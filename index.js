const express = require("express");
const axios = require("axios");
const bodyParser = require("body-parser");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

const WEATHER_API_KEY = process.env.WEATHER_API_KEY;
const WEATHER_API_URL = "https://api.weatherapi.com/v1";

app.post("/webhook", async (req, res) => {
  try {
    const intentName = req.body.queryResult.intent.displayName;
    const parameters = req.body.queryResult.parameters;
    const city = parameters.city;
    let date = parameters.date || "today";

    console.log("Intent:", intentName);
    console.log("City:", city);
    console.log("Date:", date);
    console.log("All parameters:", parameters);

    let response = "";

    if (intentName === "GetCurrentWeather") {
      const weatherData = await getCurrentWeather(city);
      response = `Current weather in ${city}: ${weatherData.temp_c}°C, ${weatherData.condition.text}. Humidity: ${weatherData.humidity}%, Wind: ${weatherData.wind_kph} km/h.`;
    } else if (intentName === "GetWeatherForecast") {
      const forecastData = await getWeatherForecast(city, date);
      response = `Weather forecast for ${city} on ${forecastData.date}: ${forecastData.day.avgtemp_c}°C, ${forecastData.day.condition.text}. Min: ${forecastData.day.mintemp_c}°C, Max: ${forecastData.day.maxtemp_c}°C.`;
    }

    res.json({
      fulfillmentText: response,
    });
  } catch (error) {
    console.error("Error processing webhook:", error);
    res.json({
      fulfillmentText:
        "Sorry, I encountered an error while fetching the weather information.",
    });
  }
});

async function getCurrentWeather(city) {
  try {
    const response = await axios.get(`${WEATHER_API_URL}/current.json`, {
      params: {
        key: WEATHER_API_KEY,
        q: city,
      },
    });
    return response.data.current;
  } catch (error) {
    console.error("Error fetching current weather:", error);
    throw error;
  }
}

async function getWeatherForecast(city, date) {
  try {
    const today = new Date();
    const targetDate = date === "today" ? today : new Date(date);
    const daysAhead = Math.min(
      Math.floor((targetDate - today) / (1000 * 60 * 60 * 24)),
      7
    );

    const response = await axios.get(`${WEATHER_API_URL}/forecast.json`, {
      params: {
        key: WEATHER_API_KEY,
        q: city,
        days: daysAhead + 1,
      },
    });

    return response.data.forecast.forecastday[daysAhead];
  } catch (error) {
    console.error("Error fetching weather forecast:", error);
    throw error;
  }
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});