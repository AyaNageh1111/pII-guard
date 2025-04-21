import 'reflect-metadata';

import knex from 'knex';

import { dbClient, logger, config } from '../../container';
import { LoggerModule } from '../../logger';

export const setupDb = async (): Promise<void> => {
  /**
   * Extracting the connection details from the DB_CONNECTION_STRING
   */
  const { protocol, host, username, password } = new URL(config.get('DB_CONNECTION_STRING'));
  const connection =
    username && password
      ? new URL(`${protocol}//${username}:${password}@${host}/`).href
      : username
      ? new URL(`${protocol}//${username}@${host}/`).href
      : new URL(`${protocol}//${host}/`).href;

  const knexRawClient = knex({
    client: 'pg',
    connection,
  });

  try {
    logger.info({ message: 'Creating database' });
    console.log(dbClient.getDatabaseName());
    await knexRawClient.raw(`CREATE DATABASE "${dbClient.getDatabaseName()}"`);
    logger.info({ message: 'Database created' });
  } catch (errorRaw) {
    const error = LoggerModule.convertToError(errorRaw);
    if ('code' in error && error.code === '42P04') {
      logger.info({ message: 'Database already exists. Skipping creation' });
      return;
    }

    logger.error(error);

    throw error;
  } finally {
    await knexRawClient.destroy();
  }
};

setupDb();
