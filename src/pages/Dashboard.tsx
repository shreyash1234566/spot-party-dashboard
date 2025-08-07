import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Users,
  Calendar,
  Building2,
  ArrowRight,
  Plus,
  Clock,
  MapPin,
  BellPlus,
  TrendingUp,
  Activity,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';

// --- Interfaces for fetched data ---
interface Event {
  _id: string;
  title?: string;
  name?: { name: string };
  startDate: string;
  status: string;
  venue?: string;
}

interface DashboardStats {
  totalUsers: number;
  totalEvents: number;
}

const quickActions = [
  {
    title: "Create New Event",
    path: "/events/create",
    icon: Plus,
    description: "Set up a new event for your users.",
    gradient: "from-violet-500 via-purple-500 to-purple-600",
    iconBg: "bg-violet-100",
    iconColor: "text-violet-600"
  },
  {
    title: "Manage Users",
    path: "/users",
    icon: Users,
    description: "View and manage all registered users.",
    gradient: "from-blue-500 via-cyan-500 to-blue-600",
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600"
  },
  {
    title: "Browse All Events",
    path: "/events/list",
    icon: Calendar,
    description: "View and manage all events.",
    gradient: "from-orange-400 via-amber-400 to-orange-500",
    iconBg: "bg-orange-100",
    iconColor: "text-orange-600"
  }
];

