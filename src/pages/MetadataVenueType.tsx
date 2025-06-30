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
  const [venueTypes, setVenueTypes] = useState<VenueType[]>([]);
  const [editIdx, setEditIdx] = useState<number | null>(null);
  const [editVenue, setEditVenue] = useState<Partial<VenueType>>({});
  const { user } = useAuth();
  const token = (user && (user.token as string)) || localStorage.getItem('token') || '';

  // Fetch all venue types
  const fetchVenueTypes = async () => {
    try {
      const res = await fetch('https://api.partywalah.in/api/events/get-event-meta', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch venue types');
      const data = await res.json();
      setVenueTypes(data.venueTypes || []);
    } catch (err) {
      toast({ title: 'Error', description: 'Could not fetch venue types', variant: 'destructive' });
    }
  };

  useEffect(() => {
    fetchVenueTypes();
    // eslint-disable-next-line
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('https://api.partywalah.in/api/events/create-venue-type', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ name, pincode, state: stateVal, city }),
      });
      if (!res.ok) throw new Error('Failed to create venue type');
      toast({ title: 'Success', description: 'Venue type created!' });
      setName(''); setPincode(''); setStateVal(''); setCity('');
      fetchVenueTypes();
    } catch (err) {
      toast({ title: 'Error', description: 'Could not create venue type', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-xl mx-auto p-8">
        <Card>
          <CardHeader>
            <CardTitle>Venue Types</CardTitle>
            <p className="text-gray-500 text-sm">Create, view, edit, and delete venue types for your events.</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <form className="space-y-2" onSubmit={handleSubmit}>
              <Label htmlFor="venueType">Add New Venue Type <span className="text-red-500">*</span></Label>
              <div className="flex gap-2">
                <Input id="venueType" value={name} onChange={e => setName(e.target.value)} placeholder="Name" className="h-11" required />
              </div>
              <div className="flex gap-2">
                <Input value={pincode} onChange={e => setPincode(e.target.value)} placeholder="Pincode" className="h-11" required />
                <Input value={stateVal} onChange={e => setStateVal(e.target.value)} placeholder="State" className="h-11" required />
                <Input value={city} onChange={e => setCity(e.target.value)} placeholder="City" className="h-11" required />
              </div>
              <Button type="submit" disabled={loading || !name.trim() || !pincode.trim() || !stateVal.trim() || !city.trim()}>{loading ? 'Submitting...' : 'Add'}</Button>
            </form>
            <div>
              <Label>Existing Venue Types</Label>
              <ul className="mt-2 space-y-2">
                {venueTypes.length === 0 && <li className="text-gray-400 text-sm">No venue types yet.</li>}
                {venueTypes.map((type, idx) => (
                  <li key={type._id} className="bg-gray-100 rounded px-3 py-2 mb-2 text-sm">
                    {editIdx === idx ? (
                      <span className="flex gap-2 items-center flex-wrap">
                        <Input value={editVenue.name || ''} onChange={e => setEditVenue({ ...editVenue, name: e.target.value })} className="h-8 w-24" />
                        <Input value={editVenue.pincode || ''} onChange={e => setEditVenue({ ...editVenue, pincode: e.target.value })} className="h-8 w-20" />
                        <Input value={editVenue.state || ''} onChange={e => setEditVenue({ ...editVenue, state: e.target.value })} className="h-8 w-20" />
                        <Input value={editVenue.city || ''} onChange={e => setEditVenue({ ...editVenue, city: e.target.value })} className="h-8 w-20" />
                        <Button size="sm" onClick={async () => {
                          setLoading(true);
                          try {
                            const res = await fetch(`https://api.partywalah.in/api/events/update-venue-type/${type._id}`, {
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
                            if (!res.ok) throw new Error('Failed to update venue type');
                            toast({ title: 'Success', description: 'Venue type updated!' });
                            setEditIdx(null); setEditVenue({});
                            fetchVenueTypes();
                          } catch {
                            toast({ title: 'Error', description: 'Could not update venue type', variant: 'destructive' });
                          } finally {
                            setLoading(false);
                          }
                        }} disabled={loading || !editVenue.name || !editVenue.pincode || !editVenue.state || !editVenue.city}>Save</Button>
                        <Button size="sm" variant="outline" onClick={() => { setEditIdx(null); setEditVenue({}); }}>Cancel</Button>
                      </span>
                    ) : (
                      <span className="flex gap-2 items-center flex-wrap">
                        <span className="font-semibold">{type.name}</span>
                        <span>Pincode: {type.pincode}</span>
                        <span>State: {type.state}</span>
                        <span>City: {type.city}</span>
                        <Button size="sm" variant="outline" onClick={() => { setEditIdx(idx); setEditVenue(type); }}>Edit</Button>
                        <Button size="sm" variant="destructive" onClick={async () => {
                          setLoading(true);
                          try {
                            const res = await fetch(`https://api.partywalah.in/api/events/delete-venue-type/${type._id}`, {
                              method: 'DELETE',
                              headers: { 'Authorization': `Bearer ${token}` },
                            });
                            if (!res.ok) throw new Error('Failed to delete venue type');
                            toast({ title: 'Success', description: 'Venue type deleted!' });
                            fetchVenueTypes();
                          } catch {
                            toast({ title: 'Error', description: 'Could not delete venue type', variant: 'destructive' });
                          } finally {
                            setLoading(false);
                          }
                        }}>Delete</Button>
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default MetadataVenueType;
