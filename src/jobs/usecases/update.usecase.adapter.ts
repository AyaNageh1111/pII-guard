import { injectable, inject } from 'inversify';

import { LoggerModule } from '../../logger';
import { SchemaModule } from '../../schemas';
import { JobDto } from '../dtos';
import { JobRepositoryModule } from '../repositories/';

import { UpdateUseCase, UpdateUseCaseError } from './update.usecase.interface';

@injectable()
export class UpdateUseCaseAdapter implements UpdateUseCase {
  constructor(
    @inject(JobRepositoryModule.JOB_REPOSITORY)
    private readonly jobRepository: JobRepositoryModule.JobRepository
  ) {}

  execute: UpdateUseCase['execute'] = async (params) => {
    const getJobByIdDtoResult = JobDto.getJobByIdDtoToV1(params);
    if (LoggerModule.isError(getJobByIdDtoResult)) {
      return new UpdateUseCaseError('Unable to create getJobByIdDto', getJobByIdDtoResult);
    }
    const jobFindResult = await this.jobRepository.getJobById(getJobByIdDtoResult);
    if (LoggerModule.isError(jobFindResult)) {
      return jobFindResult;
    }

    if (!jobFindResult) {
      return new UpdateUseCaseError('Job not found');
    }

    if (
      params.status === jobFindResult.status ||
      jobFindResult.status === SchemaModule.V1.JobStatusEnumSchema.Enum.success
    ) {
      return jobFindResult;
    }

    const updateJobResult = await this.jobRepository.updateJob(params);
    if (LoggerModule.isError(updateJobResult)) {
      return new UpdateUseCaseError('Unable to update job', updateJobResult);
    }

    const updateSearchResult = await this.jobRepository.upsertSearch(updateJobResult);
    if (LoggerModule.isError(updateSearchResult)) {
      return new UpdateUseCaseError('Unable to update search', updateSearchResult);
    }

    return updateJobResult;
  };

  isJobNotFoundError: UpdateUseCase['isJobNotFoundError'] = (error) =>
    this.jobRepository.isJobNotFoundError(error);

  isInvalidJobDataError: UpdateUseCase['isInvalidJobDataError'] = (error) =>
    this.jobRepository.isInvalidJobDataError(error);
  isUpdateUseCaseError: UpdateUseCase['isUpdateUseCaseError'] = (error) =>
    error instanceof UpdateUseCaseError;
}
