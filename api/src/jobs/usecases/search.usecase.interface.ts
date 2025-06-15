import { LoggerModule } from '../../logger';
import { SchemaModule } from '../../schemas';
import { JobDto } from '../dtos';
import { JobRepositoryModule } from '../repositories/';

export const SEARCH_JOB_USE_CASE = Symbol('SEARCH_JOB_USE_CASE');

export class SearchUseCaseError extends LoggerModule.BaseError {
  constructor(message: string, cause?: Error, metaData?: Record<string, unknown>) {
    super(message, cause, undefined, metaData);
  }
}

export interface SearchUseCase {
  execute(
    params: JobDto.SearchJob
  ): Promise<
    | Array<SchemaModule.V1.Job>
    | SearchUseCaseError
    | JobRepositoryModule.InvalidJobDataError
    | JobRepositoryModule.JobAlreadyExistsError
  >;
  isInvalidJobDataError(error: unknown): error is JobRepositoryModule.InvalidJobDataError;
  isSearchUseCaseError(error: unknown): error is SearchUseCaseError;
}
