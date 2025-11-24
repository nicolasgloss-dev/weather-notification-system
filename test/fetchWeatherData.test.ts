// -----------------------------------------------------------------------------
// File: fetchWeatherData.test.ts
// Project: Smart Weather Notification & Automation System (Serverless AWS CDK)
// Description: Unit tests verifying correct operation of the weather data fetcher,
//              including success scenarios and API failure handling.
// Author: Nicolas Gloss
// Last Updated: 2025-11-23
// -----------------------------------------------------------------------------

// This test suite validates success and failure scenarios for the weather
// data fetcher Lambda, ensuring external API calls are handled safely.

import { handler } from '../lambda/daily-summary/fetchWeatherData';
import axios from 'axios';

// Mock axios to avoid real API calls during tests.
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('fetchWeatherData Lambda', () => {
    // Reset environment variables after each test to avoid cross-test leakage.
  afterEach(() => {
    delete process.env.WEATHER_API_KEY;
    delete process.env.CITY;
  });
  
  // This test checks that the function logs a message and exits safely
  // when no real API key is provided.
  test('skips API call when dummy key is used', async () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

    const result = await handler();

    expect(result.ok).toBe(true);
    expect(result.message).toContain('Skipped real API call');

    consoleSpy.mockRestore();
  });

  // This test checks that a real API request (mocked here) works as expected.
  test('returns ok and count when API call succeeds', async () => {
    // Mock the API response from OpenWeatherMap.
    mockedAxios.get.mockResolvedValueOnce({
      data: { list: new Array(5).fill({ weather: [{ main: 'Clear' }] }) },
    });

    // Override environment variables to simulate a real API key.
    process.env.CITY = 'Sydney,AU';
    process.env.WEATHER_API_KEY = 'FAKE123';

    const result = await handler();

    expect(result.ok).toBe(true);
    expect(result.count).toBe(5);
  });

  // This test checks that an error in the API call is handled and logged.
  test('throws error when API call fails', async () => {
    mockedAxios.get.mockRejectedValueOnce(new Error('API down'));

    // Use a fake key so the function attempts the API call.
    process.env.WEATHER_API_KEY = 'FAKE123';

    // The function should throw the error, not swallow it.
    await expect(handler()).rejects.toThrow('API down');
  });
});
