import { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Edit, Trash2, Eye, Plus, Palette, FileText } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

interface Theme {
  _id: string;
  name: string;
  description: string;
  createdAt?: string;
  updatedAt?: string;
}

const Themes = () => {
  const token = localStorage.getItem('token') || '';
  const [searchTerm, setSearchTerm] = useState('');
  const [themes, setThemes] = useState<Theme[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    fetch('https://api.partywalah.in/api/admin/theme', {
      headers: { 'accept': '*/*', 'Authorization': `Bearer ${token}` }
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch themes');
        return res.json();
      })
      .then(data => {
        const themes = (Array.isArray(data) ? data : data.data || []).map((theme: any) => ({
          _id: theme._id,
          name: theme.name,
          description: theme.description,
          createdAt: theme.createdAt,
          updatedAt: theme.updatedAt,
        }));
        setThemes(themes);
      })
      .catch(() => setThemes([]))
      .finally(() => setLoading(false));
  }, []);

  const filteredThemes = themes.filter(theme =>
    (theme.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (theme.description || '').toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleDelete = async (themeId: string) => {
    if (window.confirm('Are you sure you want to delete this theme?')) {
      try {
        const res = await fetch(`https://api.partywalah.in/api/admin/theme/${themeId}`, {
          method: 'DELETE',
          headers: { 'accept': '*/*', 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          setThemes((prev) => prev.filter((theme) => theme._id !== themeId));
        } else {
          alert('Failed to delete theme.');
        }
      } catch {
        alert('Failed to delete theme.');
      }
    }
  };

  return (
    <DashboardLayout>
      <div className="p-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Theme Management</h1>
            <p className="text-gray-600">Manage all your event themes in one place</p>
          </div>
          <Link to="/themes/create">
            <Button className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Create Theme
            </Button>
          </Link>
        </div>

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search themes by name or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-12"
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading themes...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredThemes.map((theme) => (
              <Card key={theme._id} className="hover:shadow-lg transition-shadow duration-200">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <CardTitle className="text-lg leading-tight flex items-center">
                        <Palette className="w-5 h-5 mr-2 text-indigo-600" />
                        {theme.name}
                      </CardTitle>
                      <div className="text-xs text-gray-400 mt-1">ID: {theme._id}</div>
                    </div>
                  </div>
                  <CardDescription className="text-sm line-clamp-3">
                    {theme.description || 'No description available'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center text-gray-600">
                      <FileText className="w-4 h-4 mr-2" />
                      <span className="truncate">{theme.description || 'No description'}</span>
                    </div>
                    {theme.createdAt && (
                      <div className="flex items-center text-gray-600">
                        <span className="text-xs">Created: {new Date(theme.createdAt).toLocaleDateString('en-IN')}</span>
                      </div>
                    )}
                  </div>

                  <div className="pt-2 border-t border-gray-100">
                    <div className="flex space-x-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="flex-1"
                        onClick={() => navigate(`/themes/view/${theme._id}`)}
                      >
                        <Eye className="w-3 h-3 mr-1" />
                        View
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="flex-1"
                        onClick={() => navigate(`/themes/edit/${theme._id}`)}
                      >
                        <Edit className="w-3 h-3 mr-1" />
                        Edit
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleDelete(theme._id)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {filteredThemes.length === 0 && !loading && (
          <div className="text-center py-12">
            <Palette className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No themes found</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm ? 'Try adjusting your search terms' : 'Get started by creating your first theme'}
            </p>
            <Link to="/themes/create">
              <Button className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700">
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Theme
              </Button>
            </Link>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Themes;
