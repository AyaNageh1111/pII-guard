import { z } from 'zod';

import { LoggerModule } from '../logger';

import { TimeStampSchema } from './common.schema';
import { FindingSchema } from './finding.schema.v1';

export class JobError extends LoggerModule.BaseError {
  constructor(message: string, metaData?: Record<string, unknown>) {
    super(message, undefined, undefined, metaData);
  }
}

export function isJobError(job: unknown): job is JobError {
  return job instanceof JobError;
}

export const JobStatusEnumSchema = z.enum(['processing', 'success', 'failed']);
export type JobStatus = z.infer<typeof JobStatusEnumSchema>;

const JobSchemaCommon = z.object({
  id: z.preprocess(String, z.string()),
  version: z.literal('1.0.0'),
  status: JobStatusEnumSchema,
});

// New job schema
export const NewJobSchema = JobSchemaCommon.merge(
  z.object({
    status: z.literal(JobStatusEnumSchema.Values.processing),
    created_at: TimeStampSchema.default(new Date()),
    logs: z.preprocess((value) => {
      if (typeof value !== 'string') {
        return value;
      }
      try {
        return JSON.parse(value as string);
      } catch (error) {
        return z.NEVER;
      }
    }, z.array(z.string()).min(0).max(100)),
  })
);
export type NewJob = z.infer<typeof NewJobSchema>;

// Job success schema
export const JobSuccessSchema = JobSchemaCommon.merge(
  z.object({
    status: z.literal(JobStatusEnumSchema.Values.success),
    completed_at: TimeStampSchema.default(Date.now()),
    results: FindingSchema.optional(),
  })
);
export type JobSuccess = z.infer<typeof JobSuccessSchema>;

// Job failure schema
export const JobFailureSchema = JobSchemaCommon.merge(
  z.object({
    status: z.literal(JobStatusEnumSchema.Values.failed),
    completed_at: TimeStampSchema.default(Date.now()),
    error_message: z.string().nonempty(),
    error_code: z.string().nonempty(),
    error_details: z.string().optional(),
  })
);
export type JobFailure = z.infer<typeof JobFailureSchema>;

// Job schema
export const JobSchema = z.discriminatedUnion('status', [
  NewJobSchema,
  JobSuccessSchema,
  JobFailureSchema,
]);
export type Job = z.infer<typeof JobSchema>;
export function isJob(job: unknown): job is Job {
  return JobSchema.safeParse(job).success;
}
export function createJob(job: unknown): Job | JobError {
  const { success, data, error } = JobSchema.safeParse(job);
  if (!success) {
    return new JobError('Invalid job data', {
      cause: error,
      metaData: job,
    });
  }
  return data;
}

// Job creation functions
// New job
export function isNewJob(job: unknown): job is NewJob {
  return NewJobSchema.safeParse(job).success;
}
export function createNewJob(job: unknown): NewJob | JobError {
  const { success, data, error } = NewJobSchema.safeParse(job);
  if (!success) {
    return new JobError('Invalid new job data', {
      cause: error,
      metaData: job,
    });
  }
  return data;
}

// Job success
export function createJobSuccess(job: unknown): JobSuccess | JobError {
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
export function createJobFailure(job: unknown): JobFailure | JobError {
  const { success, data, error } = JobFailureSchema.safeParse(job);
  if (!success) {
    return new JobError('Invalid job failure data', {
      cause: error,
      metaData: job,
    });
  }
  return data;
}

// Job complete
export const JobCompleteSchema = z.discriminatedUnion('status', [
  JobSuccessSchema,
  JobFailureSchema,
]);
export type JobComplete = z.infer<typeof JobCompleteSchema>;
export function isJobComplete(job: unknown): job is JobSuccess | JobFailure {
  return JobSuccessSchema.safeParse(job).success || JobFailureSchema.safeParse(job).success;
}
