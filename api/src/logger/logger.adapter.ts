import { randomUUID } from 'node:crypto';

import { injectable } from 'inversify';
import { createLogger, Logger as WinstonLogger, format, transports } from 'winston';

import { type Logger } from './logger.interface';

const { combine, timestamp, errors, json } = format;

@injectable()
export class LoggerAdapter implements Logger {
  private readonly logger: WinstonLogger;
  constructor() {
    this.logger = createLogger({
      level: process.env.LOG_LEVEL ?? 'info',
      format: combine(timestamp(), errors({ stack: true }), json()),
      transports: [new transports.Console()],
    });
  }

  error: Logger['error'] = (error) => {
    const id = randomUUID();
    if (!('id' in error)) {
      Object.assign(error, { id });
    }

    this.logger.error(error);
  };

  info: Logger['info'] = (payload) => {
    this.logger.info({
      ...payload,
    });
  };

  debug: Logger['debug'] = (payload) => {
    this.logger.debug({
      ...payload,
    });
  };
  warn: Logger['warn'] = (payload) => {
    this.logger.warn({
      ...payload,
    });
  };
}
