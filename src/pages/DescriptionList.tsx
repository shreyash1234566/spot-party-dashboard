import { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Search, Edit, Trash2, Eye, Plus, HelpCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

// Define the data structure for a single Description
interface Description {
  _id: string;
  question: string;
  answer: string;
  createdAt?: string;
}

const DescriptionList = () => {
  const token = localStorage.getItem('token') || '';
  const [searchTerm, setSearchTerm] = useState('');
  const [Descriptions, setDescriptions] = useState<Description[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Fetch Descriptions from the API when the component mounts
  useEffect(() => {
    const fetchDescriptions = async () => {
      setLoading(true);
      try {
        const res = await fetch('https://6891d3e7447ff4f11fbdec9e.mockapi.io/api/party/Descriptions', {
          headers: { 'accept': '*/*', 'Authorization': `Bearer ${token}` }
        });

        if (!res.ok) {
          throw new Error('Failed to fetch Descriptions');
        }

        const data = await res.json();
        // Handle both array and object-wrapped array responses
        const DescriptionData = (Array.isArray(data) ? data : data.data || []);
        
        setDescriptions(DescriptionData);
      } catch (error) {
        toast({
          title: 'Error',
          description: (error as Error).message || 'Could not fetch Descriptions.',
          variant: 'destructive',
        });
        setDescriptions([]); // Clear data on error
      } finally {
        setLoading(false);
      }
    };
    fetchDescriptions();
  }, [token]);

  // Filter Descriptions based on the search term (searches in question and answer)
  const filteredDescriptions = Descriptions.filter(Description =>
    Description.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    Description.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle the deletion of an Description
  const handleDelete = async (DescriptionId: string) => {
    if (window.confirm('Are you sure you want to delete this Description?')) {
      try {
        const res = await fetch(`https://6891d3e7447ff4f11fbdec9e.mockapi.io/api/party/${DescriptionId}`, {
          method: 'DELETE',
          headers: { 'accept': '*/*', 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          setDescriptions((prev) => prev.filter((Description) => Description._id !== DescriptionId));
          toast({
            title: 'Success',
            description: 'Description deleted successfully.',
          });
        } else {
          const errorData = await res.json();
          throw new Error(errorData.message || 'Failed to delete Description.');
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
  
  // Skeleton loader component for better UX
  const DescriptionCardSkeleton = () => (
    <Card>
      <CardHeader>
        <Skeleton className="h-5 w-3/4 mb-2" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
      </CardHeader>
      <CardContent>
        <div className="pt-4 border-t border-gray-100 flex space-x-2">
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
            <h1 className="text-3xl font-bold text-gray-900 mb-1">Description Management</h1>
            <p className="text-gray-600">Manage all your Frequently Asked Questions</p>
          </div>
          <Link to="/Description/create">
            <Button className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Create Description
            </Button>
          </Link>
        </div>

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search Descriptions by question or answer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-11"
            />
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => <DescriptionCardSkeleton key={i} />)}
          </div>
        ) : filteredDescriptions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDescriptions.map((Description) => (
              <Card key={Description._id} className="flex flex-col hover:shadow-lg transition-shadow duration-200">
                <CardHeader className="flex-grow">
                  <CardTitle className="text-lg leading-snug flex items-start gap-2">
                    <HelpCircle className="w-5 h-5 mt-0.5 text-indigo-600 flex-shrink-0" />
                    <span>{Description.question}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col justify-between">
                  <CardDescription className="text-sm line-clamp-3 mb-4">
                    {Description.answer || 'No answer provided.'}
                  </CardDescription>

                  <div className="pt-4 border-t border-gray-100">
                    <div className="flex space-x-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="flex-1"
                        onClick={() => navigate(`/Description/view/${Description._id}`)}
                      >
                        <Eye className="w-3 h-3 mr-1.5" />
                        View
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="flex-1"
                        onClick={() => navigate(`/Description/edit/${Description._id}`)}
                      >
                        <Edit className="w-3 h-3 mr-1.5" />
                        Edit
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 px-2"
                        onClick={() => handleDelete(Description._id)}
                      >
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
            <HelpCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? 'No Descriptions Found' : 'No Descriptions Created Yet'}
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              {searchTerm 
                ? 'Your search did not match any Descriptions. Try different keywords.' 
                : 'Get started by creating your first frequently asked question.'}
            </p>
            {!searchTerm && (
              <Link to="/Description/create">
                <Button className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Description
                </Button>
              </Link>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default DescriptionList;