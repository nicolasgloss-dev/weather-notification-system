# ✅ Test Suite Overview — Smart Weather Notification & Automation System (AWS CDK)

This document summarises the **test coverage** for the Smart Weather Notification & Automation System project.  
All tests use **Jest** with **AWS CDK Assertions** to validate both **infrastructure** and **Lambda logic** before deployment.

---

## 🧪 Test Framework

- **Framework:** Jest (TypeScript)
- **Infrastructure Validation:** `aws-cdk-lib/assertions.Template`
- **Logic Testing:** Node.js mocks and simulated responses
- **Command:**

  ```bash
  npm run test
  ```

- **Goal:** Ensure all CDK stacks and Lambda functions deploy safely and behave as expected.

---

## 🧩 Test File Summary

| **File**                                | **Purpose**                                      | **Key Tests Included**                                                                                     | **Expected Outcome**                                                                 |
|----------------------------------------|--------------------------------------------------|------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------|
| `test/weather-notification-system.test.ts` | Core infrastructure validation for CDK stacks    | • Confirms SNS Topic, DynamoDB Table, and Secrets Manager secret creation.<br>• Validates permissions and Lambda bindings.<br>• Checks EventBridge daily triggers. | ✅ Stacks synthesise correctly with all shared services and resources.               |
| `test/fetchWeatherData.test.ts`        | Unit tests for `daily-summary` Lambda            | • Verifies successful API call and parsing.<br>• Handles API failure cases.<br>• Confirms correct response structure. | ✅ Forecast data is handled correctly across success and failure scenarios.          |
| `test/automation-stack.test.ts`        | CDK validation for `automation-stack.ts`         | • Confirms EventBridge rule and automation Lambda.<br>• Checks IAM permissions.<br>• Validates bundling setup. | ✅ Stack deploys cleanly and automation logic is properly wired.                     |
| `test/automationHandler.test.ts`       | Unit tests for automation Lambda logic           | • Simulates incoming weather events.<br>• Verifies simulated IoT task flow.<br>• Confirms logging and error handling. | ✅ All automation flows execute as expected and failures are logged clearly.         |

---

## 🧰 Test Coverage

| **Category**             | **Coverage Goal**                                        | **Status**     |
|--------------------------|----------------------------------------------------------|----------------|
| Infrastructure (CDK)     | Validate resource creation, permissions, and bindings    | ✅ Achieved     |
| Lambda Logic             | Simulate API, event handling, error cases                | ✅ Achieved     |
| Secrets & Config         | Validate access to Secrets Manager and DDB config        | ✅ Achieved     |
| Automation Module Flow   | EventBridge → Lambda → Simulated IoT action              | ✅ Achieved     |
| Error Handling & Logging | Confirm logs and fallbacks during failures               | ✅ Achieved     |

---

## 🧾 Example Output

Example terminal output when all tests pass:

```
Test Suites: 4 passed, 4 total
Tests:       12 passed, 12 total
Snapshots:   0 total
Time:        9.45 s
```

All stacks synthesise successfully, and Lambda logic executes correctly under simulated conditions.

---

## 🧠 Notes for Reviewers

- All tests run **locally** and use **Docker bundling** when needed for Lambda.  
- No live AWS resources are deployed during test runs — only **CloudFormation synthesis** and **mocked execution** occur.  
- Tests prioritise clarity and correctness over complexity to suit entry-level infrastructure validation needs.

---

**Last Updated:** October 2025  
**Maintainer:** *Nicolas Gloss ([GitHub](https://github.com/nicolasgloss-dev) • [Website](https://nicolasgloss.dev))*
