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

## 🧠 Why LLM-Based Detection

The goal of this system is to integrate **LLMs** to enable more flexible and accurate PII detection by:

- Detecting context-aware patterns in noisy or obfuscated text
- Supporting multilingual or human-readable formats
- Reducing both false positives and false negatives

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
