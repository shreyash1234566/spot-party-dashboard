import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Edit, Palette, FileText, Calendar, Clock } from 'lucide-react';
import { format } from 'date-fns';

// Define the Theme interface, consistent with your ThemeList component
interface Theme {
  _id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

const ThemeView = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const token = localStorage.getItem('token') || '';

  const [theme, setTheme] = useState<Theme | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchTheme = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`https://api.partywalah.in/api/admin/theme/${id}`, {
          headers: {
            'accept': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch theme details. Please try again.');
        }

        const data = await response.json();
        // The API response might be nested under a 'data' key
        setTheme(data.data || data); 
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      } finally {
        setLoading(false);
      }
    };

    fetchTheme();
  }, [id, token]);

  const renderDetailRow = (Icon: React.ElementType, label: string, value: string | undefined) => (
    <div className="flex items-start py-3 border-b">
      <Icon className="w-5 h-5 mr-4 text-gray-500 mt-1" />
      <div className="flex flex-col">
        <span className="text-sm font-medium text-gray-500">{label}</span>
        <span className="text-md text-gray-800">{value || 'N/A'}</span>
      </div>
    </div>
  );

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full p-8">
          <p className="text-gray-600">Loading theme details...</p>
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

        {theme && (
          <Card className="max-w-4xl mx-auto">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-3xl font-bold flex items-center">
                    <Palette className="w-8 h-8 mr-3 text-indigo-600" />
                    {theme.name}
                  </CardTitle>
                  <CardDescription className="mt-2">
                    Detailed view of the theme.
                  </CardDescription>
                </div>
                <Button onClick={() => navigate(`/themes/edit/${theme._id}`)}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Theme
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {renderDetailRow(FileText, 'Description', theme.description)}
                {renderDetailRow(Calendar, 'Date Created', theme.createdAt ? format(new Date(theme.createdAt), 'PPpp') : 'N/A')}
                {renderDetailRow(Clock, 'Last Updated', theme.updatedAt ? format(new Date(theme.updatedAt), 'PPpp') : 'N/A')}
                <div className="flex items-start py-3">
                  <span className="w-5 h-5 mr-4 text-gray-500 mt-1 font-mono text-lg">#</span>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-500">Theme ID</span>
                    <span className="text-md text-gray-800 font-mono">{theme._id}</span>
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

export default ThemeView;