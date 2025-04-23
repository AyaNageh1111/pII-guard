import { injectable, inject } from 'inversify';

import { ConfigsModule } from '../../configs';
import { LoggerModule } from '../../logger';

import { CollectAndFlush } from './collect-and-flush.interface';

@injectable()
export class CollectAndFlushAdapter implements CollectAndFlush {
  private static readonly LogLines = new Set<string>();
  private static cb: (data: Array<string>) => Promise<void>;

  constructor(
    @inject(ConfigsModule.CONFIGS) private readonly configs: ConfigsModule.Configs,
    @inject(LoggerModule.LOGGER) private readonly logger: LoggerModule.Logger
  ) {
    setInterval(
      this.flush.bind(
        this,
        Array.from(CollectAndFlushAdapter.LogLines),
        `Time exceeded: current size: ${
          CollectAndFlushAdapter.LogLines.size
        }, timeout in seconds: ${this.configs.get('LOG_FLUSH_INTERVAL_IN_SECONDS')}`
      ),
      this.configs.get('LOG_FLUSH_INTERVAL_IN_SECONDS') * 1000
    );
  }

  createFlow: CollectAndFlush['createFlow'] = (cb) => {
    if (!CollectAndFlushAdapter.cb) {
      CollectAndFlushAdapter.cb = cb;
    }
  };

  collectAndFlush: CollectAndFlush['collectAndFlush'] = (data) => {
    if (CollectAndFlushAdapter.LogLines.size > this.configs.get('MAX_NUMBER_OF_LOGS_TO_COLLECT')) {
      this.flush(
        Array.from(CollectAndFlushAdapter.LogLines),
        `max size reached: current size: ${
          CollectAndFlushAdapter.LogLines.size
        }, max size: ${this.configs.get('MAX_NUMBER_OF_LOGS_TO_COLLECT')}`
      );
      CollectAndFlushAdapter.LogLines.clear();
    }

    CollectAndFlushAdapter.LogLines.add(data);
    return Promise.resolve();
  };

  private async flush(logsToFlush: Array<string>, reason: string) {
    this.logger.info({
      message: `Flushing current logs due to ${reason}`,
    });

    await CollectAndFlushAdapter.cb(logsToFlush);
  }
}
