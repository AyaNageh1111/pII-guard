# 🧪 Testing PII Guard

This guide describes how to run the test setup for **PII Guard**, including simulated log generation and stress testing.

---

## 🚀 How to Test

1. **Start the PII Guard stack**

   Follow the instructions in the main [README](../README.md) to start all required services.

2. **Run the test environment**

   ```bash
   make test-start
   ```

   This will:

   - Start a dummy **Nginx** server
   - Launch **Fluent Bit** to forward logs to PII Guard
   - Run **Autocannon** to stress-test the system by sending logs to the dummy Nginx server

3. **Tear down the test environment**

   When you're done, stop all test-related services:

   ```bash
   make test-end
   ```

---

## 🛠️ Notes

- Ensure PII Guard is fully running before executing `make test-start`.
- The test setup simulates real-world log ingestion at high volume to evaluate performance and detection accuracy.
