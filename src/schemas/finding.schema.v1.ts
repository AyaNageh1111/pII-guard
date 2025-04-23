import { z } from 'zod';

import { LoggerModule } from '../logger';

import { PiiTypes } from './pii-tags.schema.v1';

export class FindingError extends LoggerModule.BaseError {
  constructor(message: string, metaData?: Record<string, unknown>) {
    super(message, undefined, undefined, metaData);
  }
}

export function isFindingError(finding: unknown): finding is FindingError {
  return finding instanceof FindingError;
}

export const ConfidenceEnumSchema = z.enum(['low', 'medium', 'high']);
export const RiskEnumSchema = z.enum(['low', 'moderate', 'severe']);
export const SourceEnumSchema = z.enum(['header', 'body', 'log-message', 'query-param', 'unknown']);
export const ReviewStatusEnumSchema = z.enum(['pending', 'reviewed', 'approved', 'rejected']);
export const FindingSchema = z.object({
  field: z.string(),
  type: z.enum(PiiTypes),
  source: SourceEnumSchema.optional(),
});

export type ConfidenceEnum = z.infer<typeof ConfidenceEnumSchema>;
export type RiskEnum = z.infer<typeof RiskEnumSchema>;
export type SourceEnum = z.infer<typeof SourceEnumSchema>;
export type ReviewStatusEnum = z.infer<typeof ReviewStatusEnumSchema>;

export type Finding = z.infer<typeof FindingSchema>;
export function createFinding(finding: Partial<Finding>): Finding | FindingError {
  const { success, data, error } = FindingSchema.safeParse(finding);
  if (!success) {
    return new FindingError('Invalid finding data', {
      cause: error,
      metaData: finding,
    });
  }
  return data;
}
