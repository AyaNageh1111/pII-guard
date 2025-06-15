import { z } from 'zod';

import { LoggerModule } from '../../logger';

export class InvalidSearchTerm extends LoggerModule.BaseError {
  constructor(message: string, metaData?: Record<string, unknown>) {
    super(message, undefined, undefined, metaData);
  }
}

export const SearchJob = z
  .string()
  .min(4, 'Search term must be at least 4 characters long')
  .max(255, 'Search term must be at most 255 characters long');

export type SearchJob = z.infer<typeof SearchJob>;
export function searchDtoToV1(data: unknown): SearchJob | InvalidSearchTerm {
  const parsed = SearchJob.safeParse(data);
  if (parsed.success) {
    return parsed.data;
  }

  return new InvalidSearchTerm('Invalid search term', {
    errors: parsed.error.flatten().fieldErrors,
  });
}
