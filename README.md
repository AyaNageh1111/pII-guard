# 🛡️ PII Guard

**PII Guard** is an LLM-powered tool that detects and manages Personally Identifiable Information (PII) in logs — designed to support data privacy and GDPR compliance.

> ⚠️ **This is a personal side project**  
> Built to explore how Large Language Models can detect sensitive data in logs more intelligently than traditional regex-based approaches.

## 📚 Table of Contents

- [About](#-about)
- [Why Use LLMs for PII Detection?](#-why-use-llms-for-pii-detection)
- [PII Types Detected](#-pii-types-detected)
  - [Identity Information](#-identity-information)
  - [Sensitive Categories (GDPR Art 9)](#-sensitive-categories-gdpr-art-9)
  - [Government & Financial Identifiers](#-government--financial-identifiers)
  - [Network & Device Information](#-network--device-information)
  - [Vehicle Information](#-vehicle-information)
- [Getting Started](#-getting-started)
- [Try It Out](#-try-it-out)
- [Project Structure](#-project-structure)
- [Suggestions & Contributions](#-suggestions--contributions)

---

## 🧠 About

This project experiments with **Large Language Models (LLMs)** — specifically the `gemma:3b` model running locally via **Ollama** — to evaluate how effectively they can identify PII in both structured and unstructured log data.

> 🧠 **LLM-Based Detection with Ollama**  
> - Uses `gemma:3b` through the Ollama runtime  
> - Analyzes logs using natural language understanding  
> - Handles real-world, messy logs better than regex  
> - Work in progress — contributions welcome!

---

## 💡 Why Use LLMs for PII Detection?

- 🔍 Identifies PII even when it's obfuscated, incomplete, or embedded in text
- 🌐 Handles multilingual input and inconsistent formats
- 🧠 Leverages semantic context instead of relying on static patterns
- 🧪 Ideal for experimenting with privacy tooling powered by AI

> Traditional detection rules often break under complexity — LLMs provide contextual intelligence.

---

## 🧾 PII Types Detected

### 👤 Identity Information  
`full-name`, `first-name`, `last-name`, `username`, `email`, `phone-number`, `mobile`, `address`, `postal-code`, `location`

### 🧠 Sensitive Categories (GDPR Art. 9)  
`racial-or-ethnic-origin`, `political-opinion`, `religious-belief`, `philosophical-belief`, `trade-union-membership`, `genetic-data`, `biometric-data`, `health-data`, `sex-life`, `sexual-orientation`

### 🧾 Government & Financial Identifiers  
`national-id`, `passport-number`, `driving-license-number`, `ssn`, `vat-number`, `credit-card`, `iban`, `bank-account`

### 🌐 Network & Device Information  
`ip-address`, `ip-addresses`, `mac-address`, `imei`, `device-id`, `device-metadata`, `browser-fingerprint`, `cookie-id`, `location-coordinates`

### 🚘 Vehicle Information  
`license-plate`

---

## 🚀 Getting Started

- Clone the repo and start everything with a single command:

```bash
make all-in-up
```
- Shut down everything with:

```bash
make all-in-down
```
- This will set up the entire stack, including:

This will launch the full stack:

- 🐘 PostgreSQL  
- 🔎 Elasticsearch  
- 🐇 RabbitMQ  
- 🤖 Ollama (with `gemma:3b`)  
- 🌐 PII Guard dashboard and backend API

---

## 🧪 Try It Out

### 🖥️ Web Interface  
Visit: [http://localhost:3000](http://localhost:3000)  

### 🔌 API Endpoint  
[http://localhost:8888/api/jobs](http://localhost:8888/api/jobs)

### 🌀 Submit Sample Logs (cURL)

```bash
curl --location 'http://localhost:8888/api/jobs/flush' \
--header 'Content-Type: application/json' \
--data-raw '{
  "version": "1.0.0",
  "logs": [
    "{\"timestamp\":\"2025-04-21T15:02:10Z\",\"service\":\"auth-service\",\"level\":\"INFO\",\"event\":\"user_login\",\"requestId\":\"1a9c7e21\",\"user\":{\"id\":\"u9001001\",\"name\":\"Leila Park\",\"email\":\"leila.park@example.io\"},\"srcIp\":\"198.51.100.15\"}",
    "{\"timestamp\":\"2025-04-21T15:02:12Z\",\"service\":\"cache-service\",\"level\":\"DEBUG\",\"event\":\"cache_miss\",\"requestId\":\"82c5cc9f\",\"cacheKey\":\"product_44291_variant_blue\",\"region\":\"us-east-1\"}"
  ]
}'
```

---

## 📂 Project Structure

- **API**: [`api/`](https://github.com/rpgeeganage/pII-guard/tree/main/api)
- **Dashboard**: [`ui/`](https://github.com/rpgeeganage/pII-guard/tree/main/ui)  
- **LLM Prompt Template**: [`api/src/prompt/pii.prompt.ts`](https://github.com/rpgeeganage/pII-guard/tree/main/api/src/prompt/pii.prompt.ts)

---

## 🙌 Suggestions & Contributions

Got a bug to report? Feature request? Wild idea? Bring it on!

- 🐛 Bug reports help improve stability
- ✨ Feature requests help shape the product
- 💬 Suggestions, feedback, and contributions are all welcome!