import { useEffect, useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

interface VendorType {
  _id: string;
  name: string;
  services: string[];
  contact: string;
  tags: string[];
}

const Vendors = () => {
  const [vendors, setVendors] = useState<VendorType[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    setLoading(true);
    // Replace with your real API endpoint if available
    fetch('/api/vendors', { headers: { accept: '*/*' } })
      .then(res => res.json())
      .then(data => setVendors(Array.isArray(data) ? data : data.data || []))
      .catch(() => setVendors([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = vendors.filter(v =>
    v.name.toLowerCase().includes(search.toLowerCase()) ||
    v.services.join(',').toLowerCase().includes(search.toLowerCase()) ||
    v.tags.join(',').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Vendors</h1>
        <Input
          placeholder="Search vendors..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="mb-4 max-w-sm"
        />
        {loading ? (
          <div>Loading vendors...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(vendor => (
              <Card key={vendor._id}>
                <CardHeader>
                  <CardTitle>{vendor.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-gray-700 mb-1">Services: {vendor.services.join(', ')}</div>
                  <div className="text-sm text-gray-700 mb-1">Contact: {vendor.contact}</div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {vendor.tags.map(tag => (
                      <span key={tag} className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
            {filtered.length === 0 && <div className="col-span-full text-gray-500">No vendors found.</div>}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Vendors;
