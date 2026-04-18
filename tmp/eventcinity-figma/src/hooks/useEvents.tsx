import { useState, useEffect } from 'react';
import { fetchEvents, searchEvents } from '../services/eventbriteApi';

/**
 * Custom hook for managing events
 * Provides event fetching, filtering, and search functionality
 */
export function useEvents(initialLocation = 'Metro Manila') {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [location, setLocation] = useState(initialLocation);
  const [category, setCategory] = useState(null);

  // Fetch events when location or category changes
  useEffect(() => {
    const loadEvents = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await fetchEvents({
          location,
          category
        });
        setEvents(data);
      } catch (err) {
        setError(err.message);
        console.error('Failed to load events:', err);
      } finally {
        setLoading(false);
      }
    };

    loadEvents();
  }, [location, category]);

  // Search events
  const search = async (query) => {
    setLoading(true);
    setError(null);

    try {
      const results = await searchEvents(query, location);
      setEvents(results);
    } catch (err) {
      setError(err.message);
      console.error('Search failed:', err);
    } finally {
      setLoading(false);
    }
  };

  // Filter events by category
  const filterByCategory = (categoryName) => {
    setCategory(categoryName);
  };

  // Change location
  const changeLocation = (newLocation) => {
    setLocation(newLocation);
  };

  return {
    events,
    loading,
    error,
    location,
    category,
    search,
    filterByCategory,
    changeLocation
  };
}

/**
 * Custom hook for managing saved/liked events
 * Uses localStorage for persistence
 */
export function useSavedEvents() {
  const [savedEvents, setSavedEvents] = useState(() => {
    const saved = localStorage.getItem('savedEvents');
    return saved ? JSON.parse(saved) : [];
  });

  const [likedEvents, setLikedEvents] = useState(() => {
    const liked = localStorage.getItem('likedEvents');
    return liked ? JSON.parse(liked) : [];
  });

  // Save event
  const saveEvent = (eventId) => {
    setSavedEvents(prev => {
      const updated = [...prev, eventId];
      localStorage.setItem('savedEvents', JSON.stringify(updated));
      return updated;
    });
  };

  // Unsave event
  const unsaveEvent = (eventId) => {
    setSavedEvents(prev => {
      const updated = prev.filter(id => id !== eventId);
      localStorage.setItem('savedEvents', JSON.stringify(updated));
      return updated;
    });
  };

  // Like event
  const likeEvent = (eventId) => {
    setLikedEvents(prev => {
      const updated = [...prev, eventId];
      localStorage.setItem('likedEvents', JSON.stringify(updated));
      return updated;
    });
  };

  // Unlike event
  const unlikeEvent = (eventId) => {
    setLikedEvents(prev => {
      const updated = prev.filter(id => id !== eventId);
      localStorage.setItem('likedEvents', JSON.stringify(updated));
      return updated;
    });
  };

  // Check if event is saved
  const isSaved = (eventId) => savedEvents.includes(eventId);

  // Check if event is liked
  const isLiked = (eventId) => likedEvents.includes(eventId);

  return {
    savedEvents,
    likedEvents,
    saveEvent,
    unsaveEvent,
    likeEvent,
    unlikeEvent,
    isSaved,
    isLiked
  };
}
