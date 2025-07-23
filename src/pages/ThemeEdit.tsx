import { useState, useEffect, FormEvent } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import DashboardLayout from '../components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Loader2, Save } from 'lucide-react';

const ThemeEdit = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const token = localStorage.getItem('token') || '';

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true); // For initial data fetch
  const [submitting, setSubmitting] = useState(false); // For form submission
  const [error, setError] = useState<string | null>(null);

  // Fetch the existing theme data to populate the form
  useEffect(() => {
    if (!id) {
      toast.error("Theme ID is missing.");
      navigate('/themes/list');
      return;
    }

    const fetchThemeData = async () => {
      setLoading(true);
      try {
        const response = await fetch(`https://api.partywalah.in/api/admin/theme/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) {
          throw new Error('Failed to fetch theme data.');
        }
        const data = await response.json();
        const theme = data.data || data;
        setName(theme.name);
        setDescription(theme.description || '');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        toast.error('Could not load theme data.');
      } finally {
        setLoading(false);
      }
    };

    fetchThemeData();
  }, [id, navigate, token]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Theme name cannot be empty.');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(`https://api.partywalah.in/api/admin/theme/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'accept': 'application/json',
        },
        body: JSON.stringify({ name, description })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update the theme.');
      }

      toast.success('Theme updated successfully!');
      navigate('/themes/list');

    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'An error occurred during submission.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full p-8">
          <Loader2 className="w-8 h-8 animate-spin text-gray-600" />
          <p className="ml-2 text-gray-600">Loading theme for editing...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="p-8 text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Link to="/themes/list">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Themes List
            </Button>
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-8">
        <div className="mb-6">
          <Link to="/themes/list">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Themes List
            </Button>
          </Link>
        </div>
        
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl">Edit Theme</CardTitle>
            <CardDescription>Update the details for this theme.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Theme Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Royal Rajasthani"
                  required
                  disabled={submitting}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the theme..."
                  rows={5}
                  disabled={submitting}
                />
              </div>
              <div className="flex justify-end">
                <Button type="submit" disabled={submitting}>
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </>
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

export default ThemeEdit;