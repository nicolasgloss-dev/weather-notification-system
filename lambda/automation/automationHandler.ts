// -----------------------------------------------------------------------------
// automationHandler.ts
// -----------------------------------------------------------------------------
// This Lambda simulates weather-based automation in AWS.
// It’s triggered by an EventBridge rule (scheduled every few hours) and
// performs different simulated actions depending on the weather condition.
//
// The goal here is to demonstrate how AWS Lambda can respond automatically
// to environmental data or scheduled checks in a real system.
// -----------------------------------------------------------------------------

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
