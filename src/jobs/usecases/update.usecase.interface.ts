import { LoggerModule } from '../../logger';
import { SchemaModule } from '../../schemas';
import { JobDto } from '../dtos/';
import { JobRepositoryModule } from '../repositories/';

export const UPDATE_JOB_USE_CASE = Symbol('UPDATE_JOB_USE_CASE');

export interface UpdateUseCase {
  execute(
    params: JobDto.UpdateJobDtoForV1
  ): Promise<
    | SchemaModule.V1.Job
    | UpdateUseCaseError
    | JobRepositoryModule.InvalidJobDataError
    | JobRepositoryModule.JobAlreadyExistsError
  >;
  isJobNotFoundError(error: unknown): error is JobRepositoryModule.JobNotFoundError;
  isInvalidJobDataError(error: unknown): error is JobRepositoryModule.InvalidJobDataError;
  isUpdateUseCaseError(error: unknown): error is UpdateUseCaseError;
}

export class UpdateUseCaseError extends LoggerModule.BaseError {
  constructor(message: string, cause?: Error, metaData?: Record<string, unknown>) {
    super(message, cause, undefined, metaData);
  }
}
