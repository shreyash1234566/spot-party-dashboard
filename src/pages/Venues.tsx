import { useEffect, useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface VenueType {
  _id: string;
  name: string;
  city: string;
  state: string;
  pincode: string;
}

const Venues = () => {
  const [venues, setVenues] = useState<VenueType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch('http://44.203.188.5:3000/api/events/get-event-meta', { headers: { accept: '*/*' } })
      .then(res => res.json())
      .then(data => setVenues(Array.isArray(data?.venues) ? data.venues : []))
      .catch(() => setVenues([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <DashboardLayout>
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Venues</h1>
        {loading ? (
          <div>Loading venues...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {venues.map(venue => (
              <Card key={venue._id}>
                <CardHeader>
                  <CardTitle>{venue.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-gray-700">City: {venue.city}</div>
                  <div className="text-sm text-gray-700">State: {venue.state}</div>
                  <div className="text-sm text-gray-700">Pincode: {venue.pincode}</div>
                </CardContent>
              </Card>
            ))}
            {venues.length === 0 && <div className="col-span-full text-gray-500">No venues found.</div>}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Venues;
