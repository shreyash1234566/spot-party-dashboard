// ============================================================================
// Imports
// ============================================================================
import { useEffect, useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

// ============================================================================
// Interfaces & Constants
// ============================================================================

// An accurate interface matching the API response
interface User {
  _id: string;
  full_name: string | null;
  email: string | null;
  phone: number;
  userType: 'customer' | 'manager' | 'admin';
  profilePictureUrl: string | null;
  isProfileComplete: boolean;
  createdAt: string; // ISO date string
}

const roleTabs = [
  { label: 'Customers', value: 'customer' },
  { label: 'Managers', value: 'manager' },
  { label: 'Admins', value: 'admin' },
];

// ============================================================================
// Component Definition
// ============================================================================

const Users = () => {
  const token = localStorage.getItem('token') || '';
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('customer');

  // Fetch users from the API on component mount
  useEffect(() => {
    setLoading(true);
    fetch('https://api.partywalah.in/api/admin/users', { headers: { accept: '*/*', 'Authorization': `Bearer ${token}` } })
      .then(res => res.json())
      .then(data => {
        // --- FIX IS HERE ---
        // The API nests the user array inside `data.data`. We need to access it correctly.
        if (data && data.data && Array.isArray(data.data.data)) {
          setAllUsers(data.data.data);
        } else {
          console.error("API response did not contain the expected user array structure:", data);
          setAllUsers([]);
        }
      })
      .catch(error => {
        console.error("Failed to fetch users:", error);
        setAllUsers([]); // Set to empty on error
      })
      .finally(() => setLoading(false));
  }, [token]); // Added token to dependency array for correctness

  // Filter users based on the active tab and search term
  const filteredUsers = allUsers.filter(user => {
    if (user.userType !== activeTab) {
      return false;
    }
    if (!searchTerm) {
      return true;
    }
    const lowerCaseSearch = searchTerm.toLowerCase();
    const nameMatch = user.full_name?.toLowerCase().includes(lowerCaseSearch);
    const emailMatch = user.email?.toLowerCase().includes(lowerCaseSearch);
    const phoneMatch = String(user.phone).includes(lowerCaseSearch);

    return nameMatch || emailMatch || phoneMatch;
  });
  
  // Helper to get initials for Avatar fallback
  const getInitials = (name: string | null) => {
    if (!name) return '??';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <DashboardLayout>
      <div className="p-4 sm:p-8 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-gray-500">View, search, and manage all users.</p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                  {roleTabs.map(tab => (
                    <TabsTrigger key={tab.value} value={tab.value}>{tab.label}</TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
              <Input
                placeholder={`Search in ${activeTab}s...`}
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="max-w-full sm:max-w-xs"
              />
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[300px]">User</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Joined On</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                      Loading users...
                    </TableCell>
                  </TableRow>
                ) : filteredUsers.length > 0 ? (
                  filteredUsers.map(user => (
                    <TableRow key={user._id}>
                      <TableCell>
                        <div className="flex items-center gap-4">
                          <Avatar>
                            <AvatarImage src={user.profilePictureUrl ?? undefined} alt={user.full_name ?? 'User'} />
                            <AvatarFallback>{getInitials(user.full_name)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{user.full_name || 'N/A'}</div>
                            <div className="text-sm text-gray-500">{user.email || 'No email'}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {user.isProfileComplete ? (
                          <Badge variant="default">Complete</Badge>
                        ) : (
                          <Badge variant="destructive">Incomplete</Badge>
                        )}
                      </TableCell>
                      <TableCell>{user.phone}</TableCell>
                      <TableCell>
                        {new Date(user.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                      No users found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Users;