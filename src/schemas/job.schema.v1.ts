import { z } from 'zod';

import { TimeStampSchema } from './common.schema';

export const JobStatusEnum = z.enum(['created', 'processing', 'completed', 'failed']);
export type JobStatus = z.infer<typeof JobStatusEnum>;

const JobSchemaCommon = z.object({
  id: z.string(),
  name: z.string(),
  version: z.literal('1.0.0'),
  status: JobStatusEnum,
});

// New job schema
export const NewJobSchema = JobSchemaCommon.merge(
  z.object({
    description: z.string().nonempty(),
    status: z.literal(JobStatusEnum.Values.created),
    createdAt: TimeStampSchema,
    logs: z.array(z.string()).optional(),
    logFilePath: z.string().optional(),
  })
).refine(
  (data) => {
    const hasLogs = data.logs && data.logs.length > 0;
    const hasLogFilePath = !!data.logFilePath;
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
    status: z.literal(JobStatusEnum.Values.processing),
    startedAt: TimeStampSchema,
  })
);
export type JobProcessing = z.infer<typeof JobProcessingSchema>;

// Job success schema
export const JobSuccessSchema = JobSchemaCommon.merge(
  z.object({
    status: z.literal(JobStatusEnum.Values.completed),
    completedAt: TimeStampSchema,
    results: z.array(z.string()).optional(),
    resultFilePath: z.string().optional(),
  })
).refine(
  (data) => {
    const hasResults = data.results && data.results.length > 0;
    const hasResultFilePath = !!data.resultFilePath;
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
    status: z.literal(JobStatusEnum.Values.failed),
    completedAt: TimeStampSchema,
    error: z.string(),
    errorCode: z.string().optional(),
    errorDetails: z.string().optional(),
  })
).refine(
  (data) => {
    const hasErrorDetails = !!data.errorDetails;
    const hasErrorCode = !!data.errorCode;
    const hasError = !!data.error;
    return hasErrorDetails || hasErrorCode || hasError;
  },
  {
    message: 'At least one of error, errorCode, or errorDetails must be provided.',
  }
);
export type JobFailure = z.infer<typeof JobFailureSchema>;

// Job completed schema
export const JobCompletedSchema = z.union([JobSuccessSchema, JobFailureSchema]);
export type JobCompleted = z.infer<typeof JobCompletedSchema>;

// Job schema
export const JobSchema = z.union([NewJobSchema, JobProcessingSchema, JobCompletedSchema]);
export type Job = z.infer<typeof JobSchema>;
