import express from "express";
import axios from "axios";
import protect from "../middleware/protect.js";
import SavedEvent from "../models/SavedEvent.js";
import { getJson } from "serpapi";
import protect from "../middleware/protect.js";
import SavedEvent from "../models/SavedEvent.js";

const router = express.Router();

// ─── Fetch Events from SerpApi ───────────────────────
const fetchFromSerpApi = async (location) => {
  const results = await getJson({
    engine: "google_events",
    q: `events in ${location} Philippines`,
    hl: "en",
    gl: "ph",
    api_key: process.env.SERPAPI_KEY,
  });
  return results.events_results || [];
};

// GET /api/events?location=Manila
router.get("/", async (req, res) => {
  try {
    const location = req.query.location || "Manila";
    const events = await fetchFromSerpApi(location);
    res.json({ success: true, data: events });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/events/save  (protected - must be logged in)
router.post("/save", protect, async (req, res) => {
  try {
    const { eventId, title, location, date, imageUrl, eventUrl } = req.body;
    const existing = await SavedEvent.findOne({
      userId: req.user._id,
      eventId,
    });
    if (existing)
      return res.status(400).json({ message: "Event already saved" });

    const saved = await SavedEvent.create({
      userId: req.user._id,
      eventId,
      title,
      location,
      date,
      imageUrl,
      eventUrl,
    });
    res.status(201).json({ success: true, data: saved });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/events/saved  (protected) (for bookmarked events)
router.get("/saved", protect, async (req, res) => {
  try {
    const saved = await SavedEvent.find({ userId: req.user._id }).sort(
      "-createdAt",
    );
    res.json({ success: true, data: saved });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/events/saved/:eventId
router.delete("/saved/:eventId", protect, async (req, res) => {
  try {
    await SavedEvent.findOneAndDelete({
      userId: req.user._id,
      eventId: req.params.eventId,
    });
    res.json({ success: true, message: "Event removed from saved" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
