
import DashboardLayout from '../components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Search, Filter, MoreHorizontal, UserPlus, Mail, Phone } from 'lucide-react';
import { useState } from 'react';

const Users = () => {
  const [searchTerm, setSearchTerm] = useState('');

  // Mock user data
  const users = [
    {
      id: 1,
      name: 'Arjun Sharma',
      email: 'arjun.sharma@gmail.com',
      phone: '+91 98765 43210',
      status: 'Active',
      eventsAttended: 15,
      totalSpent: 45000,
      joinDate: '2023-06-15',
      avatar: 'AS'
    },
    {
      id: 2,
      name: 'Priya Patel',
      email: 'priya.patel@yahoo.com',
      phone: '+91 87654 32109',
      status: 'Active',
      eventsAttended: 8,
      totalSpent: 22500,
      joinDate: '2023-09-22',
      avatar: 'PP'
    },
    {
      id: 3,
      name: 'Rahul Kumar',
      email: 'rahul.kumar@hotmail.com',
      phone: '+91 76543 21098',
      status: 'Inactive',
      eventsAttended: 3,
      totalSpent: 7500,
      joinDate: '2024-01-10',
      avatar: 'RK'
    },
    {
      id: 4,
      name: 'Sneha Reddy',
      email: 'sneha.reddy@gmail.com',
      phone: '+91 65432 10987',
      status: 'Active',
      eventsAttended: 22,
      totalSpent: 67500,
      joinDate: '2023-03-08',
      avatar: 'SR'
    },
    {
      id: 5,
      name: 'Vikram Singh',
      email: 'vikram.singh@outlook.com',
      phone: '+91 54321 09876',
      status: 'Active',
      eventsAttended: 12,
      totalSpent: 35000,
      joinDate: '2023-11-18',
      avatar: 'VS'
    }
  ];

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    return status === 'Active' 
      ? 'bg-green-100 text-green-800' 
      : 'bg-gray-100 text-gray-800';
  };

  const totalUsers = users.length;
  const activeUsers = users.filter(user => user.status === 'Active').length;
  const totalRevenue = users.reduce((sum, user) => sum + user.totalSpent, 0);

  return (
    <DashboardLayout>
      <div className="p-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">User Management</h1>
            <p className="text-gray-600">Manage and monitor all registered users</p>
          </div>
          <Button className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white">
            <UserPlus className="w-4 h-4 mr-2" />
            Add User
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-3xl font-bold text-gray-900">{totalUsers}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <UserPlus className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Users</p>
                  <p className="text-3xl font-bold text-gray-900">{activeUsers}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                  <p className="text-3xl font-bold text-gray-900">₹{totalRevenue.toLocaleString('en-IN')}</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-purple-600 font-bold">₹</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search users by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-12"
            />
          </div>
          <Button variant="outline" className="h-12">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
        </div>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle>Users List</CardTitle>
            <CardDescription>All registered users and their activity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredUsers.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center space-x-4">
                    <Avatar className="w-12 h-12">
                      <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-medium">
                        {user.avatar}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-gray-900">{user.name}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <div className="flex items-center">
                          <Mail className="w-3 h-3 mr-1" />
                          {user.email}
                        </div>
                        <div className="flex items-center">
                          <Phone className="w-3 h-3 mr-1" />
                          {user.phone}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-6">
                    <div className="text-right text-sm">
                      <p className="font-medium text-gray-900">{user.eventsAttended} events</p>
                      <p className="text-gray-600">₹{user.totalSpent.toLocaleString('en-IN')} spent</p>
                    </div>
                    
                    <Badge className={getStatusColor(user.status)}>
                      {user.status}
                    </Badge>
                    
                    <div className="text-right text-sm text-gray-600">
                      <p>Joined</p>
                      <p>{new Date(user.joinDate).toLocaleDateString('en-IN')}</p>
                    </div>
                    
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <UserPlus className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
            <p className="text-gray-600">Try adjusting your search terms</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Users;
