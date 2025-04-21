import 'reflect-metadata';
import { Knex } from 'knex';

// Based on V1.JobSchema
// file: ./src/schemas/job.schema.v1.ts
import { dbClient, logger } from '../../container';
import { LoggerModule } from '../../logger';

export const setupSchema = async (): Promise<void> => {
  logger.info({ message: 'Creating schema' });

  await dbClient.init();
  const knexPgClient = dbClient.getClient();
  const trx = await knexPgClient.transaction();

  try {
    await setUpJobSchema(trx);
    await trx.commit();
  } catch (errorRaw) {
    const error = LoggerModule.convertToError(errorRaw);
    logger.error(error);
    await trx.rollback();
    throw error;
  } finally {
    await dbClient.disconnect();
  }
};

const setUpJobSchema = async (knexTrx: Knex.Transaction): Promise<null | Error> => {
  const SCHEMA = 'jobs';

  try {
    logger.info({ message: `Creating schema: ${SCHEMA}` });
    const hasSchema = await knexTrx.schema.hasTable(SCHEMA);

    if (!hasSchema) {
      await knexTrx.schema.createTable(SCHEMA, (table) => {
        table.increments('id').primary();
        table.string('version').defaultTo('1.0.0').notNullable();
        table.string('status').notNullable();
        table.text('logs').notNullable();
        table.text('results').nullable();
        table.string('error_message').nullable();
        table.string('error_code').nullable();
        table.string('error_details').nullable();

        table.dateTime('created_at').defaultTo(knexTrx.fn.now());
        table.dateTime('updated_at').defaultTo(knexTrx.fn.now());
        table.dateTime('completed_at').nullable();

        table.index(['status'], 'job_status_index_');
      });
      logger.info({ message: `${SCHEMA} schema created` });
    } else {
      logger.info({ message: `${SCHEMA} already exists. Skipping creation` });
    }
    return null;
  } catch (errorRaw) {
    const error = LoggerModule.convertToError(errorRaw);
    logger.error(error);
    return error;
  }
};

setupSchema();
