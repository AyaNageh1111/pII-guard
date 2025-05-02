import { z } from "zod";

export const JobStatusEnum = z.enum(['processing', 'failed', 'success']);

export const PiiResultSchema = z.object({
  field: z.string(),
  type: z.string(),
  source: z.string()
});

export const JobSchema = z.object({
  id: z.string(),
  version: z.string(),
  status: JobStatusEnum,
  tags: z.array(z.string()),
  created_at: z.string(),
  logs: z.array(z.string()),
  completed_at: z.string().optional(),
  error_message: z.string().optional(),
  error_code: z.string().optional(),
  error_details: z.string().optional(),
  results: z.array(PiiResultSchema).optional()
});

export const FilterJobsDTO = z.object({
  status: JobStatusEnum.optional(),
  tags: z.array(z.string()).min(0).max(100).optional(),
  sort_direction: z.enum(['asc', 'desc']).optional().default('desc'),
  sort_by: z.enum(['created_at', 'updated_at']).optional().default('created_at'),
  page: z.preprocess(Number, z.number().min(0)).optional().default(0),
  page_size: z.preprocess(Number, z.number().min(0).max(100)).optional().default(10),
});

export type Job = z.infer<typeof JobSchema>;
export type FilterJobsDTOType = z.infer<typeof FilterJobsDTO>;
export type PiiResult = z.infer<typeof PiiResultSchema>;