// ============================================================================
// Imports
// ============================================================================
import { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { MoreHorizontal, Edit, Trash2, Ban, Bug } from 'lucide-react';

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
  isBlocked?: boolean;
  createdAt: string;
}

const roleTabs = [
  { label: 'Customers', value: 'customer' },
  { label: 'Agents', value: 'agent' },
  { label: 'Admins', value: 'admin' },
];

const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
};

// ============================================================================
// Debug Component
// ============================================================================
const DebugInfo = ({ 
  activeTab, 
  searchTerm, 
  debouncedSearchTerm, 
  page, 
  loading, 
  users, 
  totalPages, 
  apiCallCount, 
  lastApiCall,
  showDebug 
}: {
  activeTab: string;
  searchTerm: string;
  debouncedSearchTerm: string;
  page: number;
  loading: boolean;
  users: User[];
  totalPages: number;
  apiCallCount: number;
  lastApiCall: string;
  showDebug: boolean;
}) => {
  if (!showDebug) return null;

  return (
    <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg mb-4 text-sm font-mono">
      <div className="flex items-center gap-2 mb-2">
        <Bug className="h-4 w-4 text-yellow-600" />
        <h3 className="font-bold text-yellow-800">Debug Information</h3>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
        <div><strong>Active Tab:</strong> {activeTab}</div>
        <div><strong>Search Term:</strong> "{searchTerm}"</div>
        <div><strong>Debounced Search:</strong> "{debouncedSearchTerm}"</div>
        <div><strong>Page:</strong> {page}</div>
        <div><strong>Loading:</strong> {loading.toString()}</div>
        <div><strong>Users Count:</strong> {users.length}</div>
        <div><strong>Total Pages:</strong> {totalPages}</div>
        <div><strong>API Calls:</strong> {apiCallCount}</div>
        <div className="col-span-2"><strong>Last API Call:</strong> {lastApiCall}</div>
        {users.length > 0 && (
          <div className="col-span-full">
            <strong>User IDs:</strong> {users.map(u => u._id.slice(-6)).join(', ')}
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// Component
// ============================================================================
const Users = () => {
  const token = localStorage.getItem('token') || '';
  const navigate = useNavigate();
  const abortControllerRef = useRef<AbortController | null>(null);

  // State
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('customer');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [showDebug, setShowDebug] = useState(false);
  
  // Debug state
  const [apiCallCount, setApiCallCount] = useState(0);
  const [lastApiCall, setLastApiCall] = useState('');

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // ============================================================================
  // IMPROVED fetchUsers with race condition prevention and better error handling
  // ============================================================================
  const fetchUsers = useCallback(async () => {
    // Cancel previous request if it exists
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // Create new abort controller for this request
    abortControllerRef.current = new AbortController();
    
    setLoading(true);
    
    // Debug tracking - using functional updates to avoid dependency
    setApiCallCount(prev => prev + 1);
    setLastApiCall(new Date().toLocaleTimeString());
    
    const url = new URL('https://api.partywalah.in/api/admin/users');
    url.searchParams.append('page', String(page));
    url.searchParams.append('limit', String(limit));
    url.searchParams.append('role', activeTab);
    if (debouncedSearchTerm) {
      url.searchParams.append('search', debouncedSearchTerm);
    }

    console.log(`🚀 API Call:`, url.toString());

    try {
      const response = await fetch(url.toString(), {
        headers: {
          accept: '*/*',
          Authorization: `Bearer ${token}`,
        },
        signal: abortControllerRef.current.signal
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      console.log('📥 API Response:', data);

      if (data && data.data && Array.isArray(data.data.data)) {
        const fetchedUsers = data.data.data;
        console.log(`✅ Setting ${fetchedUsers.length} users for role: ${activeTab}, page: ${page}`);
        
        // CRITICAL: Always replace the entire users array
        setUsers(fetchedUsers);
        setTotalPages(data.data.totalPages || 1);
        
        console.log('📊 Users set successfully:', fetchedUsers.map(u => ({ id: u._id.slice(-6), name: u.full_name })));
      } else {
        console.log('⚠️ No valid user data in response');
        setUsers([]);
        setTotalPages(1);
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('🚫 Request aborted');
        return; // Don't update state for aborted requests
      }
      
      console.error("❌ Failed to fetch users:", error);
      setUsers([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [token, page, limit, activeTab, debouncedSearchTerm]); // REMOVED apiCallCount from dependencies

  // ============================================================================
  // Effects with proper cleanup and debouncing
  // ============================================================================
  
  // Reset page and clear users when tab or search changes
  useEffect(() => {
    console.log('🔄 Tab or search changed, resetting page and clearing users');
    setPage(1);
    setUsers([]); // Clear users immediately
    setLoading(true); // Show loading state
  }, [debouncedSearchTerm, activeTab]);

  // Fetch users when dependencies change
  useEffect(() => {
    console.log('⚡ Triggering fetchUsers due to dependency change');
    fetchUsers();
    
    // Cleanup function
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchUsers]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // ============================================================================
  // Helper functions
  // ============================================================================
  const getInitials = (name: string | null) => {
    if (!name) return '??';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

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

  const handleBlockUser = async (userId: string, isCurrentlyBlocked: boolean) => {
    const action = isCurrentlyBlocked ? 'unblock' : 'block';
    if (!window.confirm(`Are you sure you want to ${action} this user?`)) {
      return;
    }
    try {
      const response = await fetch(`https://api.partywalah.in/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ isBlocked: !isCurrentlyBlocked })
      });

      if (response.ok) {
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

  // ============================================================================
  // Render
  // ============================================================================
  console.log('🔍 Current render state:', { 
    loading, 
    usersLength: users.length, 
    activeTab, 
    page,
    searchTerm,
    debouncedSearchTerm 
  });

  return (
    <DashboardLayout>
      <div className="p-4 sm:p-8 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">User Management</h1>
            <p className="text-gray-500">View, search, and manage all users.</p>
          </div>
          
          {/* Debug Toggle Button */}
          <Button 
            variant={showDebug ? "default" : "outline"} 
            size="sm"
            onClick={() => setShowDebug(!showDebug)}
          >
            <Bug className="h-4 w-4 mr-2" />
            Debug {showDebug ? 'On' : 'Off'}
          </Button>
        </div>

        {/* Debug Information */}
        <DebugInfo 
          activeTab={activeTab}
          searchTerm={searchTerm}
          debouncedSearchTerm={debouncedSearchTerm}
          page={page}
          loading={loading}
          users={users}
          totalPages={totalPages}
          apiCallCount={apiCallCount}
          lastApiCall={lastApiCall}
          showDebug={showDebug}
        />

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
            {/* Add a unique key to force re-render when critical state changes */}
            <Table key={`${activeTab}-${page}-${debouncedSearchTerm}-${users.length}`}>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[300px]">User</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Joined On</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {/* Loading state */}
                {loading && (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
                        Loading users...
                      </div>
                    </TableCell>
                  </TableRow>
                )}

                {/* No users state */}
                {!loading && users.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center text-gray-500">
                      No users found for "{activeTab}" {debouncedSearchTerm && `matching "${debouncedSearchTerm}"`}
                    </TableCell>
                  </TableRow>
                )}

                {/* Users data */}
                {!loading && users.length > 0 && users.map((user, index) => (
                  <TableRow key={`${user._id}-${index}`}>
                    <TableCell>
                      <div className="flex items-center gap-4">
                        <Avatar>
                          <AvatarImage src={user.profilePictureUrl ?? undefined} alt={user.full_name ?? 'User'} />
                          <AvatarFallback>{getInitials(user.full_name)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{user.full_name || 'N/A'}</div>
                          <div className="text-sm text-gray-500">{user.email || 'No email'}</div>
                          {showDebug && <div className="text-xs text-blue-500">ID: {user._id.slice(-6)}</div>}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
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
                ))}
              </TableBody>
            </Table>

            {/* Pagination */}
            {totalPages > 1 && !loading && (
              <div className="mt-4 flex justify-center">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        href="#" 
                        onClick={(e) => { 
                          e.preventDefault(); 
                          setPage(p => Math.max(1, p - 1)); 
                        }} 
                        className={page === 1 ? 'pointer-events-none opacity-50' : ''} 
                      />
                    </PaginationItem>
                    
                    <PaginationItem>
                      <PaginationLink isActive>
                        {page} of {totalPages}
                      </PaginationLink>
                    </PaginationItem>

                    <PaginationItem>
                      <PaginationNext 
                        href="#" 
                        onClick={(e) => { 
                          e.preventDefault(); 
                          setPage(p => Math.min(totalPages, p + 1)); 
                        }} 
                        className={page === totalPages ? 'pointer-events-none opacity-50' : ''} 
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
            
            {/* Debug info in footer */}
            {showDebug && (
              <div className="mt-4 text-xs text-gray-500 text-center">
                Showing {users.length} of {totalPages * limit} total users
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Users;