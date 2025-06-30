import { useEffect, useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar } from 'lucide-react';

interface BookingType {
  _id: string;
  eventName: string;
  date: string;
  numberOfGuests: number;
  location: string;
}

const Bookings = () => {
  const [bookings, setBookings] = useState<BookingType[]>([]);
  const [loading, setLoading] = useState(true);

useEffect(() => {
  setLoading(true);
  fetch('http://44.203.188.5:3000/api/users/my-bookings', {
    headers: {
      accept: '*/*',
      Authorization: `Bearer  eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2ODRiZjJjMTg2MGUzNWQzZjgzZDA1NTIiLCJwaG9uZSI6OTc4MjQxOTE3MywiaWF0IjoxNzUwNzY0NTE0LCJleHAiOjE3NTEzNjkzMTR9.Lj8fcyCoSlQGn9NQ3Y2EP9aE3cEznDGsxJRJgmwsLjA` // <-- Replace with your real token
    }
  })
    .then(res => res.json())
    .then(data => setBookings(Array.isArray(data.data) ? data.data : []))
    .catch(() => setBookings([]))
    .finally(() => setLoading(false));
}, []);

  return (
    <DashboardLayout>
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">My Bookings</h1>
        {loading ? (
          <div>Loading bookings...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {bookings.map(booking => (
              <Card key={booking._id}>
                <CardHeader>
                  <CardTitle>{booking.eventName}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center text-gray-700 mb-2">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span>{new Date(booking.date).toLocaleDateString()}</span>
                  </div>
                  <div className="text-sm text-gray-700">Guests: {booking.numberOfGuests}</div>
                  <div className="text-sm text-gray-700">Location: {booking.location}</div>
                </CardContent>
              </Card>
            ))}
            {bookings.length === 0 && <div className="col-span-full text-gray-500">No bookings found.</div>}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Bookings;
