#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { WeatherNotificationSystemStack } from '../lib/weather-notification-system-stack';
import { WeatherAutomationStack } from '../lib/automation-stack';

// This is the main entry point for the CDK app.
// It tells CDK which stack to deploy and can also hold account/region info.

const app = new cdk.App();

// Instantiate the main stack and expose the SNS topic
const notificationStack = new WeatherNotificationSystemStack(app, 'WeatherNotificationSystemStack');

// Pass the actual Topic construct into the automation stack
new WeatherAutomationStack(app, 'WeatherAutomationStack', {
  notificationsTopic: notificationStack.notificationsTopic,
});
