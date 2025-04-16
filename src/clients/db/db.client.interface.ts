import { LoggerModule } from '../../logger';

export const DB_CLIENT = Symbol.for('DB_CLIENT');

export interface DbClient<DBClient> {
  init: () => Promise<void>;
  getClient: () => DBClient;
  disconnect: () => Promise<void>;
  getDatabaseName: () => string;
}

export class DbClientError extends LoggerModule.BaseError {
  constructor(
    readonly metaData?: Record<string, unknown>,
    additionalMessage?: string,
    cause?: Error
  ) {
    const message = additionalMessage
      ? `[DbClient: DbClientError]:${additionalMessage}`
      : '[DbClient: DbClientError]';
    super(message, cause);
  }
}
