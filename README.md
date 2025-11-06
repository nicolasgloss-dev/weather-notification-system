# ☁️ Smart Weather Notification & Automation System (AWS CDK)
**Version:** 1.0 – Completed November 2025  

This project implements a **modular, serverless, event-driven system** using AWS CDK (TypeScript) to:
1. Send **daily weather summary emails**
2. Push **urgent severe weather SMS alerts**
3. Trigger **simulated AWS automation based on weather conditions**

It demonstrates **real-world utility**, **IaC best practices**, and **creative automation logic**.

---

## 📌 System Overview

This system gathers real-time weather data from an external API and automates alerting and response workflows using AWS services.

- 🕕 **Daily Forecast Email:** Sends a scheduled summary email with conditions and optional temperature chart.  
- ⚠️ **Severe Weather SMS:** Sends SMS alerts for dangerous weather (e.g. storms, heatwaves).  
- ⚙️ **Weather-Aware Automation:** Simulates actions like pausing AWS tasks during poor sunlight/cloud cover.  

Each function is designed as a separate, reusable module.

---

## 🧩 Module Details

### 1. Daily Summary – Morning Forecast  
Fetches weather data (via API) and stores it for daily reports or emails.

- **AWS Lambda:** `FetchWeatherDataFn`
- **Secrets Manager:** Holds the external weather API key
- **SNS Topic:** Publishes email notifications for the daily summary (via SES
- **EventBridge Scheduler (Timezone-Aware):** Triggers the Lambda at 7:00 AM local Sydney time using `cron(0 7 * * ? *)` with `Australia/Sydney` timezone

### 2. Severe Weather Alert – Urgent Notifications  
Triggers SMS or email alerts for extreme conditions.

- **AWS Lambda:** `FetchWeatherDataFn` reused with severe alert logic  
- Reuses the same **SNS Topic**
- Future integration with **AWS Pinpoint** or **SES** possible

### 3. AWS Automation – Weather-Aware Actions  
Uses EventBridge + Lambda to simulate automatic responses (e.g. disable IoT devices during storms or trigger backups on clear days).

- **EventBridge Rule:** Fires every 3 hours
- **AWS Lambda:** `AutomationHandler`
- Demonstrates decoupled, event-driven automation logic

---

## 🧠 AWS Services Used

| Service              | Purpose                              | Reason for Choice                          |
|----------------------|--------------------------------------|--------------------------------------------|
| AWS Lambda           | Runs the weather and automation logic | Serverless, scalable, pay-per-use          |
| Amazon EventBridge   | Triggers periodic automation checks   | Simplifies scheduling and event flow       |
| Amazon SNS           | Sends notifications and alerts        | Lightweight messaging layer                |
| AWS Secrets Manager  | Stores API keys securely              | Secure, encrypted, and auditable           |
| AWS CDK (TypeScript) | Infrastructure as Code                | Reusable, testable, modern IaC framework   |

---

## 📈 Expected Outcomes

| Feature              | Outcome                                                                 |
| -------------------- | ----------------------------------------------------------------------- |
| Daily summary email  | Users receive a daily forecast summary via email                        |
| Severe weather alert | Immediate SMS warning is sent when critical conditions are detected     |
| Simulated automation | CloudWatch logs show appropriate AWS actions based on severe conditions |

---

## ⚠️ Failure Scenarios & Mitigations

| Scenario                   | Mitigation                                             |
|----------------------------|--------------------------------------------------------|
| Weather API unavailable    | Lambda logs error and skips publish instead of failing |
| EventBridge rule misfire   | CloudWatch metrics monitor invocation counts           |
| Invalid API key            | Rotated securely via Secrets Manager                  |
| SNS subscription failure   | Alerts can be resent or tested manually using CLI      |
| Weather API down           | Retry with backoff or fallback                         |
| SES/SNS issues             | Retry + CloudWatch alarms                              |
| Duplicate SMS alerts       | Timestamp-based de-duplication logic                   |
| Lambda timeout             | Streamlined logic, small payloads                      |
| Simulated task failure     | No real actions yet — logs only                        |

---

## 🛡️ Cost Optimisation

| Resource         | Cost Impact         | Optimisation Tip                            |
|------------------|----------------------|----------------------------------------------|
| Lambda           | Low                  | Keep logic small and execution short         |
| Secrets Manager  | ~$0.40/mo per secret | Can use SSM Parameter Store for free         |
| EventBridge      | Very low             | Fixed rate rule, no spike risk               |
| SNS              | Pay-per-publish      | Use email if SMS costs too high              |

---

## 🔐 Security Considerations

- Secrets encrypted in **AWS Secrets Manager**  
- IAM roles follow **least privilege** principles (e.g. Lambda execution roles, SNS publish permissions)  
- No public API Gateway or open endpoints  

---

## 🧪 Testing

| Test File                         | Purpose                                           |
|----------------------------------|---------------------------------------------------|
| `fetchWeatherData.test.ts`       | Validates weather fetch logic and error handling |
| `automationHandler.test.ts`      | Simulates all weather conditions and SNS calls   |
| `automation-stack.test.ts`       | Confirms EventBridge rule and Lambda creation    |
| `weather-notification-system.test.ts` | End-to-end CDK stack validation              |

---

## 🏗️ Architecture Diagram

![High Level Architecture](docs/diagrams/architecture.png)

---

## 📷 Screenshots

### ✅ Unit Tests Passing
![Unit Tests](docs/screenshots/jest-tests-passing.png)  
*Jest tests confirming all stacks and logic behave as expected.*

---

### 📘 Lambda AutomationHandler Logs
![Lambda Logs](docs/screenshots/lambda-cloudwatch.png)  
*CloudWatch logs showing simulated weather automation actions.*

---

### ⏰ EventBridge Rule Configuration
![EventBridge Rule](docs/screenshots/eventbridge-rule.png)  
*EventBridge rule triggering the automation Lambda every 3 hours.*

---

### 🕖 EventBridge Scheduler – Daily Summary
![EventBridge Scheduler](docs/screenshots/scheduler-7am.png)  
*EventBridge Scheduler set to run at 7:00 AM Australia/Sydney using a timezone-aware cron expression.*

---

### 📡 SNS Topic Setup
![SNS](docs/screenshots/sns-topic.png)  
*SNS topic configured and subscribed for alerting modules.*

---

### ⚙️ Lambda Function Configuration
![Lambda Details](docs/screenshots/lambda-config.png)  
*AutomationHandler Lambda setup with memory, trigger, and IAM role.*

---

### 🧪 Lambda Test Execution
![Lambda Test](docs/screenshots/lambda-test-success.png)  
*Successful Lambda test execution simulating a weather event.*

---

## 💡 Possible Enhancements

- Integrate **DynamoDB** to persist user-specific weather preferences or automation thresholds (e.g. locations, alert types). Currently, thresholds are hardcoded for simplicity  
- Connect to **Amazon Bedrock** for AI-driven weather summaries  
- Add a **React dashboard** for forecast history and manual controls  
- Trigger real-world actions using **SSM Automation** or **AWS IoT Core**  
- Use **Step Functions** to manage complex or chained automation workflows  
- Expand support to **multiple locations and time zones**  
- Use **Amazon Pinpoint** or enhanced **SES** for rich HTML email templates  
- 🔁 **Switch EventBridge rule to SNS-driven triggers** for real-time weather reactions instead of schedule-based simulations  
- 🔌 **Integrate AWS IoT or SSM** to simulate real automation (e.g., shutdown, reboot, failover, backup)  

---

## 🧱 Challenges & Solutions

| Challenge                     | Solution                                               |
|------------------------------|--------------------------------------------------------|
| API rate limits              | Retry logic with exponential backoff                  |
| Cross-stack topic reference  | Used CDK stack outputs to pass SNS topic ARN across modules |
| SNS permissions for Lambda   | Used `grantPublish` helper for secure access          |
| Testing edge cases           | Simulated dummy data with manual test events          |
| Avoiding duplicate alerts    | Timestamp filtering logic in Lambda                   |
| Secrets handling             | Encrypted and rotated via AWS Secrets Manager         |
| Modular project structure    | Separated by stack (email, alerts, automation)        |

---

## 🛠️ Improvements Added

- Split architecture into **three modular CDK stacks**  
- Added **SNS topic and subscriptions** for alerting  
- Used **Secrets Manager** for secure key handling  
- Introduced **timestamp filtering** for alert deduplication  
- Created **Jest unit tests** for logic and infrastructure 

---

## 🧹 Clean-Up Steps

1. Delete EventBridge rules and Lambda functions  
2. Delete SNS topics and subscriptions  
3. Remove Secrets Manager entry  
4. Delete IAM roles and policies 

---

## 🪞 Reflection / Lessons Learned

- Modular stacks simplify future upgrades (e.g. AI, IoT)  
- Testing early avoids pain later – Jest caught key errors  
- Simulated logs are useful for designing automation safely  
- AWS CDK helps express intent clearly, especially for beginners  

---

## 🔗 Project Links

> **Project Page:** [nicolasgloss.com/projects/weather-notification-system](https://nicolasgloss.com/projects/serverless-weather)  
> **GitHub Repo:** [github.com/nicolasgloss-dev/weather-notification-system](https://github.com/nicolasgloss-dev/weather-notification-system)  
> **Architecture Decision Log (ADR):** [weather-notification-system/docs/adr.md](https://github.com/nicolasgloss-dev/weather-notification-system/blob/main/docs/adr.md)
