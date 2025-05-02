import { LoggerModule } from '../../logger';
import { SchemaModule } from '../../schemas';
import { JobDto } from '../dtos/';
import { JobRepositoryModule } from '../repositories/';

export const NEW_JOB_USE_CASE = Symbol('NEW_JOB_USE_CASE');

export interface NewUseCase {
  execute(
    params: JobDto.CreateJobDtoForV1
  ): Promise<
    | SchemaModule.V1.Job
    | NewUseCaseError
    | JobRepositoryModule.InvalidJobDataError
    | JobRepositoryModule.JobAlreadyExistsError
  >;
  isJobAlreadyExistsError(error: unknown): error is JobRepositoryModule.JobAlreadyExistsError;
  isInvalidJobDataError(error: unknown): error is JobRepositoryModule.InvalidJobDataError;
  isNewUseCaseError(error: unknown): error is NewUseCaseError;
}

export class NewUseCaseError extends LoggerModule.BaseError {
  constructor(message: string, cause?: Error, metaData?: Record<string, unknown>) {
    super(message, cause, undefined, metaData);
  }
}
