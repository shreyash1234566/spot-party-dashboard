// ============================================================================
// Imports
// ============================================================================
import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

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
import { MoreHorizontal, Edit, Trash2, Ban, Users as UsersIcon, Shield, UserCheck } from 'lucide-react';

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

interface ApiResponse {
  success: boolean;
  data: {
    data: User[];
    totalPages: number;
    currentPage: number;
    totalUsers: number;
  };
}

const roleTabs = [
  { label: 'Customers', value: 'customer', icon: UsersIcon },
  { label: 'Agents', value: 'agent', icon: UserCheck },
  { label: 'Admins', value: 'admin', icon: Shield },
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
// Component
// ============================================================================
const Users = () => {
  const token = localStorage.getItem('token') || '';
  const navigate = useNavigate();
  const abortControllerRef = useRef<AbortController | null>(null);

  // State
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('customer');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // ============================================================================
  // Client-side filtering and pagination using useMemo
  // ============================================================================
  const { users, totalPages, totalUsers } = useMemo(() => {
    // Filter by role first
    const roleFiltered = allUsers.filter(user => user.userType === activeTab);
    
    // Then filter by search term
    const searchFiltered = roleFiltered.filter(user => {
      if (!debouncedSearchTerm.trim()) return true;
      
      const searchLower = debouncedSearchTerm.toLowerCase();
      const nameMatch = user.full_name?.toLowerCase().includes(searchLower) || false;
      const emailMatch = user.email?.toLowerCase().includes(searchLower) || false;
      const phoneMatch = user.phone?.toString().includes(debouncedSearchTerm) || false;
      
      return nameMatch || emailMatch || phoneMatch;
    });

    // Calculate pagination
    const totalFiltered = searchFiltered.length;
    const totalPagesCalc = Math.ceil(totalFiltered / limit);
    const paginatedUsers = searchFiltered.slice((page - 1) * limit, page * limit);

    return {
      users: paginatedUsers,
      totalPages: totalPagesCalc,
      totalUsers: totalFiltered
    };
  }, [allUsers, activeTab, debouncedSearchTerm, page, limit]);

  // ============================================================================
  // fetchAllUsers - fetch all users at once
  // ============================================================================
  const fetchAllUsers = useCallback(async () => {
    // Cancel previous request if it exists
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    // Create new abort controller for this request
    abortControllerRef.current = new AbortController();
    setLoading(true);

    try {
      // Fetch all users without pagination or filtering
      const response = await fetch('https://api.partywalah.in/api/admin/users?limit=1000', {
        headers: {
          'accept': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        signal: abortControllerRef.current.signal
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ApiResponse = await response.json();
      
      if (data && data.data && Array.isArray(data.data.data)) {
        setAllUsers(data.data.data);
      } else {
        setAllUsers([]);
      }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.log('Request aborted');
        return; // Don't update state for aborted requests
      }
      console.error("Failed to fetch users:", error);
      setAllUsers([]);
    } finally {
      setLoading(false);
    }
  }, [token]);

  // ============================================================================
  // Effects
  // ============================================================================

  // Reset page when tab or search changes
  useEffect(() => {
    setPage(1);
  }, [debouncedSearchTerm, activeTab]);

  // Fetch all users on component mount
  useEffect(() => {
    fetchAllUsers();

    // Cleanup function to abort fetch on component unmount
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchAllUsers]);

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
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        setAllUsers(prevUsers => prevUsers.filter(u => u._id !== userId));
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
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ isBlocked: !isCurrentlyBlocked })
      });

      if (response.ok) {
        setAllUsers(prevUsers => prevUsers.map(u => 
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
  return (
    <DashboardLayout>
      <div className="p-4 sm:p-8 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">User Management</h1>
            <p className="text-gray-500">
              View, search, and manage all users. 
              {totalUsers > 0 && (
                <span className="ml-2 text-sm font-medium">
                  ({totalUsers} total {activeTab}s found)
                </span>
              )}
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-3">
                  {roleTabs.map(tab => {
                    const Icon = tab.icon;
                    return (
                      <TabsTrigger key={tab.value} value={tab.value} className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        {tab.label}
                      </TabsTrigger>
                    );
                  })}
                </TabsList>
              </Tabs>
              
              <div className="relative w-full sm:w-80">
                <Input
                  placeholder={`Search ${activeTab}s by name, email, phone...`}
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="pr-10"
                />
                {searchTerm && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1 h-6 w-6 p-0"
                    onClick={() => setSearchTerm('')}
                  >
                    ×
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[300px]">User</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Joined On</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {/* Loading state */}
                {loading && (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
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
                    <TableCell colSpan={4} className="h-24 text-center text-gray-500">
                      <div className="space-y-2">
                        <div>No {activeTab}s found</div>
                        {debouncedSearchTerm && (
                          <div className="text-sm">matching "{debouncedSearchTerm}"</div>
                        )}
                        {debouncedSearchTerm && (
                          <Button 
                            variant="link" 
                            size="sm"
                            onClick={() => setSearchTerm('')}
                          >
                            Clear search
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )}

                {/* Users data */}
                {!loading && users.length > 0 && users.map((user) => (
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
                    <TableCell>{user.phone || 'N/A'}</TableCell>
                    <TableCell>
                      {new Date(user.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric', month: 'short', day: 'numeric',
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
                          <DropdownMenuItem 
                            className="text-red-600 focus:text-red-500" 
                            onClick={() => handleDeleteUser(user._id)}
                          >
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

            {totalPages > 1 && !loading && (
              <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-sm text-gray-500">
                  Showing {users.length} of {totalUsers} {activeTab}s
                  {debouncedSearchTerm && ` matching "${debouncedSearchTerm}"`}
                </div>
                
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        href="#" 
                        onClick={(e) => { 
                          e.preventDefault(); 
                          if (page > 1) setPage(p => p - 1); 
                        }} 
                        className={page === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'} 
                      />
                    </PaginationItem>
                    
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (page <= 3) {
                        pageNum = i + 1;
                      } else if (page >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = page - 2 + i;
                      }
                      
                      return (
                        <PaginationItem key={pageNum}>
                          <PaginationLink 
                            href="#"
                            isActive={pageNum === page}
                            onClick={(e) => {
                              e.preventDefault();
                              setPage(pageNum);
                            }}
                            className="cursor-pointer"
                          >
                            {pageNum}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    })}

                    <PaginationItem>
                      <PaginationNext 
                        href="#" 
                        onClick={(e) => { 
                          e.preventDefault(); 
                          if (page < totalPages) setPage(p => p + 1); 
                        }} 
                        className={page === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'} 
                      />
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