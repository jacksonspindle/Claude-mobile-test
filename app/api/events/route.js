export const dynamic = 'force-dynamic';

// Mock data for demonstration
// In production, replace this with real API calls to Eventbrite, Ticketmaster, etc.
const getMockEvents = () => {
  const today = new Date();
  const dateStr = today.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  });

  return [
    {
      id: '1',
      title: 'Live Jazz Night',
      venue: 'The Blue Note',
      address: '131 W 3rd St, New York, NY 10012',
      time: '8:00 PM - 11:00 PM',
      description: 'Enjoy an evening of smooth jazz with local artists. No cover charge, just great music and vibes.',
      free: true,
      date: dateStr
    },
    {
      id: '2',
      title: 'Open Mic Acoustic Session',
      venue: 'Rockwood Music Hall',
      address: '196 Allen St, New York, NY 10002',
      time: '7:00 PM - 10:00 PM',
      description: 'Local singer-songwriters showcase their original acoustic music. Free entry, donations welcome.',
      free: true,
      date: dateStr
    },
    {
      id: '3',
      title: 'Indie Rock Showcase',
      venue: 'Mercury Lounge',
      address: '217 E Houston St, New York, NY 10002',
      time: '9:00 PM - 12:00 AM',
      description: 'Three up-and-coming indie rock bands. Free admission before 9:30 PM.',
      free: true,
      date: dateStr
    },
    {
      id: '4',
      title: 'Brooklyn Blues Night',
      venue: 'Brooklyn Bowl',
      address: '61 Wythe Ave, Brooklyn, NY 11249',
      time: '6:00 PM - 9:00 PM',
      description: 'Classic blues performances by Brooklyn-based musicians. Free entry, full bar available.',
      free: true,
      date: dateStr
    },
    {
      id: '5',
      title: 'Latin Music Night',
      venue: 'SOBs',
      address: '204 Varick St, New York, NY 10014',
      time: '8:30 PM - 11:30 PM',
      description: 'Salsa, bachata, and reggaeton live performances. No cover charge on Tuesdays.',
      free: true,
      date: dateStr
    },
    {
      id: '6',
      title: 'Folk & Americana Open Stage',
      venue: 'The Bitter End',
      address: '147 Bleecker St, New York, NY 10012',
      time: '7:30 PM - 10:30 PM',
      description: 'Historic venue hosting folk and Americana artists. Free show, 1 drink minimum.',
      free: true,
      date: dateStr
    }
  ];
};

// Function to fetch real events from Eventbrite API
// Uncomment and add your API key to use real data
/*
const fetchEventbriteEvents = async () => {
  const EVENTBRITE_API_KEY = process.env.EVENTBRITE_API_KEY;

  if (!EVENTBRITE_API_KEY) {
    return [];
  }

  try {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const response = await fetch(
      `https://www.eventbriteapi.com/v3/events/search/?` +
      `location.address=New York, NY&` +
      `categories=103&` + // Music category
      `price=free&` +
      `start_date.range_start=${today.toISOString()}&` +
      `start_date.range_end=${tomorrow.toISOString()}&` +
      `expand=venue`,
      {
        headers: {
          'Authorization': `Bearer ${EVENTBRITE_API_KEY}`
        }
      }
    );

    const data = await response.json();

    return data.events?.map(event => ({
      id: event.id,
      title: event.name.text,
      venue: event.venue?.name || 'TBA',
      address: event.venue?.address?.localized_address_display || '',
      time: new Date(event.start.local).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit'
      }),
      description: event.description?.text?.substring(0, 200) || 'No description available',
      free: event.is_free,
      date: new Date(event.start.local).toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric'
      }),
      url: event.url
    })) || [];
  } catch (error) {
    console.error('Error fetching Eventbrite events:', error);
    return [];
  }
};
*/

export async function GET() {
  try {
    // Try to fetch real events first
    // const realEvents = await fetchEventbriteEvents();

    // For now, use mock data
    // In production, uncomment the line above and use: const events = realEvents.length > 0 ? realEvents : getMockEvents();
    const events = getMockEvents();

    return Response.json({
      success: true,
      count: events.length,
      date: new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      }),
      events: events
    });
  } catch (error) {
    console.error('Error in events API:', error);
    return Response.json(
      {
        success: false,
        error: 'Failed to fetch events',
        events: []
      },
      { status: 500 }
    );
  }
}
