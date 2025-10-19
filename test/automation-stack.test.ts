import * as cdk from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import * as sns from 'aws-cdk-lib/aws-sns';
import { WeatherAutomationStack } from '../lib/automation-stack';

// -----------------------------------------------------------------------------
// automation-stack.test.ts
// -----------------------------------------------------------------------------
// This test validates that the WeatherAutomationStack correctly defines
// both the Lambda function and the EventBridge rule for automated tasks.
//
// It uses CDK assertions to ensure key properties such as the runtime,
// schedule expression, and description are strictly validated. This prevents
// configuration drift or silent regressions as the infrastructure evolves.
// -----------------------------------------------------------------------------

test('EventBridge Rule and Lambda Function are created for automation', () => {
  const app = new cdk.App();

  // --------------------------------------------------------------------------
  // Create a mock SNS topic to satisfy the required constructor prop.
  // This mirrors how the real stack expects the topic to be provided.
  // --------------------------------------------------------------------------
  const mockTopicStack = new cdk.Stack(app, 'MockTopicStack');
  const mockTopic = new sns.Topic(mockTopicStack, 'MockNotificationsTopic');

  // --------------------------------------------------------------------------
  // Instantiate the automation stack with the required prop.
  // --------------------------------------------------------------------------
  const stack = new WeatherAutomationStack(app, 'AutomationTestStack', {
    notificationsTopic: mockTopic,
  });

  // Convert stack resources into a CloudFormation template for assertions.
  const template = Template.fromStack(stack);

  // --------------------------------------------------------------------------
  // Test 1: Strictly verify the Lambda function.
  // --------------------------------------------------------------------------
  // This ensures the Lambda is created with the correct runtime and intent.
  // Any deviation (e.g. wrong runtime or missing description) will fail the test.
  // --------------------------------------------------------------------------
  template.hasResourceProperties('AWS::Lambda::Function', {
    Description: 'Handles weather-triggered AWS automation tasks',
    Runtime: 'nodejs18.x',
    MemorySize: 256,
    Timeout: 15,
  });

  // --------------------------------------------------------------------------
  // Test 2: Strictly validate the EventBridge Rule.
  // --------------------------------------------------------------------------
  // This confirms the schedule is exactly every 3 hours, with a matching
  // description. Even a one-word change will fail this assertion — intentional
  // for strong regression protection.
  // --------------------------------------------------------------------------
  //
  // Note:
  // - The "rate(3 hours)" format uses the plural form ("hours"), which is the
  //   syntax required by AWS EventBridge for recurring schedules.
  // - Verifying the description helps catch subtle configuration mismatches
  //   that could occur when IaC templates evolve over time.
  // --------------------------------------------------------------------------
  template.hasResourceProperties('AWS::Events::Rule', {
    ScheduleExpression: 'rate(3 hours)',
    Description: 'Triggers weather automation tasks every 3 hours.',
  });

  // --------------------------------------------------------------------------
  // Test 3: Confirm exact resource counts.
  // --------------------------------------------------------------------------
  // This prevents accidental creation of duplicate EventBridge rules
  // or missing resources that should always exist.
  // --------------------------------------------------------------------------
  template.resourceCountIs('AWS::Events::Rule', 1);
  template.resourceCountIs('AWS::Lambda::Function', 1);
});
