
// Mock data for PII detection dashboard

export type PiiType = 'email' | 'ip' | 'name' | 'phone' | 'address' | 'ssn' | 'credit_card';
export type JobStatus = 'success' | 'failed' | 'processing';
export type LogSource = 'CloudWatch' | 'nginx' | 'application' | 'database' | 'api';

export interface PiiJob {
  id: string;
  status: JobStatus;
  createdAt: Date;
  completedAt: Date | null;
  tags: string[];
  detections: number;
  piiTypes: Record<PiiType, number>;
  source: LogSource;
  error?: string;
}

// Generate random past date within the last 30 days
const randomPastDate = (daysBack = 30) => {
  const date = new Date();
  date.setDate(date.getDate() - Math.floor(Math.random() * daysBack));
  return date;
};

// Generate random completed date after created date
const randomCompletedDate = (createdDate: Date) => {
  const completedDate = new Date(createdDate);
  // Add random minutes (0-60)
  completedDate.setMinutes(completedDate.getMinutes() + Math.floor(Math.random() * 60));
  return completedDate;
};

// Generate random tags
const tags = ['production', 'staging', 'development', 'user-service', 'payment-service', 'auth-service', 'api', 'database'];
const randomTags = () => {
  const numTags = Math.floor(Math.random() * 3) + 1;
  const selectedTags = new Set<string>();
  
  while (selectedTags.size < numTags) {
    selectedTags.add(tags[Math.floor(Math.random() * tags.length)]);
  }
  
  return Array.from(selectedTags);
};

// Generate random PII types distribution
const randomPiiTypes = () => {
  const types: Record<PiiType, number> = {
    email: Math.floor(Math.random() * 10),
    ip: Math.floor(Math.random() * 10),
    name: Math.floor(Math.random() * 5),
    phone: Math.floor(Math.random() * 5),
    address: Math.floor(Math.random() * 3),
    ssn: Math.floor(Math.random() * 2),
    credit_card: Math.floor(Math.random() * 2)
  };
  return types;
};

// Generate random source
const sources: LogSource[] = ['CloudWatch', 'nginx', 'application', 'database', 'api'];
const randomSource = () => {
  return sources[Math.floor(Math.random() * sources.length)];
};

// Generate mock jobs
export const generateMockJobs = (count: number): PiiJob[] => {
  const jobs: PiiJob[] = [];
  
  for (let i = 0; i < count; i++) {
    const status: JobStatus = Math.random() > 0.9 
      ? 'failed' 
      : Math.random() > 0.8 ? 'processing' : 'success';
    
    const createdAt = randomPastDate();
    const completedAt = status !== 'processing' ? randomCompletedDate(createdAt) : null;
    const piiTypes = randomPiiTypes();
    
    // Calculate total detections from piiTypes
    const detections = Object.values(piiTypes).reduce((sum, val) => sum + val, 0);
    
    jobs.push({
      id: `job-${100000 + i}`,
      status,
      createdAt,
      completedAt,
      tags: randomTags(),
      detections,
      piiTypes,
      source: randomSource(),
      error: status === 'failed' ? 'Error processing log file. Permission denied.' : undefined
    });
  }
  
  return jobs.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
};

// Generate time-series data for the past days
export const generateTimeSeriesData = (days: number) => {
  const data = [];
  const now = new Date();
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(now.getDate() - i);
    data.push({
      date: date.toISOString().split('T')[0],
      detections: Math.floor(Math.random() * 50) + 10
    });
  }
  
  return data;
};

// Generate hourly data for the past 24 hours
export const generateHourlyData = () => {
  const data = [];
  const now = new Date();
  
  for (let i = 23; i >= 0; i--) {
    const date = new Date();
    date.setHours(now.getHours() - i);
    data.push({
      hour: date.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'}),
      detections: Math.floor(Math.random() * 20) + 5
    });
  }
  
  return data;
};

// Summary stats
export const generateSummaryStats = () => {
  return {
    totalScanned: Math.floor(Math.random() * 10000) + 5000,
    totalDetections: Math.floor(Math.random() * 2000) + 500,
    statusBreakdown: {
      success: Math.floor(Math.random() * 800) + 300,
      failed: Math.floor(Math.random() * 100) + 10,
      processing: Math.floor(Math.random() * 50) + 10
    }
  };
};

// Generate mock data for source distribution
export const generateSourceData = () => {
  return sources.map(source => ({
    name: source,
    value: Math.floor(Math.random() * 100) + 20
  }));
};

// Generate mock data for PII type distribution
export const generatePiiTypeData = () => {
  const piiTypes: PiiType[] = ['email', 'ip', 'name', 'phone', 'address', 'ssn', 'credit_card'];
  return piiTypes.map(type => ({
    name: type,
    value: Math.floor(Math.random() * 100) + 10
  }));
};

// Mock data
export const mockData = {
  jobs: generateMockJobs(100),
  timeSeries: generateTimeSeriesData(30),
  hourlyData: generateHourlyData(),
  summaryStats: generateSummaryStats(),
  sourceData: generateSourceData(),
  piiTypeData: generatePiiTypeData()
};
