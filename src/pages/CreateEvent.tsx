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
    whatsIncluded: [''], // Change from string to array of strings
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

  // Handler for changing a single included item
  const handleIncludedChange = (idx: number, value: string) => {
    setFormData(prev => {
      const updated = [...prev.whatsIncluded];
      updated[idx] = value;
      return { ...prev, whatsIncluded: updated };
    });
  };

  // Handler to add a new included item
  const addIncludedItem = () => {
    setFormData(prev => ({ ...prev, whatsIncluded: [...prev.whatsIncluded, ''] }));
  };

  // Handler to remove an included item
  const removeIncludedItem = (idx: number) => {
    setFormData(prev => {
      const updated = prev.whatsIncluded.filter((_, i) => i !== idx);
      return { ...prev, whatsIncluded: updated.length ? updated : [''] };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Event data:', formData);
    toast({
      title: "Event Created Successfully!",
      description: "Your event has been saved and is ready for review.",
    });
  };

  // Entry Requirement Types
  interface EntryRequirementString {
    type: 'string';
    title: string;
    description: string;
  }
  interface EntryRequirementArray {
    type: 'array';
    title: string;
    items: string[];
  }
  type EntryRequirement = EntryRequirementString | EntryRequirementArray;

  // Add to your useState at the top:
  const [entryRequirements, setEntryRequirements] = useState<EntryRequirement[]>([
    { type: 'string', title: '', description: '' }
  ]);
  const [entryType, setEntryType] = useState<'string' | 'array'>('string');

  // Section enable/disable states
  const [enabledSections, setEnabledSections] = useState({
    eventDetails: true,
    tags: true,
    host: true,
    partner: true,
    whatsIncluded: true,
    entryRequirements: true,
  });
  const handleSectionToggle = (section: keyof typeof enabledSections) => {
    setEnabledSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  // Handlers for Entry Requirements
  const handleEntryTypeChange = (type: 'string' | 'array') => {
    setEntryType(type);
    setEntryRequirements(prev => {
      // If only one and it's the default, switch its type
      if (prev.length === 1 && ((type === 'string' && prev[0].type === 'array') || (type === 'array' && prev[0].type === 'string'))) {
        return [
          type === 'string'
            ? { type: 'string', title: '', description: '' }
            : { type: 'array', title: '', items: [''] }
        ];
      }
      return prev;
    });
  };

  const handleEntryChange = (idx: number, field: string, value: string) => {
    setEntryRequirements(prev => prev.map((req, i) => {
      if (i !== idx) return req;
      if (req.type === 'string') {
        return { ...req, [field]: value };
      } else {
        if (field === 'title') return { ...req, title: value };
        return req;
      }
    }));
  };

  const handleEntryArrayItemChange = (idx: number, itemIdx: number, value: string) => {
    setEntryRequirements(prev => prev.map((req, i) => {
      if (i !== idx || req.type !== 'array') return req;
      const items = [...req.items];
      items[itemIdx] = value;
      return { ...req, items };
    }));
  };

  const addEntryRequirement = () => {
    setEntryRequirements(prev => [
      ...prev,
      entryType === 'string'
        ? { type: 'string', title: '', description: '' }
        : { type: 'array', title: '', items: [''] }
    ]);
  };

  const addEntryArrayItem = (idx: number) => {
    setEntryRequirements(prev => prev.map((req, i) => {
      if (i !== idx || req.type !== 'array') return req;
      return { ...req, items: [...req.items, ''] };
    }));
  };

  const removeEntryRequirement = (idx: number) => {
    setEntryRequirements(prev => prev.filter((_, i) => i !== idx));
  };

  const removeEntryArrayItem = (idx: number, itemIdx: number) => {
    setEntryRequirements(prev => prev.map((req, i) => {
      if (i !== idx || req.type !== 'array') return req;
      const items = req.items.filter((_, j) => j !== itemIdx);
      return { ...req, items: items.length ? items : [''] };
    }));
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
              <div className="flex items-center gap-2">
                <input type="checkbox" checked={enabledSections.eventDetails} onChange={() => handleSectionToggle('eventDetails')} />
                <CardTitle className="flex items-center space-x-2">
                  <CalendarIcon className="w-5 h-5 text-indigo-600" />
                  <span>Event Details</span>
                </CardTitle>
              </div>
              <CardDescription>Basic information about your event</CardDescription>
            </CardHeader>
            {enabledSections.eventDetails && (
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
            )}
          </Card>

          {/* Tags */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <input type="checkbox" checked={enabledSections.tags} onChange={() => handleSectionToggle('tags')} />
                <CardTitle>Event Tags</CardTitle>
              </div>
              <CardDescription>Add tags to help users find your event</CardDescription>
            </CardHeader>
            {enabledSections.tags && (
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
            )}
          </Card>

          {/* Host Information */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <input type="checkbox" checked={enabledSections.host} onChange={() => handleSectionToggle('host')} />
                <CardTitle>Host Information</CardTitle>
              </div>
              <CardDescription>Details about the event host</CardDescription>
            </CardHeader>
            {enabledSections.host && (
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
            )}
          </Card>

          {/* Partner Information */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <input type="checkbox" checked={enabledSections.partner} onChange={() => handleSectionToggle('partner')} />
                <CardTitle>Partner Information</CardTitle>
              </div>
              <CardDescription>Details about event partners (optional)</CardDescription>
            </CardHeader>
            {enabledSections.partner && (
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
            )}
          </Card>

          {/* What's Included */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <input type="checkbox" checked={enabledSections.whatsIncluded} onChange={() => handleSectionToggle('whatsIncluded')} />
                <CardTitle>What's Included</CardTitle>
              </div>
              <CardDescription>Describe what attendees will get with their ticket</CardDescription>
            </CardHeader>
            {enabledSections.whatsIncluded && (
              <CardContent>
                <div className="space-y-2">
                  <Label>Include Details</Label>
                  <div className="space-y-3">
                    {formData.whatsIncluded.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 text-emerald-600">
                          <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                        </span>
                        <Input
                          value={item}
                          onChange={e => handleIncludedChange(idx, e.target.value)}
                          placeholder="e.g. VIP entrance"
                          className="flex-1 h-11"
                        />
                        {formData.whatsIncluded.length > 1 && (
                          <button type="button" onClick={() => removeIncludedItem(idx)} className="text-gray-400 hover:text-red-500">
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                    <button type="button" onClick={addIncludedItem} className="flex items-center gap-1 text-emerald-600 hover:text-emerald-800 font-medium mt-1">
                      <Plus className="w-4 h-4" /> Add another
                    </button>
                  </div>
                  <p className="text-sm text-gray-500">Add each included item as a separate point</p>
                </div>
              </CardContent>
            )}
          </Card>

          {/* Entry Requirements */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <input type="checkbox" checked={enabledSections.entryRequirements} onChange={() => handleSectionToggle('entryRequirements')} />
                <CardTitle>Entry Requirements</CardTitle>
              </div>
              <CardDescription>Specify entry requirements for your event</CardDescription>
            </CardHeader>
            {enabledSections.entryRequirements && (
              <CardContent>
                <div className="mb-4 flex gap-4">
                  <Label>Type:</Label>
                  <Button
                    type="button"
                    variant={entryType === 'string' ? 'default' : 'outline'}
                    onClick={() => handleEntryTypeChange('string')}
                  >
                    Single Description
                  </Button>
                  <Button
                    type="button"
                    variant={entryType === 'array' ? 'default' : 'outline'}
                    onClick={() => handleEntryTypeChange('array')}
                  >
                    List
                  </Button>
                </div>
                {entryRequirements.map((req, idx) => (
                  <div key={idx} className="mb-6 border-b pb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Input
                        value={req.title}
                        onChange={e => handleEntryChange(idx, 'title', e.target.value)}
                        placeholder="Section Title (e.g. Costume Code, Party Rules)"
                        className="flex-1"
                      />
                      {entryRequirements.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeEntryRequirement(idx)}
                          className="text-gray-400 hover:text-red-500"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    {req.type === 'string' ? (
                      <Textarea
                        value={req.description}
                        onChange={e => handleEntryChange(idx, 'description', e.target.value)}
                        placeholder="Description"
                        className="mb-2"
                      />
                    ) : (
                      <div className="space-y-2">
                        {req.items.map((item, itemIdx) => (
                          <div key={itemIdx} className="flex items-center gap-2">
                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-200 text-gray-700">
                              <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/><text x="12" y="16" textAnchor="middle" fontSize="14" fill="currentColor" fontFamily="Arial" fontWeight="bold">i</text></svg>
                            </span>
                            <Input
                              value={item}
                              onChange={e => handleEntryArrayItemChange(idx, itemIdx, e.target.value)}
                              placeholder="Rule or requirement"
                              className="flex-1"
                            />
                            {req.items.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeEntryArrayItem(idx, itemIdx)}
                                className="text-gray-400 hover:text-red-500"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => addEntryArrayItem(idx)}
                          className="flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-medium mt-1"
                        >
                          <Plus className="w-4 h-4" /> Add Rule
                        </button>
                      </div>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  onClick={addEntryRequirement}
                  className="mt-2"
                  variant="outline"
                >
                  <Plus className="w-4 h-4 mr-1" /> Add Entry Requirement
                </Button>
              </CardContent>
            )}
          </Card>

          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline" className="px-8">
              Save as Draft
            </Button>
            <Button type="submit" className="px-8 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white">
              Create Event
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default CreateEvent;
