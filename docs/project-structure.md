# 🧱 Project Structure — Smart Weather Notification & Automation System (AWS CDK)

This document outlines the directory layout and purpose of each component within the  
**Smart Weather Notification & Automation System** project.  
It helps future contributors and reviewers understand where core logic, infrastructure, and documentation reside.

---

## 📂 Overall Directory Layout

```
/weather-notification-system/
├── bin/
│   └── weather-notification-system.ts         # Entry point for CDK application
├── lib/
│   ├── daily-summary-stack.ts                 # CDK stack for daily weather email summary
│   └── automation-stack.ts                    # CDK stack for AWS automation logic
├── lambda/
│   ├── daily-summary/                         # Lambda function for daily forecast retrieval and email
│   └── automation/                            # Lambda function for AWS weather-aware automation
├── test/
│   ├── weather-notification-system.test.ts    # CDK infrastructure tests for all stacks
│   ├── fetchWeatherData.test.ts               # Unit tests for daily summary Lambda
│   ├── automation-stack.test.ts               # CDK tests for automation EventBridge + Lambda
│   └── automationHandler.test.ts              # Unit tests for automation Lambda logic
├── docs/
│   ├── diagrams/                              # Architecture and workflow diagrams
│   └── screenshots/                           # Project evidence and test result screenshots
├── README.md                                  # Main project documentation
└── cdk.json                                   # CDK configuration file
```

---

## 🧩 Directory Breakdown

### **`bin/`**
Contains the CDK application entry point.  
Defines which stacks are deployed when running `cdk deploy`.  

---

### **`lib/`**
Stores all AWS CDK infrastructure stacks.  
Each stack corresponds to one major module of the system:
- `weather-notification-system-stack.ts` → Consolidated stack for weather summaries and alerts  
- `automation-stack.ts` → Handles hourly AWS automation logic and EventBridge triggers  

---

### **`lambda/`**
Contains the Lambda source code grouped by module:
- `daily-summary/` → Fetches forecasts, checks severe weather, and publishes alerts  
- `automation/` → Performs simulated AWS automation actions based on weather data  

Each folder includes a `handler.ts` file and its helper modules.

---

### **`test/`**
Includes **Jest**-based test suites for both infrastructure and logic:
- CDK stack validation using `aws-cdk-lib/assertions`.  
- Unit testing for Lambda handlers to verify expected outcomes.

---

### **`docs/`**
Holds all supporting documentation and visuals:
- `diagrams/` → Architecture, service flow, and automation visuals.  
- `screenshots/` → Proof of successful builds, test runs, and AWS console results.  

---

### **`README.md`**
Primary overview for the project — includes system modules, AWS services used, architecture diagram, test summary, and cost/security notes.

---

### **`cdk.json`**
Specifies the CDK app context and execution configuration (e.g., entry file, build commands).

---

## 🧠 Notes for Future Maintenance
- Maintain **consistent naming** for new stacks and Lambda folders.  
- Keep diagrams and screenshots in `/docs/` to avoid cluttering the root directory.  
- Run all Jest tests before major commits to ensure infrastructure consistency.  
- Document any new stack additions or folder changes in this file for traceability.

---

**Last Updated:** October 2025  
**Maintainer:** *Nicolas Gloss ([GitHub](https://github.com/nicolasgloss-dev) • [Website](https://nicolasgloss.dev))*

