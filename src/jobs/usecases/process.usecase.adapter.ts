import { injectable, inject } from 'inversify';

import { ClientModule } from '../../clients';
import { ConfigsModule } from '../../configs';
import { LoggerModule } from '../../logger';
import { SchemaModule } from '../../schemas';
import { JobRepositoryModule } from '../repositories/';

import { ProcessUseCase, ProcessUseCaseError } from './process.usecase.interface';

@injectable()
export class ProcessUseCaseAdapter implements ProcessUseCase {
  constructor(
    @inject(JobRepositoryModule.JOB_REPOSITORY)
    private readonly jobRepository: JobRepositoryModule.JobRepository,
    @inject(ClientModule.PubSubClientModule.PUBSUB_CLIENT)
    private readonly pubSubClient: ClientModule.PubSubClientModule.PubSubClient,
    @inject(ConfigsModule.CONFIGS) private readonly configs: ConfigsModule.Configs,
    @inject(ClientModule.LlmClientModule.LLM_CLIENT)
    private readonly llmClient: ClientModule.LlmClientModule.LlmClient
  ) {}

  execute: ProcessUseCase['execute'] = async (params) => {
    const promptBuildResult = await this.buildPrompt(params);
    if (LoggerModule.isError(promptBuildResult)) {
      return promptBuildResult;
    }

    const askResult = await this.llmClient.ask<SchemaModule.V1.Finding>(promptBuildResult);
    if (LoggerModule.isError(askResult)) {
      const jobFailedResult = SchemaModule.V1.createJobFailure({
        ...params,
        status: SchemaModule.V1.JobStatusEnumSchema.Enum.failed,
      });

      if (LoggerModule.isError(jobFailedResult)) {
        return new ProcessUseCaseError('Unable to create job failure', jobFailedResult);
      }

      await this.pubSubClient.publish(
        this.configs.get('JOB_STATUS_UPDATED_TOPIC'),
        jobFailedResult
      );
    }

    const JobSuccessResult = SchemaModule.V1.createJobSuccess({
      ...params,
      status: SchemaModule.V1.JobStatusEnumSchema.Enum.success,
      results: askResult,
    });

    if (LoggerModule.isError(JobSuccessResult)) {
      return new ProcessUseCaseError('Unable to create job success', JobSuccessResult);
    }

    await this.pubSubClient.publish(this.configs.get('JOB_STATUS_UPDATED_TOPIC'), JobSuccessResult);

    return null;
  };

  buildPrompt: ProcessUseCase['buildPrompt'] = (params) => {
    const prompt = `Process the following job: ${JSON.stringify(params)}`;
    return Promise.resolve(prompt);
  };
  isJobNotFoundError: ProcessUseCase['isJobNotFoundError'] = (error) =>
    this.jobRepository.isJobNotFoundError(error);
  isInvalidJobDataError: ProcessUseCase['isInvalidJobDataError'] = (error) =>
    this.jobRepository.isInvalidJobDataError(error);
  isProcessUseCaseError: ProcessUseCase['isProcessUseCaseError'] = (error) =>
    error instanceof ProcessUseCaseError;
}
