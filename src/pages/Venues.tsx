import { useEffect, useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

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
  const [editId, setEditId] = useState<string | null>(null);
  const [editVenue, setEditVenue] = useState<Partial<VenueType>>({});

  useEffect(() => {
    const token = localStorage.getItem('token') || '';
    setLoading(true);
    fetch('https://api.partywalah.in/api/events/get-event-meta', { headers: { accept: '*/*', 'Authorization': `Bearer ${token}` } })
      .then(res => res.json())
      .then(data => setVenues(Array.isArray(data?.venues) ? data.venues : []))
      .catch(() => setVenues([]))
      .finally(() => setLoading(false));
  }, []);

  const handleEditClick = (venue: VenueType) => {
    setEditId(venue._id);
    setEditVenue({ ...venue });
  };

  const handleSave = async () => {
    if (!editId || !editVenue.name || !editVenue.city || !editVenue.state || !editVenue.pincode) {
      return;
    }
    
    const token = localStorage.getItem('token') || '';
    setLoading(true);
    try {
      const res = await fetch(`https://api.partywalah.in/api/admin/venue/${editId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: editVenue.name,
          pincode: editVenue.pincode,
          state: editVenue.state,
          city: editVenue.city
        })
      });
      
      if (!res.ok) throw new Error('Failed to update venue');
      
      setEditId(null);
      setEditVenue({});
      
      // Refresh the venues list
      const updatedRes = await fetch('https://api.partywalah.in/api/events/get-event-meta', { 
        headers: { accept: '*/*', 'Authorization': `Bearer ${token}` } 
      });
      const updatedData = await updatedRes.json();
      setVenues(Array.isArray(updatedData?.venues) ? updatedData.venues : []);
      
    } catch (error) {
      console.error('Failed to update venue:', error);
      alert('Failed to update venue. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setEditId(null);
    setEditVenue({});
  };

  const handleChange = (field: keyof VenueType, value: string) => {
    setEditVenue(prev => ({ ...prev, [field]: value }));
  };

  const handleDelete = async (venueId: string) => {
    if (!window.confirm('Are you sure you want to delete this venue?')) {
      return;
    }
    
    const token = localStorage.getItem('token') || '';
    setLoading(true);
    try {
      const res = await fetch(`https://api.partywalah.in/api/admin/venue/${venueId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!res.ok) throw new Error('Failed to delete venue');
      
      // Refresh the venues list
      const updatedRes = await fetch('https://api.partywalah.in/api/events/get-event-meta', { 
        headers: { accept: '*/*', 'Authorization': `Bearer ${token}` } 
      });
      const updatedData = await updatedRes.json();
      setVenues(Array.isArray(updatedData?.venues) ? updatedData.venues : []);
      
    } catch (error) {
      console.error('Failed to delete venue:', error);
      alert('Failed to delete venue. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Venues</h1>
        {loading ? (
          <div>Loading venues...</div>
        ) : venues.length === 0 ? (
          <div className="text-gray-500">No venues found.</div>
        ) : (
          <div className="overflow-x-auto rounded-lg shadow">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">City</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">State</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pincode</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {venues.map((venue) => (
                  <tr key={venue._id}>
                    {editId === venue._id ? (
                      <>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <Input value={editVenue.name || ''} onChange={e => handleChange('name', e.target.value)} />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <Input value={editVenue.city || ''} onChange={e => handleChange('city', e.target.value)} />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <Input value={editVenue.state || ''} onChange={e => handleChange('state', e.target.value)} />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <Input value={editVenue.pincode || ''} onChange={e => handleChange('pincode', e.target.value)} />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                          <Button onClick={handleSave} size="sm">Save</Button>
                          <Button variant="outline" onClick={handleCancel} size="sm">Cancel</Button>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{venue.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{venue.city}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{venue.state}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{venue.pincode}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                          <Button size="sm" onClick={() => handleEditClick(venue)}>Edit</Button>
                          <Button 
                            size="sm" 
                            variant="destructive" 
                            onClick={() => handleDelete(venue._id)}
                            disabled={loading}
                          >
                            Delete
                          </Button>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Venues;
