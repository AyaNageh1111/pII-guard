import { LoggerModule } from '../../logger';

export const COLLECT_AND_FLUSH_CLIENT = Symbol.for('COLLECT_AND_FLUSH_CLIENT');

export interface CollectAndFlush {
  start: () => void;
  setSink: (sink: (data: Array<string>) => Promise<void>) => void;
  collect: (log: string) => Promise<void>;
  flush: (reason?: string) => Promise<void>;
}

export class CollectAndFlushError extends LoggerModule.BaseError {
  constructor(
    readonly metaData?: Record<string, unknown>,
    additionalMessage?: string,
    cause?: Error
  ) {
    const message = additionalMessage
      ? `[CollectAndFlushClient: CollectAndFlushError]:${additionalMessage}`
      : '[CollectAndFlushClient: CollectAndFlushError]';
    super(message, cause);
  }
}
