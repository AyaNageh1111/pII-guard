import { injectable, inject } from 'inversify';

import { LoggerModule } from '../../logger';
import { JobRepositoryModule } from '../repositories/';

import { SearchUseCase, SearchUseCaseError } from './search.usecase.interface';

@injectable()
export class SearchUseCaseAdapter implements SearchUseCase {
  constructor(
    @inject(JobRepositoryModule.JOB_REPOSITORY)
    private jobRepository: JobRepositoryModule.JobRepository
  ) {}

  execute: SearchUseCase['execute'] = async (params) => {
    const jobResult = await this.jobRepository.search(params);

    if (LoggerModule.isError(jobResult)) {
      return new SearchUseCaseError('Unable to search jobs', jobResult);
    }

    return jobResult;
  };

  isInvalidJobDataError(error: unknown): error is JobRepositoryModule.InvalidJobDataError {
    return error instanceof JobRepositoryModule.InvalidJobDataError;
  }

  isSearchUseCaseError(error: unknown): error is SearchUseCaseError {
    return error instanceof SearchUseCaseError;
  }
}
