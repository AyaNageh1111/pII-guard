import { injectable, inject } from 'inversify';

import { ClientModule } from '../../clients';
import { ConfigsModule } from '../../configs';
import { LoggerModule } from '../../logger';
import { JobRepositoryModule } from '../repositories/';

import { NewJobUseCase, NewJobUseCaseError } from './new-job.usecase.interface';

@injectable()
export class NewJobUseCaseAdapter implements NewJobUseCase {
  constructor(
    @inject(JobRepositoryModule.JOB_REPOSITORY)
    private readonly jobRepository: JobRepositoryModule.JobRepository,
    @inject(ClientModule.PubSubClientModule.PUBSUB_CLIENT)
    private readonly pubSubClient: ClientModule.PubSubClientModule.PubSubClient,
    @inject(ConfigsModule.CONFIGS) private readonly configs: ConfigsModule.Configs
  ) {}

  execute: NewJobUseCase['execute'] = async (params) => {
    const jobResult = await this.jobRepository.createJob(params);

    if (LoggerModule.isError(jobResult)) {
      return jobResult;
    }

    const publishResults = await this.pubSubClient.publish(
      this.configs.get('NEW_JOB_CREATED_TOPIC'),
      jobResult
    );

    if (LoggerModule.isError(publishResults)) {
      return new NewJobUseCaseError(
        'Unable to publish job created event',
        publishResults,
        jobResult
      );
    }

    return jobResult;
  };

  isJobAlreadyExistsError: NewJobUseCase['isJobAlreadyExistsError'] = (error) =>
    this.jobRepository.isJobAlreadyExistsError(error);

  isInvalidJobDataError: NewJobUseCase['isInvalidJobDataError'] = (error) =>
    this.jobRepository.isInvalidJobDataError(error);
  isNewJobUseCaseError: NewJobUseCase['isNewJobUseCaseError'] = (error) =>
    error instanceof NewJobUseCaseError;
}
