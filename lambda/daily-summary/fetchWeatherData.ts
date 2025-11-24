// -----------------------------------------------------------------------------
// File: fetchWeatherData.ts
// Project: Smart Weather Notification & Automation System (Serverless AWS CDK)
// Description: Lambda function that fetches live weather data from the external
//              API using the stored secret key. Returns structured weather info
//              for downstream automation functions.
// Author: Nicolas Gloss
// Last Updated: 2025-11-23
// -----------------------------------------------------------------------------

import axios from 'axios';
import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';

// NOTE: This Lambda runs at 7AM Sydney time (via EventBridge cron).
// It fetches weather data and will eventually publish the morning summary.

const secretsClient = new SecretsManagerClient({}); // reuse client to avoid extra cold start cost

export const handler = async () => {
  const city = process.env.CITY || 'Sydney,AU';

  // This value is only a placeholder for local/testing.
  // If left as dummy, try to pull the real API key below.
  let apiKey = process.env.WEATHER_API_KEY || 'DUMMY_KEY_FOR_LOCAL_TESTS';

  console.log('[FetchWeather] Starting run for city:', city);

  // If still using dummy, attempt to fetch the real API key from Secrets Manager.
  // This avoids committing credentials or hardcoding them in the environment.
  if (apiKey === 'DUMMY_KEY_FOR_LOCAL_TESTS' || apiKey === '') {
    try {
      const secret = await secretsClient.send(
        new GetSecretValueCommand({ SecretId: 'WeatherAPIKey' })
      );
      if (secret.SecretString) {
        apiKey = secret.SecretString;
        console.log('[FetchWeather] Retrieved real API key from Secrets Manager.');
      }
    } catch (err: any) {
      // If this fails, the function will simply skip the real API call — safe behaviour for dev/test.
      console.warn('[FetchWeather] Could not retrieve secret, continuing with dummy key.', err?.message);
    }
  }

  // If still on dummy key after trying to retrieve, skip external call for safety.
  if (apiKey === 'DUMMY_KEY_FOR_LOCAL_TESTS') {
    console.log('[FetchWeather] No real API key found, skipping API call.');
    return { ok: true, message: 'Skipped real API call (dummy key).' };
  }

  try {
    const url = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`;
    const { data } = await axios.get(url, { timeout: 8000 });

    console.log('[FetchWeather] Forecast list length:', data?.list?.length ?? 0);
    return { ok: true, count: data?.list?.length ?? 0 };
  } catch (err: any) {
    console.error('[FetchWeather] Error fetching data:', err?.message);
    throw err;
  }
};
