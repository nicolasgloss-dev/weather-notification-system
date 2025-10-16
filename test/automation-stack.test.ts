import * as cdk from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { WeatherAutomationStack } from '../lib/automation-stack';

// -----------------------------------------------------------------------------
// automation-stack.test.ts
// -----------------------------------------------------------------------------
// This test validates that the WeatherAutomationStack correctly defines
// both the Lambda function and the EventBridge rule for automated tasks.
//
// It uses CDK assertions to ensure key properties such as the runtime,
// schedule expression, and description are correctly defined.
// -----------------------------------------------------------------------------

test('EventBridge Rule and Lambda Function are created for automation', () => {
  const app = new cdk.App();

  // --------------------------------------------------------------------------
  // Create the stack instance for testing.
  // --------------------------------------------------------------------------
  const stack = new WeatherAutomationStack(app, 'AutomationTestStack');

  // Convert stack resources to a CloudFormation template for assertions.
  const template = Template.fromStack(stack);

  // --------------------------------------------------------------------------
  // Test 1: Verify the Lambda function exists with correct runtime and purpose.
  // --------------------------------------------------------------------------
  template.hasResourceProperties('AWS::Lambda::Function', {
    Description: 'Handles weather-triggered AWS automation tasks',
    Runtime: 'nodejs18.x',
  });

  // --------------------------------------------------------------------------
  // Test 2: Validate the EventBridge Rule configuration.
  // --------------------------------------------------------------------------
  // This assertion checks that the stack correctly defines an EventBridge rule
  // which runs every 3 hours. The description is verified as well to confirm
  // that the infrastructure code matches its intended purpose.
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
  // Test 3: Confirm the expected resource counts exist in the stack.
  // --------------------------------------------------------------------------
  // These checks ensure that exactly one EventBridge rule and one Lambda
  // function are created, preventing duplication or missing resources.
  // --------------------------------------------------------------------------
  template.resourceCountIs('AWS::Events::Rule', 1);
  template.resourceCountIs('AWS::Lambda::Function', 1);
});
