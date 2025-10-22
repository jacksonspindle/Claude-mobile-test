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

    // SeatGeek API - free tier available at https://seatgeek.com/
    const response = await axios.get('https://api.seatgeek.com/2/events', {
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

    const events = response.data.events || [];

    // Filter for free or low-cost events and format them
    const formattedEvents = events
      .filter(event => {
        // Include events that are free or very low cost (under $20)
        const stats = event.stats;
        const lowestPrice = stats?.lowest_price || 0;
        return lowestPrice === null || lowestPrice === 0 || lowestPrice < 20;
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

// Fetch events from Eventbrite API (requires API key)
const fetchEventbriteEvents = async () => {
  const EVENTBRITE_API_KEY = process.env.EVENTBRITE_API_KEY;

  if (!EVENTBRITE_API_KEY) {
    return [];
  }

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const response = await axios.get('https://www.eventbriteapi.com/v3/events/search/', {
      params: {
        'location.address': 'New York, NY',
        'categories': '103', // Music category
        'price': 'free',
        'start_date.range_start': today.toISOString(),
        'start_date.range_end': tomorrow.toISOString(),
        'expand': 'venue'
      },
      headers: {
        'Authorization': `Bearer ${EVENTBRITE_API_KEY}`
      },
      timeout: 10000
    });

    const events = response.data.events || [];

    return events.map(event => {
      const startTime = new Date(event.start.local);

      return {
        id: event.id,
        title: event.name.text,
        venue: event.venue?.name || 'TBA',
        address: event.venue?.address?.localized_address_display || '',
        time: startTime.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        }),
        description: event.description?.text?.substring(0, 200) || 'No description available',
        free: true,
        date: startTime.toLocaleDateString('en-US', {
          weekday: 'long',
          month: 'long',
          day: 'numeric'
        }),
        url: event.url,
        image: event.logo?.url || null
      };
    });
  } catch (error) {
    console.error('Error fetching Eventbrite events:', error.message);
    return [];
  }
};

// Enhanced mock data with real NYC venues and their typical free music nights
const getMockEvents = () => {
  const today = new Date();
  const dateStr = today.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  });

  const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, etc.

  // Different events based on actual day of week (many venues have specific free nights)
  const weeklyEvents = {
    1: [ // Monday
      {
        title: 'Monday Night Jazz Jam',
        venue: 'Zinc Bar',
        address: '82 W 3rd St, New York, NY 10012',
        time: '9:00 PM',
        description: 'Open jazz jam session with professional musicians. No cover charge.',
        url: 'https://www.zincbar.com'
      }
    ],
    2: [ // Tuesday
      {
        title: 'Tuesday Blues Jam',
        venue: 'Terra Blues',
        address: '149 Bleecker St, New York, NY 10012',
        time: '9:30 PM',
        description: 'Open blues jam with house band. Free admission.',
        url: 'https://www.terrablues.com'
      }
    ],
    3: [ // Wednesday
      {
        title: 'Rockwood Music Hall Free Shows',
        venue: 'Rockwood Music Hall',
        address: '196 Allen St, New York, NY 10002',
        time: '6:00 PM',
        description: 'Multiple free shows throughout the evening featuring emerging artists.',
        url: 'https://www.rockwoodmusichall.com'
      }
    ],
    4: [ // Thursday
      {
        title: 'Open Mic Night',
        venue: 'The Bitter End',
        address: '147 Bleecker St, New York, NY 10012',
        time: '7:00 PM',
        description: 'Historic Greenwich Village venue hosts open mic night. Free entry.',
        url: 'https://www.bitterend.com'
      }
    ],
    5: [ // Friday
      {
        title: 'Friday Night Live',
        venue: "Arlene's Grocery",
        address: '95 Stanton St, New York, NY 10002',
        time: '8:00 PM',
        description: 'Free rock shows in the Lower East Side. Multiple bands.',
        url: 'https://www.arlenesgrocery.net'
      }
    ],
    6: [ // Saturday
      {
        title: 'Saturday Afternoon Jazz',
        venue: 'The Django',
        address: '2 6th Ave, New York, NY 10013',
        time: '3:00 PM',
        description: 'Free jazz brunch performances. World-class musicians.',
        url: 'https://www.thedjangonyc.com'
      }
    ],
    0: [ // Sunday
      {
        title: 'Sunday Gospel Brunch',
        venue: 'Ginny\'s Supper Club',
        address: '310 Malcolm X Blvd, New York, NY 10027',
        time: '11:00 AM',
        description: 'Live gospel music with Sunday brunch in Harlem.',
        url: 'https://www.ginnyssupperclub.com'
      }
    ]
  };

  // Common venues with frequent free shows
  const commonEvents = [
    {
      title: 'Live Music Night',
      venue: 'Pianos',
      address: '158 Ludlow St, New York, NY 10002',
      time: '8:00 PM',
      description: 'Free live music on the main stage. Rock, indie, and alternative.',
      url: 'https://www.pianosnyc.com'
    },
    {
      title: 'Open Stage',
      venue: 'Googie\'s Lounge',
      address: '300 W 135th St, New York, NY 10030',
      time: '7:30 PM',
      description: 'Free open mic and live performances in a cozy Harlem spot.',
      url: 'https://www.googieslounge.com'
    },
    {
      title: 'Songwriter Showcase',
      venue: 'The Living Room',
      address: '154 Ludlow St, New York, NY 10002',
      time: '9:00 PM',
      description: 'Acoustic singer-songwriter performances. No cover charge.',
      url: 'https://www.livingroomny.com'
    }
  ];

  const dayEvents = weeklyEvents[dayOfWeek] || [];
  const allEvents = [...dayEvents, ...commonEvents.slice(0, 3)];

  return allEvents.map((event, index) => ({
    id: `mock-${index}`,
    title: event.title,
    venue: event.venue,
    address: event.address,
    time: event.time,
    description: event.description,
    free: true,
    date: dateStr,
    url: event.url
  }));
};

