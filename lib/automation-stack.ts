import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as events from 'aws-cdk-lib/aws-events';
import * as targets from 'aws-cdk-lib/aws-events-targets';

// -----------------------------------------------------------------------------
// This section defines the automation module for the Smart Weather Notification
// System. The purpose is to demonstrate AWS event-driven automation, where an
// EventBridge rule triggers a Lambda function based on weather conditions.
// -----------------------------------------------------------------------------

export class WeatherAutomationStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // -------------------------------------------------------------------------
    // Lambda Function: Automation Handler
    // -------------------------------------------------------------------------
    // This Lambda simulates AWS automation actions triggered by specific
    // weather conditions (e.g. turning off IoT devices during storms).
    // -------------------------------------------------------------------------
    const automationHandler = new lambda.Function(this, 'AutomationHandler', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'automationHandler.main',
      code: lambda.Code.fromAsset('lambda/automation'),
      description: 'Handles weather-triggered AWS automation tasks',
    });

    // -------------------------------------------------------------------------
    // EventBridge Rule: WeatherAutomationRule
    // -------------------------------------------------------------------------
    // This rule runs periodically (e.g. every hour) and checks for simulated
    // weather conditions. In a production scenario, it could be driven by
    // an external API or an SNS message with weather data.
    // -------------------------------------------------------------------------
    const weatherAutomationRule = new events.Rule(this, 'WeatherAutomationRule', {
      schedule: events.Schedule.rate(cdk.Duration.hours(1)),
      description: 'Triggers automation tasks based on weather conditions',
    });

    // -------------------------------------------------------------------------
    // Add Lambda Target
    // -------------------------------------------------------------------------
    // Connects the EventBridge rule to the automation Lambda. Each invocation
    // will simulate checking weather and responding accordingly.
    // -------------------------------------------------------------------------
    weatherAutomationRule.addTarget(new targets.LambdaFunction(automationHandler));
  }
}
