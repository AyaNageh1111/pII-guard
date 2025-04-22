import { z } from 'zod';

import { LoggerModule } from '../../logger';
import { SchemaModule } from '../../schemas/';

export class InvalidFilterJobsError extends LoggerModule.BaseError {
  constructor(message: string, metaData?: Record<string, unknown>) {
    super(message, undefined, undefined, metaData);
  }
}
export const FilterJobsDtoForV1 = z.object({
  status: SchemaModule.V1.JobStatusEnumSchema.optional(),
  sort_direction: z.enum(['asc', 'desc']).optional().default('desc'),
  sort_by: z.enum(['created_at', 'updated_at']).optional().default('created_at'),
  page: z.number().min(0).optional().default(0),
  page_size: z.number().min(0).max(100).optional().default(10),
});
export type FilterJobsDtoForV1 = z.infer<typeof FilterJobsDtoForV1>;
export function filterJobsDtoToV1(data: unknown): FilterJobsDtoForV1 | InvalidFilterJobsError {
  const parsed = FilterJobsDtoForV1.safeParse(data);
  if (parsed.success) {
    return parsed.data;
  }

  return new InvalidFilterJobsError('Invalid job data', {
    errors: parsed.error.flatten().fieldErrors,
  });
}
