
import { useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Edit, Trash2, Eye, Plus, Calendar, MapPin, DollarSign } from 'lucide-react';
import { Link } from 'react-router-dom';

const EventList = () => {
  const [searchTerm, setSearchTerm] = useState('');

  // Mock event data
  const events = [
    {
      id: 1,
      name: 'Summer Music Festival',
      description: 'A spectacular outdoor music festival featuring top artists from around the world.',
      price: 2500,
      currency: '₹',
      location: 'Mumbai, Maharashtra',
      date: '2024-07-15',
      time: '18:00',
      status: 'Published',
      tags: ['Music', 'Outdoor', 'Premium'],
      hostName: 'EventPro India',
      attendees: 1250
    },
    {
      id: 2,
      name: 'Tech Conference 2024',
      description: 'Annual technology conference bringing together industry leaders and innovators.',
      price: 1500,
      currency: '₹',
      location: 'Bangalore, Karnataka',
      date: '2024-08-02',
      time: '09:00',
      status: 'Draft',
      tags: ['Technology', 'Conference', 'Business'],
      hostName: 'TechEvents',
      attendees: 850
    },
    {
      id: 3,
      name: 'Food & Wine Expo',
      description: 'Culinary experience featuring gourmet food and premium wine tastings.',
      price: 3000,
      currency: '₹',
      location: 'Delhi, NCR',
      date: '2024-07-28',
      time: '19:30',
      status: 'Published',
      tags: ['Food', 'Wine', 'Premium', 'VIP'],
      hostName: 'Gourmet Events',
      attendees: 450
    },
    {
      id: 4,
      name: 'Art Gallery Opening',
      description: 'Contemporary art exhibition showcasing works from emerging local artists.',
      price: 800,
      currency: '₹',
      location: 'Pune, Maharashtra',
      date: '2024-07-20',
      time: '17:00',
      status: 'Published',
      tags: ['Art', 'Culture', 'Indoor'],
      hostName: 'Creative Spaces',
      attendees: 120
    }
  ];

  const filteredEvents = events.filter(event =>
    event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Published':
        return 'bg-green-100 text-green-800';
      case 'Draft':
        return 'bg-yellow-100 text-yellow-800';
      case 'Cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
              placeholder="Search events by name, location, or tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-12"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredEvents.map((event) => (
            <Card key={event.id} className="hover:shadow-lg transition-shadow duration-200">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start mb-2">
                  <CardTitle className="text-lg leading-tight">{event.name}</CardTitle>
                  <Badge className={`${getStatusColor(event.status)} text-xs`}>
                    {event.status}
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
                    <span>{new Date(event.date).toLocaleDateString('en-IN')} at {event.time}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <MapPin className="w-4 h-4 mr-2" />
                    <span>{event.location}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <DollarSign className="w-4 h-4 mr-2" />
                    <span className="font-medium">{event.currency}{event.price}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1">
                  {event.tags.slice(0, 3).map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {event.tags.length > 3 && (
                    <Badge variant="secondary" className="text-xs">
                      +{event.tags.length - 3}
                    </Badge>
                  )}
                </div>

                <div className="pt-2 border-t border-gray-100">
                  <div className="flex justify-between items-center text-sm text-gray-600 mb-3">
                    <span>Hosted by {event.hostName}</span>
                    <span>{event.attendees} attendees</span>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline" className="flex-1">
                      <Eye className="w-3 h-3 mr-1" />
                      View
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1">
                      <Edit className="w-3 h-3 mr-1" />
                      Edit
                    </Button>
                    <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredEvents.length === 0 && (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No events found</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm ? 'Try adjusting your search terms' : 'Get started by creating your first event'}
            </p>
            <Link to="/events/create">
              <Button className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700">
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Event
              </Button>
            </Link>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default EventList;
