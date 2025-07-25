// ============================================================================
// Imports
// ============================================================================
import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom'; // <-- Add useNavigate
import DashboardLayout from '../components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button'; // <-- Add Button
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'; // <-- Add DropdownMenu
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { MoreHorizontal, Edit, Trash2, Ban } from 'lucide-react'; // <-- Add icons

// ============================================================================
// Interfaces & Constants
// ============================================================================
interface User {
  _id: string;
  full_name: string | null;
  email: string | null;
  phone: number;
  userType: 'customer' | 'agent' | 'admin';
  profilePictureUrl: string | null;
  isProfileComplete: boolean;
  isBlocked?: boolean; // <-- Add isBlocked property
  createdAt: string;
}

const roleTabs = [
  { label: 'Customers', value: 'customer' },
  { label: 'Agents', value: 'agent' },
  { label: 'Admins', value: 'admin' },
];

// A simple debounce hook for search functionality
const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
};


// ============================================================================
// Component
// ============================================================================
const Users = () => {
  const token = localStorage.getItem('token') || '';
  const navigate = useNavigate(); // <-- Initialize navigate

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('customer');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // --- MODIFIED: Fetch logic now includes role and search term ---
  const fetchUsers = useCallback(() => {
    setLoading(true);
    const url = new URL('https://api.partywalah.in/api/admin/users');
    url.searchParams.append('page', String(page));
    url.searchParams.append('limit', String(limit));
    url.searchParams.append('role', activeTab); // <-- Send role to API
    if (debouncedSearchTerm) {
      url.searchParams.append('search', debouncedSearchTerm); // <-- Send search term to API
    }

    fetch(url.toString(), {
      headers: {
        accept: '*/*',
        Authorization: `Bearer ${token}`,
      },
    })
      .then(res => res.json())
      .then(data => {
        if (data && data.data && Array.isArray(data.data.data)) {
          setUsers(data.data.data);
          setTotalPages(data.data.totalPages || 1);
        } else {
          setUsers([]);
          setTotalPages(1);
        }
      })
      .catch(error => {
        console.error("Failed to fetch users:", error);
        setUsers([]);
      })
      .finally(() => setLoading(false));
  }, [token, page, limit, activeTab, debouncedSearchTerm]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Reset to page 1 on search or tab change
  useEffect(() => {
    setPage(1);
  }, [debouncedSearchTerm, activeTab]);

  const getInitials = (name: string | null) => {
    if (!name) return '??';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };
  
  // --- NEW: Handler for deleting a user ---
  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm('Are you sure you want to permanently delete this user? This action cannot be undone.')) {
      return;
    }
    try {
      const response = await fetch(`https://api.partywalah.in/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        setUsers(prevUsers => prevUsers.filter(u => u._id !== userId));
        alert('User deleted successfully.');
      } else {
        alert('Failed to delete user.');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('An error occurred while deleting the user.');
    }
  };

  // --- NEW: Handler for blocking/unblocking a user ---
  const handleBlockUser = async (userId: string, isCurrentlyBlocked: boolean) => {
    const action = isCurrentlyBlocked ? 'unblock' : 'block';
    if (!window.confirm(`Are you sure you want to ${action} this user?`)) {
      return;
    }
    try {
      // NOTE: Adjust the API endpoint and body as per your backend implementation
      const response = await fetch(`https://api.partywalah.in/api/admin/users/${userId}`, {
        method: 'PATCH', // or PUT
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ isBlocked: !isCurrentlyBlocked })
      });

      if (response.ok) {
        // Optimistically update the UI for instant feedback
        setUsers(prevUsers => prevUsers.map(u => 
          u._id === userId ? { ...u, isBlocked: !isCurrentlyBlocked } : u
        ));
        alert(`User ${action}ed successfully.`);
      } else {
        alert(`Failed to ${action} user.`);
      }
    } catch (error) {
      console.error(`Error ${action}ing user:`, error);
      alert(`An error occurred while trying to ${action} the user.`);
    }
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
                    <TabsTrigger key={tab.value} value={tab.value}>
                      {tab.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
              <Input
                placeholder={`Search ${activeTab}s...`}
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
                  <TableHead className="text-right">Actions</TableHead> {/* <-- Add Actions Header */}
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      Loading users...
                    </TableCell>
                  </TableRow>
                ) : users.length > 0 ? (
                  users.map(user => (
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
                        {/* --- MODIFIED: Show Blocked status --- */}
                        {user.isBlocked ? (
                          <Badge variant="secondary">Blocked</Badge>
                        ) : user.isProfileComplete ? (
                          <Badge variant="default">Complete</Badge>
                        ) : (
                          <Badge variant="destructive">Incomplete</Badge>
                        )}
                      </TableCell>
                      <TableCell>{user.phone}</TableCell>
                      <TableCell>
                        {new Date(user.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric', month: 'long', day: 'numeric',
                        })}
                      </TableCell>
                      {/* --- NEW: Actions cell with Dropdown --- */}
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => navigate(`/users/edit/${user._id}`)}>
                              <Edit className="mr-2 h-4 w-4" />
                              <span>Edit</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleBlockUser(user._id, !!user.isBlocked)}>
                              <Ban className="mr-2 h-4 w-4" />
                              <span>{user.isBlocked ? 'Unblock' : 'Block'}</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600 focus:text-red-500" onClick={() => handleDeleteUser(user._id)}>
                              <Trash2 className="mr-2 h-4 w-4" />
                              <span>Delete</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      No users found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>

            {totalPages > 1 && !loading && (
              <div className="mt-4 flex justify-center">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious href="#" onClick={(e) => { e.preventDefault(); setPage(p => Math.max(1, p - 1)); }} className={page === 1 ? 'pointer-events-none opacity-50' : ''} />
                    </PaginationItem>
                    
                    {/* Simplified page number rendering */}
                    <PaginationItem><PaginationLink isActive>{page}</PaginationLink></PaginationItem>

                    <PaginationItem>
                      <PaginationNext href="#" onClick={(e) => { e.preventDefault(); setPage(p => Math.min(totalPages, p + 1)); }} className={page === totalPages ? 'pointer-events-none opacity-50' : ''} />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Users;