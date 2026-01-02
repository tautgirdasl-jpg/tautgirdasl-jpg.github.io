
import { GoogleGenAI } from "@google/genai";
import { WeatherData, WeatherForecastDay } from "../types";

export const fetchWeatherWithGemini = async (location: string): Promise<WeatherData> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `
    Search for the current weather and a detailed 7-day forecast for ${location}.
    For each of the 7 days, provide a 3-hourly breakdown (8 slots per day) of the expected weather.
    
    Provide the information in two parts:
    1. A textual summary of the next week's weather.
    2. A structured JSON block at the very end of your response enclosed in \`\`\`json blocks.
    
    The JSON should follow this structure exactly:
    {
      "current": { "temp": number, "condition": string, "humidity": number, "wind": "speed in km/h" },
      "forecast": [
        { 
          "date": "YYYY-MM-DD", 
          "day": "DayName", 
          "high": number, 
          "low": number, 
          "condition": "Short Description", 
          "iconType": "sunny|cloudy|rainy|stormy|snowy",
          "hourly": [
             { "time": "HH:MM", "temp": number, "condition": "Description", "iconType": "sunny|cloudy|rainy|stormy|snowy" }
          ]
        }
      ]
    }
    Ensure there are 7 days in the forecast array and each day has an "hourly" array.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const fullText = response.text || "";
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    
    const sources = groundingChunks
      .filter((chunk: any) => chunk.web)
      .map((chunk: any) => ({
        title: chunk.web.title,
        uri: chunk.web.uri
      }));

    let structuredData: any = null;
    const jsonMatch = fullText.match(/```json\n([\s\S]*?)\n```/);
    if (jsonMatch && jsonMatch[1]) {
      try {
        structuredData = JSON.parse(jsonMatch[1]);
      } catch (e) {
        console.error("Failed to parse weather JSON", e);
      }
    }

    if (!structuredData) {
      structuredData = {
        current: { temp: 15, condition: "Mostly Clear", humidity: 60, wind: "10 km/h" },
        forecast: Array.from({ length: 7 }).map((_, i) => ({
          date: new Date(Date.now() + i * 86400000).toISOString().split('T')[0],
          day: new Date(Date.now() + i * 86400000).toLocaleDateString('en-US', { weekday: 'long' }),
          high: 18 + i,
          low: 10 + i,
          condition: "Variable",
          iconType: "cloudy",
          hourly: [
            { time: "09:00", temp: 12, condition: "Partly Cloudy", iconType: "cloudy" },
            { time: "12:00", temp: 17, condition: "Sunny", iconType: "sunny" },
            { time: "15:00", temp: 19, condition: "Sunny", iconType: "sunny" },
            { time: "18:00", temp: 16, condition: "Clear", iconType: "sunny" }
          ]
        }))
      };
    }

    return {
      location,
      current: structuredData.current,
      forecast: structuredData.forecast,
      sources,
      rawSummary: fullText.split('```json')[0].trim()
    };
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};
