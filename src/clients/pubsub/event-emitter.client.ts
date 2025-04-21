import { EventEmitter } from 'node:events';

import { injectable, inject } from 'inversify';

import { LoggerModule } from '../../logger';

import { PubSubClient, PubSubClientError } from './pubsub.client.interface';

@injectable()
export class EventEmitterAdapter implements PubSubClient {
  private static readonly topicList = new Set<string>();
  private static eventEmitterClient: EventEmitterAdapter;
  private readonly eventEmitter = new EventEmitter();
  constructor(@inject(LoggerModule.LOGGER) private readonly logger: LoggerModule.Logger) {
    if (!EventEmitterAdapter.eventEmitterClient) {
      EventEmitterAdapter.eventEmitterClient = this;
    }
  }

  init: PubSubClient['init'] = async () => {
    await Promise.resolve();
  };

  getClient: PubSubClient['getClient'] = () => {
    if (!EventEmitterAdapter.eventEmitterClient) {
      throw new PubSubClientError(undefined, 'EventEmitter Client not initialized');
    }
    return EventEmitterAdapter.eventEmitterClient;
  };

  disconnect: PubSubClient['disconnect'] = async () => {
    if (!EventEmitterAdapter.eventEmitterClient) {
      throw new PubSubClientError(undefined, 'EventEmitter Client not initialized');
    }
    await Promise.resolve();
  };

  publish: PubSubClient['publish'] = (topic, data) => {
    if (!EventEmitterAdapter.eventEmitterClient) {
      throw new PubSubClientError(undefined, 'EventEmitter Client not initialized');
    }
    this.logger.info({
      message: 'EventEmitterAdapter publish',
      topic,
      data,
    });
    this.eventEmitter.emit(topic, data);
    return Promise.resolve(null);
  };

  subscribe: PubSubClient['subscribe'] = (
    topic: string,
    callback: (data: unknown) => Promise<void>
  ) => {
    if (!EventEmitterAdapter.eventEmitterClient) {
      throw new PubSubClientError(undefined, 'EventEmitter Client not initialized');
    }
    if (EventEmitterAdapter.topicList.has(topic)) {
      this.logger.info({
        message: `Topic ${topic} already subscribed`,
      });
      return Promise.resolve(null);
    }
    EventEmitterAdapter.topicList.add(topic);
    this.eventEmitter.addListener(topic, (data: unknown) => {
      this.logger.info({
        message: 'EventEmitterAdapter subscribe',
        topic,
        data,
      });
      callback(data);
    });
    return Promise.resolve(null);
  };
}
