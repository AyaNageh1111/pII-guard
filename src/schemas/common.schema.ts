import { z } from 'zod';

export const TimeStampSchema = z
  .number()
  .refine(
    (value: unknown) => {
      if (value === null || value === undefined) {
        return false;
      }

      const parsedDate = Date.parse(value.toString());
      return !isNaN(parsedDate) && parsedDate > 0;
    },
    {
      message: 'Invalid timestamp',
    }
  )
  .brand<number>();
export type TimeStamp = z.infer<typeof TimeStampSchema>;
