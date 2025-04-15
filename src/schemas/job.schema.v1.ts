import { z } from 'zod';

import { BaseError } from '../logger/';

import { TimeStampSchema } from './common.schema';
import { FindingSchema } from './finding.schema.v1';

export class JobError extends BaseError {
  constructor(message: string, metaData?: Record<string, unknown>) {
    super(message, undefined, undefined, metaData);
  }
}

export function isJobError(job: unknown): job is JobError {
  return job instanceof JobError;
}

export const JobStatusEnumSchema = z.enum(['created', 'processing', 'success', 'failed']);
export type JobStatus = z.infer<typeof JobStatusEnumSchema>;

const JobSchemaCommon = z.object({
  id: z.string(),
  name: z.string(),
  version: z.literal('1.0.0'),
  status: JobStatusEnumSchema,
});

// New job schema
export const NewJobSchema = JobSchemaCommon.merge(
  z.object({
    description: z.string().nonempty(),
    status: z.literal(JobStatusEnumSchema.Values.created),
    created_at: TimeStampSchema,
    logs: z.array(z.string()).optional(),
    log_file_path: z.string().optional(),
  })
).refine(
  (data) => {
    const hasLogs = data.logs && data.logs.length > 0;
    const hasLogFilePath = !!data.log_file_path;
    if (hasLogs && hasLogFilePath) {
      return false;
    }

    return hasLogs || hasLogFilePath;
  },
  {
    message: 'Either logs or logFilePath must be provided, but not both.',
  }
);
export type NewJob = z.infer<typeof NewJobSchema>;

// Job processing schema
export const JobProcessingSchema = JobSchemaCommon.merge(
  z.object({
    status: z.literal(JobStatusEnumSchema.Values.processing),
    started_at: TimeStampSchema,
  })
);
export type JobProcessing = z.infer<typeof JobProcessingSchema>;

// Job success schema
export const JobSuccessSchema = JobSchemaCommon.merge(
  z.object({
    status: z.literal(JobStatusEnumSchema.Values.success),
    success_at: TimeStampSchema,
    results: z.array(FindingSchema).optional(),
    result_file_path: z.string().optional(),
  })
).refine(
  (data) => {
    const hasResults = data.results && data.results.length > 0;
    const hasResultFilePath = !!data.result_file_path;
    if (hasResults && hasResultFilePath) {
      return false;
    }
    return hasResults || hasResultFilePath;
  },
  {
    message: 'Either results or resultFilePath must be provided, but not both.',
  }
);
export type JobSuccess = z.infer<typeof JobSuccessSchema>;

// Job failure schema
export const JobFailureSchema = JobSchemaCommon.merge(
  z.object({
    status: z.literal(JobStatusEnumSchema.Values.failed),
    success_at: TimeStampSchema,
    error_message: z.string().nonempty(),
    error_code: z.string().nonempty(),
    error_details: z.string().optional(),
  })
);
export type JobFailure = z.infer<typeof JobFailureSchema>;

// Job success schema
export const JobsuccessSchema = z.union([JobSuccessSchema, JobFailureSchema]);
export type Jobsuccess = z.infer<typeof JobsuccessSchema>;

// Job schema
export const JobSchema = z.union([NewJobSchema, JobProcessingSchema, JobsuccessSchema]);
export type Job = z.infer<typeof JobSchema>;
export function isJob(job: unknown): job is Job {
  return JobSchema.safeParse(job).success;
}

// Job creation functions
// New job
export function isNewJob(job: unknown): job is NewJob {
  return NewJobSchema.safeParse(job).success;
}
export function createNewJob(job: Partial<NewJob>): NewJob | JobError {
  const { success, data, error } = NewJobSchema.safeParse(job);
  if (!success) {
    return new JobError('Invalid new job data', {
      cause: error,
      metaData: job,
    });
  }
  return data;
}

// Job processing
export function createJobProcessing(job: Partial<JobProcessing>): JobProcessing | JobError {
  const { success, data, error } = JobProcessingSchema.safeParse(job);
  if (!success) {
    return new JobError('Invalid job processing data', {
      cause: error,
      metaData: job,
    });
  }
  return data;
}
export function isJobProcessing(job: unknown): job is JobProcessing {
  return JobProcessingSchema.safeParse(job).success;
}

// Job success
export function createJobSuccess(job: Partial<JobSuccess>): JobSuccess | JobError {
  const { success, data, error } = JobSuccessSchema.safeParse(job);
  if (!success) {
    return new JobError('Invalid job success data', {
      cause: error,
      metaData: job,
    });
  }
  return data;
}
export function isJobSuccess(job: unknown): job is JobSuccess {
  return JobSuccessSchema.safeParse(job).success;
}

// Job failure
export function isJobFailure(job: unknown): job is JobFailure {
  return JobFailureSchema.safeParse(job).success;
}
export function createJobFailure(job: Partial<JobFailure>): JobFailure | JobError {
  const { success, data, error } = JobFailureSchema.safeParse(job);
  if (!success) {
    return new JobError('Invalid job failure data', {
      cause: error,
      metaData: job,
    });
  }
  return data;
}

// Job success
export function isJobsuccess(job: unknown): job is Jobsuccess {
  return JobsuccessSchema.safeParse(job).success;
}
