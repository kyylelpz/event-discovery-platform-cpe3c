import express from "express";
import { getJson } from "serpapi";
import protect from "../middleware/protect.js";
import SavedEvent from "../models/SavedEvent.js";

const router = express.Router();

const escapeXml = (value = "") =>
  value
    .toString()
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

const parseCount = (value) => {
  const normalized = value?.toString().replace(/,/g, "");
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
};

const createPosterDataUri = ({ title, location, category }) => {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="675" viewBox="0 0 1200 675">
      <defs>
        <linearGradient id="bg" x1="0%" x2="100%" y1="0%" y2="100%">
          <stop offset="0%" stop-color="#1f2937" />
          <stop offset="100%" stop-color="#111827" />
        </linearGradient>
      </defs>
      <rect width="1200" height="675" fill="url(#bg)" />
      <rect x="56" y="56" width="1088" height="563" rx="28" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.18)" />
      <text x="96" y="156" fill="#f59e0b" font-family="Arial, sans-serif" font-size="30" font-weight="700">${escapeXml(category)}</text>
      <text x="96" y="258" fill="#ffffff" font-family="Arial, sans-serif" font-size="60" font-weight="700">${escapeXml(title)}</text>
      <text x="96" y="336" fill="#d1d5db" font-family="Arial, sans-serif" font-size="28">${escapeXml(location)}</text>
      <text x="96" y="580" fill="#9ca3af" font-family="Arial, sans-serif" font-size="24">Eventcinity live event</text>
    </svg>
  `;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
};

const slugify = (value = "event") =>
  value
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "event";

const pickFirstString = (...values) =>
  values.find((value) => typeof value === "string" && value.trim()) || "";

const joinDefined = (...values) =>
  values
    .flat()
    .filter((value) => typeof value === "string" && value.trim())
    .join(", ");

const normalizeSerpApiEvent = (event, location) => {
  const title = pickFirstString(event.title, event.name, "Untitled Event");
  const venueName = pickFirstString(
    event.venue?.name,
    event.venue?.title,
    event.venue?.display_name,
  );
  const address = pickFirstString(
    event.address,
    event.location,
    event.venue?.address,
  );
  const resolvedLocation =
    joinDefined(venueName, address) || `${location}, Philippines`;
  const category = pickFirstString(event.category, event.segment, "Community");
  const host = pickFirstString(
    event.host,
    event.organizer,
    event.venue?.name,
    "Eventcinity Partner",
  );
  const image = pickFirstString(
    event.image,
    event.imageUrl,
    event.thumbnail,
    event.logo?.url,
  );

  return {
    id: pickFirstString(event.id, event.event_id, slugify(title)),
    title,
    category,
    startDate: pickFirstString(
      event.startDate,
      event.start_date,
      event.date?.start_date,
      event.date,
      "2026-05-01",
    ),
    timeLabel: pickFirstString(
      event.timeLabel,
      event.start_time,
      event.date?.when,
      event.date?.start_time,
      "Time to be announced",
    ),
    location: resolvedLocation,
    province: location,
    host,
    description: pickFirstString(
      event.description,
      event.about,
      "Imported from a live events source.",
    ),
    attendeeCount: parseCount(event.attendeeCount || event.going_count),
    savedCount: parseCount(event.savedCount),
    reactions: parseCount(event.reactions),
    attendees: [],
    mapLabel: resolvedLocation,
    createdBy: "lia-tan",
    source: "live",
    image:
      image ||
      createPosterDataUri({
        title,
        location: resolvedLocation,
        category,
      }),
    imageLabel: pickFirstString(event.imageLabel, `${title} event artwork`),
    eventUrl: pickFirstString(event.link, event.event_url, event.eventUrl),
  };
};

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

router.get("/", async (req, res) => {
  try {
    const location = req.query.location || "Manila";
    const events = await fetchFromSerpApi(location);
    const normalizedEvents = events.map((event) =>
      normalizeSerpApiEvent(event, location),
    );

    res.json({
      success: true,
      events: normalizedEvents,
      meta: {
        location,
        count: normalizedEvents.length,
        source: "serpapi",
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post("/save", protect, async (req, res) => {
  try {
    const { eventId, title, location, date, imageUrl, eventUrl } = req.body;
    const existing = await SavedEvent.findOne({
      userId: req.user._id,
      eventId,
    });

    if (existing) {
      return res.status(400).json({ message: "Event already saved" });
    }

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
