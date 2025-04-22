import { injectable, inject } from 'inversify';

import { ClientModule } from '../../clients';
import { ConfigsModule } from '../../configs';
import { LoggerModule } from '../../logger';
import { JobRepositoryModule } from '../repositories/';

import { NewUseCase, NewUseCaseError } from './new.usecase.interface';

@injectable()
export class NewUseCaseAdapter implements NewUseCase {
  constructor(
    @inject(JobRepositoryModule.JOB_REPOSITORY)
    private readonly jobRepository: JobRepositoryModule.JobRepository,
    @inject(ClientModule.PubSubClientModule.PUBSUB_CLIENT)
    private readonly pubSubClient: ClientModule.PubSubClientModule.PubSubClient,
    @inject(ConfigsModule.CONFIGS) private readonly configs: ConfigsModule.Configs
  ) {}

  execute: NewUseCase['execute'] = async (params) => {
    const jobResult = await this.jobRepository.createJob(params);

    if (LoggerModule.isError(jobResult)) {
      return jobResult;
    }

    const publishResults = await this.pubSubClient.publish(
      this.configs.get('NEW_JOB_CREATED_TOPIC'),
      jobResult
    );

    if (LoggerModule.isError(publishResults)) {
      return new NewUseCaseError('Unable to publish job created event', publishResults, jobResult);
    }

    const updateSearchResult = await this.jobRepository.upsertSearch(jobResult);
    if (LoggerModule.isError(updateSearchResult)) {
      return new NewUseCaseError('Unable to update search', updateSearchResult);
    }

    return jobResult;
  };

  isJobAlreadyExistsError: NewUseCase['isJobAlreadyExistsError'] = (error) =>
    this.jobRepository.isJobAlreadyExistsError(error);

  isInvalidJobDataError: NewUseCase['isInvalidJobDataError'] = (error) =>
    this.jobRepository.isInvalidJobDataError(error);
  isNewUseCaseError: NewUseCase['isNewUseCaseError'] = (error) => error instanceof NewUseCaseError;
}
