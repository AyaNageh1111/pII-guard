import 'reflect-metadata';

import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';

import { dbClient, logger, jobApi, jobPubSub, config, pubsubClient } from './container';
import { LoggerModule } from './logger';

const server = () => {
  const app = new Hono();
  app.use(cors());

  logger.info({ message: 'Starting HTTP Component' });

  const weHandlerPort = config.get('HTTP_PORT');
  app.route('/api', jobApi.getApi());

  logger.info({ message: `API component Listening on port ${weHandlerPort}` });

  serve(
    {
      fetch: app.fetch,
      port: weHandlerPort,
    },
    (info) => {
      logger.info({ message: 'HTTP Server component started', info });
    }
  );
};

const pubsub = async () => {
  logger.info({ message: 'Starting PubSub component' });
  await pubsubClient.init();
  await jobPubSub.run();
  logger.info({ message: 'PubSub component started' });
};

const start = async () => {
  try {
    await dbClient.init();
    logger.info({ message: 'Database client initialized' });
  } catch (errorRaw) {
    logger.info({
      message: 'Error initializing database',
      error: errorRaw,
    });
    logger.error(LoggerModule.convertToError(errorRaw));

    throw errorRaw;
  }

  server();
  await pubsub();
};

/**
 * Start the application
 */
start()
  .then(() => logger.info({ message: '[start] Started successfully' }))
  .catch((error) => {
    logger.info({
      message: '[start] Error starting application',
      error,
    });
    logger.error(LoggerModule.convertToError(error));
    process.exit(1);
  });

/**
 * Handle uncaught exceptions and unhandled rejections
 */
process
  .on('unhandledRejection', (reason, p) => {
    const error = new Error(`Unhandled Rejection at: ${p} reason: ${reason}`);
    logger.info({
      message: '[error] Unhandled Rejection',
      reason,
      p,
    });
    logger.error(LoggerModule.convertToError(error));
    process.exit(1);
  })
  .on('uncaughtException', (errorRaw) => {
    logger.info({
      message: '[error] Uncaught Exception',
      error: errorRaw,
    });
    logger.error(LoggerModule.convertToError(errorRaw));
    process.exit(1);
  });

/**
 * Handle graceful shutdown
 */
['SIGTERM', 'SIGINT', 'SIGUSR2'].forEach((type) => {
  process.once(type, () => {
    logger.info({ message: `Received ${type}, requesting graceful shutdown` });
    Promise.allSettled([dbClient.disconnect()])
      .then((results) => {
        const failed = results.filter((result) => result.status === 'rejected');
        if (failed.length) {
          failed.forEach((result) => {
            logger.info({
              message: 'Error disconnecting client',
              error: result.reason,
            });
            logger.error(LoggerModule.convertToError(result.reason));
          });
          process.exit(0);
        } else {
          process.kill(process.pid, type);
        }
      })
      .catch((error) => {
        logger.info({
          message: 'Error during graceful shutdown',
          error,
        });
        logger.error(LoggerModule.convertToError(error));
        process.exit(1);
      });
  });
});
