import { injectable, inject } from 'inversify';

import { ConfigsModule } from '../../configs';
import { LoggerModule } from '../../logger';

import { CollectAndFlush, CollectAndFlushError } from './collect-and-flush.interface';

@injectable()
export class CollectAndFlushAdapter implements CollectAndFlush {
  private static isStarted: boolean;
  private static readonly LogLines = new Set<string>();
  private static sink: (data: Array<string>) => Promise<void> | null;

  constructor(
    @inject(ConfigsModule.CONFIGS) private readonly configs: ConfigsModule.Configs,
    @inject(LoggerModule.LOGGER) private readonly logger: LoggerModule.Logger
  ) {}

  start: CollectAndFlush['start'] = () => {
    if (CollectAndFlushAdapter.isStarted) {
      return;
    }

    CollectAndFlushAdapter.isStarted = true;

    if (!CollectAndFlushAdapter.sink) {
      throw new CollectAndFlushError({
        message: 'Sink is not set',
      });
    }

    setInterval(
      this.flush.bind(this, `Time exceeded: ${this.configs.get('LOG_FLUSH_INTERVAL_IN_SECONDS')}`),
      this.configs.get('LOG_FLUSH_INTERVAL_IN_SECONDS') * 1000
    ).unref();
  };

  setSink: CollectAndFlush['setSink'] = (sink) => {
    if (!CollectAndFlushAdapter.sink) {
      CollectAndFlushAdapter.sink = sink;
    }
  };

  collect: CollectAndFlush['collect'] = async (data) => {
    if (CollectAndFlushAdapter.LogLines.size > this.configs.get('MAX_NUMBER_OF_LOGS_TO_COLLECT')) {
      await this.flush(
        `max size reached: current size: ${
          CollectAndFlushAdapter.LogLines.size
        }, max size: ${this.configs.get('MAX_NUMBER_OF_LOGS_TO_COLLECT')}`
      );
    }

    this.handleIncomingData(data);
  };

  flush: CollectAndFlush['flush'] = async (reason) => {
    const logsToFlush = Array.from(CollectAndFlushAdapter.LogLines);

    this.logger.debug({
      message: `Flushing current logs due to ${reason}`,
    });

    if (!logsToFlush.length) {
      this.logger.debug({
        message: 'No logs to flush',
      });
      return;
    }

    this.logger.info({
      message: `Flushing record count: ${logsToFlush.length}`,
    });
    CollectAndFlushAdapter.LogLines.clear();
    await CollectAndFlushAdapter.sink(logsToFlush);
    this.logger.debug({
      message: `Flushed record count: ${logsToFlush.length}`,
    });
  };

  private handleIncomingData(data: string): void {
    try {
      const logs = JSON.parse(data);
      if (Array.isArray(logs)) {
        for (const log of logs) {
          CollectAndFlushAdapter.LogLines.add(JSON.stringify(log));
        }
      }
    } catch {
      CollectAndFlushAdapter.LogLines.add(data);
    }
  }
}
