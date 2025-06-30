import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const EventView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [allEvents, setAllEvents] = useState([]);

  useEffect(() => {
    if (!id) {
      setError('No event ID provided');
      setLoading(false);
      return;
    }

    const fetchAllEvents = async () => {
      try {
        const res = await fetch('https://api.partywalah.in/api/admin/events', {
          headers: { accept: '*/*' }
        });
        const data = await res.json();
        const events = Array.isArray(data) ? data : data.data || [];
        setAllEvents(events);

        const foundEvent = events.find(evt => evt._id === id);
        if (foundEvent) {
          setEvent(foundEvent);
          setLoading(false);
          return;
        }

        // If not found, try other endpoints
        await tryDifferentEndpoints();
      } catch (err) {
        console.error('Error fetching events:', err);
        await tryDifferentEndpoints();
      }
    };

    const tryDifferentEndpoints = async () => {
      const endpoints = [
        `https://api.partywalah.in/api/admin/events/${id}`,
        `https://api.partywalah.in/api/admin/event/${id}`,
        `https://api.partywalah.in/api/events/${id}`,
        `https://api.partywalah.in/api/event/${id}`,
        `https://api.partywalah.in/events/${id}`,
        `https://api.partywalah.in/event/${id}`
      ];

      for (const endpoint of endpoints) {
        try {
          const res = await fetch(endpoint, {
            headers: { accept: '*/*' }
          });

          if (res.ok) {
            const data = await res.json();
            if (data?._id) {
              setEvent(data);
              setLoading(false);
              return;
            } else if (data?.data?._id) {
              setEvent(data.data);
              setLoading(false);
              return;
            } else if (Array.isArray(data) && data.length > 0) {
              setEvent(data[0]);
              setLoading(false);
              return;
            }
          }
        } catch (err) {
          console.warn(`${endpoint} failed:`, err.message);
        }
      }

      setError('Event not found in any endpoint');
      setLoading(false);
    };

    fetchAllEvents();
  }, [id]);

  useEffect(() => {
    if (event && event.entryRequirements) {
      console.log('Entry Requirements fetched:', event.entryRequirements);
    }
  }, [event]);

  if (loading) {
    return (
      <div className="p-8">
        <Card>
          <CardContent className="p-6">
            <div>🔍 Debugging API endpoints...</div>
            <div className="text-sm text-gray-500 mt-2">Looking for ID: {id}</div>
            <div className="text-xs text-gray-400 mt-1">Check console for details</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <Card>
          <CardContent className="p-6">
            <div className="text-red-600 mb-4">🚨 Debug Information</div>
            <div className="space-y-2 text-sm">
              <div><strong>Error:</strong> {error}</div>
              <div><strong>Looking for ID:</strong> {id}</div>
              <div><strong>Total events found:</strong> {allEvents.length}</div>

              {allEvents.length > 0 && (
                <div className="mt-4">
                  <strong>Available Event IDs:</strong>
                  <div className="max-h-40 overflow-y-auto bg-gray-50 p-2 rounded text-xs mt-1">
                    {allEvents.map((evt, idx) => (
                      <div key={idx} className={evt._id === id ? 'bg-yellow-200 font-bold' : ''}>
                        {idx + 1}. {evt._id} - {evt.title}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-4">
                <strong>Endpoints tested:</strong>
                <ul className="text-xs text-gray-600 ml-4 list-disc">
                  <li>/api/admin/events/{id}</li>
                  <li>/api/admin/event/{id}</li>
                  <li>/api/events/{id}</li>
                  <li>/api/event/{id}</li>
                  <li>/events/{id}</li>
                  <li>/event/{id}</li>
                </ul>
              </div>
            </div>
            <Button variant="outline" className="mt-4" onClick={() => navigate(-1)}>
              Back to List
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <Card>
        <CardHeader>
          <div className="text-xs text-green-600">✅ Found via fallback method!</div>
          <div className="text-xs text-gray-400">ID: {event._id}</div>
          <CardTitle className="text-2xl">{event.title}</CardTitle>
          <div className="text-sm text-gray-600">Type: {event.name?.name}</div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div><strong>Date:</strong> {event.startDate ? new Date(event.startDate).toLocaleString() : '-'}</div>
          <div><strong>Location:</strong> {event.location || '-'}</div>
          <div><strong>Price:</strong> {event.price ?? '-'}</div>
          <div><strong>Number of Guests:</strong> {event.numberOfGuests ?? '-'}</div>
          <div><strong>Tags:</strong> {Array.isArray(event.tags) && event.tags.length > 0 ?
            event.tags.map((tag, i) => (
              <span key={i} className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded mr-1">
                {tag}
              </span>
            )) : '-'}</div>
          <div><strong>What's Included:</strong> {Array.isArray(event.whatsIncluded) && event.whatsIncluded.length > 0 ?
            <ul className="list-disc ml-6">{event.whatsIncluded.map((item, i) => <li key={i}>{item}</li>)}</ul> : '-'}</div>

          <div><strong>Hosted By:</strong> {event.hostedBy?.name ? `${event.hostedBy.name} (${event.hostedBy.location || '-'})` : '-'}
            {event.hostedBy?.image && (
              <div className="mt-2">
                <img src={event.hostedBy.image} alt="Host" className="w-32 h-32 object-cover rounded shadow" />
              </div>
            )}
          </div>

          <div><strong>Partnered By:</strong> {event.partneredBy?.name ? `${event.partneredBy.name} (${event.partneredBy.location || '-'})` : '-'}
            {event.partneredBy?.image && (
              <div className="mt-2">
                <img src={event.partneredBy.image} alt="Partner" className="w-32 h-32 object-cover rounded shadow" />
              </div>
            )}
          </div>

          <div>
            <strong>Entry Requirements:</strong>
            {Array.isArray(event.entryRequirements) && event.entryRequirements.length > 0 ? (
              <ul className="list-disc ml-6">
                {event.entryRequirements.map((req, i) => (
                  <li key={i}>
                    <span className="font-semibold">{req.title}:</span>
                    {Array.isArray(req.data) && req.data.length > 0 ? (
                      <ul className="list-disc ml-6 mt-1">
                        {req.data.map((item, idx) => (
                          <li key={idx}>{item}</li>
                        ))}
                      </ul>
                    ) : (
                      <span className="ml-2 text-gray-600">No details</span>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              '-'
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EventView;
