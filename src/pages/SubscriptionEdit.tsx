import { useState, useEffect, FormEvent } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { ArrowLeft, Plus, Trash2, Loader2, Save, CreditCard } from 'lucide-react';

// Define the shape for a dynamic feature item for the form state
interface FeatureItem {
  id: number;
  text: string;
}

const SubscriptionEdit = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const token = localStorage.getItem('token') || '';

  // State for all form fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [planType, setPlanType] = useState<'monthly' | 'yearly'>('monthly');
  const [features, setFeatures] = useState<FeatureItem[]>([{ id: Date.now(), text: '' }]);
  
  const [loading, setLoading] = useState(true); // For initial data fetch
  const [submitting, setSubmitting] = useState(false); // For form submission
  const [error, setError] = useState<string | null>(null);

  // Fetch existing subscription data to populate the form
  useEffect(() => {
    if (!id) {
      toast({ title: "Error", description: "Subscription ID is missing.", variant: 'destructive' });
      navigate('/subscription/list');
      return;
    }

    const fetchSubscriptionData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`https://api.partywalah.in/api/admin/subscription/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) {
          throw new Error('Failed to fetch subscription data.');
        }
        const data = await response.json();
        const subscription = data.data || data;
        
        // Populate state with fetched data
        setTitle(subscription.name);
        setDescription(subscription.description || '');
        setPrice(subscription.price.toString());
        setPlanType(subscription.planType);
        // Convert the string array of features to the form's state structure
        setFeatures(subscription.features.map((text: string, index: number) => ({
          id: Date.now() + index, // Create unique IDs
          text: text
        })));

      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
        setError(errorMessage);
        toast({ title: 'Error', description: 'Could not load subscription data.', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    };

    fetchSubscriptionData();
  }, [id, navigate, token]);

  // --- Handlers for the dynamic features array (same as create form) ---
  const addFeature = () => setFeatures(prev => [...prev, { id: Date.now(), text: '' }]);
  const removeFeature = (idToRemove: number) => {
    if (features.length > 1) {
      setFeatures(prev => prev.filter(feature => feature.id !== idToRemove));
    }
  };
  const handleFeatureChange = (idToUpdate: number, value: string) => {
    setFeatures(prev =>
      prev.map(feature => (feature.id === idToUpdate ? { ...feature, text: value } : feature))
    );
  };

  // --- Handle Form Submission ---
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const filledFeatures = features.filter(f => f.text.trim() !== '');
    if (!title.trim() || !price.trim() || filledFeatures.length === 0) {
      toast({
        title: 'Missing Information',
        description: 'Please fill out the title, price, and at least one feature.',
        variant: 'destructive',
      });
      return;
    }

    setSubmitting(true);
    const payload = {
      name: title.trim(),
      description: description.trim(),
      price: parseFloat(price),
      planType: planType,
      features: filledFeatures.map(f => f.text.trim()),
    };

    try {
      const response = await fetch(`https://api.partywalah.in/api/admin/subscription/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update the subscription.');
      }

      toast({ title: 'Success', description: 'Subscription plan updated successfully!' });
      navigate('/subscription/list');

    } catch (err) {
      toast({ title: 'Submission Error', description: (err as Error).message, variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full p-8">
          <Loader2 className="w-8 h-8 animate-spin text-gray-600" />
          <p className="ml-3 text-gray-600">Loading plan for editing...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="p-8 text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Link to="/subscription/list">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to List
            </Button>
          </Link>
        </div>
      </DashboardLayout>
    );
  }
  
  const isFormInvalid = !title.trim() || !price.trim() || features.every(f => !f.text.trim());

  return (
    <DashboardLayout>
      <div className="p-4 md:p-8">
        <div className="mb-6">
          <Button asChild variant="outline">
            <Link to="/subscription/list">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to List
            </Link>
          </Button>
        </div>
        
        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-3">
              <CreditCard className="w-7 h-7 text-indigo-600" />
              Edit Subscription Plan
            </CardTitle>
            <CardDescription>Update the details for the "{title}" plan.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* --- Form fields are same as Create form --- */}
              <div className="space-y-2">
                <Label htmlFor="title">Plan Title <span className="text-red-500">*</span></Label>
                <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required disabled={submitting} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} disabled={submitting} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Price (₹) <span className="text-red-500">*</span></Label>
                  <Input id="price" type="number" value={price} onChange={(e) => setPrice(e.target.value)} required disabled={submitting} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="plan-type">Plan Type</Label>
                  {/* The key prop is important here to force re-render when the default value changes */}
                  <Select key={planType} onValueChange={(value: 'monthly' | 'yearly') => setPlanType(value)} defaultValue={planType} disabled={submitting}>
                    <SelectTrigger id="plan-type"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-3">
                <Label>Features <span className="text-red-500">*</span></Label>
                {features.map((feature, index) => (
                  <div key={feature.id} className="flex items-center gap-2">
                    <Input placeholder={`Feature ${index + 1}`} value={feature.text} onChange={(e) => handleFeatureChange(feature.id, e.target.value)} disabled={submitting} />
                    <Button type="button" variant="ghost" size="icon" className="text-red-500 hover:bg-red-100 hover:text-red-600 flex-shrink-0" onClick={() => removeFeature(feature.id)} disabled={features.length <= 1 || submitting}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                <Button type="button" variant="outline" className="w-full mt-2" onClick={addFeature} disabled={submitting}>
                  <Plus className="w-4 h-4 mr-2" /> Add Feature
                </Button>
              </div>
              <div className="flex justify-end pt-4">
                <Button type="submit" disabled={submitting || isFormInvalid}>
                  {submitting ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</>
                  ) : (
                    <><Save className="mr-2 h-4 w-4" /> Save Changes</>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default SubscriptionEdit;