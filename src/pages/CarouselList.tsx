import React, { useState, useEffect } from 'react';
import { 
  Image, 
  
  EyeOff, 
  Plus, 
  RefreshCw, 
  Calendar,
  Loader2,
  AlertCircle,
  CheckCircle2,
  
} from 'lucide-react';
import { GiCarousel } from "react-icons/gi";
import DashboardLayout from '@/components/DashboardLayout';
import { Link } from 'react-router-dom';

interface CarouselItem {
  _id: string;
  imageUrl: string;
  title: string;
  description: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface ApiResponse {
  statusCode: number;
  message: string;
  data: CarouselItem[];
}

const CarouselList: React.FC = () => {
  const [carouselItems, setCarouselItems] = useState<CarouselItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchCarouselItems = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('https://api.partywalah.in/api/admin/carousel', {
        method: 'GET',
        headers: {
          'accept': '*/*',
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
      }

      const result: ApiResponse = await response.json();
      setCarouselItems(result.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  useEffect(() => {
    fetchCarouselItems();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="flex items-center gap-2 text-gray-600">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Loading carousel items...</span>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout>
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <GiCarousel className="w-8 h-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Carousel Management</h1>
            <p className="text-gray-600">{carouselItems.length} items found</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchCarouselItems}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Link
  to="/carousel/create" 
 
>
            <Plus className="w-4 h-4" />
            Add New
            </Link>
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <span className="text-red-700">{error}</span>
        </div>
      )}

      {/* Carousel Items Grid */}
      {carouselItems.length === 0 ? (
        <div className="text-center py-12">
          <Image className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-600 mb-2">No carousel items found</h3>
          <p className="text-gray-500">Create your first carousel item to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {carouselItems.map((item) => (
            <div key={item._id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              {/* Image */}
              <div className="relative h-48 bg-gray-100">
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik04IDEwSDE2VjE0SDhaIiBmaWxsPSIjOUNBM0FGIi8+Cjwvc3ZnPgo=';
                  }}
                />
                {/* Active Status Badge */}
                <div className={`absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-medium ${
                  item.isActive 
                    ? 'bg-green-100 text-green-800 border border-green-200'
                    : 'bg-red-100 text-red-800 border border-red-200'
                }`}>
                  {item.isActive ? 'Active' : 'Inactive'}
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2">{item.title}</h3>
                <p className="text-gray-600 text-sm mb-3 line-clamp-3">{item.description}</p>
                
                {/* Date */}
                <div className="flex items-center gap-1 text-xs text-gray-500 mb-4">
                  <Calendar className="w-3 h-3" />
                  <span>Created: {formatDate(item.createdAt)}</span>
                </div>

                
                   
                </div>
              </div>
            
          ))}
        </div>
      )}

      {/* Stats Footer */}
      {carouselItems.length > 0 && (
        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <span>Active: {carouselItems.filter(item => item.isActive).length}</span>
              </div>
              <div className="flex items-center gap-2">
                <EyeOff className="w-4 h-4 text-gray-400" />
                <span>Inactive: {carouselItems.filter(item => !item.isActive).length}</span>
              </div>
            </div>
            <span>Total: {carouselItems.length} items</span>
          </div>
        </div>
      )}
    </div>
    </DashboardLayout>
  );
};

export default CarouselList;