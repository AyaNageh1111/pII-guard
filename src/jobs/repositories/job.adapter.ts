import { injectable, inject } from 'inversify';

import { ClientModule } from '../../clients';
import { ConfigsModule } from '../../configs';
import { LoggerModule } from '../../logger';
import { SchemaModule } from '../../schemas';

import {
  JobRepository,
  JobAlreadyExistsError,
  InvalidJobDataError,
  JobNotFoundError,
  SearchUpdateError,
} from './job.interface';

@injectable()
export class JobRepositoryAdapter implements JobRepository {
  private readonly table = 'jobs';
  private readonly searchIndex;

  constructor(
    @inject(ClientModule.DbClientModule.DB_CLIENT)
    private readonly dbClient: ClientModule.DbClientModule.DbClient<ClientModule.DbClientModule.SqlDbClientType>,
    @inject(ClientModule.SearchClientModule.SEARCH_CLIENT)
    private readonly searchClient: ClientModule.SearchClientModule.SearchClient,
    @inject(ConfigsModule.CONFIGS) private readonly configs: ConfigsModule.Configs
  ) {
    this.searchIndex = this.configs.get('JOB_ELASTICSEARCH_INDEX');
  }

  createJob: JobRepository['createJob'] = async (params) => {
    try {
      const [result] = await this.db(this.table)
        .insert({
          ...params,
          status: SchemaModule.V1.JobStatusEnumSchema.Values.processing,
          logs: JSON.stringify(params.logs),
        })
        .into(this.table)
        .returning('*');
      const createdJobResult = SchemaModule.V1.createNewJob(result);
      if (LoggerModule.isError(createdJobResult)) {
        return new InvalidJobDataError('Invalid job data', createdJobResult);
      }

      return createdJobResult;
    } catch (errorRaw) {
      const error = this.handleUniqueViolationError(errorRaw, params);
      if (error) {
        return error;
      }

      return new LoggerModule.BaseError(
        'Unable to create job',
        LoggerModule.convertToError(errorRaw),
        undefined,
        params
      );
    }
  };

  getJobById: JobRepository['getJobById'] = async (params) => {
    try {
      const [result] = await this.db(this.table).where({ id: params.id }).select('*');
      if (!result) {
        return new JobNotFoundError('Job not found', undefined, {
          params,
        });
      }

      const jobResult = SchemaModule.V1.createJob(result);
      if (LoggerModule.isError(jobResult)) {
        return new InvalidJobDataError('Invalid job data', jobResult);
      }

      return jobResult;
    } catch (errorRaw) {
      return new InvalidJobDataError(
        'Unable to get job by id',
        LoggerModule.convertToError(errorRaw),
        params
      );
    }
  };

  filterJobs: JobRepository['filterJobs'] = async (params) => {
    try {
      const filters: Array<Record<string, unknown>> = [];
      if (params.tags?.length) {
        filters.push({
          terms: {
            tags: params.tags,
          },
        });
      }

      if (params.status) {
        filters.push({
          term: { status: params.status },
        });
      }

      const sort: Array<Record<string, string>> = [
        {
          [params.sort_by]: params.sort_direction,
        },
      ];
      const result = await this.searchClient.search(
        {
          from: params.page * params.page_size,
          size: params.page_size,
          sort,
          query: {
            bool: {
              filter: filters,
            },
          },
        },
        this.searchIndex
      );

      if (LoggerModule.isError(result)) {
        return new InvalidJobDataError('Unable to search', result, {
          params,
        });
      }

      const jobsResult = result.map(
        (job: unknown): SchemaModule.V1.Job | SchemaModule.V1.JobError =>
          SchemaModule.V1.createJob(job)
      );
      const [validResults, invalidResults] = jobsResult.reduce<
        [Array<SchemaModule.V1.Job>, Array<SchemaModule.V1.JobError>]
      >(
        (acc, result) => {
          const [validResults, invalidResults] = acc;
          if (LoggerModule.isError(result)) {
            invalidResults.push(result);
          } else {
            validResults.push(result);
          }

          return [validResults, invalidResults];
        },
        [[], []]
      );

      if (invalidResults.length) {
        return new InvalidJobDataError('Invalid job data in search', undefined, {
          parseResult: jobsResult,
          searchResult: result,
        });
      }
      return validResults;
    } catch (errorRaw) {
      return new InvalidJobDataError(
        'Unable to filter jobs',
        LoggerModule.convertToError(errorRaw),
        params
      );
    }
  };

  updateJob: JobRepository['updateJob'] = async (params) => {
    try {
      const foundJobResult = await this.getJobById({ id: params.id });
      if (!foundJobResult) {
        return new JobNotFoundError('Job not found', undefined, params);
      }

      if (LoggerModule.isError(foundJobResult)) {
        return foundJobResult;
      }

      const newTags = new Set(...params.tags, ...foundJobResult.tags);
      const [updatedJobResult] = await this.db(this.table)
        .where({ id: params.id })
        .update({
          ...params,
          id: foundJobResult.id,
          logs: JSON.stringify(foundJobResult.logs),
          results: SchemaModule.V1.isJobSuccess(params) ? JSON.stringify(params.results) : null,
          tags: JSON.stringify(Array.from(newTags)),
        })
        .returning('*');

      const jobResult = SchemaModule.V1.createJob(updatedJobResult);

      if (LoggerModule.isError(jobResult)) {
        return new InvalidJobDataError('Invalid job data', jobResult);
      }

      return jobResult;
    } catch (errorRaw) {
      return new LoggerModule.BaseError(
        'Unable to update job',
        LoggerModule.convertToError(errorRaw),
        undefined,
        params
      );
    }
  };

  upsertSearch: JobRepository['upsertSearch'] = async (params) => {
    const upsertResults = await this.searchClient.upsert(params.id, params, this.searchIndex);

    if (LoggerModule.isError(upsertResults)) {
      return new SearchUpdateError(upsertResults.message, upsertResults, {
        params,
      });
    }

    return params;
  };

  isInvalidJobDataError: JobRepository['isInvalidJobDataError'] = (error) =>
    error instanceof InvalidJobDataError;

  isJobNotFoundError: JobRepository['isJobNotFoundError'] = (error) =>
    error instanceof JobNotFoundError;

  isJobAlreadyExistsError: JobRepository['isJobAlreadyExistsError'] = (error) =>
    error instanceof JobAlreadyExistsError;

  private db(
    tableName: string | Record<string, string>
  ): ReturnType<ClientModule.DbClientModule.SqlDbClientType> {
    return this.dbClient.getClient()(tableName);
  }

  private handleUniqueViolationError(
    errorRaw: unknown,
    meta: Record<string, unknown>
  ): null | JobAlreadyExistsError {
    if (typeof errorRaw === 'object' && errorRaw) {
      if ('code' in errorRaw) {
        if (errorRaw.code === '23505') {
          return new JobAlreadyExistsError(
            'Unique constraint violation',
            LoggerModule.convertToError(errorRaw),
            meta
          );
        }
      }
    }

    return null;
  }
}
