import { LoggerModule } from '../../logger';

export const JOB_PUBSUB_COMPONENT = Symbol.for('JOB_PUBSUB_COMPONENT');

export interface JobPubSub {
  run(): Promise<void>;
  subscribeToJobCreated(): Promise<void>;
  subscribeToJobUpdated(): Promise<void>;
}

export class JobPubSubError extends LoggerModule.BaseError {
  constructor(message: string, cause?: Error, metaData?: Record<string, unknown>) {
    super(message, cause, undefined, metaData);
  }
}
