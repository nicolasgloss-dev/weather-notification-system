import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as events from 'aws-cdk-lib/aws-events';
import * as targets from 'aws-cdk-lib/aws-events-targets';
import * as iam from 'aws-cdk-lib/aws-iam';

// -----------------------------------------------------------------------------
// WeatherAutomationStack
// -----------------------------------------------------------------------------
// This stack sets up the automation module for the Smart Weather Notification
// & Automation System. It demonstrates event-driven automation using AWS
// EventBridge to trigger a Lambda function on a recurring schedule.
// -----------------------------------------------------------------------------
export class WeatherAutomationStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // -------------------------------------------------------------------------
    // Lambda Function - AutomationHandler
    // -------------------------------------------------------------------------
    // This Lambda simulates AWS automation tasks triggered by weather conditions.
    // Examples:
    //   - Turn off IoT devices during storms
    //   - Pause watering systems when it rains
    //   - Start backups or cleanup during clear weather
    //
    // The goal here is to show how AWS Lambda can be used to run automated
    // actions based on weather events or scheduled triggers.
    // -------------------------------------------------------------------------
    const automationHandler = new lambda.Function(this, 'AutomationHandler', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'automationHandler.main',
      code: lambda.Code.fromAsset('lambda/automation'),
      description: 'Handles weather-triggered AWS automation tasks',
      memorySize: 128,
      timeout: cdk.Duration.seconds(10),
    });

    // -------------------------------------------------------------------------
    // EventBridge Rule - WeatherAutomationRule
    // -------------------------------------------------------------------------
    // This rule triggers the automation Lambda on a regular schedule.
    // In this demo, it runs every 3 hours. In a real-world setup, it could
    // trigger based on live weather data or SNS notifications.
    // -------------------------------------------------------------------------
    const weatherAutomationRule = new events.Rule(this, 'WeatherAutomationRule', {
      schedule: events.Schedule.rate(cdk.Duration.hours(3)),
      description: 'Triggers weather automation tasks every 3 hours.',
    });

    // Connect the EventBridge rule to the Lambda target.
    weatherAutomationRule.addTarget(new targets.LambdaFunction(automationHandler));

    // -------------------------------------------------------------------------
    // Permissions - Example of least privilege.
    // -------------------------------------------------------------------------
    // The Lambda only needs basic permissions for logging and (optionally)
    // to publish messages or trigger other resources.
    // -------------------------------------------------------------------------
    automationHandler.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ['logs:CreateLogGroup', 'logs:CreateLogStream', 'logs:PutLogEvents'],
        resources: ['*'],
      }),
    );

    // -------------------------------------------------------------------------
    // Outputs - Helps verify resource creation after deployment.
    // -------------------------------------------------------------------------
    new cdk.CfnOutput(this, 'AutomationFunctionName', {
      value: automationHandler.functionName,
      description: 'Lambda that runs automated AWS tasks based on weather.',
    });

    new cdk.CfnOutput(this, 'AutomationRuleName', {
      value: weatherAutomationRule.ruleName,
      description: 'EventBridge rule that triggers weather automation tasks.',
    });
  }
}
