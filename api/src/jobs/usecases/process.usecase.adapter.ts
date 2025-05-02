import { injectable, inject } from 'inversify';

import { ClientModule } from '../../clients';
import { ConfigsModule } from '../../configs';
import { LoggerModule } from '../../logger';
import { PromptModule } from '../../prompt';
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
    private readonly llmClient: ClientModule.LlmClientModule.LlmClient,
    @inject(LoggerModule.LOGGER) private readonly logger: LoggerModule.Logger
  ) {}

  execute: ProcessUseCase['execute'] = async (params) => {
    const promptBuildResult = this.buildPrompt(params.logs);

    const askResult = await this.llmClient.ask<SchemaModule.V1.Finding>(promptBuildResult);

    if (LoggerModule.isError(askResult)) {
      await this.markJobAsFailed(params, askResult);
      return askResult;
    }

    const publishResults = await this.markJobAsSuccess(params, askResult);
    if (LoggerModule.isError(publishResults)) {
      this.logger.error(publishResults);
      return publishResults;
    }

    this.logger.debug({
      message: 'Published completed',
    });

    return null;
  };

  buildPrompt: ProcessUseCase['buildPrompt'] = (logs) => {
    const numberedLogs = logs.map((log, index) => `${index + 1}. ${log}`).join('\n');

    const prompt = PromptModule.build(
      SchemaModule.V1.AllPiiTypes.map((tag) => tag),
      numberedLogs
    );

    return prompt;
  };

  isJobNotFoundError: ProcessUseCase['isJobNotFoundError'] = (error) =>
    this.jobRepository.isJobNotFoundError(error);
  isInvalidJobDataError: ProcessUseCase['isInvalidJobDataError'] = (error) =>
    this.jobRepository.isInvalidJobDataError(error);
  isProcessUseCaseError: ProcessUseCase['isProcessUseCaseError'] = (error) =>
    error instanceof ProcessUseCaseError;

  private markJobAsFailed = async (
    params: SchemaModule.V1.NewJob,
    error: LoggerModule.BaseError
  ): Promise<null | ProcessUseCaseError> => {
    const jobFailedResult = SchemaModule.V1.createJobFailure({
      ...params,
      status: SchemaModule.V1.JobStatusEnumSchema.Enum.failed,
      completed_at: new Date(),
      error_message: error.message,
      error_details: error.toString(),
    });
    if (LoggerModule.isError(jobFailedResult)) {
      this.logger.error(jobFailedResult);
      return new ProcessUseCaseError('Unable to create job failure', jobFailedResult);
    }

    const publishResults = await this.pubSubClient.publish(
      this.configs.get('JOB_STATUS_UPDATED_TOPIC'),
      jobFailedResult
    );
    if (LoggerModule.isError(publishResults)) {
      this.logger.error(publishResults);
    }
    return null;
  };

  private markJobAsSuccess = async (
    params: SchemaModule.V1.NewJob,
    askResult: SchemaModule.V1.Finding
  ): Promise<null | ProcessUseCaseError> => {
    const jobSuccessResult = SchemaModule.V1.createJobSuccess({
      ...params,
      status: SchemaModule.V1.JobStatusEnumSchema.Enum.success,
      completed_at: new Date(),
      results: askResult,
    });

    if (LoggerModule.isError(jobSuccessResult)) {
      this.logger.error(jobSuccessResult);
      return new ProcessUseCaseError('Unable to create job success', jobSuccessResult);
    }

    const publishResults = await this.pubSubClient.publish(
      this.configs.get('JOB_STATUS_UPDATED_TOPIC'),
      jobSuccessResult
    );
    if (LoggerModule.isError(publishResults)) {
      this.logger.error(publishResults);
    }
    return null;
  };
}
