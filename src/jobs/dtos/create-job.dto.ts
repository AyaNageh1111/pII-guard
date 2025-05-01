import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';

import { LoggerModule } from '../../logger';
import { SchemaModule } from '../../schemas/';

export class InvalidCreateJobError extends LoggerModule.BaseError {
  constructor(message: string, metaData?: Record<string, unknown>) {
    super(message, undefined, undefined, metaData);
  }
}

export class DuplicateJobError extends LoggerModule.BaseError {
  constructor(message: string, metaData?: Record<string, unknown>) {
    super(message, undefined, undefined, metaData);
  }
}

export const CreateJobDtoForV1 = SchemaModule.V1.NewJobSchema.omit({
  id: true,
  created_at: true,
  status: true,
}).extend({
  task_group_id: z.string().optional().default(uuidv4()),
});

export type CreateJobDtoForV1 = z.infer<typeof CreateJobDtoForV1>;
export function createdJobDtoToV1(data: unknown): CreateJobDtoForV1 | InvalidCreateJobError {
  const parsed = CreateJobDtoForV1.safeParse(data);
  if (parsed.success) {
    return parsed.data;
  }

  return new InvalidCreateJobError('Invalid job data', {
    errors: parsed.error.flatten().fieldErrors,
  });
}
