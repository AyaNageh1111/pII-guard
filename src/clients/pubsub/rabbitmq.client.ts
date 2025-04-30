import { connect, ChannelModel, Channel } from 'amqplib';
import { injectable, inject } from 'inversify';

import { ConfigsModule } from '../../configs';
import { LoggerModule } from '../../logger';

import { PubSubClient, PubSubClientError } from './pubsub.client.interface';

@injectable()
export class RabbitMqClientAdapter implements PubSubClient {
  private static rabbitMqClientAdapter: RabbitMqClientAdapter;
  private static channel: Channel;
  private static channelModel: ChannelModel;
  constructor(
    @inject(LoggerModule.LOGGER) private readonly logger: LoggerModule.Logger,
    @inject(ConfigsModule.CONFIGS) private readonly configs: ConfigsModule.Configs
  ) {}

  init: PubSubClient['init'] = async () => {
    if (!RabbitMqClientAdapter.channelModel) {
      this.logger.info({
        message: 'Initializing Rabbit-MQ client',
      });
      RabbitMqClientAdapter.channelModel = await connect(this.configs.get('QUEUE_URL'));
      RabbitMqClientAdapter.channel = await RabbitMqClientAdapter.channelModel.createChannel();
      RabbitMqClientAdapter.rabbitMqClientAdapter = this;
    }
  };

  getClient: PubSubClient['getClient'] = () => {
    if (!RabbitMqClientAdapter.rabbitMqClientAdapter) {
      throw new PubSubClientError(undefined, 'Rabbit MQ Client not initialized');
    }
    return RabbitMqClientAdapter.rabbitMqClientAdapter;
  };

  publish: PubSubClient['publish'] = async (topic, data) => {
    try {
      await RabbitMqClientAdapter.channel.assertQueue(topic, { durable: true });
      const buffer = Buffer.from(JSON.stringify(data));
      await RabbitMqClientAdapter.channel.sendToQueue(topic, buffer, { persistent: true });
      this.logger.info({
        message: `Published to: ${topic}`,
        data,
      });
      return null;
    } catch (errorRaw) {
      const error = LoggerModule.convertToError(errorRaw);
      this.logger.error(error);
      return new PubSubClientError(
        {
          topic,
          data,
        },
        `Unable to publish message to : ${topic}`,
        error
      );
    }
  };

  subscribe: PubSubClient['subscribe'] = async (topic, callback) => {
    try {
      await RabbitMqClientAdapter.channel.assertQueue(topic, { durable: true });

      await RabbitMqClientAdapter.channel.consume(
        topic,
        async (msg) => {
          if (msg) {
            const content = msg.content.toString();
            this.logger.info({
              message: 'Message received',
              content,
            });
            try {
              await callback(JSON.parse(content));
              await RabbitMqClientAdapter.channel.ack(msg);
            } catch (errorRaw) {
              const error = LoggerModule.convertToError(errorRaw);
              this.logger.error(error);
              return new PubSubClientError(
                {
                  topic,
                  msg,
                },
                'Unable to publish message',
                LoggerModule.convertToError(error)
              );
            }
          } else {
            this.logger.info({
              message: `No message in: ${topic}`,
            });
          }
          return null;
        },
        { noAck: false }
      );

      this.logger.info({
        message: `subscribed to: ${topic}`,
      });
      return null;
    } catch (errorSubscribeRaw) {
      const error = LoggerModule.convertToError(errorSubscribeRaw);
      this.logger.error(error);
      return new PubSubClientError(
        {
          topic,
        },
        `Unable to subscribed to : ${topic}`,
        error
      );
    }
  };

  disconnect: PubSubClient['disconnect'] = async () => {
    if (RabbitMqClientAdapter.channelModel) {
      await RabbitMqClientAdapter.channelModel.close();
    }

    if (RabbitMqClientAdapter.channel) {
      await RabbitMqClientAdapter.channel.close();
    }
  };
}
