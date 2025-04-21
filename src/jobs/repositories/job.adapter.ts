import { injectable, inject } from 'inversify';

import { ClientModule } from '../../clients';
import { LoggerModule } from '../../logger';
import { SchemaModule } from '../../schemas';

import {
  JobRepository,
  JobAlreadyExistsError,
  InvalidJobDataError,
  JobNotFoundError,
} from './job.interface';

@injectable()
export class JobRepositoryAdapter implements JobRepository {
  private readonly table = 'jobs';

  constructor(
    @inject(ClientModule.DbClientModule.DB_CLIENT)
    private readonly dbClient: ClientModule.DbClientModule.DbClient<ClientModule.DbClientModule.SqlDbClientType>
  ) {}

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
        return null;
      }
      const jobResult = SchemaModule.V1.JobSchema.parse(result);
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
      const query = this.db(this.table)
        .select('*')
        .where({ status: params.status })
        .orderBy(params.sort_by, params.sort_direction)
        .limit(params.page_size)
        .offset(params.page * params.page_size);
      const [result] = await query;
      if (!result) {
        return [];
      }
      const jobsResult = result.map(
        (job: unknown): SchemaModule.V1.Job => SchemaModule.V1.JobSchema.parse(job)
      );
      if (jobsResult.some((job: unknown): job is Error => LoggerModule.isError(job))) {
        return new InvalidJobDataError('Invalid job data', jobsResult);
      }
      return jobsResult;
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

      const updatedJobResult = await this.db(this.table)
        .where({ id: params.id })
        .update(params)
        .returning('*');

      const jobResult = SchemaModule.V1.JobSchema.parse(updatedJobResult);
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
