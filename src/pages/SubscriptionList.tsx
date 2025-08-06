import { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Search, Edit, Trash2, Eye, Plus, CreditCard, CheckCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

// Define the data structure for a subscription plan
interface Subscription {
  _id: string;
  name: string;
  description?: string;
  price: number;
  planType: 'monthly' | 'yearly';
  features: string[];
  createdAt?: string;
}

const SubscriptionList = () => {
  const token = localStorage.getItem('token') || '';
  const [searchTerm, setSearchTerm] = useState('');
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Fetch subscription plans from the API
  useEffect(() => {
    const fetchSubscriptions = async () => {
      setLoading(true);
      try {
        const res = await fetch('https://api.partywalah.in/api/admin/subscription', {
          headers: { 'accept': '*/*', 'Authorization': `Bearer ${token}` }
        });

        if (!res.ok) {
          throw new Error('Failed to fetch subscription plans');
        }

        const data = await res.json();
        const subscriptionData = Array.isArray(data) ? data : data.data || [];
        setSubscriptions(subscriptionData);
      } catch (error) {
        toast({
          title: 'Error',
          description: (error as Error).message || 'Could not fetch subscription plans.',
          variant: 'destructive',
        });
        setSubscriptions([]);
      } finally {
        setLoading(false);
      }
    };
    fetchSubscriptions();
  }, [token]);

  // Filter plans based on search term
  const filteredSubscriptions = subscriptions.filter(sub =>
    (sub.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (sub.description || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle the deletion of a plan
  const handleDelete = async (subscriptionId: string) => {
    if (window.confirm('Are you sure you want to delete this subscription plan?')) {
      try {
        const res = await fetch(`https://api.partywalah.in/api/admin/subscription/${subscriptionId}`, {
          method: 'DELETE',
          headers: { 'accept': '*/*', 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          setSubscriptions((prev) => prev.filter((sub) => sub._id !== subscriptionId));
          toast({
            title: 'Success',
            description: 'Subscription plan deleted successfully.',
          });
        } else {
          const errorData = await res.json();
          throw new Error(errorData.message || 'Failed to delete plan.');
        }
      } catch (error) {
        toast({
          title: 'Error',
          description: (error as Error).message,
          variant: 'destructive',
        });
      }
    }
  };

  // Skeleton loader for a better user experience
  const SubscriptionCardSkeleton = () => (
    <Card className="flex flex-col">
      <CardHeader>
        <Skeleton className="h-6 w-1/2 mb-2" />
        <Skeleton className="h-4 w-3/4" />
      </CardHeader>
      <CardContent className="flex flex-col flex-grow justify-between">
        <div>
          <Skeleton className="h-10 w-1/3 mb-6" />
          <div className="space-y-3">
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-5/6" />
            <Skeleton className="h-5 w-full" />
          </div>
        </div>
        <div className="pt-4 mt-4 border-t flex space-x-2">
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-9 w-12" />
        </div>
      </CardContent>
    </Card>
  );

  return (
    <DashboardLayout>
      <div className="p-4 md:p-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-1">Subscription Plans</h1>
            <p className="text-gray-600">Manage all your subscription tiers and benefits.</p>
          </div>
          <Link to="/subscription/create">
            <Button className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Create Plan
            </Button>
          </Link>
        </div>

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search plans by name or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-11"
            />
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => <SubscriptionCardSkeleton key={i} />)}
          </div>
        ) : filteredSubscriptions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSubscriptions.map((sub) => (
              <Card key={sub._id} className="flex flex-col hover:shadow-lg transition-shadow duration-300 border-t-4 border-indigo-500">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-gray-800">{sub.name}</CardTitle>
                  {sub.description && (
                    <CardDescription className="text-sm">{sub.description}</CardDescription>
                  )}
                </CardHeader>
                <CardContent className="flex flex-col flex-grow justify-between">
                  <div>
                    <div className="mb-6">
                      <span className="text-4xl font-extrabold text-gray-900">
                        ₹{sub.price.toLocaleString('en-IN')}
                      </span>
                      <span className="text-lg text-gray-500 font-medium">
                        /{sub.planType}
                      </span>
                    </div>
                    <ul className="space-y-3 text-sm">
                      {sub.features.map((feature, index) => (
                        <li key={index} className="flex items-center gap-3">
                          <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                          <span className="text-gray-700">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-4 mt-6 border-t border-gray-100">
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline" className="flex-1" onClick={() => navigate(`/subscription/view/${sub._id}`)}>
                        <Eye className="w-3 h-3 mr-1.5" /> View
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1" onClick={() => navigate(`/subscription/edit/${sub._id}`)}>
                        <Edit className="w-3 h-3 mr-1.5" /> Edit
                      </Button>
                      <Button size="sm" variant="ghost" className="text-red-600 hover:text-red-700 hover:bg-red-50 px-2" onClick={() => handleDelete(sub._id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 border-2 border-dashed rounded-lg">
            <CreditCard className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? 'No Plans Found' : 'No Subscription Plans Created Yet'}
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              {searchTerm ? 'Your search did not match any plans. Try different keywords.' : 'Get started by creating your first subscription plan.'}
            </p>
            {!searchTerm && (
              <Link to="/subscription/create">
                <Button className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Plan
                </Button>
              </Link>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default SubscriptionList;