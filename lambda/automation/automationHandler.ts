// -----------------------------------------------------------------------------
// File: automationHandler.ts
// Project: Smart Weather Notification & Automation System (Serverless AWS CDK)
// Description: Lambda handler responsible for evaluating weather conditions and
//              triggering automated tasks or alerts (e.g., severe weather actions).
// Author: Nicolas Gloss
// Last Updated: 2025-11-23
// -----------------------------------------------------------------------------

// This Lambda demonstrates how AWS can automate actions based on environment
// data or scheduled checks, similar to real event-driven systems.

import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";

// Create a single SNS client outside the handler to reuse across invocations.
// This improves performance because AWS reuses Lambda execution environments.
const sns = new SNSClient({});

// -----------------------------------------------------------------------------
// main handler
// -----------------------------------------------------------------------------
// This is the entry point for the Lambda. It runs automatically when triggered
// by EventBridge. In a real setup, it would receive a weather payload, but
// here it simply randomises the condition for demonstration purposes.
// -----------------------------------------------------------------------------
export const main = async (event: any) => {
  console.log("[AutomationHandler] Event received:", JSON.stringify(event));

  // ---------------------------------------------------------------------------
  // Step 1: Simulate checking weather conditions.
  // In a production setup, this data might come from a weather API or DynamoDB.
  // ---------------------------------------------------------------------------
  const conditions = ["Clear", "Rain", "Storm", "Cloudy"];
  const selected = conditions[Math.floor(Math.random() * conditions.length)];
  console.log(`[AutomationHandler] Simulated weather condition: ${selected}`);

  // ---------------------------------------------------------------------------
  // Step 2: Run automation logic depending on condition.
  // Each branch represents a realistic AWS use case that could be automated.
  // ---------------------------------------------------------------------------
  switch (selected) {
    case "Storm":
      console.log("[AutomationHandler] Detected storm. Simulating IoT device shutdown.");
      // In a real system, this might call AWS IoT Core or Systems Manager
      // Automation to safely turn off connected devices or scale down EC2 services.
      break;

    case "Rain":
      console.log("[AutomationHandler] Detected rain. Sending SNS notification.");
      // In production, this might notify admins or pause irrigation systems
      // by publishing to an SNS topic that triggers other subscribed actions.
      // An environment variable is used as the SNS topic ARN to keep it flexible.
      await sns.send(
        new PublishCommand({
          TopicArn: process.env.AUTOMATION_TOPIC_ARN,
          Message: "Automated notice: Rain detected. IoT watering system paused.",
        }),
      );
      break;

    case "Clear":
      console.log("[AutomationHandler] Clear weather. Simulating backup trigger.");
      // In production, this might start an AWS Backup job, trigger S3 replication,
      // or launch data archive tasks when systems are stable and weather is good.
      break;

    default:
      console.log("[AutomationHandler] Cloudy weather. No automation required.");
      // Cloudy or mild conditions might not need any automation.
      // This shows resilience — the system does nothing safely.
      break;
  }

  // ---------------------------------------------------------------------------
  // Step 3: Return structured response for logs and tests.
  // ---------------------------------------------------------------------------
  return {
    statusCode: 200,
    condition: selected,
    message: "Automation simulation complete.",
  };
};
