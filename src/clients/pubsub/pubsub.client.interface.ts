import { LoggerModule } from '../../logger';

export const PUBSUB_CLIENT = Symbol.for('PUBSUB_CLIENT');

export class PubSubClientError extends LoggerModule.BaseError {
  constructor(
    readonly metaData?: Record<string, unknown>,
    additionalMessage?: string,
    cause?: Error
  ) {
    const message = additionalMessage
      ? `[PubSubClient: PubSubClientError]:${additionalMessage}`
      : '[PubSubClient: PubSubClientError]';
    super(message, cause);
  }
}

export interface PubSubClient {
  init: () => Promise<void>;
  getClient: () => PubSubClient;
  disconnect: () => Promise<void>;
  publish(topic: string, data: unknown): Promise<void>;
  subscribe(topic: string, callback: (data: unknown) => void): Promise<void>;
}
