import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { ArrowLeft, Palette } from 'lucide-react';

const ThemeCreate = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token') || '';
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.description.trim()) {
      toast({
        title: 'Missing Information',
        description: 'Please provide both theme name and description.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('https://api.partywalah.in/api/admin/theme', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          description: formData.description.trim(),
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to create theme');
      }

      toast({
        title: 'Success',
        description: 'Theme created successfully!',
      });

      navigate('/themes/list');
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

  return (
    <DashboardLayout>
      <div className="p-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <Button
              variant="ghost"
              onClick={() => navigate('/themes/list')}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Themes
            </Button>
            
            <div className="flex items-center mb-2">
              <Palette className="w-8 h-8 text-indigo-600 mr-3" />
              <h1 className="text-3xl font-bold text-gray-900">Create New Theme</h1>
            </div>
            <p className="text-gray-600">Add a new theme for your events</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Theme Details</CardTitle>
              <CardDescription>
                Provide the basic information for your new theme
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="theme-name">
                    Theme Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="theme-name"
                    type="text"
                    placeholder="e.g. Royal Rajasthani, Modern Minimalist, Vintage Classic"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="h-11"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="theme-description">
                    Theme Description <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="theme-description"
                    placeholder="Describe the theme style, colors, decorations, and overall aesthetic..."
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={5}
                    className="resize-none"
                    required
                  />
                  <p className="text-sm text-gray-500">
                    Provide details about colors, decorations, style elements, and atmosphere
                  </p>
                </div>

                <div className="flex gap-4 pt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/themes/list')}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting || !formData.name.trim() || !formData.description.trim()}
                    className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
                  >
                    {isSubmitting ? 'Creating...' : 'Create Theme'}
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

export default ThemeCreate;
