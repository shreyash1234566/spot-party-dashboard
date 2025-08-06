import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Edit, CreditCard, Calendar, Clock, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';

// Define the Subscription interface, consistent with your other components
interface Subscription {
  _id: string;
  name: string;
  description?: string;
  price: number;
  planType: 'monthly' | 'yearly';
  features: string[];
  createdAt: string;
  updatedAt: string;
}

const SubscriptionView = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const token = localStorage.getItem('token') || '';

  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setError("No Subscription ID provided.");
      setLoading(false);
      return;
    }

    const fetchSubscription = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`https://api.partywalah.in/api/admin/subscription/${id}`, {
          headers: {
            'accept': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch subscription details.');
        }

        const data = await response.json();
        setSubscription(data.data || data);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'An unknown error occurred.';
        setError(message);
        toast({ title: "Error", description: message, variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };

    fetchSubscription();
  }, [id, token]);
  
  // Skeleton loader for a better loading experience
  const ViewSkeleton = () => (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-28" />
        </div>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        <Skeleton className="h-12 w-40" />
        <div className="space-y-3">
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-5/6" />
          <Skeleton className="h-6 w-full" />
        </div>
        <div className="pt-4 border-t">
          <Skeleton className="h-10 w-full" />
        </div>
      </CardContent>
    </Card>
  );

  return (
    <DashboardLayout>
      <div className="p-4 md:p-8">
        <div className="mb-6">
          <Button asChild variant="outline">
            <Link to="/subscription/list">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Subscription List
            </Link>
          </Button>
        </div>

        {loading && <ViewSkeleton />}

        {error && !loading && (
            <div className="text-center py-10">
                <p className="text-red-600 mb-4">{error}</p>
                <Button asChild variant="outline">
                    <Link to="/subscription/list">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Subscription List
                    </Link>
                </Button>
            </div>
        )}

        {subscription && !loading && (
          <Card className="max-w-4xl mx-auto">
            <CardHeader>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex-1 flex items-center gap-4">
                  <CreditCard className="w-10 h-10 text-indigo-600 flex-shrink-0" />
                  <div>
                    <CardTitle className="text-3xl font-bold">{subscription.name}</CardTitle>
                    {subscription.description && (
                      <CardDescription className="mt-1">{subscription.description}</CardDescription>
                    )}
                  </div>
                </div>
                <Button onClick={() => navigate(`/subscription/edit/${subscription._id}`)}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Plan
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              {/* Main Details */}
              <div className="mb-8 p-6 bg-gray-50 rounded-lg border">
                <div className="mb-6">
                  <span className="text-5xl font-extrabold text-gray-900">
                    ₹{subscription.price.toLocaleString('en-IN')}
                  </span>
                  <span className="ml-2 text-xl text-gray-500 font-medium">
                    / {subscription.planType}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Features included:</h3>
                <ul className="space-y-3">
                  {subscription.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              {/* Metadata */}
              <div className="space-y-2 border-t pt-4">
                 <div className="flex items-start py-2">
                  <span className="w-5 h-5 mr-4 text-gray-500 mt-1 font-mono text-lg">#</span>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-500">Subscription ID</span>
                    <span className="text-md text-gray-800 font-mono break-all">{subscription._id}</span>
                  </div>
                </div>
                <div className="flex items-start py-2">
                  <Calendar className="w-5 h-5 mr-4 text-gray-500 mt-1" />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-500">Date Created</span>
                    <span className="text-md text-gray-800">{subscription.createdAt ? format(new Date(subscription.createdAt), 'PPP p') : 'N/A'}</span>
                  </div>
                </div>
                <div className="flex items-start py-2">
                  <Clock className="w-5 h-5 mr-4 text-gray-500 mt-1" />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-500">Last Updated</span>
                    <span className="text-md text-gray-800">{subscription.updatedAt ? format(new Date(subscription.updatedAt), 'PPP p') : 'N/A'}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default SubscriptionView;