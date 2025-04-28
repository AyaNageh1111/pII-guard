import { injectable, inject } from 'inversify';

import { ConfigsModule } from '../../configs';
import { LoggerModule } from '../../logger';

import { CollectAndFlush, CollectAndFlushError } from './collect-and-flush.interface';
@injectable()
export class CollectAndFlushAdapter implements CollectAndFlush {
  private static isStarted: boolean;
  private static readonly LogLines = new Set<string>();
  private static sink: (data: Array<string>) => Promise<void> | null;

  private static logCounter = 0;
  private static currentTimeFrame: number = Math.floor(Date.now() / 1000);

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
    const incomingLogs = this.parseIncomingData(data);
    const nowMinute = Math.floor(Date.now() / 60000);

    if (CollectAndFlushAdapter.currentTimeFrame !== nowMinute) {
      CollectAndFlushAdapter.currentTimeFrame = nowMinute;
      CollectAndFlushAdapter.logCounter = 0;
    }

    for (const log of incomingLogs) {
      if (CollectAndFlushAdapter.logCounter >= this.configs.get('MAX_NUMBER_OF_LOGS_TO_COLLECT')) {
        this.logger.debug({
          message: `Sampling limit reached at ${nowMinute}. Dropping incoming log.`,
        });
        await this.flush(`max size reached: ${CollectAndFlushAdapter.LogLines.size}`);
        continue;
      }

      CollectAndFlushAdapter.LogLines.add(JSON.stringify(log));
      CollectAndFlushAdapter.logCounter++;
    }
  };

  flush: CollectAndFlush['flush'] = async (reason) => {
    this.logger.debug({
      message: `Flushing current logs due to ${reason}`,
    });

    if (!CollectAndFlushAdapter.LogLines.size) {
      this.logger.debug({
        message: 'No logs to flush',
      });
      return;
    }

    const logsToFlush = Array.from(CollectAndFlushAdapter.LogLines);
    CollectAndFlushAdapter.LogLines.clear();
    this.logger.info({
      message: `Flushing record count: ${logsToFlush.length}`,
      reason,
    });
    await CollectAndFlushAdapter.sink(logsToFlush);
    this.logger.debug({
      message: `Flushed record count: ${logsToFlush.length}`,
    });
  };

  private parseIncomingData(data: string): Array<string> {
    try {
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) ? parsed : [parsed];
    } catch {
      return [data];
    }
  }
}
