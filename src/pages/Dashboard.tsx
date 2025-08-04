import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Calendar, TrendingUp, DollarSign, Plus, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';

interface Event {
  _id: string;
  name: { name: string } | null;
  title?: string;
  startDate: string;
  status: string;
  price: number;
  currency: string;
  location: string;
  description?: string;
}

interface User {
  _id: string;
  full_name: string | null;
  email: string | null;
  phone: number;
  userType: 'customer' | 'agent' | 'admin';
  createdAt: string;
}

interface DashboardStats {
  totalUsers: number;
  activeEvents: number;
  totalRevenue: number;
  monthlyGrowth: number;
}

const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    activeEvents: 0,
    totalRevenue: 0,
    monthlyGrowth: 0
  });
  const [recentEvents, setRecentEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const token = localStorage.getItem('token') || localStorage.getItem('adminUser') || '';

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [usersRes, eventsRes] = await Promise.all([
        fetch('https://api.partywalah.in/api/admin/users', {
          headers: { 'Authorization': `Bearer ${token}` },
        }),
        fetch('https://api.partywalah.in/api/admin/events', {
          headers: { 'Authorization': `Bearer ${token}` },
        })
      ]);

      if (!usersRes.ok) {
        throw new Error(`Failed to fetch users: ${usersRes.statusText}`);
      }
      if (!eventsRes.ok) {
        throw new Error(`Failed to fetch events: ${eventsRes.statusText}`);
      }
      
      const usersData = await usersRes.json();
      const eventsData = await eventsRes.json();
      
      const totalUsers = usersData.data ? usersData.data.length : 0;
      const events: Event[] = Array.isArray(eventsData) ? eventsData : eventsData.data || [];
      
      const activeEvents = events.filter(event => 
        event.status && ['active', 'approved', 'published'].includes(event.status.toLowerCase())
      ).length;

      const totalRevenue = events.reduce((sum, event) => {
        return sum + (event.price || 0);
      }, 0);

      const sortedEvents = [...events]
        .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())
        .slice(0, 4);
      setRecentEvents(sortedEvents);

      const monthlyGrowth = 18.6;

      setStats({
        totalUsers,
        activeEvents,
        totalRevenue,
        monthlyGrowth
      });

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Could not fetch dashboard data.';
      toast({ 
        title: 'Error', 
        description: errorMessage,
        variant: 'destructive' 
      });
      console.error("Dashboard Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'approved':
      case 'active':
      case 'published':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'draft':
        return 'bg-blue-100 text-blue-800';
      case 'expired':
        return 'bg-gray-300 text-gray-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // --- FIX IS HERE ---
  // We make the rendering logic robust by providing fallback values (e.g., ?? 0)
  // This prevents the app from crashing if the `stats` object is not yet populated
  // when `loading` becomes false (e.g., after an API error).
  const dashboardStats = [
    {
      title: 'Total Users',
      value: loading ? '...' : (stats.totalUsers ?? 0).toLocaleString(),
      change: '+12.5%',
      icon: Users,
      color: 'bg-blue-500'
    },
    {
      title: 'Active Events',
      value: loading ? '...' : (stats.activeEvents ?? 0).toString(),
      change: '+8.2%',
      icon: Calendar,
      color: 'bg-green-500'
    },
    {
      title: 'Revenue',
      value: loading ? '...' : formatCurrency(stats.totalRevenue ?? 0),
      change: '+23.1%',
      icon: DollarSign,
      color: 'bg-purple-500'
    },
    {
      title: 'Growth Rate',
      value: loading ? '...' : `${stats.monthlyGrowth ?? 0}%`,
      change: '+2.4%',
      icon: TrendingUp,
      color: 'bg-orange-500'
    }
  ];

  return (
    <DashboardLayout>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600">Welcome back! Here's what's happening with your events.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {dashboardStats.map((stat, index) => (
            <Card key={index} className="relative overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {stat.title}
                </CardTitle>
                <div className={`w-10 h-10 ${stat.color} rounded-full flex items-center justify-center`}>
                  <stat.icon className="w-5 h-5 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                <p className="text-xs text-green-600 mt-1">
                  {stat.change} from last month
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Events</CardTitle>
              <CardDescription>Latest events created in your platform</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-4">
                  <p className="text-gray-600">Loading events...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentEvents.length > 0 ? (
                    recentEvents.map((event) => (
                      <div key={event._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">
                            {event.title || event.name?.name || 'Untitled Event'}
                          </p>
                          <p className="text-sm text-gray-500">
                            {new Date(event.startDate).toLocaleDateString('en-IN')}
                          </p>
                        </div>
                        <Badge className={`${getStatusColor(event.status)} text-xs`}>
                          {event.status || 'pending'}
                        </Badge>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-gray-500">No events found</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common tasks and shortcuts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                <button 
                  className="p-4 text-left bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
                  onClick={() => navigate('/events/create')}
                >
                  <Plus className="w-6 h-6 text-indigo-600 mb-2" />
                  <p className="font-medium text-indigo-900">Create Event</p>
                  <p className="text-sm text-indigo-600">Add new event</p>
                </button>
                <button 
                  className="p-4 text-left bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
                  onClick={() => navigate('/users')}
                >
                  <Users className="w-6 h-6 text-green-600 mb-2" />
                  <p className="font-medium text-green-900">Manage Users</p>
                  <p className="text-sm text-green-600">View all users</p>
                </button>
                <button 
                  className="p-4 text-left bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
                  onClick={() => navigate('/events/list')}
                >
                  <Eye className="w-6 h-6 text-purple-600 mb-2" />
                  <p className="font-medium text-purple-900">View Events</p>
                  <p className="text-sm text-purple-600">Browse events</p>
                </button>
                <button 
                  className="p-4 text-left bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors"
                  onClick={() => navigate('/bookings')}
                >
                  <DollarSign className="w-6 h-6 text-orange-600 mb-2" />
                  <p className="font-medium text-orange-900">Bookings</p>
                  <p className="text-sm text-orange-600">View bookings</p>
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;