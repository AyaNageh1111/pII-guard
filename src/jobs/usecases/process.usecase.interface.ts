import { LoggerModule } from '../../logger';
import { SchemaModule } from '../../schemas';
import { JobRepositoryModule } from '../repositories/';

export const PROCESS_JOB_USE_CASE = Symbol('PROCESS_JOB_USE_CASE');

export interface ProcessUseCase {
  execute(
    params: SchemaModule.V1.NewJob
  ): Promise<
    | null
    | ProcessUseCaseError
    | JobRepositoryModule.InvalidJobDataError
    | JobRepositoryModule.JobAlreadyExistsError
  >;
  buildPrompt(params: SchemaModule.V1.NewJob): Promise<string | ProcessUseCaseError>;
  isJobNotFoundError(error: unknown): error is JobRepositoryModule.JobNotFoundError;
  isInvalidJobDataError(error: unknown): error is JobRepositoryModule.InvalidJobDataError;
  isProcessUseCaseError(error: unknown): error is ProcessUseCaseError;
}

export class ProcessUseCaseError extends LoggerModule.BaseError {
  constructor(message: string, cause?: Error, metaData?: Record<string, unknown>) {
    super(message, cause, undefined, metaData);
  }
}
