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
    console.log('EventView - ID from params:', id);
    
    if (!id) {
      setError('No event ID provided');
      setLoading(false);
      return;
    }

    // First, let's fetch all events to see the structure and find our event
    fetch('http://44.203.188.5:3000/api/admin/events', {
      headers: { 'accept': '*/*' }
    })
      .then(res => res.json())
      .then(data => {
        const events = Array.isArray(data) ? data : data.data || [];
        setAllEvents(events);
        console.log('All events:', events);
        
        // Find the event with matching _id
        const foundEvent = events.find(event => event._id === id);
        console.log('Found event by _id:', foundEvent);
        
        if (foundEvent) {
          setEvent(foundEvent);
          setLoading(false);
          return;
        }
        
        // If not found, try different API endpoints
        tryDifferentEndpoints();
      })
      .catch(err => {
        console.error('Error fetching all events:', err);
        tryDifferentEndpoints();
      });

    const tryDifferentEndpoints = async () => {
      const endpoints = [
        `http://44.203.188.5:3000/api/admin/events/${id}`,
        `http://44.203.188.5:3000/api/admin/event/${id}`,
        `http://44.203.188.5:3000/api/events/${id}`,
        `http://44.203.188.5:3000/api/event/${id}`,
        `http://44.203.188.5:3000/events/${id}`,
        `http://44.203.188.5:3000/event/${id}`
      ];

      for (const endpoint of endpoints) {
        console.log(`Trying endpoint: ${endpoint}`);
        try {
          const response = await fetch(endpoint, {
            headers: { 'accept': '*/*' }
          });
          
          console.log(`${endpoint} - Status: ${response.status}`);
          
          if (response.ok) {
            const data = await response.json();
            console.log(`${endpoint} - Success! Data:`, data);
            
            // Handle different response formats
            if (data && data._id) {
              setEvent(data);
              setLoading(false);
              return;
            } else if (data && data.data && data.data._id) {
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
          console.log(`${endpoint} - Error:`, err.message);
        }
      }
      
      // If all endpoints fail
      setError('Event not found in any endpoint');
      setLoading(false);
    };
  }, [id]);

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
            
            <Button 
              variant="outline" 
              className="mt-4" 
              onClick={() => navigate(-1)}
            >
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
          <div><strong>Price:</strong> {event.price !== undefined ? event.price : '-'}</div>
          <div><strong>Number of Guests:</strong> {event.numberOfGuests !== undefined ? event.numberOfGuests : '-'}</div>
          <div><strong>Tags:</strong> {event.tags && event.tags.length > 0 ? 
            event.tags.map((tag, i) => (
              <span key={i} className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded mr-1">
                {tag}
              </span>
            )) : '-'}</div>
          <div><strong>What's Included:</strong> {event.whatsIncluded && event.whatsIncluded.length > 0 ? 
            <ul className="list-disc ml-6">{event.whatsIncluded.map((item, i) => <li key={i}>{item}</li>)}</ul> : '-'}</div>
          <div><strong>Hosted By:</strong> {event.hostedBy?.name ? `${event.hostedBy.name} (${event.hostedBy.location || '-'})` : '-'}</div>
          <div><strong>Partnered By:</strong> {event.partneredBy?.name ? `${event.partneredBy.name} (${event.partneredBy.location || '-'})` : '-'}</div>
          <Button variant="outline" className="mt-4" onClick={() => navigate(-1)}>Back</Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default EventView;