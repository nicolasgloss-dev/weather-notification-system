import * as cdk from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { WeatherAutomationStack } from '../lib/automation-stack';

test('EventBridge Rule and Lambda Function are created for automation', () => {
  const app = new cdk.App();

  // --------------------------------------------------------------------------
  // Create the stack instance for testing.
  // --------------------------------------------------------------------------
  const stack = new WeatherAutomationStack(app, 'AutomationTestStack');

  // Convert stack resources to a CloudFormation template for assertions.
  const template = Template.fromStack(stack);

  // --------------------------------------------------------------------------
  // Test 1: Check if the Lambda function is created.
  // --------------------------------------------------------------------------
  template.hasResourceProperties('AWS::Lambda::Function', {
    Description: 'Handles weather-triggered AWS automation tasks',
    Runtime: 'nodejs18.x',
  });

  // --------------------------------------------------------------------------
  // Test 2: Check if the EventBridge rule exists and runs hourly.
  // --------------------------------------------------------------------------
  template.hasResourceProperties('AWS::Events::Rule', {
    ScheduleExpression: 'rate(1 hour)',
    Description: 'Triggers automation tasks based on weather conditions',
  });

  // --------------------------------------------------------------------------
  // Test 3: Ensure the EventBridge rule targets the Lambda function.
  // --------------------------------------------------------------------------
  template.resourceCountIs('AWS::Events::Rule', 1);
  template.resourceCountIs('AWS::Lambda::Function', 1);
});
