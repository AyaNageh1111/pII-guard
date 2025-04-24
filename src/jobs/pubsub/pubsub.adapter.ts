import { injectable, inject } from 'inversify';

import { ClientModule } from '../../clients';
import { ConfigsModule } from '../../configs';
import { LoggerModule } from '../../logger';
import { SchemaModule } from '../../schemas';
import { JobUseCasesModule } from '../usecases/';

import { JobPubSub } from './pubsub.interface';

@injectable()
export class JobPubSubAdapter implements JobPubSub {
  constructor(
    @inject(ClientModule.PubSubClientModule.PUBSUB_CLIENT)
    private readonly pubSubClient: ClientModule.PubSubClientModule.PubSubClient,
    @inject(ConfigsModule.CONFIGS) private readonly configs: ConfigsModule.Configs,
    @inject(JobUseCasesModule.PROCESS_JOB_USE_CASE)
    private readonly processJobUseCase: JobUseCasesModule.ProcessUseCase,
    @inject(JobUseCasesModule.UPDATE_JOB_USE_CASE)
    private readonly updateJobUseCase: JobUseCasesModule.UpdateUseCase,
    @inject(LoggerModule.LOGGER) private readonly logger: LoggerModule.Logger
  ) {}

  run: JobPubSub['run'] = async () => {
    await this.subscribeToJobCreated();
    await this.subscribeToJobUpdated();
  };

  subscribeToJobCreated: JobPubSub['subscribeToJobCreated'] = async () => {
    await this.pubSubClient.subscribe(
      this.configs.get('NEW_JOB_CREATED_TOPIC'),
      async (data: unknown) => {
        this.logger.debug({
          message: 'JobPubSubAdapter: Job Created Event Received',
          data,
          topic: this.configs.get('NEW_JOB_CREATED_TOPIC'),
        });
        try {
          const newJobCreated = SchemaModule.V1.createNewJob(data);
          if (LoggerModule.isError(newJobCreated)) {
            this.logger.debug({
              message: 'JobPubSubAdapter: Error converting job created event',
              error: newJobCreated,
            });
            this.logger.error(newJobCreated);
            return;
          }

          await this.processJobUseCase.execute(newJobCreated);
        } catch (errorRaw) {
          const error = LoggerModule.convertToError(errorRaw);
          this.logger.error(error);
          this.logger.debug({
            message: 'JobPubSubAdapter: Error processing job created event',
            error,
          });
        }
      }
    );
  };

  subscribeToJobUpdated: JobPubSub['subscribeToJobUpdated'] = async () => {
    await this.pubSubClient.subscribe(
      this.configs.get('JOB_STATUS_UPDATED_TOPIC'),
      async (data: unknown) => {
        this.logger.debug({
          message: 'JobPubSubAdapter: Job Updated Event Received',
          data,
          topic: this.configs.get('JOB_STATUS_UPDATED_TOPIC'),
        });
        try {
          const jobUpdated = SchemaModule.V1.isJobComplete(data);
          if (!jobUpdated) {
            this.logger.debug({
              message: 'JobPubSubAdapter: not a job updated event',
              data: jobUpdated,
            });
            return;
          }

          await this.updateJobUseCase.execute(data);
        } catch (errorRaw) {
          const error = LoggerModule.convertToError(errorRaw);
          this.logger.error(error);
          this.logger.debug({
            message: 'JobPubSubAdapter: Error processing job updated event',
            error,
          });
        }
      }
    );
  };
}
