import * as cdk from 'aws-cdk-lib';
import { Template, Match } from 'aws-cdk-lib/assertions';
import { WeatherNotificationSystemStack } from '../lib/weather-notification-system-stack';

// These tests confirm that the stack creates the expected AWS resources.
// Having these tests helps prove that the IaC setup is correct and repeatable.

// Create the CDK app and stack once and reuse it across tests.
const app = new cdk.App();
const stack = new WeatherNotificationSystemStack(app, 'TestStack');

// Convert the stack to a CloudFormation template for assertions.
const template = Template.fromStack(stack);

test('SNS Topic, DynamoDB Table, and Lambda Function are created', () => {
  // Check that the SNS topic exists.
  template.hasResourceProperties('AWS::SNS::Topic', {
    DisplayName: 'Weather Notifications',
  });

  // Check that the DynamoDB table exists with correct key and billing mode.
  template.hasResourceProperties('AWS::DynamoDB::Table', {
    KeySchema: [
      {
        AttributeName: 'pk',
        KeyType: 'HASH',
      },
    ],
    BillingMode: 'PAY_PER_REQUEST',
  });

  // Check that a Lambda function exists with the expected runtime.
  template.hasResourceProperties('AWS::Lambda::Function', {
    Runtime: 'nodejs18.x',
  });
});

test('Secrets Manager secret for API key is created', () => {
  // Check that the secret for the weather API key exists.
  // Using Match.stringLikeRegexp makes it flexible if the text changes slightly.
  template.hasResourceProperties('AWS::SecretsManager::Secret', {
    Description: Match.stringLikeRegexp('OpenWeatherMap'),
  });
});

test('Lambda has permission to access Secrets Manager', () => {
  // Check that at least one IAM policy statement allows GetSecretValue.
  template.hasResourceProperties('AWS::IAM::Policy', {
    PolicyDocument: {
      Statement: Match.arrayWith([
        Match.objectLike({
          Action: Match.stringLikeRegexp('secretsmanager:GetSecretValue'),
          Effect: 'Allow',
        }),
      ]),
    },
  });
});
