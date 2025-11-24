// -----------------------------------------------------------------------------
// File: weather-notification-system.test.ts
// Project: Smart Weather Notification & Automation System (Serverless AWS CDK)
// Description: Validates core infrastructure of the Weather Notification System
//              Stack, including SNS, Lambda permissions, and IAM policy creation.
// Author: Nicolas Gloss
// Last Updated: 2025-11-23
// -----------------------------------------------------------------------------

// This test suite ensures the Weather Notification System stack creates all
// required resources and assigns correct IAM permissions.

import * as cdk from 'aws-cdk-lib';
import { Template, Match } from 'aws-cdk-lib/assertions';
import { WeatherNotificationSystemStack } from '../lib/weather-notification-system-stack';

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
