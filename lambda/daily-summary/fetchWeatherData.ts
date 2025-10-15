import axios from 'axios';

// This Lambda will later be triggered on a schedule (EventBridge).
// For now it just connects to the weather API and logs results.

export const handler = async () => {
  // City and API key are passed in through environment variables.
  const city = process.env.CITY || 'Sydney,AU';
  const apiKey = process.env.WEATHER_API_KEY || 'DUMMY_KEY_FOR_LOCAL_TESTS';

  console.log('[FetchWeather] Starting run for city:', city);

  // When testing locally without a real API key, this block skips the call.
  if (apiKey === 'DUMMY_KEY_FOR_LOCAL_TESTS' || apiKey === '') {
    console.log('[FetchWeather] No real API key found, skipping API call.');
    return { ok: true, message: 'Skipped real API call (dummy key).' };
  }

  try {
    // Build the request URL using OpenWeatherMap API format.
    const url = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(
      city,
    )}&appid=${apiKey}&units=metric`;

    // Make the HTTP request to get forecast data.
    const { data } = await axios.get(url, { timeout: 8000 });

    // Log the length of the list just to confirm data came back.
    console.log('[FetchWeather] Forecast list length:', data?.list?.length ?? 0);

    // Later versions of this function will process the forecast,
    // look for severe weather, and publish alerts to SNS.
    return { ok: true, count: data?.list?.length ?? 0 };
  } catch (err: any) {
    // Any network or API error will show up here.
    console.error('[FetchWeather] Error fetching data:', err?.message);
    throw err;
  }
};
