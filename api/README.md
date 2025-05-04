# 📡 API Documentation

This folder contains the implementation of the API for the **PII Guard** application. Below is an overview of the key components including schemas, DTOs, configurations, and event topics.

---

## 📑 Table of Contents
1. [📘 Schemas](#-schemas)
   - [🏷️ PII Tags Schema](#-pii-tags-schema)
   - [🧩 Job Schema](#-job-schema)
   - [🔎 Finding Schema](#-finding-schema)
   - [📦 Common Schema](#-common-schema)
2. [📬 DTOs](#-dtos)
   - [🔄 Update Job DTO](#-update-job-dto)
   - [🆔 Get Job By ID DTO](#-get-job-by-id-dto)
   - [🎯 Filter Jobs DTO](#-filter-jobs-dto)
3. [⚙️ Configurations](#-configurations)
4. [📢 Events](#-events)
5. [📝 Notes](#-notes)

---

## 📘 Schemas

### 🏷️ PII Tags Schema
- **File**: `src/schemas/pii-tags.schema.v1.ts`
- **Description**: Defines types of Personally Identifiable Information (PII).
- **Exports**:
  - `PiiTypes`, `SpecialCategories`, `Identifiers`, `TrackingData`, `AllPiiTypes`
  - `PiiType`: Type representing any PII type.

---

### 🧩 Job Schema
- **File**: `src/schemas/job.schema.v1.ts`
- **Description**: Schemas for detection jobs including status handling.
- **Exports**:
  - `JobStatusEnumSchema`, `NewJobSchema`, `JobSuccessSchema`, `JobFailureSchema`, `JobCompleteSchema`
- **Functions**:
  - `createJob`, `createNewJob`, `createJobSuccess`, `createJobFailure`
  - Type guards: `isJob`, `isNewJob`, `isJobSuccess`, `isJobFailure`, `isJobComplete`

---

### 🔎 Finding Schema
- **File**: `src/schemas/finding.schema.v1.ts`
- **Description**: Defines PII findings and associated metadata.
- **Exports**:
  - Enums: `ConfidenceEnumSchema`, `RiskEnumSchema`, `SourceEnumSchema`, `ReviewStatusEnumSchema`
  - `FindingSchema`
- **Functions**:
  - `createFinding`: Create a new finding object.

---

### 📦 Common Schema
- **File**: `src/schemas/common.schema.ts`
- **Description**: Shared/common schema definitions.
- **Exports**:
  - `TimeStampSchema`: Standardized timestamp format.

---

## 📬 DTOs

### 🔄 Update Job DTO
- **File**: `src/jobs/dtos/update-job.dto.ts`
- **Description**: DTO for updating job status.
- **Exports**:
  - `UpdateJobDtoForV1`
- **Functions**:
  - `updatedJobDtoToV1`: Validator/parser function.

---

### 🆔 Get Job By ID DTO
- **File**: `src/jobs/dtos/get-job-by-id.dto.ts`
- **Description**: DTO for fetching job details by ID.
- **Exports**:
  - `GetJobByIdDtoForV1`
- **Functions**:
  - `getJobByIdDtoToV1`: Validator/parser function.

---

### 🎯 Filter Jobs DTO
- **File**: `src/jobs/dtos/filter-jobs.dto.ts`
- **Description**: DTO for filtering job list queries.
- **Exports**:
  - `FilterJobsDtoForV1`
- **Functions**:
  - `filterJobsDtoToV1`: Validator/parser function.

---

## ⚙️ Configurations

- **File**: `src/configs/configs.interface.ts`
- **Description**: Defines application configurations required for the API to function.
- **Default Values**:
  - `APP_ENV`: `local`
  - `HTTP_PORT`: `6000`
  - `LOG_FLUSH_INTERVAL_IN_SECONDS`: `60`
  - `MAX_NUMBER_OF_LOGS_TO_COLLECT`: `100`
  - `MESSAGE_PREFETCH_COUNT`: `10`

- **Required Configurations**:
  - `DB_CONNECTION_STRING`: Database connection string.
  - `QUEUE_URL`: URL for the message queue.
  - `LLM_API_URL`: URL for the LLM API.
  - `NEW_JOB_CREATED_TOPIC`: Topic for new job creation events.
  - `JOB_STATUS_UPDATED_TOPIC`: Topic for job status updates.
  - `ELASTICSEARCH_URL`: URL for Elasticsearch.
  - `JOB_ELASTICSEARCH_INDEX`: Elasticsearch index for jobs.
  - `LLM_MODEL`: Model name for the LLM.

---

## 📢 Events

### 🧵 Job Events
- `NEW_JOB_CREATED_TOPIC`: Topic published when a new job is created.
- `JOB_STATUS_UPDATED_TOPIC`: Topic published when job status changes.

---

## 📝 Notes

- All schemas are written using [Zod](https://zod.dev/), a TypeScript-first schema validation library.

