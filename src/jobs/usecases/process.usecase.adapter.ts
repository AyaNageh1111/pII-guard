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
    private readonly llmClient: ClientModule.LlmClientModule.LlmClient,
    @inject(LoggerModule.LOGGER) private readonly logger: LoggerModule.Logger
  ) {}

  execute: ProcessUseCase['execute'] = async (params) => {
    const promptBuildResult = await this.buildPrompt(params);
    if (LoggerModule.isError(promptBuildResult)) {
      await this.markJobAsFailed(params, promptBuildResult);
      return promptBuildResult;
    }

    const askResult = await this.llmClient.ask<SchemaModule.V1.Finding>(promptBuildResult);
    if (LoggerModule.isError(askResult)) {
      await this.markJobAsFailed(params, askResult);
      return askResult;
    }

    const JobSuccessResult = SchemaModule.V1.createJobSuccess({
      ...params,
      status: SchemaModule.V1.JobStatusEnumSchema.Enum.success,
      completed_at: new Date(),
      results: askResult,
    });

    if (LoggerModule.isError(JobSuccessResult)) {
      return new ProcessUseCaseError('Unable to create job success', JobSuccessResult);
    }

    await this.pubSubClient.publish(this.configs.get('JOB_STATUS_UPDATED_TOPIC'), JobSuccessResult);

    return null;
  };

  buildPrompt: ProcessUseCase['buildPrompt'] = (params) => {
    const AllPiiTypes = SchemaModule.V1.AllPiiTypes;

    const piiTags = AllPiiTypes.map((tag) => `- "${tag}"`).join('\n');
    const numberedLogs = params.logs.map((log, index) => `${index + 1}. ${log}`).join('\n');

    const prompt = `
You are a GDPR compliance assistant. Your job is to analyze logs and detect personal data (PII) as defined under GDPR.

Below is the complete list of allowed PII types (return only values from this list):

${piiTags}

Instructions:

- Carefully analyze **each log entry**, including **deeply nested fields** and **keys with indirect or unusual names**.
- Do not stop after finding one or two fields — be **exhaustive** in your analysis.
- Single log entry may have multiple PII Data
- Single log entry may have multiple GDPR records
- Must Detect all the possible PII data and GDPR records
- Run regular expression detection to identify special PII data such as IP addresses, emails.
- Treat all parts of the log (keys, values, objects, arrays) as potential sources of PII.
- Detect and tag **every instance** of personal data, no matter how deep or how common.
- For each finding, return:
  - field: the detected value
  - type: a PII type from the list provided
  - source: one of "log-message", "header", "body", "query-param", or "unknown"
  - log_entry: the full original log line where the field was found

Output Instructions:

- Output must be valid a **JSON array of objects**.
- Always return an array, even if only one object is found.
- Do **not** return a single object.
- Do **not** wrap the response in Markdown.
- Do **not** include any explanation or extra text.
- The output must **start directly with [\` and end with \`]**.
- Make sure the output is 100% valid JSON and can be parsed with \`JSON.parse()\`.
- Do not escape quotation marks inside nested JSON.
- Use raw objects if including original log lines.

Example output:
\`\`\`json
[
  {
    "field": "john@example.com",
    "type": "email",
    "source": "log-message"
  },
  {
    "field": "10.0.0.2",
    "type": "ip-address",
    "source": "log-message"
  }
]
\`\`\`

Now analyze the following logs:
${numberedLogs}
`;

    return Promise.resolve(prompt);
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

    await this.pubSubClient.publish(this.configs.get('JOB_STATUS_UPDATED_TOPIC'), jobFailedResult);
    return null;
  };
}
