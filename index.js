const express = require("express");
const bodyParser = require("body-parser");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());

// Simple test route
app.get("/", (req, res) => {
  res.send("Weather Bot Webhook Server is running!");
});

// Debug route to see what's coming in
app.post("/debug", (req, res) => {
  console.log("Debug request body:", JSON.stringify(req.body));
  res.json({ message: "Debug request received" });
});

// Webhook route
app.post("/webhook", (req, res) => {
  console.log("Webhook called with:", JSON.stringify(req.body));
  
  try {
    const intentName = req.body.queryResult.intent.displayName;
    const parameters = req.body.queryResult.parameters;
    const city = parameters.city || "unknown city";
    
    console.log("Intent:", intentName);
    console.log("Parameters:", parameters);
    
    // Simple static responses for testing
    let response = "";
    
    if (intentName === "GetCurrentWeather") {
      response = `Current weather in ${city}: 28°C, partly cloudy. Humidity: 65%, Wind: 12 km/h.`;
    } else if (intentName === "GetWeatherForecast") {
      const date = parameters.date ? new Date(parameters.date).toISOString().split('T')[0] : "today";
      response = `Weather forecast for ${city} on ${date}: 30°C, mostly sunny. Min: 26°C, Max: 34°C.`;
    } else {
      response = `I received intent: ${intentName} with city: ${city}`;
    }
    
    console.log("Sending response:", response);
    
    res.json({
      fulfillmentText: response
    });
  } catch (error) {
    console.error("Error processing webhook:", error);
    res.json({
      fulfillmentText: "Sorry, I encountered an error processing your request. Error: " + error.message
    });
  }
});

// Start server
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});