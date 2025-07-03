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
    setLoading(true);
    fetch('https://api.partywalah.in/api/events/get-event-meta', { headers: { accept: '*/*' } })
      .then(res => res.json())
      .then(data => setVenues(Array.isArray(data?.venues) ? data.venues : []))
      .catch(() => setVenues([]))
      .finally(() => setLoading(false));
  }, []);

  const handleEditClick = (venue: VenueType) => {
    setEditId(venue._id);
    setEditVenue({ ...venue });
  };

  const handleSave = () => {
    // Optionally send a PUT request here to save data on server
    setVenues(prev =>
      prev.map(v => (v._id === editId ? { ...(v as VenueType), ...editVenue } : v))
    );
    setEditId(null);
    setEditVenue({});
  };

  const handleCancel = () => {
    setEditId(null);
    setEditVenue({});
  };

  const handleChange = (field: keyof VenueType, value: string) => {
    setEditVenue(prev => ({ ...prev, [field]: value }));
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
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <Button size="sm" onClick={() => handleEditClick(venue)}>Edit</Button>
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
