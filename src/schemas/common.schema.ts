import { z } from 'zod';

export const TimeStampSchema = z
  .preprocess((value) => {
    if (value instanceof Date) {
      return value;
    }

    if (typeof value === 'string') {
      const parsedDate = Date.parse(value.toString());
      return !isNaN(parsedDate) && parsedDate > 0 ? undefined : parsedDate;
    }

    return z.NEVER;
  }, z.date())
  .brand<number>();
export type TimeStamp = z.infer<typeof TimeStampSchema>;
