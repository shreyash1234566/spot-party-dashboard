import { useEffect, useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';

interface UserType {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
}

const roleTabs = [
  { label: 'Managers', value: 'manager' },
  { label: 'Clients', value: 'client' },
  { label: 'Admins', value: 'admin' },
];

const Users = () => {
  const [users, setUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState('manager');

  useEffect(() => {
    setLoading(true);
    fetch('http://44.203.188.5:3000/api/admin/users', { headers: { accept: '*/*' } })
      .then(res => res.json())
      .then(data => setUsers(Array.isArray(data) ? data : data.data || []))
      .catch(() => setUsers([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = users.filter(u =>
    u.role === tab && (
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase()) ||
      u.phone?.toLowerCase().includes(search.toLowerCase())
    )
  );

  return (
    <DashboardLayout>
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Users</h1>
        <Tabs value={tab} onValueChange={setTab} className="mb-6">
          <TabsList>
            {roleTabs.map(rt => (
              <TabsTrigger key={rt.value} value={rt.value}>{rt.label}</TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <Input
          placeholder="Search by name, email, or phone..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="mb-4 max-w-sm"
        />
        {loading ? (
          <div>Loading users...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(user => (
              <Card key={user._id}>
                <CardHeader>
                  <CardTitle>{user.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-gray-700">Email: {user.email}</div>
                  <div className="text-sm text-gray-700">Phone: {user.phone}</div>
                  <div className="text-xs mt-2 font-semibold text-indigo-600 uppercase">{user.role}</div>
                </CardContent>
              </Card>
            ))}
            {filtered.length === 0 && <div className="col-span-full text-gray-500">No users found.</div>}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Users;
