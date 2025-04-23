import { LoggerModule } from '../../logger';
import { SchemaModule } from '../../schemas';
import { JobDto } from '../dtos/';
import { JobRepositoryModule } from '../repositories/';

export const GET_FILTER_USE_CASE = Symbol('GET_FILTER_USE_CASE');

export interface GetFilterUseCase {
  executeGet(
    params: JobDto.GetJobByIdDtoForV1
  ): Promise<SchemaModule.V1.Job | null | JobRepositoryModule.InvalidJobDataError>;
  executeFilter(
    params: JobDto.FilterJobsDtoForV1
  ): Promise<Array<SchemaModule.V1.Job> | JobRepositoryModule.InvalidJobDataError>;
  isInvalidJobDataError(error: unknown): error is JobRepositoryModule.InvalidJobDataError;
  isGetFilterUseCaseError(error: unknown): error is GetFilterUseCaseError;
  isJobNotFoundError(error: unknown): error is JobRepositoryModule.JobNotFoundError;
}

export class GetFilterUseCaseError extends LoggerModule.BaseError {
  constructor(message: string, cause?: Error, metaData?: Record<string, unknown>) {
    super(message, cause, undefined, metaData);
  }
}
