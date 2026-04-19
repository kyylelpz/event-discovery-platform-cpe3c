/**
 * Eventbrite API Service
 *
 * This service will handle all API calls to Eventbrite
 * Documentation: https://www.eventbrite.com/platform/api
 */

const EVENTBRITE_API_BASE = 'https://www.eventbriteapi.com/v3';
const API_TOKEN = process.env.EVENTBRITE_API_TOKEN || 'YOUR_API_TOKEN_HERE';

/**
 * Fetch events from Eventbrite API
 * @param {Object} params - Query parameters
 * @returns {Promise} Event data
 */
export async function fetchEvents(params = {}) {
  const {
    location = 'Metro Manila, Philippines',
    category = null,
    startDate = null,
    page = 1,
    pageSize = 20
  } = params;

  try {
    const queryParams = new URLSearchParams({
      'location.address': location,
      'expand': 'venue,category',
      'page': page.toString(),
      'page_size': pageSize.toString()
    });

    if (category) {
      queryParams.append('categories', category);
    }

    if (startDate) {
      queryParams.append('start_date.range_start', startDate);
    }

    const response = await fetch(
      `${EVENTBRITE_API_BASE}/events/search/?${queryParams}`,
      {
        headers: {
          'Authorization': `Bearer ${API_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Eventbrite API error: ${response.status}`);
    }

    const data = await response.json();
    return transformEventbriteEvents(data.events);
  } catch (error) {
    console.error('Error fetching events:', error);
    throw error;
  }
}

/**
 * Fetch single event details
 * @param {string} eventId - Eventbrite event ID
 * @returns {Promise} Event details
 */
export async function fetchEventById(eventId) {
  try {
    const response = await fetch(
      `${EVENTBRITE_API_BASE}/events/${eventId}/?expand=venue,category,ticket_availability`,
      {
        headers: {
          'Authorization': `Bearer ${API_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Eventbrite API error: ${response.status}`);
    }

    const data = await response.json();
    return transformEventbriteEvent(data);
  } catch (error) {
    console.error('Error fetching event:', error);
    throw error;
  }
}

/**
 * Transform Eventbrite API response to our app format
 */
function transformEventbriteEvents(eventbriteEvents) {
  return eventbriteEvents.map(transformEventbriteEvent);
}

function transformEventbriteEvent(event) {
  return {
    id: event.id,
    title: event.name.text,
    description: event.description.text,
    date: new Date(event.start.local).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }),
    time: new Date(event.start.local).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit'
    }),
    location: event.venue?.address?.localized_address_display || 'TBA',
    category: event.category?.name || 'General',
    imageUrl: event.logo?.url || event.logo?.original?.url || '',
    attendees: event.ticket_availability?.total_tickets_sold || 0,
    url: event.url,
    venue: event.venue,
    organizer: event.organizer
  };
}

/**
 * Search events by query
 */
export async function searchEvents(query, location = 'Metro Manila, Philippines') {
  try {
    const queryParams = new URLSearchParams({
      'q': query,
      'location.address': location,
      'expand': 'venue,category'
    });

    const response = await fetch(
      `${EVENTBRITE_API_BASE}/events/search/?${queryParams}`,
      {
        headers: {
          'Authorization': `Bearer ${API_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Eventbrite API error: ${response.status}`);
    }

    const data = await response.json();
    return transformEventbriteEvents(data.events);
  } catch (error) {
    console.error('Error searching events:', error);
    throw error;
  }
}
