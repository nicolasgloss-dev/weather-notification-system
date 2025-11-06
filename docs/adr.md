# 🧭 Architecture Decision Log (ADR)

This document records the major design decisions for the **Smart Weather Notification & Automation System (AWS CDK)** project.  
Each decision includes context, choice, consequences, and alternatives considered.

---

## ADR 001 — Infrastructure as Code with AWS CDK

**Decision:**  
Use **AWS CDK (TypeScript)** for defining and deploying all infrastructure.

**Context:**  
- The project requires a reproducible, automated, and modular deployment.  
- CDK integrates directly with AWS services and allows for strongly typed, testable constructs.  
- It aligns with other projects in the portfolio for consistency and reusability.

**Consequences:**  
- Easier iteration and code reuse between Lambda, SNS, and EventBridge modules.  
- Enables unit testing of IaC components with Jest.  
- Added environment variables, CloudWatch logging, and tagging to improve maintainability and cost tracking.  
- Learning curve for CDK, but aligns with professional AWS DevOps/Cloud Engineer standards.

**Alternatives:**  
- **Terraform:** Multi-cloud but heavier setup for small serverless projects.  
- **AWS SAM:** Optimised for serverless, but lacks the modular IaC flexibility of CDK.

---

## ADR 002 — Event-Driven Serverless Architecture

**Decision:**  
Adopt an **event-driven, serverless pattern** using EventBridge, Lambda, and SNS.

**Context:**  
- The project involves scheduled and conditional triggers (daily weather updates, severe weather alerts, and automated actions).  
- EventBridge provides scalable cron-like scheduling without manual intervention.  
- Extended automation now runs hourly via EventBridge rules for weather-aware actions.  
- Serverless architecture reduces operational overhead and scales automatically.

**Consequences:**  
- No servers to manage, with minimal running cost.  
- High modularity—each Lambda function handles a specific concern.  
- Requires careful monitoring and permissions separation across functions.

**Alternatives:**  
- **Step Functions:** More control over sequencing, but unnecessary complexity.  
- **EC2 or containerised approach:** Higher cost and maintenance burden.

---

## ADR 003 — Notification System Using SNS and SES

**Decision:**  
Use **Amazon SNS** for SMS and **Amazon SES** for email delivery.

**Context:**  
- Notifications must reach both SMS and email channels.  
- SNS provides a unified way to send SMS and trigger further workflows.  
- SES allows formatted HTML email summaries for daily forecasts.

**Consequences:**  
- Scalable and low-cost notification pipeline.  
- Easy subscription management and testing.  
- Requires verified identities for SES in some regions.

**Alternatives:**  
- **Twilio or SendGrid:** External tools with more formatting options but additional cost and API complexity.  
- **Pure SNS (email + SMS):** Possible, but SES provides superior email formatting.

---

## ADR 004 — Secure Secret and Configuration Management

**Decision:**  
Use **AWS Secrets Manager** for storing weather API keys and **Parameter Store** for simple configurations.

**Context:**  
- External API credentials must not be hardcoded or exposed.  
- Secrets need rotation and secure retrieval at runtime.  
- Some configuration items (e.g., recipient phone number, city name) do not require encryption.

**Consequences:**  
- Follows AWS best practices for credential handling.  
- Slightly higher cost for Secrets Manager, but adds auditability and automatic rotation options.  
- Adds dependency on IAM permissions for secret retrieval.

**Alternatives:**  
- **Hardcoded environment variables:** Insecure and not suitable for production.  
- **S3 configuration file:** Possible, but less secure and lacks rotation capabilities.

---

## ADR 005 — Simulated IoT and System Automation

**Decision:**  
Include a simulated **IoT automation workflow** via the `AutomationHandler` Lambda (previously `IoTAutomationFn`).

**Context:**  
- Demonstrates the ability to respond dynamically to environmental conditions.  
- Allows showcasing real-world automation scenarios (e.g., turning off devices in poor sunlight).  
- Adds creative and educational value to the portfolio.

**Consequences:**  
- Enables future integration with AWS IoT Core or SSM automation.  
- Integrated with SNS for system-wide notifications.  
- Supports modular triggers (EventBridge + manual SNS).  
- Logs are traceable in CloudWatch for demonstration purposes.  
- Simulation avoids cost or unintended actions in real AWS environments.

