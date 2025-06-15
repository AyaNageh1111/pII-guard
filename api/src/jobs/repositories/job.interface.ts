import { LoggerModule } from '../../logger';
import { SchemaModule } from '../../schemas';
import { JobDto } from '../dtos/';

export const JOB_REPOSITORY = Symbol.for('JOB_REPOSITORY');

export class SearchUpdateError extends LoggerModule.BaseError {
  constructor(message: string, cause?: Error, metaData?: Record<string, unknown>) {
    super(message, cause, undefined, metaData);
  }
}
export class InvalidJobDataError extends LoggerModule.BaseError {
  constructor(message: string, cause?: Error, metaData?: Record<string, unknown>) {
    super(message, cause, undefined, metaData);
  }
}
export class JobNotFoundError extends LoggerModule.BaseError {
  constructor(message: string, cause?: Error, metaData?: Record<string, unknown>) {
    super(message, cause, undefined, metaData);
  }
}
export class JobAlreadyExistsError extends LoggerModule.BaseError {
  constructor(message: string, cause?: Error, metaData?: Record<string, unknown>) {
    super(message, cause, undefined, metaData);
  }
}
export class SearchJobError extends LoggerModule.BaseError {
  constructor(message: string, cause?: Error, metaData?: Record<string, unknown>) {
    super(message, cause, undefined, metaData);
  }
}
export interface JobRepository {
  createJob(
    params: JobDto.CreateJobDtoForV1
  ): Promise<SchemaModule.V1.Job | JobAlreadyExistsError | InvalidJobDataError>;
  getJobById(
    params: JobDto.GetJobByIdDtoForV1
  ): Promise<null | SchemaModule.V1.Job | InvalidJobDataError>;
  filterJobs(
    params: JobDto.FilterJobsDtoForV1
  ): Promise<Array<SchemaModule.V1.Job> | InvalidJobDataError>;
  updateJob(
    params: JobDto.UpdateJobDtoForV1
  ): Promise<SchemaModule.V1.Job | InvalidJobDataError | JobNotFoundError>;
  upsertSearch(
    params: SchemaModule.V1.Job
  ): Promise<SchemaModule.V1.Job | SearchUpdateError | InvalidJobDataError>;
  search(
    params: JobDto.SearchJob
  ): Promise<Array<SchemaModule.V1.Job> | SearchJobError | InvalidJobDataError>;
  isInvalidJobDataError(error: unknown): error is InvalidJobDataError;
  isJobNotFoundError(error: unknown): error is JobNotFoundError;
  isJobAlreadyExistsError(error: unknown): error is JobAlreadyExistsError;
}
