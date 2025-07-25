// src/pages/EventList.tsx (or wherever your component resides)

import { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Edit, Trash2, Eye, Plus, Calendar, MapPin, DollarSign } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from '@/components/ui/pagination'; // Import the new component

// A simple debounce hook
const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
};

const EventList = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  
  const navigate = useNavigate();
  const ITEMS_PER_PAGE = 9;

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const url = new URL('https://api.partywalah.in/api/admin/events');
      url.searchParams.append('page', String(currentPage));
      url.searchParams.append('limit', String(ITEMS_PER_PAGE));
      if (debouncedSearchTerm) {
        url.searchParams.append('search', debouncedSearchTerm); // Assuming backend supports a 'search' query parameter
      }

      const res = await fetch(url.toString(), {
        headers: { 'accept': '*/*' } // Note: Add Authorization header if needed
      });
      if (!res.ok) throw new Error('Failed to fetch events');
      
      const data = await res.json();
      setEvents(data.data || []);
      setTotalPages(data.totalPages || 1);
    } catch (error) {
      console.error("Fetch error:", error);
      setEvents([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [currentPage, debouncedSearchTerm]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // Reset to page 1 when search term changes
  useEffect(() => {
    if (debouncedSearchTerm !== searchTerm) {
       setCurrentPage(1);
    }
  }, [debouncedSearchTerm, searchTerm]);


  const handleDelete = async (eventId: string) => {
    if (!window.confirm('Are you sure you want to delete this event?')) return;

    try {
      const endpoint = `https://api.partywalah.in/api/admin/event/${eventId}`;
      const res = await fetch(endpoint, {
        method: 'DELETE',
        headers: { 'accept': '*/*' }, // Note: Add Authorization header if needed
      });
      
      if (res.ok) {
        // If the last item on a page is deleted, go to the previous page
        if (events.length === 1 && currentPage > 1) {
          setCurrentPage(currentPage - 1);
        } else {
          // Otherwise, just refetch the current page
          fetchEvents();
        }
      } else {
        alert('Failed to delete event. Server responded with an error.');
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete event. An unexpected error occurred.');
    }
  };


  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'approved': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'complete': return 'bg-green-100 text-green-800';
      case 'expired': return 'bg-gray-300 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <DashboardLayout>
      <div className="p-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Event Management</h1>
            <p className="text-gray-600">Manage all your events in one place</p>
          </div>
          <Link to="/events/create">
            <Button className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Create Event
            </Button>
          </Link>
        </div>

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-12"
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading events...</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {events.map((event) => (
                <Card key={event._id} className="hover:shadow-lg transition-shadow duration-200">
  {event.image && (
    <div className="w-full h-48 bg-gray-100 rounded-t-lg overflow-hidden flex items-center justify-center">
      <img
        src={event.image}
        alt={event.title}
        className="object-cover w-full h-full"
        loading="lazy"
        onError={e => (e.currentTarget.style.display = 'none')}
      />
    </div>
  )}
  <CardHeader className="pb-3">
    <div className="flex justify-between items-start mb-2">
      <div>
        <CardTitle className="text-lg leading-tight">{event.title}</CardTitle>
        <div className="text-xs text-gray-500 mt-1">Type: {event.name?.name}</div>
      </div>
      <Badge className={`${getStatusColor(event.status)} text-xs`}>
        {event.status || 'Pending'}
      </Badge>
    </div>
    <CardDescription className="text-sm line-clamp-2">
      {event.description}
    </CardDescription>
  </CardHeader>
  <CardContent className="space-y-4">
    <div className="space-y-2 text-sm">
      <div className="flex items-center text-gray-600">
        <Calendar className="w-4 h-4 mr-2" />
        <span>{new Date(event.startDate).toLocaleDateString('en-IN')}</span>
      </div>
      <div className="flex items-center text-gray-600">
        <MapPin className="w-4 h-4 mr-2" />
        <span>{event.location}</span>
      </div>
      <div className="flex items-center text-gray-600">
        <DollarSign className="w-4 h-4 mr-2" />
        <span className="font-medium">{event.currency || '₹'}{event.price}</span>
      </div>
    </div>

    <div className="flex flex-wrap gap-1">
      {/* --- THIS IS THE CORRECTED LINE --- */}
      {(event.tags || []).slice(0, 3).map((tag) => (
        <Badge key={tag} variant="secondary" className="text-xs">
          {tag}
        </Badge>
      ))}
      {(event.tags || []).length > 3 && (
        <Badge variant="secondary" className="text-xs">
          +{(event.tags || []).length - 3}
        </Badge>
      )}
    </div>

    <div className="pt-2 border-t border-gray-100">
      <div className="flex justify-between items-center text-sm text-gray-600 mb-3">
        <span>Hosted by {event.hostedBy?.name}</span>
        <span>{event.numberOfGuests} guests</span>
      </div>
      
      <div className="flex space-x-2">
        <Button size="sm" variant="outline" className="flex-1" onClick={() => navigate(`/events/view/${event._id}`)}>
          <Eye className="w-3 h-3 mr-1" />
          View
        </Button>
        <Button size="sm" variant="outline" className="flex-1" onClick={() => navigate(`/events/edit/${event._id}`)}>
          <Edit className="w-3 h-3 mr-1" />
          Edit
        </Button>
        <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => handleDelete(event._id)}>
          <Trash2 className="w-3 h-3" />
        </Button>
      </div>
    </div>
  </CardContent>
</Card>
              ))}
            </div>

            {events.length === 0 && (
              <div className="text-center py-12 col-span-full">
                <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No events found</h3>
                <p className="text-gray-600 mb-6">
                  {searchTerm ? 'Try adjusting your search terms, or clear the search.' : 'Get started by creating your first event.'}
                </p>
              </div>
            )}

            {totalPages > 1 && (
              <div className="mt-8">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious href="#" onClick={(e) => { e.preventDefault(); setCurrentPage(p => Math.max(1, p - 1)); }} className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''} />
                    </PaginationItem>
                    
                    {/* Add page number logic here if needed */}

                    <PaginationItem>
                      <PaginationNext href="#" onClick={(e) => { e.preventDefault(); setCurrentPage(p => Math.min(totalPages, p + 1)); }} className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''} />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default EventList;