import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as sns from 'aws-cdk-lib/aws-sns';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import * as lambdaNode from 'aws-cdk-lib/aws-lambda-nodejs';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as path from 'path';
import * as scheduler from 'aws-cdk-lib/aws-scheduler';

// -----------------------------------------------------------------------------
// WeatherNotificationSystemStack
// -----------------------------------------------------------------------------
// This stack builds the main AWS resources for the Smart Weather Notification
// & Automation System project. It creates:
// - SNS for alerts
// - Secrets Manager for the weather API key
// - A Lambda function for fetching and publishing weather summaries
//
// DynamoDB was initially planned but is now removed for simplicity.
// Future enhancements section below outlines optional integration.
// -----------------------------------------------------------------------------
export class WeatherNotificationSystemStack extends cdk.Stack {
  // expose topic for reuse by other stacks
  public readonly notificationsTopic: sns.Topic;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // -------------------------------------------------------------------------
    // SNS Topic - for sending weather alerts or updates via notifications.
    // The topic can be subscribed to by email, SMS, or other services later.
    // -------------------------------------------------------------------------
    this.notificationsTopic = new sns.Topic(this, 'NotificationsTopic', {
      displayName: 'Weather Notifications',
    });

    // -------------------------------------------------------------------------
    // Secrets Manager - stores the external weather API key securely.
    // The key can be added manually later using the AWS Console or CLI.
    // -------------------------------------------------------------------------
    const weatherApiSecret = new secretsmanager.Secret(this, 'WeatherApiKey', {
      secretName: 'WeatherAPIKey',
      description: 'API key for weather provider (OpenWeatherMap)',
    });

    // -------------------------------------------------------------------------
    // Lambda Function - FetchWeatherDataFn
    // -------------------------------------------------------------------------
    // This Lambda will:
    // - Call the OpenWeatherMap API
    // - Process the forecast
    // - Send daily updates via SNS
    //
    // The NodejsFunction automatically compiles the TypeScript Lambda using
    // esbuild. This makes it easy to test and deploy from a single source file.
    // -------------------------------------------------------------------------
    const fetchWeatherFn = new lambdaNode.NodejsFunction(this, 'FetchWeatherDataFn', {
      runtime: lambda.Runtime.NODEJS_18_X,
      entry: path.join(__dirname, '../lambda/daily-summary/fetchWeatherData.ts'),
      handler: 'handler',
      memorySize: 256,
      timeout: cdk.Duration.seconds(20),

      // -----------------------------------------------------------------------
      // Local build setup
      // -----------------------------------------------------------------------
      // forceDockerBundling: false disables Docker-based builds.
      // This means esbuild (installed locally) will handle TypeScript bundling.
      // It's faster, uses fewer system resources, and avoids Docker issues
      // on Windows setups. Docker will only be used if local esbuild isn't found.
      // -----------------------------------------------------------------------
      bundling: {
        forceDockerBundling: false,
      },

      // -----------------------------------------------------------------------
      // Environment variables for the Lambda function.
      // These can be referenced inside the code using process.env.VARIABLE.
      // -----------------------------------------------------------------------
      environment: {
        CITY: 'Sydney,AU',
        WEATHER_API_KEY: '', // Pulled from AWS Secrets Manager securely at runtime
        // Reusing the same SNS topic to centralise all weather-related notifications.
        AUTOMATION_TOPIC_ARN: this.notificationsTopic.topicArn,
      },
    });

    // -------------------------------------------------------------------------
    // EventBridge Scheduler — runs at 7AM *Australia/Sydney* time (timezone aware).
    // CloudWatch Events (events.Rule) is UTC-only, so Scheduler is the correct choice.
    // Using EventBridge Scheduler here because it supports explicit time zones (Sydney)
    // -------------------------------------------------------------------------
    const schedulerRole = new iam.Role(this, 'DailySummarySchedulerRole', {
      assumedBy: new iam.ServicePrincipal('scheduler.amazonaws.com'),
    });

    // Allow Scheduler to invoke the Lambda
    fetchWeatherFn.grantInvoke(schedulerRole);

    // EventBridge Scheduler uses its own cron format (6 fields, ? for day placeholders)
    new scheduler.CfnSchedule(this, 'DailySummarySydney', {
      description: 'Triggers the daily weather summary at 7AM (Australia/Sydney).',
      flexibleTimeWindow: { mode: 'OFF' },
      scheduleExpression: 'cron(0 7 * * ? *)',
      scheduleExpressionTimezone: 'Australia/Sydney',
      target: {
        arn: fetchWeatherFn.functionArn,
        roleArn: schedulerRole.roleArn,
      },
    });

    // NOTE: This rule won’t automatically trigger during local testing.
    // To test it manually before deployment, just invoke the Lambda directly
    // using AWS Console or: `npx aws-lambda invoke` / CDK's `cdk synth + invoke`.

    // -------------------------------------------------------------------------
    // Permissions - define what the Lambda is allowed to do.
    //             - minimal access required for core Lambda functionality.
    // -------------------------------------------------------------------------
    // Allow publishing messages to the SNS topic.
    this.notificationsTopic.grantPublish(fetchWeatherFn);

    // Allow the Lambda to read the API key from Secrets Manager.
    weatherApiSecret.grantRead(fetchWeatherFn);

    // Add an explicit IAM policy for fine-grained access control.
    fetchWeatherFn.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ['secretsmanager:GetSecretValue'],
        resources: [weatherApiSecret.secretArn],
      }),
    );

    // -------------------------------------------------------------------------
    // Outputs - show useful info after deployment (helps verify resources).
    // -------------------------------------------------------------------------
    new cdk.CfnOutput(this, 'TopicArn', { value: this.notificationsTopic.topicArn });
    new cdk.CfnOutput(this, 'FunctionName', { value: fetchWeatherFn.functionName });
    new cdk.CfnOutput(this, 'WeatherSecretName', { value: weatherApiSecret.secretName });

    // -------------------------------------------------------------------------
    // Future Enhancements
    // -------------------------------------------------------------------------
    // - Add a DynamoDB table for storing user preferences or alert thresholds.
    // - Integrate with SES for HTML email summaries.
    // - Add location-based configuration for multiple regions.
  }
}
