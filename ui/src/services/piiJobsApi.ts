
import { z } from "zod";

// Simple string schemas without restrictions
export const ConfidenceEnumSchema = z.string();
export const RiskEnumSchema = z.string();
export const SourceEnumSchema = z.string();
export const ReviewStatusEnumSchema = z.string();

export const PiiTypes = ['email', 'phone', 'name', 'address', 'ssn', 'credit_card', 'ip'] as const;
export const PiiTypesSchema = z.string();

// Schemas
export const FindingSchema = z.object({
  field: z.string(),
  type: z.string(),
  source: z.string().optional(),
});

export const JobSchema = z.object({
  id: z.string(),
  version: z.string().optional(),
  status: z.string(),
  tags: z.array(z.string()),
  created_at: z.string(),
  logs: z.array(z.string()).optional(),
  completed_at: z.string().optional(),
  error_message: z.string().optional(),
  error_code: z.string().optional(),
  error_details: z.string().optional(),
  results: z.array(FindingSchema).optional(),
  task_group_id: z.string().optional(),
});

export type Finding = z.infer<typeof FindingSchema>;
export type Job = z.infer<typeof JobSchema>;

export const fetchPiiJobs = async (filters?: {
  status?: string[];
  tags?: string[];
  piiTypes?: string[];
  dateRange?: { from: Date; to: Date };
  searchQuery?: string;
  page?: number;
  pageSize?: number;
}): Promise<Job[]> => {
  try {
    // Build the URL with query parameters
    let url = 'http://localhost:8888/api/jobs';
    const queryParams = new URLSearchParams();
    
    // Add filters to query parameters
    if (filters?.page) {
      queryParams.append('page', filters.page.toString());
    }
    
    if (filters?.pageSize) {
      queryParams.append('page_size', filters.pageSize.toString());
    }
    
    if (filters?.status && filters.status.length > 0) {
      filters.status.forEach(status => {
        queryParams.append('status', status);
      });
    }
    
    if (filters?.tags && filters.tags.length > 0) {
      filters.tags.forEach(tag => {
        queryParams.append('tag', tag);
      });
    }
    
    if (filters?.piiTypes && filters.piiTypes.length > 0) {
      filters.piiTypes.forEach(type => {
        queryParams.append('pii_type', type);
      });
    }
    
    if (filters?.searchQuery) {
      queryParams.append('search', filters.searchQuery);
    }
    
    if (filters?.dateRange?.from && filters?.dateRange?.to) {
      queryParams.append('date_from', filters.dateRange.from.toISOString());
      queryParams.append('date_to', filters.dateRange.to.toISOString());
    }
    
    // Append query parameters to the URL if any
    const queryString = queryParams.toString();
    if (queryString) {
      url = `${url}?${queryString}`;
    }
    
    console.log(`Fetching jobs from API: ${url}`);
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch PII jobs: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    return z.array(JobSchema).parse(data);
    
  } catch (error) {
    console.error('Error fetching PII jobs:', error);
    throw error;
  }
};

// Keeping mockPiiJobs for fallback or testing purposes, but it won't be used by default
export const mockPiiJobs: Job[] = [
  {
    id: "job_12345",
    version: "1.0.0",
    status: "processing",
    tags: ["cloudwatch", "pii-scan"],
    created_at: "2025-04-25T10:00:00.000Z",
    logs: [
      "2025-04-25T09:59:59.001Z ec2-user INFO Start scanning logs from CloudWatch group '/aws/lambda/app-handler'",
      "2025-04-25T10:00:00.005Z ec2-user INFO Detected potential sensitive data in log stream 'app-handler-xyz'"
    ]
  },
  {
    id: "job_12346",
    version: "1.0.0",
    status: "failed",
    tags: ["nginx", "error"],
    created_at: "2025-04-25T09:45:00.000Z",
    logs: [
      "127.0.0.1 - - [25/Apr/2025:09:44:55 +0000] \"POST /api/submit HTTP/1.1\" 500 162 \"-\" \"curl/7.81.0\"",
      "2025-04-25T09:45:01.321Z ERROR Failed to decode payload from log line: SyntaxError: Unexpected end of JSON input"
    ],
    completed_at: "2025-04-25T09:46:00.000Z",
    error_message: "Unexpected token in JSON",
    error_code: "JSON_PARSE_ERROR",
    error_details: "Failed parsing Nginx access log line 1 due to missing content length"
  },
  {
    id: "job_12347",
    version: "1.0.0",
    status: "success",
    tags: ["cloudwatch", "scan-complete"],
    created_at: "2025-04-25T09:30:00.000Z",
    logs: [
      "2025-04-25T09:30:00.000Z INFO Starting scan of 54 log entries from CloudWatch stream: lambda-runtime-abc",
      "2025-04-25T09:30:05.002Z INFO Detected PII in request body: {\"email\": \"user@example.com\", \"ip\": \"192.168.1.1\"}",
      "2025-04-25T09:30:09.000Z INFO Scan completed successfully"
    ],
    completed_at: "2025-04-25T09:32:00.000Z",
    results: [
      {
        field: "email",
        type: "email",
        source: "body"
      },
      {
        field: "ip_address",
        type: "ip",
        source: "header"
      },
      {
        field: "user_name",
        type: "name",
        source: "query-param"
      }
    ]
  }
];
