import DashboardLayout from '../components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Star } from 'lucide-react';
import { useEffect, useState } from 'react';

const Subscription = () => {
  const [plans, setPlans] = useState<any[]>([]);
  const [stats, setStats] = useState<any[]>([]);
  const [recentSubscriptions, setRecentSubscriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch('https://api.partywalah.in/api/subscriptions', { headers: { accept: '*/*' } })
      .then(async res => {
        const text = await res.text();
        try {
          const data = JSON.parse(text);
          setPlans(data.plans || []);
          setStats(data.stats || []);
          setRecentSubscriptions(data.recentSubscriptions || []);
        } catch (e) {
          console.warn("Response was not JSON:", text);
          setPlans([]);
          setStats([]);
          setRecentSubscriptions([]);
        }
      })
      .catch(() => {
        setPlans([]);
        setStats([]);
        setRecentSubscriptions([]);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <DashboardLayout>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Subscription Management</h1>
          <p className="text-gray-600">Manage subscription plans and monitor revenue</p>
        </div>

        {loading ? (
          <div>Loading subscription data...</div>
        ) : (
          <>
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {stats.map((stat, index) => (
                <Card key={index}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                        <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                        <p className={`text-sm ${stat.color} mt-1`}>
                          {stat.change} from last month
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                        {/* Add icons if needed */}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Subscription Plans */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Subscription Plans</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {plans.map((plan, index) => (
                  <Card key={index} className={`relative ${plan.popular ? 'ring-2 ring-purple-500 shadow-lg' : ''}`}>
                    {plan.popular && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <Badge className="bg-purple-500 text-white px-3 py-1">
                          <Star className="w-3 h-3 mr-1" />
                          Most Popular
                        </Badge>
                      </div>
                    )}
                    <CardHeader className="text-center pb-2">
                      <div className={`w-16 h-16 ${plan.color || 'bg-blue-500'} rounded-full flex items-center justify-center mx-auto mb-4`}>
                        {/* <plan.icon className="w-8 h-8 text-white" /> */}
                      </div>
                      <CardTitle className="text-xl">{plan.name}</CardTitle>
                      <div className="text-3xl font-bold text-gray-900">
                        {plan.price}
                        <span className="text-sm font-normal text-gray-600">{plan.period}</span>
                      </div>
                      <CardDescription>{plan.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-3 mb-6">
                        {plan.features?.map((feature: string, featureIndex: number) => (
                          <li key={featureIndex} className="flex items-center text-sm">
                            <Check className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                      <Button 
                        className={`w-full ${plan.popular 
                          ? 'bg-purple-500 hover:bg-purple-600' 
                          : 'bg-gray-900 hover:bg-gray-800'
                        }`}
                      >
                        Manage Plan
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Recent Subscriptions */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Subscriptions</CardTitle>
                <CardDescription>Latest subscription activities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentSubscriptions.map((subscription: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-medium text-sm">
                            {subscription.user?.split(' ').map((n: string) => n[0]).join('')}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{subscription.user}</p>
                          <p className="text-sm text-gray-600">Subscribed to {subscription.plan}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">{subscription.amount}</p>
                        <p className="text-sm text-gray-600">
                          {new Date(subscription.date).toLocaleDateString('en-IN')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Subscription;
