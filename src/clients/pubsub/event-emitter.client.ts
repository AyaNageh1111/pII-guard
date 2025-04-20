import { EventEmitter } from 'node:events';

import { injectable } from 'inversify';

import { PubSubClient, PubSubClientError } from './pubsub.client.interface';

@injectable()
export class EventEmitterAdapter extends EventEmitter implements PubSubClient {
  private static eventEmitterClient: EventEmitterAdapter;
  constructor() {
    super();
  }

  init: PubSubClient['init'] = async () => {
    if (!EventEmitterAdapter.eventEmitterClient) {
      EventEmitterAdapter.eventEmitterClient = new EventEmitterAdapter();
    }
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
    EventEmitterAdapter.eventEmitterClient.emit(topic, data);
    return Promise.resolve(null);
  };

  subscribe: PubSubClient['subscribe'] = (topic: string, callback: (data: unknown) => void) => {
    if (!EventEmitterAdapter.eventEmitterClient) {
      throw new PubSubClientError(undefined, 'EventEmitter Client not initialized');
    }
    EventEmitterAdapter.eventEmitterClient.on(topic, callback);
    return Promise.resolve(null);
  };
}
