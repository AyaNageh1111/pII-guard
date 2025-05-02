import { LoggerModule } from '../../logger';

export const FLUSH_USE_CASE = Symbol('FLUSH_USE_CASE');

export interface FlushUseCase {
  execute: (logsToFlush: Array<string>) => Promise<void>;
}

export class FlushUseCaseError extends LoggerModule.BaseError {
  constructor(message: string, cause?: Error, metaData?: Record<string, unknown>) {
    super(message, cause, undefined, metaData);
  }
}
