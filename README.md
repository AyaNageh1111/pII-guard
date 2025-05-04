# 🛡️ PII Guard

**PII Guard** is a backend service designed to detect and manage Personally Identifiable Information (PII) in logs for data privacy and GDPR compliance.

This project is an effort to build a **Trying out an fun project** that uses **Large Language Models (LLMs)** to analyze log data and identify sensitive fields — going beyond traditional regex or static rule engines.

> 🧠 **LLM-Based Detection (Work in Progress)**  
> PII Guard is based on integrating LLMs to identify PII more accurately, especially in cases where the data is obfuscated, inconsistent, or deeply embedded in unstructured logs.

---

## 📦 API Overview

The system exposes RESTful APIs to:

- Submit and track PII detection jobs
- Process and store logs from multiple sources
- Return structured results with detected PII
- Export compliance-friendly reports

---

## 📊 Sequence Diagram

![API Sequence Diagram](https://github.com/user-attachments/assets/629f53b4-4916-4b00-b536-7e168e0c26cd)

---

## 📚 Component Overview

| 🔍 Component                          | 📝 Description |
|--------------------------------------|----------------|
| 📦 **Total Logs Scanned**            | Total number of logs scanned. |
| 🧠 **PII Detections**                | Number of detected PII entities and detection rate. |
| 📈 **Detection Status**              | Job summaries: success, failed, processing. |
| ⏳ **Processing Jobs**               | Ongoing jobs with time estimates. |
| 📅 **PII Detections Over Time**      | Time-series chart of detections. |
| 🥧 **PII Types Distribution**        | Pie chart showing types of PII found. |
| 🏷️ **Detections by Source**         | Logs grouped by source/service. |
| ⏰ **Recent Detection Rate (24h)**   | Hourly breakdown of detections. |
| 📋 **Detection Jobs**               | History of jobs with statuses and metadata. |
| 📂 **GDPR Compliance Reports**       | Export CSV and structured reports. |
| 🧾 **PII Detection Results Table**   | Full list of findings with source/context.

---

## 🧠 LLM-Based Detection (Work in Progress)

The goal of this system is to integrate **LLMs** to enable more flexible and accurate PII detection by:

- Detecting context-aware patterns in noisy or obfuscated text
- Supporting multilingual or human-readable formats
- Reducing both false positives and false negatives
- Complementing (not replacing) rule-based detection

> LLMs are used to improve interpretability and adaptiveness, especially in complex log formats.

---

## 📌 PII Fields Detected

### 👤 Identity Information
`full-name`, `first-name`, `last-name`, `username`, `email`, `phone-number`, `mobile`, `address`, `postal-code`, `location`

### 🧠 Sensitive Categories (GDPR Art. 9)
`racial-or-ethnic-origin`, `political-opinion`, `religious-belief`, `philosophical-belief`, `trade-union-membership`, `genetic-data`, `biometric-data`, `health-data`, `sex-life`, `sexual-orientation`

### 🧾 Government & Financial Identifiers
`national-id`, `passport-number`, `driving-license-number`, `ssn`, `vat-number`, `credit-card`, `iban`, `bank-account`

### 🌐 Network & Device Data
`ip-address`, `ip-addresses`, `mac-address`, `imei`, `device-id`, `device-metadata`, `browser-fingerprint`, `cookie-id`, `location-coordinates`

### 🚘 Vehicle Information
`license-plate`

---

## 📑 Sample API Response

### `GET /api/jobs`

```json
[
  {
    "id": "job_12345",
    "version": "1.0.0",
    "status": "processing",
    "tags": ["cloudwatch", "pii-scan"],
    "task_group_id": "group_001",
    "created_at": "2025-04-25T10:00:00.000Z",
    "logs": [
      "2025-04-25T09:59:59.001Z ec2-user INFO Start scanning logs from CloudWatch group '/aws/lambda/app-handler'",
      "2025-04-25T10:00:00.005Z ec2-user INFO Detected potential sensitive data in log stream 'app-handler-xyz'"
    ]
  },
  {
    "id": "job_12346",
    "version": "1.0.0",
    "status": "failed",
    "tags": ["nginx", "error"],
    "task_group_id": "group_002",
    "created_at": "2025-04-25T09:45:00.000Z",
    "completed_at": "2025-04-25T09:46:00.000Z",
    "error_message": "Unexpected token in JSON",
    "error_code": "JSON_PARSE_ERROR",
    "error_details": "Failed parsing Nginx access log line 1 due to missing content length",
    "logs": [...]
  },
  {
    "id": "job_12347",
    "version": "1.0.0",
    "status": "success",
    "tags": ["cloudwatch", "scan-complete"],
    "task_group_id": "group_003",
    "created_at": "2025-04-25T09:30:00.000Z",
    "completed_at": "2025-04-25T09:32:00.000Z",
    "logs": [...],
    "results": [
      {
        "field": "email",
        "type": "email",
        "source": "body"
      },
      {
        "field": "ip_address",
        "type": "ip",
        "source": "header"
      },
      {
        "field": "user_name",
        "type": "name",
        "source": "query-param"
      }
    ]
  }
]
```

---

## 📘 Schemas & DTOs

- **Schemas**:
  - `pii-tags.schema.v1.ts`
  - `job.schema.v1.ts`
  - `finding.schema.v1.ts`
  - `common.schema.ts`

- **DTOs**:
  - `update-job.dto.ts`
  - `get-job-by-id.dto.ts`
  - `filter-jobs.dto.ts`

All schemas use [Zod](https://zod.dev/) for validation.

---

## ⚙️ Configuration

| Key                      | Description                          |
|--------------------------|--------------------------------------|
| `DB_CONNECTION_STRING`   | PostgreSQL connection string         |
| `QUEUE_URL`              | RabbitMQ or other broker             |
| `LLM_API_URL`            | Endpoint to inference model          |
| `LLM_MODEL`              | LLM model identifier (e.g. `gemma:3b`) |
| `ELASTICSEARCH_URL`      | URL to Elasticsearch cluster         |
| `JOB_ELASTICSEARCH_INDEX`| Job index name in ES                |

---

## 📢 Events

| Event                         | Description                             |
|-------------------------------|-----------------------------------------|
| `NEW_JOB_CREATED_TOPIC`       | Triggered when a new job is submitted   |
| `JOB_STATUS_UPDATED_TOPIC`    | Triggered when job status changes       |

---

## 📝 Notes

- This project is a work-in-progress MVP.
- Detection logic is rule-based today, with LLM integration underway.
- All schemas are written with [Zod](https://zod.dev/).
- Logs are queryable and exportable for audit/review workflows.

---

### 💖 Built with [Lovable](https://lovable.dev/) — designed with Vibe Coding and Vibe Design.