import { z } from 'zod';

import { LoggerModule } from '../../logger';

export class InvalidGetByIdJobError extends LoggerModule.BaseError {
  constructor(message: string, metaData?: Record<string, unknown>) {
    super(message, undefined, undefined, metaData);
  }
}

export const GetJobByIdDtoForV1 = z.object({
  id: z.string(),
});
export type GetJobByIdDtoForV1 = z.infer<typeof GetJobByIdDtoForV1>;
export function getJobByIdDtoToV1(data: unknown): GetJobByIdDtoForV1 | InvalidGetByIdJobError {
  const parsed = GetJobByIdDtoForV1.safeParse(data);
  if (parsed.success) {
    return parsed.data;
  }

  return new InvalidGetByIdJobError('Invalid job data', {
    errors: parsed.error.flatten().fieldErrors,
  });
}
