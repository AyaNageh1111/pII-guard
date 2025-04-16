import { z } from 'zod';

import { LoggerModule } from '../../../logger';
import { SchemaModule } from '../../../schemas/';

export class InvalidJobError extends LoggerModule.BaseError {
  constructor(message: string, metaData?: Record<string, unknown>) {
    super(message, undefined, undefined, metaData);
  }
}

export const CreateJobDtoForV1 = SchemaModule.V1.NewJobSchema.omit({
  id: true,
  created_at: true,
  status: true,
});

export type CreateJobDtoForV1 = z.infer<typeof CreateJobDtoForV1>;
export function createdJobDtoToV1(data: unknown): CreateJobDtoForV1 | InvalidJobError {
  const parsed = CreateJobDtoForV1.safeParse(data);
  if (parsed.success) {
    return parsed.data;
  }

  return new InvalidJobError('Invalid job data', {
    errors: parsed.error.flatten().fieldErrors,
  });
}
