import { injectable, inject } from 'inversify';

import { LoggerModule } from '../../logger';
import { JobRepositoryModule } from '../repositories/';

import { GetFilterUseCase, GetFilterUseCaseError } from './get-filter.interface';

@injectable()
export class GetFilterUseCaseAdapter implements GetFilterUseCase {
  constructor(
    @inject(JobRepositoryModule.JOB_REPOSITORY)
    private readonly jobRepository: JobRepositoryModule.JobRepository
  ) {}

  executeGet: GetFilterUseCase['executeGet'] = async (params) => {
    const jobResult = await this.jobRepository.getJobById(params);

    if (LoggerModule.isError(jobResult)) {
      return jobResult;
    }

    return jobResult;
  };
  executeFilter: GetFilterUseCase['executeFilter'] = async (params) => {
    const jobResult = await this.jobRepository.filterJobs(params);

    if (LoggerModule.isError(jobResult)) {
      return jobResult;
    }

    return jobResult;
  };

  isInvalidJobDataError: GetFilterUseCase['isInvalidJobDataError'] = (error) =>
    this.jobRepository.isInvalidJobDataError(error);
  isGetFilterUseCaseError: GetFilterUseCase['isGetFilterUseCaseError'] = (error) =>
    error instanceof GetFilterUseCaseError;
}
