import 'reflect-metadata';

// Based on V1.JobSchema
// file: ./src/schemas/job.schema.v1.ts
import { ClientModule } from '../../clients';
import { searchClient, logger, config } from '../../container';
import { LoggerModule } from '../../logger';

const JobElasticSearchSchema = {
  settings: {
    analysis: {
      analyzer: {
        lowercase_analyzer: {
          type: 'custom',
          tokenizer: 'standard',
          filter: ['lowercase'],
        },
      },
    },
  },
  mappings: {
    properties: {
      id: { type: 'keyword' },
      version: { type: 'keyword' },
      status: { type: 'keyword' },
      tags: { type: 'keyword' },
      task_group_id: { type: 'keyword' },
      created_at: { type: 'date' },
      completed_at: { type: 'date' },
      logs: {
        type: 'object',
        enabled: false,
      },
      results: {
        type: 'nested',
        properties: {
          field: {
            type: 'text',
          },
          type: { type: 'keyword' },
          source: { type: 'keyword' },
          service: { type: 'keyword' },
          value: {
            type: 'text',
          },
          log_entry: {
            type: 'object',
            enabled: false,
          },
        },
      },
    },
  },
};

export const setupSearchSchema = async (): Promise<void> => {
  logger.info({ message: 'Creating elasticsearch schema' });

  try {
    await setUpJobSchema(searchClient);
  } catch (errorRaw) {
    const error = LoggerModule.convertToError(errorRaw);
    logger.error(error);
    throw error;
  }
};

const setUpJobSchema = async (
  searchClient: ClientModule.SearchClientModule.SearchClient
): Promise<null> => {
  const index = config.get('JOB_ELASTICSEARCH_INDEX');
  logger.info({ message: `Creating schema: ${index}` });
  const result = await searchClient.createIndex(index, JobElasticSearchSchema);
  if (LoggerModule.isError(result)) {
    throw result;
  }

  return null;
};

setupSearchSchema();
