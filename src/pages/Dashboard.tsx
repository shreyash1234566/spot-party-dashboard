import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Users,
  Calendar,
  Building2,
  BellPlus,
  ArrowRight,
  Plus,
  TrendingUp,
  Activity,
  Clock,
  MapPin
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

// --- Interfaces for fetched data ---
interface Event {
  _id: string;
  title?: string;
  name?: { name: string };
  startDate: string;
  status: string;
  venue?: string;
  attendees?: number;
}

interface DashboardStats {
  totalUsers: number;
  totalEvents: number;
  totalVenues: number;
}

// --- Data for the Quick Actions section ---
const quickActions = [
  { 
    title: "Create New Event", 
    path: "/events/create", 
    icon: Plus, 
    description: "Set up a new event",
    color: "bg-gradient-to-br from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700"
  },
  { 
    title: "Browse Events", 
    path: "/events/list", 
    icon: Calendar, 
    description: "View all events",
    color: "bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
  },
  { 
    title: "Manage Users", 
    path: "/users", 
    icon: Users, 
    description: "User management",
    color: "bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
  },
  { 
    title: "View Venues", 
    path: "/venues", 
    icon: Building2, 
    description: "Venue directory",
    color: "bg-gradient-to-br from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
  },
];

const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalEvents: 0,
    totalVenues: 0,
  });
  const [recentEvents, setRecentEvents] = useState<Event[]>([]);
  // FIX: Removed duplicate 'loading' state and unused 'venues' state
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const token = localStorage.getItem('token') || '';

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // FIX: Corrected the Promise.all structure for proper concurrent fetching
        const [usersRes, eventsRes, venuesRes] = await Promise.all([
          fetch('https://api.partywalah.in/api/admin/users', { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch('https://api.partywalah.in/api/admin/events', { headers: { 'Authorization': `Bearer ${token}` } }),
          // Assuming this is the correct endpoint for venues based on your code
          fetch('https://api.partywalah.in/api/admin/venues', { headers: { 'Authorization': `Bearer ${token}` } })
        ]);

        // Process responses after all promises have resolved
        const usersData = usersRes.ok ? await usersRes.json() : { data: [] };
        const eventsData = eventsRes.ok ? await eventsRes.json() : { data: [] };
        const venuesData = venuesRes.ok ? await venuesRes.json() : { data: [] };

        const events: Event[] = Array.isArray(eventsData) ? eventsData : eventsData.data || [];

        // Calculate stats from actual data length
        setStats({
          totalUsers: (usersData.data || []).length,
          totalEvents: events.length,
          totalVenues: (venuesData.data || []).length,
        });

        // Sort events to find the most recent ones for the list
        const sortedEvents = [...events]
          .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())
          .slice(0, 6); // Show 6 recent events
        setRecentEvents(sortedEvents);

      } catch (err) {
        toast({ 
          title: 'Dashboard Error', 
          description: "Could not fetch all dashboard data. Some information may be missing.",
          variant: 'destructive' 
        });
      } finally {
        // This will now correctly run only after all API calls are complete
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [token]);

  // --- UI Helper Functions ---
  const getStatusBadge = (status: string) => {
    const s = status?.toLowerCase() || 'unknown';
    const styles = {
      approved: 'bg-emerald-50 text-emerald-700 border-emerald-200 shadow-sm',
      active: 'bg-emerald-50 text-emerald-700 border-emerald-200 shadow-sm',
      published: 'bg-emerald-50 text-emerald-700 border-emerald-200 shadow-sm',
      pending: 'bg-amber-50 text-amber-700 border-amber-200 shadow-sm',
      draft: 'bg-sky-50 text-sky-700 border-sky-200 shadow-sm',
      cancelled: 'bg-red-50 text-red-700 border-red-200 shadow-sm',
      expired: 'bg-slate-50 text-slate-700 border-slate-200 shadow-sm',
      default: 'bg-slate-50 text-slate-700 border-slate-200 shadow-sm',
    };
    return styles[s as keyof typeof styles] || styles.default;
  };

  const StatCard = ({ 
    icon: Icon, 
    title, 
    value, 
    path, 
    trend, 
    color 
  }: { 
    icon: React.ElementType, 
    title: string, 
    value: number, 
    path: string,
    trend?: string,
    color: string
  }) => (
    <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-0 shadow-sm hover:-translate-y-1" onClick={() => navigate(path)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <div className="space-y-1">
          <CardTitle className="text-sm font-medium text-slate-600">{title}</CardTitle>
          {loading ? (
            <Skeleton className="h-8 w-20" />
          ) : (
            <div className="text-2xl font-bold text-slate-900">
              {(value || 0).toLocaleString('en-IN')}
            </div>
          )}
        </div>
        <div className={`p-2 rounded-lg ${color} text-white shadow-sm group-hover:scale-110 transition-transform duration-200`}>
          <Icon className="w-5 h-5" />
        </div>
      </CardHeader>
      {trend && (
        <CardContent className="pt-0">
          <div className="flex items-center text-xs text-emerald-600">
            <TrendingUp className="w-3 h-3 mr-1" />
            <span>{trend}</span>
          </div>
        </CardContent>
      )}
    </Card>
  );

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
        <div className="p-4 md:p-8">
          {/* Header Section */}
          <header className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-slate-900 mb-2">
                  Welcome back! 👋
                </h1>
                <p className="text-slate-600">Here's what's happening with your platform today.</p>
              </div>
              <div className="hidden md:flex items-center space-x-2 text-sm text-slate-500">
                <Activity className="w-4 h-4" />
                <span>Live updates</span>
              </div>
            </div>
          </header>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard 
              icon={Users} 
              title="Total Users" 
              value={stats.totalUsers} 
              path="/users" 
              trend="+12% from last month"
              color="bg-gradient-to-br from-blue-500 to-blue-600"
            />
            <StatCard 
              icon={Calendar} 
              title="Total Events" 
              value={stats.totalEvents} 
              path="/events/list" 
              trend="+8% from last month"
              color="bg-gradient-to-br from-purple-500 to-purple-600"
            />
            <StatCard 
              icon={Building2} 
              title="Total Venues" 
              value={stats.totalVenues} 
              path="/venues" 
              trend="+5% from last month"
              color="bg-gradient-to-br from-emerald-500 to-emerald-600"
            />
            
            {/* Create Notification Action Card */}
            <Card 
              className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-2 border-dashed border-slate-200 hover:border-indigo-300 bg-gradient-to-br from-indigo-50 to-indigo-100 hover:-translate-y-1"
              onClick={() => navigate('/notifications/create')}
            >
              <CardContent className="flex flex-col items-center justify-center text-center p-6">
                <div className="p-3 rounded-full bg-indigo-500 text-white mb-3 group-hover:scale-110 transition-transform duration-200">
                  <BellPlus className="w-6 h-6" />
                </div>
                <p className="font-semibold text-slate-900 mb-1">Send Notification</p>
                <p className="text-sm text-slate-600">Create a new alert</p>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Recent Events - Takes 2/3 width */}
            <Card className="lg:col-span-2 shadow-sm border-0 hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="border-b border-slate-100">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl font-semibold text-slate-900">Recent Events</CardTitle>
                    <CardDescription className="text-slate-600">Latest events added to your platform</CardDescription>
                  </div>
                  <Link 
                    to="/events/list" 
                    className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center group"
                  >
                    View all
                    <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-slate-100">
                  {loading ? (
                    [...Array(6)].map((_, i) => (
                      <div key={i} className="p-6 flex items-center space-x-4">
                        <Skeleton className="h-12 w-12 rounded-lg" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-3 w-1/2" />
                        </div>
                        <Skeleton className="h-6 w-20 rounded-full" />
                      </div>
                    ))
                  ) : recentEvents.length > 0 ? (
                    recentEvents.map((event, index) => (
                      <div key={event._id} className="p-6 hover:bg-slate-50 transition-colors duration-200 group">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold shadow-sm">
                            {(index + 1).toString().padStart(2, '0')}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-slate-900 truncate group-hover:text-indigo-600 transition-colors">
                              {event.title || event.name?.name || "Untitled Event"}
                            </p>
                            <div className="flex items-center space-x-4 mt-1 text-sm text-slate-500">
                              <div className="flex items-center">
                                <Clock className="w-3 h-3 mr-1" />
                                {new Date(event.startDate).toLocaleDateString('en-GB', { 
                                  day: '2-digit', 
                                  month: 'short', 
                                  year: 'numeric' 
                                })}
                              </div>
                              {event.venue && (
                                <div className="flex items-center">
                                  <MapPin className="w-3 h-3 mr-1" />
                                  <span className="truncate">{event.venue}</span>
                                </div>
                              )}
                            </div>
                          </div>
                          <Badge variant="outline" className={`capitalize font-medium ${getStatusBadge(event.status)}`}>
                            {event.status || 'unknown'}
                          </Badge>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-16">
                      <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                      <p className="text-slate-500 text-lg font-medium mb-2">No events yet</p>
                      <p className="text-slate-400 text-sm">Create your first event to get started</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions - Takes 1/3 width */}
            <Card className="shadow-sm border-0 hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="border-b border-slate-100">
                <CardTitle className="text-xl font-semibold text-slate-900">Quick Actions</CardTitle>
                <CardDescription className="text-slate-600">Jump to key sections</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-3">
                  {quickActions.map((action) => (
                    <Link
                      key={action.path}
                      to={action.path}
                      className="group block"
                    >
                      <div className={`p-4 rounded-xl ${action.color} text-white transition-all duration-200 hover:shadow-lg hover:scale-105`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <action.icon className="w-5 h-5" />
                            <div>
                              <p className="font-semibold">{action.title}</p>
                              <p className="text-xs opacity-90">{action.description}</p>
                            </div>
                          </div>
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;