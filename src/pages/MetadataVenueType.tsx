import DashboardLayout from '../components/DashboardLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useState, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '../contexts/AuthContext';

interface VenueType {
  _id: string;
  name: string;
  pincode: string;
  state: string;
  city: string;
}

const MetadataVenueType = () => {
  const [name, setName] = useState('');
  const [pincode, setPincode] = useState('');
  const [stateVal, setStateVal] = useState('');
  const [city, setCity] = useState('');
  const [loading, setLoading] = useState(false);
  const [venues, setVenues] = useState<VenueType[]>([]);
  const [editIdx, setEditIdx] = useState<number | null>(null);
  const [editVenue, setEditVenue] = useState<Partial<VenueType>>({});
  const { user } = useAuth();
  const token = (user && (user.token as string)) || localStorage.getItem('token') || '';

  // Fetch all venues from get-event-meta endpoint
  const fetchVenues = async () => {
    try {
      const res = await fetch('https://api.partywalah.in/api/events/get-event-meta', {
        headers: { 
          'accept': '*/*',
          'Authorization': `Bearer ${token}` 
        },
      });
      if (!res.ok) throw new Error('Failed to fetch venues');
      const data = await res.json();
      // Extract venues from the response, same as in the first component
      setVenues(Array.isArray(data?.venues) ? data.venues : []);
    } catch (err) {
      toast({ title: 'Error', description: 'Could not fetch venues', variant: 'destructive' });
      setVenues([]);
    }
  };

  useEffect(() => {
    fetchVenues();
    // eslint-disable-next-line
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('https://api.partywalah.in/api/admin/venue', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ name, pincode, state: stateVal, city }),
      });
      if (!res.ok) throw new Error('Failed to create venue');
      toast({ title: 'Success', description: 'Venue created!' });
      setName(''); setPincode(''); setStateVal(''); setCity('');
      fetchVenues(); // Refresh the list
    } catch (err) {
      toast({ title: 'Error', description: 'Could not create venue', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (venueId: string) => {
    setLoading(true);
    try {
      const res = await fetch(`https://api.partywalah.in/api/admin/venue/${venueId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: editVenue.name,
          pincode: editVenue.pincode,
          state: editVenue.state,
          city: editVenue.city,
        }),
      });
      if (!res.ok) throw new Error('Failed to update venue');
      toast({ title: 'Success', description: 'Venue updated!' });
      setEditIdx(null); 
      setEditVenue({});
      fetchVenues(); // Refresh the list
    } catch {
      toast({ title: 'Error', description: 'Could not update venue', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (venueId: string) => {
    if (!window.confirm('Are you sure you want to delete this venue?')) {
      return;
    }
    
    setLoading(true);
    try {
      const res = await fetch(`https://api.partywalah.in/api/admin/venue/${venueId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to delete venue');
      toast({ title: 'Success', description: 'Venue deleted!' });
      fetchVenues(); // Refresh the list
    } catch {
      toast({ title: 'Error', description: 'Could not delete venue', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto p-8">
        <Card>
          <CardHeader>
            <CardTitle>Venue Management</CardTitle>
            <p className="text-gray-500 text-sm">Create, view, edit, and delete venues for your events.</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <form className="space-y-2" onSubmit={handleSubmit}>
              <Label htmlFor="venueName">Add New Venue <span className="text-red-500">*</span></Label>
              <div className="flex gap-2">
                <Input 
                  id="venueName" 
                  value={name} 
                  onChange={e => setName(e.target.value)} 
                  placeholder="Venue Name" 
                  className="h-11" 
                  required 
                />
              </div>
              <div className="flex gap-2">
                <Input 
                  value={pincode} 
                  onChange={e => setPincode(e.target.value)} 
                  placeholder="Pincode" 
                  className="h-11" 
                  required 
                />
                <Input 
                  value={stateVal} 
                  onChange={e => setStateVal(e.target.value)} 
                  placeholder="State" 
                  className="h-11" 
                  required 
                />
                <Input 
                  value={city} 
                  onChange={e => setCity(e.target.value)} 
                  placeholder="City" 
                  className="h-11" 
                  required 
                />
              </div>
              <Button 
                type="submit" 
                disabled={loading || !name.trim() || !pincode.trim() || !stateVal.trim() || !city.trim()}
              >
                {loading ? 'Adding...' : 'Add Venue'}
              </Button>
            </form>
            
            <div>
              <Label>Existing Venues</Label>
              {venues.length === 0 ? (
                <p className="text-gray-400 text-sm mt-2">No venues found.</p>
              ) : (
                <div className="mt-2 space-y-2">
                  {venues.map((venue, idx) => (
                    <div key={venue._id} className="bg-gray-100 rounded px-3 py-3 text-sm">
                      {editIdx === idx ? (
                        <div className="flex gap-2 items-center flex-wrap">
                          <Input 
                            value={editVenue.name || ''} 
                            onChange={e => setEditVenue({ ...editVenue, name: e.target.value })} 
                            className="h-8 w-32" 
                            placeholder="Name"
                          />
                          <Input 
                            value={editVenue.pincode || ''} 
                            onChange={e => setEditVenue({ ...editVenue, pincode: e.target.value })} 
                            className="h-8 w-24" 
                            placeholder="Pincode"
                          />
                          <Input 
                            value={editVenue.state || ''} 
                            onChange={e => setEditVenue({ ...editVenue, state: e.target.value })} 
                            className="h-8 w-24" 
                            placeholder="State"
                          />
                          <Input 
                            value={editVenue.city || ''} 
                            onChange={e => setEditVenue({ ...editVenue, city: e.target.value })} 
                            className="h-8 w-24" 
                            placeholder="City"
                          />
                          <Button 
                            size="sm" 
                            onClick={() => handleUpdate(venue._id)}
                            disabled={loading || !editVenue.name || !editVenue.pincode || !editVenue.state || !editVenue.city}
                          >
                            Save
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => { setEditIdx(null); setEditVenue({}); }}
                          >
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <div className="flex gap-4 items-center flex-wrap">
                          <span className="font-semibold">{venue.name}</span>
                          <span className="text-gray-600">Pincode: {venue.pincode}</span>
                          <span className="text-gray-600">State: {venue.state}</span>
                          <span className="text-gray-600">City: {venue.city}</span>
                          <div className="flex gap-2 ml-auto">
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => { setEditIdx(idx); setEditVenue(venue); }}
                            >
                              Edit
                            </Button>
                            <Button 
                              size="sm" 
                              variant="destructive" 
                              onClick={() => handleDelete(venue._id)}
                              disabled={loading}
                            >
                              Delete
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default MetadataVenueType;