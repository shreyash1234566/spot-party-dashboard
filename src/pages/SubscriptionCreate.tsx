import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { ArrowLeft, Plus, Trash2, Loader2, Save, CreditCard } from 'lucide-react';

// Define the shape for a dynamic feature item
interface FeatureItem {
  id: number;
  text: string;
}

const SubscriptionCreate = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token') || '';

  // State for all form fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [planType, setPlanType] = useState<'monthly' | 'yearly'>('monthly');
  const [features, setFeatures] = useState<FeatureItem[]>([
    { id: Date.now(), text: '' },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- Handlers for the dynamic features array ---

  const addFeature = () => {
    setFeatures(prev => [...prev, { id: Date.now(), text: '' }]);
  };

  const removeFeature = (id: number) => {
    if (features.length > 1) {
      setFeatures(prev => prev.filter(feature => feature.id !== id));
    }
  };

  const handleFeatureChange = (id: number, value: string) => {
    setFeatures(prev =>
      prev.map(feature => (feature.id === id ? { ...feature, text: value } : feature))
    );
  };

  // --- Form Submission ---

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // --- Validation ---
    const filledFeatures = features.filter(f => f.text.trim() !== '');
    if (!title.trim() || !price.trim() || filledFeatures.length === 0) {
      toast({
        title: 'Missing Information',
        description: 'Please fill out the title, price, and at least one feature.',
        variant: 'destructive',
      });
      return;
    }
    
    setIsSubmitting(true);
    
    // --- Prepare API Payload ---
    const payload = {
      name: title.trim(),
      description: description.trim(),
      price: parseFloat(price),
      planType: planType,
      features: filledFeatures.map(f => f.text.trim()),
    };

    try {
      // NOTE: Update API endpoint if it's different.
      const res = await fetch('https://api.partywalah.in/api/admin/subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to create subscription plan');
      }

      toast({
        title: 'Success',
        description: 'Subscription plan created successfully!',
      });

      navigate('/subscription/list');
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormInvalid = !title.trim() || !price.trim() || features.every(f => !f.text.trim());

  return (
    <DashboardLayout>
      <div className="p-4 md:p-8">
        <div className="max-w-3xl mx-auto">
          <div className="mb-6">
            <Button variant="outline" onClick={() => navigate('/subscription/list')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Subscription List
            </Button>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <CreditCard className="w-8 h-8 text-indigo-600" />
                <div>
                  <CardTitle className="text-2xl">Create Subscription Plan</CardTitle>
                  <CardDescription>
                    Add a new subscription tier with its price and features.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* --- Basic Info --- */}
                <div className="space-y-2">
                  <Label htmlFor="title">Plan Title <span className="text-red-500">*</span></Label>
                  <Input
                    id="title"
                    placeholder="e.g., Monster, Pro, Basic"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="e.g., Best for frequent users and event hosts."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                  />
                </div>
                
                {/* --- Price and Plan Type --- */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">Price (₹) <span className="text-red-500">*</span></Label>
                    <Input
                      id="price"
                      type="number"
                      placeholder="e.g., 999"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="plan-type">Plan Type</Label>
                    <Select onValueChange={(value: 'monthly' | 'yearly') => setPlanType(value)} defaultValue={planType}>
                      <SelectTrigger id="plan-type">
                        <SelectValue placeholder="Select plan type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="yearly">Yearly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* --- Dynamic Features --- */}
                <div className="space-y-3">
                  <Label>Features <span className="text-red-500">*</span></Label>
                  {features.map((feature, index) => (
                    <div key={feature.id} className="flex items-center gap-2">
                      <Input
                        placeholder={`Feature ${index + 1}`}
                        value={feature.text}
                        onChange={(e) => handleFeatureChange(feature.id, e.target.value)}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="text-red-500 hover:bg-red-100 hover:text-red-600 flex-shrink-0"
                        onClick={() => removeFeature(feature.id)}
                        disabled={features.length <= 1}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                  <Button type="button" variant="outline" className="w-full mt-2" onClick={addFeature}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Feature
                  </Button>
                </div>
                
                {/* --- Action Buttons --- */}
                <div className="flex justify-end gap-4 pt-4">
                  <Button type="button" variant="outline" onClick={() => navigate('/subscription/list')}>
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting || isFormInvalid}
                    className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Create Plan
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SubscriptionCreate;