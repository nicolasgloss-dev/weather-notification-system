#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { WeatherNotificationSystemStack } from '../lib/weather-notification-system-stack';

// This is the main entry point for the CDK app.
// It tells CDK which stack to deploy and can also hold account/region info.

const app = new cdk.App();

// Create a new instance of the main stack.
// The stack name appears in CloudFormation after deployment.
new WeatherNotificationSystemStack(app, 'WeatherNotificationSystemStack', {
  // If I ever want to deploy to a specific account or region,
  // I can uncomment the next line and fill in the details.
  // env: { account: '123456789012', region: 'ap-southeast-2' },
});
