
import { useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar as CalendarIcon, MapPin, Upload, Plus, X } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const CreateEvent = () => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    currency: '₹',
    location: '',
    date: '',
    time: '',
    hostName: '',
    hostImage: null as File | null,
    hostLocation: '',
    hostDescription: '',
    partnerName: '',
    partnerImage: null as File | null,
    partnerUrl: '',
    partnerDescription: '',
    partnerLocation: '',
    whatsIncluded: '',
    tags: [] as string[]
  });

  const [currentTag, setCurrentTag] = useState('');

  const availableTags = ['DJ', 'Party', 'Premium', 'VIP', 'Music', 'Dance', 'Food', 'Drinks', 'Outdoor', 'Indoor'];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (field: string, file: File | null) => {
    setFormData(prev => ({ ...prev, [field]: file }));
  };

  const addTag = (tag: string) => {
    if (tag && !formData.tags.includes(tag)) {
      setFormData(prev => ({ ...prev, tags: [...prev.tags, tag] }));
    }
    setCurrentTag('');
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({ ...prev, tags: prev.tags.filter(tag => tag !== tagToRemove) }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Event data:', formData);
    toast({
      title: "Event Created Successfully!",
      description: "Your event has been saved and is ready for review.",
    });
  };

  return (
    <DashboardLayout>
      <div className="p-8 max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Event</h1>
          <p className="text-gray-600">Fill in the details below to create your event listing.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Event Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CalendarIcon className="w-5 h-5 text-indigo-600" />
                <span>Event Details</span>
              </CardTitle>
              <CardDescription>Basic information about your event</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Event Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Enter event name"
                    className="h-11"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location *</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      placeholder="Event location"
                      className="pl-10 h-11"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Describe your event in detail..."
                  className="min-h-24"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="price">Price *</Label>
                  <div className="flex">
                    <Select value={formData.currency} onValueChange={(value) => handleInputChange('currency', value)}>
                      <SelectTrigger className="w-20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="₹">₹</SelectItem>
                        <SelectItem value="$">$</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      id="price"
                      type="number"
                      value={formData.price}
                      onChange={(e) => handleInputChange('price', e.target.value)}
                      placeholder="0"
                      className="flex-1 ml-2 h-11"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date">Date *</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => handleInputChange('date', e.target.value)}
                    className="h-11"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="time">Time *</Label>
                  <Input
                    id="time"
                    type="time"
                    value={formData.time}
                    onChange={(e) => handleInputChange('time', e.target.value)}
                    className="h-11"
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tags */}
          <Card>
            <CardHeader>
              <CardTitle>Event Tags</CardTitle>
              <CardDescription>Add tags to help users find your event</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {formData.tags.map(tag => (
                  <span key={tag} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-indigo-100 text-indigo-800">
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-2 text-indigo-600 hover:text-indigo-800"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                {availableTags.filter(tag => !formData.tags.includes(tag)).map(tag => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => addTag(tag)}
                    className="px-3 py-1 rounded-full text-sm border border-gray-300 hover:bg-gray-50 transition-colors"
                  >
                    <Plus className="w-3 h-3 inline mr-1" />
                    {tag}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Host Information */}
          <Card>
            <CardHeader>
              <CardTitle>Host Information</CardTitle>
              <CardDescription>Details about the event host</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="hostName">Host Name *</Label>
                  <Input
                    id="hostName"
                    value={formData.hostName}
                    onChange={(e) => handleInputChange('hostName', e.target.value)}
                    placeholder="Name of the host"
                    className="h-11"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hostLocation">Host Location</Label>
                  <Input
                    id="hostLocation"
                    value={formData.hostLocation}
                    onChange={(e) => handleInputChange('hostLocation', e.target.value)}
                    placeholder="Host's location"
                    className="h-11"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="hostDescription">Host Description</Label>
                <Textarea
                  id="hostDescription"
                  value={formData.hostDescription}
                  onChange={(e) => handleInputChange('hostDescription', e.target.value)}
                  placeholder="Brief description about the host..."
                  className="min-h-20"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hostImage">Host Image</Label>
                <Input
                  id="hostImage"
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange('hostImage', e.target.files?.[0] || null)}
                  className="h-11"
                />
              </div>
            </CardContent>
          </Card>

          {/* Partner Information */}
          <Card>
            <CardHeader>
              <CardTitle>Partner Information</CardTitle>
              <CardDescription>Details about event partners (optional)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="partnerName">Partner Name</Label>
                  <Input
                    id="partnerName"
                    value={formData.partnerName}
                    onChange={(e) => handleInputChange('partnerName', e.target.value)}
                    placeholder="Name of the partner"
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="partnerUrl">Partner Website</Label>
                  <Input
                    id="partnerUrl"
                    value={formData.partnerUrl}
                    onChange={(e) => handleInputChange('partnerUrl', e.target.value)}
                    placeholder="https://partner-website.com"
                    className="h-11"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="partnerLocation">Partner Location</Label>
                  <Input
                    id="partnerLocation"
                    value={formData.partnerLocation}
                    onChange={(e) => handleInputChange('partnerLocation', e.target.value)}
                    placeholder="Partner's location"
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="partnerImage">Partner Image</Label>
                  <Input
                    id="partnerImage"
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange('partnerImage', e.target.files?.[0] || null)}
                    className="h-11"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="partnerDescription">Partner Description</Label>
                <Textarea
                  id="partnerDescription"
                  value={formData.partnerDescription}
                  onChange={(e) => handleInputChange('partnerDescription', e.target.value)}
                  placeholder="Brief description about the partner..."
                  className="min-h-20"
                />
              </div>
            </CardContent>
          </Card>

          {/* What's Included */}
          <Card>
            <CardHeader>
              <CardTitle>What's Included</CardTitle>
              <CardDescription>Describe what attendees will get with their ticket</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="whatsIncluded">Include Details</Label>
                <Textarea
                  id="whatsIncluded"
                  value={formData.whatsIncluded}
                  onChange={(e) => handleInputChange('whatsIncluded', e.target.value)}
                  placeholder="• Welcome drink&#10;• Access to all areas&#10;• Complimentary snacks&#10;• Photo booth access"
                  className="min-h-32"
                />
                <p className="text-sm text-gray-500">You can use HTML formatting or markdown-style lists</p>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline" className="px-8">
              Save as Draft
            </Button>
            <Button type="submit" className="px-8 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700">
              Create Event
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default CreateEvent;
