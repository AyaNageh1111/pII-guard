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
    await knexRawClient.raw(`CREATE DATABASE "${dbClient.getDatabaseName()}"`);
    logger.info({ message: 'Database created' });
  } catch (errorRaw) {
    if (errorRaw instanceof Error && 'code' in errorRaw && errorRaw.code === '42P04') {
      logger.info({ message: 'Database already exists. Skipping creation' });
      return;
    }

    const error = LoggerModule.convertToError(errorRaw);
    logger.error(error);

    throw error;
  } finally {
    await knexRawClient.destroy();
  }
};

setupDb();
