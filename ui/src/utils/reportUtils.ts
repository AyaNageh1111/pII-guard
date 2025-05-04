
import { Job, Finding } from "@/services/piiJobsApi";

// Export the maskSensitiveData function so it can be imported by other files
export const maskSensitiveData = (value: string, type: string): string => {
  if (!value) return "***";
  
  switch (type.toLowerCase()) {
    case 'email':
      // Mask email to show only first character and domain
      const [username, domain] = value.split('@');
      return `${username.charAt(0)}${'*'.repeat(username.length - 1)}@${domain}`;
    
    case 'ip':
    case 'ip_address':
      // Mask IP address to show only first octet
      const octets = value.split('.');
      if (octets.length === 4) {
        return `${octets[0]}.***.***.***`;
      }
      return value.substring(0, 3) + '***';
      
    case 'phone':
      // Mask phone number to show only last 4 digits
      return `***-***-${value.slice(-4)}`;
      
    case 'name':
      // Show only first letter of name
      return `${value.charAt(0)}${'*'.repeat(value.length - 1)}`;
      
    case 'address':
      // Mask address to show only first 3 characters
      return `${value.substring(0, 3)}${'*'.repeat(Math.min(value.length - 3, 10))}`;
      
    case 'ssn':
    case 'credit_card':
      // Complete masking except last 4
      return `${'*'.repeat(value.length - 4)}${value.slice(-4)}`;
      
    default:
      // Default masking - show first char and mask the rest
      return `${value.charAt(0)}${'*'.repeat(Math.min(value.length - 1, 10))}`;
  }
};

// Group jobs by their task_group_id
const groupJobsByTaskGroups = (jobs: Job[]): Record<string, Job[]> => {
  // Filter out jobs without task_group_id
  const validJobs = jobs.filter(job => job.task_group_id);
  
  // Group by task_group_id
  return validJobs.reduce<Record<string, Job[]>>((groups, job) => {
    const groupId = job.task_group_id || "unknown";
    if (!groups[groupId]) {
      groups[groupId] = [];
    }
    groups[groupId].push(job);
    return groups;
  }, {});
};

// Generate markdown report for each task group
const generateTaskGroupReport = (groupId: string, jobs: Job[]): string => {
  // Task statuses
  const taskStatuses = jobs.map(job => {
    const statusEmoji = job.status === 'success' ? '✅' : 
                         job.status === 'processing' ? '🔄' : '❌';
    return `- Task ID: \`${job.id}\` — ${statusEmoji} ${job.status}`;
  }).join('\n');
  
  // Logs processed per task
  const logsProcessed = jobs.map(job => {
    const logCount = job.logs?.length || 0;
    return `- Task ID: \`${job.id}\` — ${logCount} logs`;
  }).join('\n');
  
  // PII detections for successful jobs
  let piiDetectionsMarkdown = '';
  let totalPiiDetected = 0;
  
  const successfulJobs = jobs.filter(job => job.status === 'success');
  for (const job of successfulJobs) {
    if (job.results && job.results.length > 0) {
      piiDetectionsMarkdown += `\n**Detected PII (Task ID: ${job.id}):**\n`;
      
      // Group findings by type for better organization
      const findingsByType: Record<string, Finding[]> = {};
      for (const finding of job.results) {
        if (!findingsByType[finding.type]) {
          findingsByType[finding.type] = [];
        }
        findingsByType[finding.type].push(finding);
      }
      
      for (const [type, findings] of Object.entries(findingsByType)) {
        const typeDisplay = type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' ');
        piiDetectionsMarkdown += `\n### ${typeDisplay} (${findings.length})\n`;
        
        for (const finding of findings) {
          const maskedValue = maskSensitiveData(finding.field, finding.type);
          const source = finding.source ? `(source: \`${finding.source}\`)` : '';
          piiDetectionsMarkdown += `- \`${maskedValue}\` ${source}\n`;
          totalPiiDetected++;
        }
      }
    }
  }
  
  // Summary statistics
  const totalLogs = jobs.reduce((sum, job) => sum + (job.logs?.length || 0), 0);
  const totalTasks = jobs.length;
  const totalSuccessful = successfulJobs.length;
  
  const summarySection = `
**Summary:**
- Total logs scanned in group: ${totalLogs}
- Total tasks: ${totalTasks}
- Successful: ${totalSuccessful}
- Total PII items detected: ${totalPiiDetected}
`;

  // Combine all sections
  return `
### Task Group: \`${groupId}\`

**Tasks and Statuses:**
${taskStatuses}

**Logs Processed per Task:**
${logsProcessed}
${piiDetectionsMarkdown}
${summarySection}
`;
};

