'use client';

import { useEffect, useState } from 'react';

export default function Home() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateString, setDateString] = useState('');

  useEffect(() => {
    fetchEvents();
    // Refresh events every 5 minutes
    const interval = setInterval(fetchEvents, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/events');
      const data = await response.json();

      if (data.success) {
        setEvents(data.events);
        setDateString(data.date);
      } else {
        setError(data.error || 'Failed to load events');
      }
    } catch (err) {
      setError('Failed to connect to the server');
      console.error('Error fetching events:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <header className="header">
        <h1>NYC Live Music Tonight</h1>
        <p>{dateString || 'Loading...'}</p>
      </header>

      {loading && (
        <div className="loading">
          <p>Finding live music events...</p>
        </div>
      )}

      {error && (
        <div className="error">
          <p>{error}</p>
          <button
            onClick={fetchEvents}
            style={{
              marginTop: '1rem',
              padding: '0.5rem 1rem',
              background: '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            Retry
          </button>
        </div>
      )}

      {!loading && !error && events.length === 0 && (
        <div className="no-events">
          <p>No live music events found for today.</p>
          <p style={{ marginTop: '1rem', fontSize: '0.9rem' }}>
            Check back later or try again tomorrow!
          </p>
        </div>
      )}

      {!loading && !error && events.length > 0 && (
        <div className="events-grid">
          {events.map((event) => (
            <div key={event.id} className="event-card">
              <h2 className="event-title">{event.title}</h2>
              <div className="event-venue">{event.venue}</div>
              {event.address && (
                <div className="event-time">
                  <span>📍</span>
                  <span>{event.address}</span>
                </div>
              )}
              <div className="event-time">
                <span>🕒</span>
                <span>{event.time}</span>
              </div>
              {event.description && (
                <p className="event-description">{event.description}</p>
              )}
              {event.free && <span className="free-badge">FREE</span>}
              {event.url && (
                <a
                  href={event.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="event-link"
                >
                  View Event Details →
                </a>
              )}
            </div>
          ))}
        </div>
      )}

      <footer style={{
        textAlign: 'center',
        padding: '2rem',
        marginTop: '2rem',
        color: '#666',
        fontSize: '0.9rem'
      }}>
        <p>🎵 Discover live music in NYC every day</p>
        <p style={{ marginTop: '0.5rem', fontSize: '0.8rem' }}>
          Data updates automatically • Powered by SeatGeek
        </p>
      </footer>
    </div>
  );
}