**Alternatives:**  
- **Actual IoT device integration:** Possible with AWS IoT Core, but unnecessary for a proof-of-concept.  
- **Simple CloudWatch log message:** Easier, but less modular for future expansion.

---

## ADR 006 — Security and Compliance Design

**Decision:**  
Follow a **least-privilege, encryption-first** approach across all resources.

**Context:**  
- The system handles API keys, contact data, and notification content.  
- IAM roles and policies must be scoped to individual functions.  
- Secrets Manager encryption ensures compliance with AWS security best practices.

**Consequences:**  
- Minimal blast radius in case of misconfiguration.  
- Resource tags and scoped IAM policies introduced for least-privilege and cost attribution.  
- Alignment with AWS Well-Architected Framework security pillar.  
- Slightly higher complexity in permissions management.

**Alternatives:**  
- **Shared execution role:** Simpler, but violates least-privilege principle.  
- **Unencrypted secrets:** Faster setup but not compliant with security standards.

---

## ADR 007 — Testing Strategy

**Decision:**  
Implement **unit and integration testing** using Jest and CDK assertions.

**Context:**  
- Infrastructure and Lambda logic must be testable before deployment.  
- CDK’s `assertions.Template` enables validation of resource creation.  
- Lambda logic can be mocked and validated independently.

**Consequences:**  
- Improves reliability and confidence in IaC code.  
- Easier debugging of template generation before deployment.  
- Test coverage expanded to include automation and Lambda logic using Jest.  
- Requires initial setup time for Jest and test mocks.

**Alternatives:**  
- **Manual validation via AWS Console:** Slower and less reliable.  
- **Post-deployment CloudWatch testing:** Possible but reactive rather than proactive.

---

## ADR 008 — AI Integration (Future Consideration)

**Decision:**  
Plan optional integration with **Amazon Bedrock** for intelligent weather summarisation.

**Context:**  
- AI can enhance the user experience by producing natural summaries or alert prioritisation.  
- Bedrock models (e.g., Claude, Titan) are easily integrated via API calls.  
- AI inclusion will remain conceptual for now to maintain project simplicity.

**Consequences:**  
- Highlights forward-thinking design for interviews.  
- Provides a clear path for future AI project expansion.  
- No direct cost or dependency in the current implementation.

**Alternatives:**  
- **Integrate Bedrock immediately:** Adds unnecessary complexity.  
- **Exclude AI entirely:** Simpler, but misses a strong discussion point for innovation.

---

## ADR 009 — Cost and Observability Enhancements (New)

**Decision:**  
Implement **CloudWatch logging**, **environment tagging**, and **schedule tuning** to optimise cost and visibility.

**Context:**  
- Serverless resources benefit from transparent monitoring.  
- Tags and metrics help identify cost contributors per module.  
- Scheduled events were tuned to minimise idle invocation costs.

**Consequences:**  
- Improved observability via CloudWatch logs and metrics.  
- Easier cost allocation and Free Tier awareness.  
- Slight increase in stack complexity.

**Alternatives:**  
- **Manual monitoring or external APM tools:** Adds overhead.  
- **No tagging:** Simpler, but less accountable.

---

## ADR 010 — Dynamic Config with DynamoDB (Planned)

**Decision:**  
DynamoDB is not currently used in the deployed architecture, but is identified as a future enhancement to store dynamic weather configuration data such as location preferences, alert thresholds, or contact rules.

**Context:**
- Current implementation uses static values passed via environment variables or hardcoded defaults.
- Adding DynamoDB would enable persistent, user-customisable configuration and support a web frontend or API for updates.
- This aligns with scalable design but was deprioritised to focus on Lambda-event flow and notifications first.

**Consequences:**
- Not included in the current AWS billing or architecture diagram.
- Avoids unnecessary complexity while still showing modular potential.
- Can be added later as a new module using CDK (e.g., config-storage-stack.ts).

**Alternatives:**
- **Keep static values only:** Simpler, but lacks personalisation or reuse.
- **Use S3 for config:** Possible, but lacks querying and conditional retrieval.

---

**Status:**  
All decisions above are **accepted and implemented (or reserved for future expansion)**.  
Each aligns with AWS best practices and supports a maintainable, cost-efficient, and secure architecture.

---

**Last Updated:** November 2025 — Final Revision  
**Author:** *Nicolas Gloss (nicolasgloss-dev)*  
**Project:** *Smart Weather Notification & Automation System*
