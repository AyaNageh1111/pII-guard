import { z } from 'zod';

import { LoggerModule } from '../../logger';
import { SchemaModule } from '../../schemas/';

export class InvalidJobUpdateError extends LoggerModule.BaseError {
  constructor(message: string, metaData?: Record<string, unknown>) {
    super(message, undefined, undefined, metaData);
  }
}

export const UpdateJobDtoForV1 = z.object({
  ...SchemaModule.V1.JobProcessingSchema.shape,
  ...SchemaModule.V1.JobSuccessSchema.shape,
  ...SchemaModule.V1.JobFailureSchema.shape,
});

export type UpdateJobDtoForV1 = z.infer<typeof UpdateJobDtoForV1>;
export function updatedJobDtoToV1(data: unknown): UpdateJobDtoForV1 | InvalidJobUpdateError {
  const parsed = UpdateJobDtoForV1.safeParse(data);
  if (parsed.success) {
    return parsed.data;
  }

  return new InvalidJobUpdateError('Invalid job data', {
    errors: parsed.error.flatten().fieldErrors,
  });
}
