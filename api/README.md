# 📡 API Documentation

This folder contains the implementation of the API for the **PII Guard** application. Below is an overview of the key components, including schemas, DTOs, configurations, and event topics.

---

## 📑 Table of Contents

1. [📊 Sequence Diagram](#-sequence-diagram)
2. [📘 Schemas](#-schemas)
   - [🏷️ PII Tags Schema](#-pii-tags-schema)
   - [🧩 Job Schema](#-job-schema)
   - [🔎 Finding Schema](#-finding-schema)
   - [📦 Common Schema](#-common-schema)
3. [📬 DTOs](#-dtos)
   - [🔄 Update Job DTO](#-update-job-dto)
   - [🆔 Get Job By ID DTO](#-get-job-by-id-dto)
   - [🎯 Filter Jobs DTO](#-filter-jobs-dto)
4. [⚙️ Configurations](#-configurations)
5. [📢 Events](#-events)
6. [📝 Notes](#-notes)

---

## 📊 Sequence Diagram

![API Sequence Diagram](https://github.com/user-attachments/assets/629f53b4-4916-4b00-b536-7e168e0c26cd)

---

## 📘 Schemas

### 🏷️ PII Tags Schema

- **File**: `src/schemas/pii-tags.schema.v1.ts`  
- **Description**: Defines various types of Personally Identifiable Information (PII).  
- **Exports**:
  - `PiiTypes`, `SpecialCategories`, `Identifiers`, `TrackingData`, `AllPiiTypes`
  - `PiiType`: Type representing any PII classification.

---

### 🧩 Job Schema

- **File**: `src/schemas/job.schema.v1.ts`  
- **Description**: Defines job-related schemas for tracking detection job lifecycle.  
- **Exports**:
  - `JobStatusEnumSchema`, `NewJobSchema`, `JobSuccessSchema`, `JobFailureSchema`, `JobCompleteSchema`  
- **Functions**:
  - Creators: `createJob`, `createNewJob`, `createJobSuccess`, `createJobFailure`  
  - Type guards: `isJob`, `isNewJob`, `isJobSuccess`, `isJobFailure`, `isJobComplete`

---

### 🔎 Finding Schema

- **File**: `src/schemas/finding.schema.v1.ts`  
- **Description**: Describes PII findings, including source, confidence, and risk level.  
- **Exports**:
  - Enums: `ConfidenceEnumSchema`, `RiskEnumSchema`, `SourceEnumSchema`, `ReviewStatusEnumSchema`  
  - `FindingSchema`  
- **Functions**:
  - `createFinding`: Factory function for generating findings.

---

### 📦 Common Schema

- **File**: `src/schemas/common.schema.ts`  
- **Description**: Reusable schema definitions used across other modules.  
- **Exports**:
  - `TimeStampSchema`: Unified timestamp schema.

---

## 📬 DTOs

### 🔄 Update Job DTO

- **File**: `src/jobs/dtos/update-job.dto.ts`  
- **Description**: DTO for updating the status of a job.  
- **Exports**:
  - `UpdateJobDtoForV1`  
- **Functions**:
  - `updatedJobDtoToV1`: Validates and parses update data.

---

### 🆔 Get Job By ID DTO

- **File**: `src/jobs/dtos/get-job-by-id.dto.ts`  
- **Description**: DTO to retrieve a job by its ID.  
- **Exports**:
  - `GetJobByIdDtoForV1`  
- **Functions**:
  - `getJobByIdDtoToV1`: Validates and parses job ID input.

---

### 🎯 Filter Jobs DTO

- **File**: `src/jobs/dtos/filter-jobs.dto.ts`  
- **Description**: DTO to filter jobs based on criteria such as status, tags, or date.  
- **Exports**:
  - `FilterJobsDtoForV1`  
- **Functions**:
  - `filterJobsDtoToV1`: Validates and parses filter input.

---

## ⚙️ Configurations

- **File**: `src/configs/configs.interface.ts`  
- **Description**: Application-level configuration schema used to initialize the system.

### 🔧 Default Values

| Key                             | Default Value |
|----------------------------------|---------------|
| `APP_ENV`                        | `local`       |
| `HTTP_PORT`                      | `6000`        |
| `LOG_FLUSH_INTERVAL_IN_SECONDS` | `60`          |
| `MAX_NUMBER_OF_LOGS_TO_COLLECT` | `100`         |
| `MESSAGE_PREFETCH_COUNT`        | `10`          |

### 🔐 Required Environment Variables

- `DB_CONNECTION_STRING`: PostgreSQL or other DB connection string  
- `QUEUE_URL`: URL for the message broker (e.g., RabbitMQ)  
- `LLM_API_URL`: URL for the LLM inference service  
- `NEW_JOB_CREATED_TOPIC`: Topic for job creation events  
- `JOB_STATUS_UPDATED_TOPIC`: Topic for job status update events  
- `ELASTICSEARCH_URL`: URL to Elasticsearch cluster  
- `JOB_ELASTICSEARCH_INDEX`: Index name for storing job data  
- `LLM_MODEL`: Inference model name used by the LLM engine

---

## 📢 Events

### 🧵 Job Events

| Event                     | Description                              |
|---------------------------|------------------------------------------|
| `NEW_JOB_CREATED_TOPIC`   | Emitted when a new job is created.       |
| `JOB_STATUS_UPDATED_TOPIC`| Emitted when a job's status is updated.  |

---

## 📝 Notes

- All schemas are implemented using [Zod](https://zod.dev/), a TypeScript-first schema validation library.
- Error handling is managed using custom error classes that extend `LoggerModule.BaseError` for consistent behavior and traceability.