const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalEvents: 0,
  });
  const [recentEvents, setRecentEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  
  // In a real app, you'd get this from your auth context/state
  const token = 'your-auth-token-here';

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // Fetch data from actual APIs like in the second code
        const [usersRes, eventsRes] = await Promise.all([
          fetch('https://api.partywalah.in/api/admin/users', { 
            headers: { 'Authorization': `Bearer ${token}` } 
          }),
          fetch('https://api.partywalah.in/api/admin/events', { 
            headers: { 'Authorization': `Bearer ${token}` } 
          })
        ]);

        const usersData = usersRes.ok ? await usersRes.json() : { data: { total: 0 } };
        const eventsData = eventsRes.ok ? await eventsRes.json() : { data: [] };

        const events: Event[] = Array.isArray(eventsData.data) ? eventsData.data : [];
        const totalUsersCount = usersData.data?.total || 0;

        // Set the actual stats from API
        setStats({
          totalUsers: totalUsersCount,
          totalEvents: events.length,
        });

        // Sort events by date and take the 5 most recent
        const sortedEvents = [...events]
          .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())
          .slice(0, 5);
        setRecentEvents(sortedEvents);

      } catch (err) {
        console.error('Dashboard Error:', err);
        
        // Fallback to demo data if API fails (for demonstration purposes)
        setStats({
          totalUsers: 1247,
          totalEvents: 23,
        });

        setRecentEvents([
          {
            _id: '1',
            title: 'Annual Tech Conference 2024',
            startDate: '2024-12-15T10:00:00Z',
            status: 'approved',
            venue: 'Convention Center, Mumbai'
          },
          {
            _id: '2',
            title: 'Christmas Celebration',
            startDate: '2024-12-25T18:00:00Z',
            status: 'pending',
            venue: 'Grand Hotel, Delhi'
          },
          {
            _id: '3',
            title: 'New Year Party',
            startDate: '2024-12-31T21:00:00Z',
            status: 'published',
            venue: 'Beach Resort, Goa'
          },
          {
            _id: '4',
            title: 'Corporate Workshop',
            startDate: '2024-11-20T09:00:00Z',
            status: 'cancelled',
            venue: 'Office Complex, Bangalore'
          },
          {
            _id: '5',
            title: 'Music Festival',
            startDate: '2024-11-30T16:00:00Z',
            status: 'approved',
            venue: 'Open Ground, Pune'
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [token]);

  const getStatusBadge = (status: string) => {
    const s = status?.toLowerCase() || 'unknown';
    const styles = {
      approved: 'bg-emerald-50 text-emerald-700 border-emerald-200 shadow-sm',
      published: 'bg-emerald-50 text-emerald-700 border-emerald-200 shadow-sm',
      pending: 'bg-amber-50 text-amber-700 border-amber-200 shadow-sm',
      cancelled: 'bg-rose-50 text-rose-700 border-rose-200 shadow-sm',
      default: 'bg-slate-50 text-slate-700 border-slate-200 shadow-sm',
    };
    return styles[s as keyof typeof styles] || styles.default;
  };

  const getStatusIcon = (status: string) => {
    const s = status?.toLowerCase() || 'unknown';
    switch (s) {
      case 'approved':
      case 'published':
        return '✅';
      case 'pending':
        return '⏳';
      case 'cancelled':
        return '❌';
      default:
        return '📅';
    }
  };

  const handleNavigate = (path: string) => {
    console.log(`Navigate to: ${path}`);
    // In your actual app, use navigate(path) or router navigation
  };

  const StatCard = ({
    icon: Icon,
    title,
    value,
    path,
    gradient,
    delay = 0
  }: {
    icon: React.ElementType,
    title: string,
    value: number,
    path: string,
    gradient: string,
    delay?: number
  }) => (
    <Card
      className={`group hover:shadow-2xl hover:shadow-purple-500/20 transition-all duration-500 cursor-pointer border-0 bg-gradient-to-br ${gradient} text-white overflow-hidden relative transform hover:scale-105 ${mounted ? 'animate-in slide-in-from-bottom-4' : ''}`}
      style={{ animationDelay: `${delay}ms` }}
      onClick={() => handleNavigate(path)}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
      <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white/10 transform translate-x-16 -translate-y-16" />
      <div className="absolute bottom-0 left-0 w-20 h-20 rounded-full bg-white/10 transform -translate-x-10 translate-y-10" />

      <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-white/90">{title}</CardTitle>
        <div className="p-2 rounded-xl bg-white/20 backdrop-blur-sm group-hover:bg-white/30 transition-colors">
          <Icon className="w-4 h-4 text-white group-hover:scale-110 transition-transform" />
        </div>
      </CardHeader>
      <CardContent className="relative">
        {loading ? (
          <div className="h-8 w-20 bg-white/20 rounded animate-pulse" />
        ) : (
          <div className="text-3xl font-bold text-white flex items-center">
            {(value || 0).toLocaleString('en-IN')}
            <TrendingUp className="w-5 h-5 ml-2 text-white/80 group-hover:translate-y-1 transition-transform" />
          </div>
        )}
        <div className="mt-2 flex items-center text-white/80">
          <Activity className="w-3 h-3 mr-1" />
          <span className="text-xs">View details</span>
        </div>
      </CardContent>
    </Card>
  );

  const NotificationCard = ({ delay = 0 }) => (
    <Card
      className={`group flex items-center justify-center p-6 bg-gradient-to-br from-indigo-50 to-purple-50 hover:from-indigo-100 hover:to-purple-100 transition-all duration-500 cursor-pointer border border-indigo-200/50 hover:border-indigo-300 hover:shadow-xl hover:shadow-indigo-500/20 transform hover:scale-105 ${mounted ? 'animate-in slide-in-from-bottom-4' : ''}`}
      style={{ animationDelay: `${delay}ms` }}
      onClick={() => handleNavigate('/notifications/create')}
    >
      <div className="text-center relative">
        <div className="flex justify-center mb-3 relative">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg group-hover:shadow-xl transition-shadow">
            <BellPlus className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
          </div>
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
        </div>
        <p className="font-semibold text-slate-800 mb-1">New Notification</p>
        <p className="text-sm text-slate-600">Send instant alerts</p>
        <div className="mt-3 flex items-center justify-center text-indigo-600 group-hover:text-indigo-700">
          <Sparkles className="w-4 h-4 mr-1" />
          <span className="text-xs font-medium">Quick Action</span>
        </div>
      </div>
    </Card>
  );

  return (
    <DashboardLayout>
    <div className="min-h-screen bg-slate-100">
      <main className="p-4 md:p-8 bg-gradient-to-br from-slate-50 via-white to-slate-100 min-h-screen">
        <header className={`mb-8 ${mounted ? 'animate-in fade-in slide-in-from-top-4' : ''}`}>
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-2 h-8 bg-gradient-to-b from-purple-500 to-indigo-600 rounded-full" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900 bg-clip-text text-transparent">
              Dashboard Overview
            </h1>
          </div>
          <p className="text-slate-600 ml-5 flex items-center">
            <Activity className="w-4 h-4 mr-2 text-purple-500" />
            Real-time insights into your platform's performance
          </p>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <StatCard
            icon={Users}
            title="Active Users"
            value={stats.totalUsers}
            path="/users"
            gradient="from-blue-500 via-cyan-500 to-teal-500"
            delay={100}
          />
          <StatCard
            icon={Calendar}
            title="Total Events"
            value={stats.totalEvents}
            path="/events/list"
            gradient="from-purple-500 via-violet-500 to-purple-600"
            delay={200}
          />
          <NotificationCard delay={300} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className={`lg:col-span-2 shadow-xl border-0 bg-white/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-500 ${mounted ? 'animate-in slide-in-from-left-4' : ''}`} style={{ animationDelay: '400ms' }}>
            <CardHeader className="bg-gradient-to-r from-slate-50 to-purple-50 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 shadow-lg">
                    <Calendar className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold text-slate-900">Recent Events</CardTitle>
                    <p className="text-sm text-slate-600">Latest activity from your platform</p>
                  </div>
                </div>
                <button 
                  onClick={() => handleNavigate('/events/list')}
                  className="group flex items-center space-x-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  <span className="text-sm font-medium">View all</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-slate-100/50">
                {loading ? (
                  [...Array(5)].map((_, i) => (
                    <div key={i} className="p-6 flex items-center space-x-4 animate-pulse">
                      <div className="w-12 h-12 bg-slate-200 rounded-xl" />
                      <div className="flex-1 space-y-3">
                        <div className="h-4 bg-slate-200 rounded w-3/4" />
                        <div className="h-3 bg-slate-200 rounded w-1/2" />
                      </div>
                      <div className="h-6 w-20 bg-slate-200 rounded-full" />
                    </div>
                  ))
                ) : recentEvents.length > 0 ? (
                  recentEvents.map((event, index) => (
                    <div key={event._id} className={`group p-6 hover:bg-gradient-to-r hover:from-purple-50/50 hover:to-indigo-50/50 transition-all duration-300 cursor-pointer border-l-4 border-transparent hover:border-purple-500 ${mounted ? 'animate-in slide-in-from-bottom-2' : ''}`} style={{ animationDelay: `${500 + index * 100}ms` }}>
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-100 to-indigo-100 flex items-center justify-center group-hover:shadow-lg transition-shadow">
                            <span className="text-lg">{getStatusIcon(event.status)}</span>
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-slate-800 truncate text-lg group-hover:text-purple-700 transition-colors">
                            {event.title || event.name?.name || "Untitled Event"}
                          </p>
                          <div className="flex items-center space-x-6 mt-2 text-sm text-slate-500">
                            <div className="flex items-center space-x-2 bg-slate-100 rounded-full px-3 py-1">
                              <Clock className="w-4 h-4 text-purple-500" />
                              <span className="font-medium">
                                {new Date(event.startDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                              </span>
                            </div>
                            {event.venue && (
                              <div className="flex items-center space-x-2 bg-slate-100 rounded-full px-3 py-1">
                                <MapPin className="w-4 h-4 text-indigo-500" />
                                <span className="truncate font-medium">{event.venue}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className={`capitalize font-semibold px-3 py-1 rounded-full border ${getStatusBadge(event.status)}`}>
                            {event.status || 'unknown'}
                          </div>
                          <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-purple-500 group-hover:translate-x-1 transition-all" />
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-20">
                    <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-purple-100 to-indigo-100 flex items-center justify-center">
                      <Calendar className="w-12 h-12 text-purple-500" />
                    </div>
                    <h3 className="text-xl font-semibold text-slate-700 mb-2">No Recent Events</h3>
                    <p className="text-slate-500">Your events will appear here once created</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className={`shadow-xl border-0 bg-white/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-500 ${mounted ? 'animate-in slide-in-from-right-4' : ''}`} style={{ animationDelay: '600ms' }}>
            <CardHeader className="bg-gradient-to-r from-slate-50 to-indigo-50 border-b border-slate-100">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold text-slate-900">Quick Actions</CardTitle>
                  <p className="text-sm text-slate-600">Streamline your workflow</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {quickActions.map((action, index) => (
                  <button 
                    key={action.path} 
                    onClick={() => handleNavigate(action.path)}
                    className="group block w-full text-left"
                  >
                    <div className={`p-5 rounded-2xl border border-slate-200/50 bg-gradient-to-r from-white to-slate-50/50 group-hover:border-transparent group-hover:shadow-xl group-hover:shadow-purple-500/20 transition-all duration-300 transform group-hover:scale-105 ${mounted ? 'animate-in slide-in-from-bottom-2' : ''}`} style={{ animationDelay: `${700 + index * 100}ms` }}>
                      <div className="flex items-center">
                        <div className={`p-3 rounded-2xl ${action.iconBg} mr-4 group-hover:shadow-lg transition-shadow`}>
                          <action.icon className={`w-6 h-6 ${action.iconColor} group-hover:scale-110 transition-transform`} />
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-slate-800 group-hover:text-purple-700 transition-colors">
                            {action.title}
                          </p>
                          <p className="text-sm text-slate-600 mt-1 group-hover:text-slate-700 transition-colors">
                            {action.description}
                          </p>
                        </div>
                        <div className="ml-4 p-2 rounded-full bg-gradient-to-r from-purple-100 to-indigo-100 group-hover:from-purple-200 group-hover:to-indigo-200 transition-colors">
                          <ArrowRight className="w-4 h-4 text-purple-600 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
    </DashboardLayout>
  );
};

export default Dashboard;