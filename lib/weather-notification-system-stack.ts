import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as sns from 'aws-cdk-lib/aws-sns';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import * as lambdaNode from 'aws-cdk-lib/aws-lambda-nodejs';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as path from 'path';

export class WeatherNotificationSystemStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // This stack builds the core resources for the weather notification project.
    // It sets up DynamoDB, SNS, Secrets Manager, and one Lambda that will later
    // fetch weather data from an external API.

    // SNS Topic - used later for sending alerts or updates.
    const notificationsTopic = new sns.Topic(this, 'NotificationsTopic', {
      displayName: 'Weather Notifications',
    });

    // DynamoDB Table - simple pay-per-request table to hold configuration
    // or subscription data. Using on-demand billing keeps costs near zero.
    const configTable = new dynamodb.Table(this, 'ConfigTable', {
      partitionKey: { name: 'pk', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY, // fine for dev/testing
    });

    // Secrets Manager - this will securely store the weather API key.
    // Key value can be added through the AWS Console or CLI later.
    const weatherApiSecret = new secretsmanager.Secret(this, 'WeatherApiKey', {
      secretName: 'WeatherAPIKey',
      description: 'API key for weather provider (OpenWeatherMap)',
    });

    // Lambda Function - handles calling the external API.
    // Using NodejsFunction compiles the TS file automatically.
    const fetchWeatherFn = new lambdaNode.NodejsFunction(this, 'FetchWeatherDataFn', {
      runtime: lambda.Runtime.NODEJS_18_X,
      entry: path.join(__dirname, '../lambda/daily-summary/fetchWeatherData.ts'),
      handler: 'handler',
      memorySize: 256,
      timeout: cdk.Duration.seconds(20),

      // This setting uses local esbuild instead of Docker, which keeps synth/deploy simple.
      bundling: { forceDockerBundling: false },

      // Basic environment variables. Replace with the API key logic later
      // to pull from Secrets Manager directly.
      environment: {
        CITY: 'Sydney,AU',
        WEATHER_API_KEY: '',
        NOTIFICATIONS_TOPIC_ARN: notificationsTopic.topicArn,
        CONFIG_TABLE_NAME: configTable.tableName,
      },
    });

    // Give the Lambda permission to publish to SNS and read/write DynamoDB.
    notificationsTopic.grantPublish(fetchWeatherFn);
    configTable.grantReadWriteData(fetchWeatherFn);

    // Allow Lambda to read the weather API key from Secrets Manager.
    weatherApiSecret.grantRead(fetchWeatherFn);

    // Explicit IAM statement - example of least privilege control.
    fetchWeatherFn.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ['secretsmanager:GetSecretValue'],
        resources: [weatherApiSecret.secretArn],
      }),
    );

    // Outputs help identify key resources after deployment.
    new cdk.CfnOutput(this, 'TopicArn', { value: notificationsTopic.topicArn });
    new cdk.CfnOutput(this, 'ConfigTableName', { value: configTable.tableName });
    new cdk.CfnOutput(this, 'FunctionName', { value: fetchWeatherFn.functionName });
    new cdk.CfnOutput(this, 'WeatherSecretName', { value: weatherApiSecret.secretName });
  }
}
