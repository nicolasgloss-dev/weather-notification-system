import * as cdk from 'aws-cdk-lib';
import { Template, Match } from 'aws-cdk-lib/assertions';
import { WeatherNotificationSystemStack } from '../lib/weather-notification-system-stack';

// -----------------------------------------------------------------------------
// weather-notification-system.test.ts
// -----------------------------------------------------------------------------
// This test file ensures that the WeatherNotificationSystemStack defines
// all expected core resources (SNS, Lambda, Secrets Manager).
// DynamoDB checks have been removed as the table is now a future enhancement.
// -----------------------------------------------------------------------------

// Create the CDK app and stack once and reuse it across tests.
const app = new cdk.App();
const stack = new WeatherNotificationSystemStack(app, 'TestStack');

// Convert the stack to a CloudFormation template for assertions.
const template = Template.fromStack(stack);

test('SNS Topic and Lambda Function are created', () => {
  // Check that the SNS topic exists with correct DisplayName.
  template.hasResourceProperties('AWS::SNS::Topic', {
    DisplayName: 'Weather Notifications',
  });

  // Check that a Lambda function exists with the expected runtime.
  template.hasResourceProperties('AWS::Lambda::Function', {
    Runtime: 'nodejs18.x',
  });
});

test('Secrets Manager secret for API key is created', () => {
  // Check that the secret for the weather API key exists.
  // Using a flexible match to avoid brittleness on minor text changes.
  template.hasResourceProperties('AWS::SecretsManager::Secret', {
    Description: Match.stringLikeRegexp('OpenWeatherMap'),
  });
});

test('Lambda has permission to access Secrets Manager', () => {
  // Check that IAM policy grants access to GetSecretValue.
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
