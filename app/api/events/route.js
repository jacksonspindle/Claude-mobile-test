import axios from 'axios';

export const dynamic = 'force-dynamic';

// Fetch events from SeatGeek API (free tier with client_id)
const fetchSeatGeekEvents = async () => {
  const SEATGEEK_CLIENT_ID = process.env.SEATGEEK_CLIENT_ID;

  if (!SEATGEEK_CLIENT_ID) {
    return [];
  }

  try {
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0];

    // Try with Authorization header first (for API keys)
    let response;
    try {
      response = await axios.get('https://api.seatgeek.com/2/events', {
        params: {
          'venue.city': 'New York',
          'venue.state': 'NY',
          'datetime_local.gte': dateStr,
          'datetime_local.lte': dateStr,
          'taxonomies.name': 'concert',
          'per_page': 100,
          'sort': 'datetime_local.asc'
        },
        headers: {
          'Authorization': `Bearer ${SEATGEEK_CLIENT_ID}`
        },
        timeout: 10000
      });
    } catch (headerError) {
      // If header auth fails, try as client_id parameter
      console.log('Header auth failed, trying client_id parameter');
      response = await axios.get('https://api.seatgeek.com/2/events', {
        params: {
          'client_id': SEATGEEK_CLIENT_ID,
          'venue.city': 'New York',
          'venue.state': 'NY',
          'datetime_local.gte': dateStr,
          'datetime_local.lte': dateStr,
          'taxonomies.name': 'concert',
          'per_page': 100,
          'sort': 'datetime_local.asc'
        },
        timeout: 10000
      });
    }

    const events = response.data.events || [];

    // Filter for free or low-cost events and format them
    const formattedEvents = events
      .filter(event => {
        // Include events that are free or affordable (under $30)
        const stats = event.stats;
        const lowestPrice = stats?.lowest_price || 0;
        return lowestPrice === null || lowestPrice === 0 || lowestPrice <= 30;
      })
      .map(event => {
        const startTime = new Date(event.datetime_local);
        const venue = event.venue;
        const isFree = !event.stats?.lowest_price || event.stats.lowest_price === 0;

        return {
          id: event.id.toString(),
          title: event.title || event.short_title,
          venue: venue?.name || 'TBA',
          address: venue?.address ? `${venue.address}, ${venue.extended_address}` : venue?.display_location || '',
          time: startTime.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
          }),
          description: `${event.type || 'Concert'} at ${venue?.name || 'venue'}. ${isFree ? 'Free event!' : `Starting from $${event.stats?.lowest_price}`}`,
          free: isFree,
          date: startTime.toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric'
          }),
          url: event.url,
          image: event.performers?.[0]?.image || null
        };
      });

    return formattedEvents;
  } catch (error) {
    console.error('Error fetching SeatGeek events:', error.message);
    return [];
  }
};


export async function GET() {
  try {
    console.log('Fetching events from SeatGeek API...');

    // Fetch only from SeatGeek
    const seatGeekEvents = await fetchSeatGeekEvents();

    console.log(`Found ${seatGeekEvents.length} SeatGeek events`);

    // Sort by time
    const sortedEvents = seatGeekEvents.sort((a, b) => {
      const timeA = new Date(`2000-01-01 ${a.time}`);
      const timeB = new Date(`2000-01-01 ${b.time}`);
      return timeA - timeB;
    });

    return Response.json({
      success: true,
      count: sortedEvents.length,
      date: new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      }),
      events: sortedEvents,
      source: 'seatgeek'
    });
  } catch (error) {
    console.error('Error in events API:', error);

    return Response.json({
      success: false,
      error: 'Failed to fetch events from SeatGeek',
      count: 0,
      events: [],
      date: new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      })
    });
  }
}
