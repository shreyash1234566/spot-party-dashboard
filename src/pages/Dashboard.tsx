
import DashboardLayout from '../components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Calendar, TrendingUp, DollarSign } from 'lucide-react';

const Dashboard = () => {
  const stats = [
    {
      title: 'Total Users',
      value: '2,847',
      change: '+12.5%',
      icon: Users,
      color: 'bg-blue-500'
    },
    {
      title: 'Active Events',
      value: '127',
      change: '+8.2%',
      icon: Calendar,
      color: 'bg-green-500'
    },
    {
      title: 'Revenue',
      value: '₹1,24,500',
      change: '+23.1%',
      icon: DollarSign,
      color: 'bg-purple-500'
    },
    {
      title: 'Growth Rate',
      value: '18.6%',
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
          {stats.map((stat, index) => (
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
              <div className="space-y-4">
                {[
                  { name: 'Summer Music Festival', date: '2024-07-15', status: 'Published' },
                  { name: 'Tech Conference 2024', date: '2024-08-02', status: 'Draft' },
                  { name: 'Food & Wine Expo', date: '2024-07-28', status: 'Published' },
                  { name: 'Art Gallery Opening', date: '2024-07-20', status: 'Published' }
                ].map((event, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{event.name}</p>
                      <p className="text-sm text-gray-500">{event.date}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      event.status === 'Published' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {event.status}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common tasks and shortcuts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                <button className="p-4 text-left bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors">
                  <Calendar className="w-6 h-6 text-indigo-600 mb-2" />
                  <p className="font-medium text-indigo-900">Create Event</p>
                  <p className="text-sm text-indigo-600">Add new event</p>
                </button>
                <button className="p-4 text-left bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
                  <Users className="w-6 h-6 text-green-600 mb-2" />
                  <p className="font-medium text-green-900">Manage Users</p>
                  <p className="text-sm text-green-600">View all users</p>
                </button>
                <button className="p-4 text-left bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors">
                  <TrendingUp className="w-6 h-6 text-purple-600 mb-2" />
                  <p className="font-medium text-purple-900">Analytics</p>
                  <p className="text-sm text-purple-600">View reports</p>
                </button>
                <button className="p-4 text-left bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors">
                  <DollarSign className="w-6 h-6 text-orange-600 mb-2" />
                  <p className="font-medium text-orange-900">Revenue</p>
                  <p className="text-sm text-orange-600">Track earnings</p>
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
