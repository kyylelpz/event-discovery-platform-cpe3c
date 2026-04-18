import express from "express";
import cors from "cors";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "Backend running ✅" });
});

// Testing of fetch Events in Rapid API
const fetchEvents = async (location) => {
  const response = await axios.get(
    "https://real-time-events-search.p.rapidapi.com/search-events",
    {
      headers: {
        "X-RapidAPI-Key": process.env.RAPIDAPI_KEY,
        "X-RapidAPI-Host": "real-time-events-search.p.rapidapi.com",
      },
      params: {
        query: `events in ${location} Philippines`,
        date: "any",
        is_virtual: "false",
        start: "0",
      },
    },
  );
  return response.data.data || [];
};

// Events Route
app.get("/api/events", async (req, res) => {
  const location = req.query.location || "Manila";

  try {
    const events = await fetchEvents(location);
    res.json({
      total: events.length,
      location,
      events,
    });
  } catch (error) {
    console.error("ERROR:", error.response?.data || error.message);
    res.status(500).json({
      error: "Failed to fetch events",
      details: error.response?.data || error.message,
    });
  }
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