export async function GET() {
  try {
    console.log('Fetching events from multiple sources...');

    // Fetch from multiple sources in parallel
    const [seatGeekEvents, eventbriteEvents] = await Promise.all([
      fetchSeatGeekEvents(),
      fetchEventbriteEvents()
    ]);

    console.log(`Found ${seatGeekEvents.length} SeatGeek events`);
    console.log(`Found ${eventbriteEvents.length} Eventbrite events`);

    // Combine all events
    let allEvents = [...seatGeekEvents, ...eventbriteEvents];

    // If no real events found, use mock data with real venues
    if (allEvents.length === 0) {
      console.log('No real events found, using mock data with real NYC venues');
      allEvents = getMockEvents();
    }

    // Remove duplicates based on title and venue
    const uniqueEvents = allEvents.filter((event, index, self) =>
      index === self.findIndex(e =>
        e.title.toLowerCase() === event.title.toLowerCase() &&
        e.venue.toLowerCase() === event.venue.toLowerCase()
      )
    );

    // Sort by time
    uniqueEvents.sort((a, b) => {
      const timeA = new Date(`2000-01-01 ${a.time}`);
      const timeB = new Date(`2000-01-01 ${b.time}`);
      return timeA - timeB;
    });

    return Response.json({
      success: true,
      count: uniqueEvents.length,
      date: new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      }),
      events: uniqueEvents,
      sources: {
        seatgeek: seatGeekEvents.length,
        eventbrite: eventbriteEvents.length,
        mock: allEvents.length === getMockEvents().length
      }
    });
  } catch (error) {
    console.error('Error in events API:', error);

    // Fallback to mock data on error
    const mockEvents = getMockEvents();

    return Response.json({
      success: true,
      count: mockEvents.length,
      date: new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      }),
      events: mockEvents,
      sources: {
        seatgeek: 0,
        eventbrite: 0,
        mock: true
      },
      error: 'Using fallback data due to API error'
    });
  }
}