// Generate detailed findings report specifically for PII data
export const generatePiiFindings = (jobs: Job[]): string => {
  const successfulJobs = jobs.filter(job => job.status === 'success');
  let findings: Finding[] = [];
  
  // Collect all findings from successful jobs
  successfulJobs.forEach(job => {
    if (job.results && job.results.length > 0) {
      findings = [...findings, ...job.results];
    }
  });
  
  if (findings.length === 0) {
    return "# PII Findings Report\n\nNo PII detected in any successful jobs.";
  }
  
  // Group findings by type
  const findingsByType: Record<string, Finding[]> = {};
  findings.forEach(finding => {
    if (!findingsByType[finding.type]) {
      findingsByType[finding.type] = [];
    }
    findingsByType[finding.type].push(finding);
  });
  
  // Create markdown report
  let report = '# PII Findings Report\n\n';
  report += `Generated on: ${new Date().toLocaleString()}\n\n`;
  report += `Total findings: ${findings.length}\n\n`;
  
  // Add details for each type of finding
  for (const [type, typeFindings] of Object.entries(findingsByType)) {
    const typeDisplay = type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' ');
    report += `## ${typeDisplay} (${typeFindings.length})\n\n`;
    
    typeFindings.forEach((finding, index) => {
      const maskedValue = maskSensitiveData(finding.field, finding.type);
      const source = finding.source ? ` from \`${finding.source}\`` : '';
      const jobId = successfulJobs.find(job => job.results?.includes(finding))?.id || 'unknown';
      report += `${index + 1}. \`${maskedValue}\`${source} (Job: \`${jobId}\`)\n`;
    });
    
    report += '\n';
  }
  
  report += '## Summary\n\n';
  report += 'PII Types found:\n\n';
  
  for (const [type, typeFindings] of Object.entries(findingsByType)) {
    const typeDisplay = type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' ');
    report += `- ${typeDisplay}: ${typeFindings.length}\n`;
  }
  
  return report;
};

// Generate complete GDPR/PII report
export const generateGdprPiiReport = (jobs: Job[]): string => {
  const taskGroups = groupJobsByTaskGroups(jobs);
  let report = '# GDPR/PII Scan Report\n\n';
  report += `Generated on: ${new Date().toLocaleString()}\n\n`;
  
  // Generate report for each task group
  for (const [groupId, groupJobs] of Object.entries(taskGroups)) {
    report += generateTaskGroupReport(groupId, groupJobs);
    report += '\n---\n\n';
  }
  
  // Add PII findings section
  report += '## Detailed PII Findings\n\n';
  
  // Collect all findings from successful jobs
  const findings = jobs
    .filter(job => job.status === 'success')
    .flatMap(job => job.results || []);
    
  if (findings.length === 0) {
    report += "No PII detected in any successful jobs.\n\n";
  } else {
    // Group findings by type
    const findingsByType: Record<string, Finding[]> = {};
    findings.forEach(finding => {
      if (!findingsByType[finding.type]) {
        findingsByType[finding.type] = [];
      }
      findingsByType[finding.type].push(finding);
    });
    
    // Add details for each type of finding
    for (const [type, typeFindings] of Object.entries(findingsByType)) {
      const typeDisplay = type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' ');
      report += `### ${typeDisplay} (${typeFindings.length})\n\n`;
      
      typeFindings.forEach((finding, index) => {
        const maskedValue = maskSensitiveData(finding.field, finding.type);
        const source = finding.source ? ` from \`${finding.source}\`` : '';
        const jobId = jobs.find(job => job.results?.includes(finding))?.id || 'unknown';
        report += `${index + 1}. \`${maskedValue}\`${source} (Job: \`${jobId}\`)\n`;
      });
      
      report += '\n';
    }
  }
  
  // Add overall summary
  const totalJobs = jobs.length;
  const filteredJobs = Object.values(taskGroups).flat();
  const includedJobs = filteredJobs.length;
  const successfulJobs = filteredJobs.filter(job => job.status === 'success').length;
  const totalDetections = filteredJobs.reduce((sum, job) => 
    sum + (job.results?.length || 0), 0);
  
  report += `## Overall Summary\n\n`;
  report += `- Total jobs in system: ${totalJobs}\n`;
  report += `- Jobs included in report: ${includedJobs}\n`;
  report += `- Jobs filtered out: ${totalJobs - includedJobs}\n`;
  report += `- Successful jobs: ${successfulJobs}\n`;
  report += `- Total PII items detected: ${totalDetections}\n`;
  
  return report;
};
