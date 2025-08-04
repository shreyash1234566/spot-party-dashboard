// ============================================================================
// Imports
// ============================================================================
import { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { Calendar as CalendarIcon, MapPin, Plus, X } from 'lucide-react';

// ============================================================================
// Component Definition
// ============================================================================
const CreateEvent = () => {
  // ============================================================================
  // State Management
  // ============================================================================
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    currency: '₹',
    location: '',
    startDate: '',
    time: '',
    numberOfGuests: '',
    hostName: '',
    hostImage: null as File | null,
    hostImageUrl: '',
    hostLocation: '',
    hostDescription: '',
    partnerName: '',
    partnerImage: null as File | null,
    partnerImageUrl: '',
    partnerUrl: '',
    partnerDescription: '',
    partnerLocation: '',
    eventType: '',
    eventSubType: '',
    theme: '', 
    whatsIncluded: [''],
    tags: [] as string[],
    venueType: '',
    venueTypeName: '',
    foodPreferences: '',
    foodPreferencesName: '',
    specialRequirements: '',
    eventImage: null as File | null,
    eventImageUrl: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentTag, setCurrentTag] = useState('');
  const availableTags = ['DJ', 'Party', 'Premium', 'VIP', 'Music', 'Dance', 'Food', 'Drinks', 'Outdoor', 'Indoor'];

  // Card entry state
  const [cardEntry, setCardEntry] = useState<{ title: string; data: string }>({ title: '', data: '' });

  // Entry requirements state
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

  const [entryRequirements, setEntryRequirements] = useState<EntryRequirement[]>([]);
  const [entryType, setEntryType] = useState<'string' | 'array'>('string');

  // Section visibility
  const [enabledSections, setEnabledSections] = useState({
    eventType: true,
    eventSubType: true,
    eventDetails: true,
    tags: true,
    host: true,
    partner: true,
    whatsIncluded: true,
    entryRequirements: true,
  });

  // --- UPDATED: Metadata state with Theme ---
  interface ThemeMeta {
    _id: string;
    name: string;
    description: string;
  }
  interface EventTypeMeta {
    _id: string;
    name: string;
  }
  interface EventSubTypeMeta {
    _id: string;
    name: string;
    parent: string;
  }
  interface EventMeta {
    venues: any[];
    foodPrefs: any[];
    eventType: EventTypeMeta[];
    eventSubType: EventSubTypeMeta[];
    theme: ThemeMeta[];
  }

  const [meta, setMeta] = useState<EventMeta | null>(null);
  const filteredSubTypes = meta?.eventSubType?.filter((sub) => sub.parent === formData.eventType) || [];

  // ============================================================================
  // Handlers and Logic
  // ============================================================================
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (field: string, file: File | null) => {
    setFormData(prev => ({ ...prev, [field]: file }));
  };

  // Tag handlers
  const addTag = (tag: string) => {
    const trimmedTag = tag.trim();
    if (trimmedTag && !formData.tags.includes(trimmedTag)) {
      setFormData(prev => ({ ...prev, tags: [...prev.tags, trimmedTag] }));
    }
    setCurrentTag('');
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  // What's included handlers
  const handleIncludedChange = (idx: number, value: string) => {
    setFormData(prev => {
      const updated = [...prev.whatsIncluded];
      updated[idx] = value;
      return { ...prev, whatsIncluded: updated };
    });
  };

  const addIncludedItem = () => {
    setFormData(prev => ({ ...prev, whatsIncluded: [...prev.whatsIncluded, ''] }));
  };

  const removeIncludedItem = (idx: number) => {
    setFormData(prev => {
      const updated = prev.whatsIncluded.filter((_, i) => i !== idx);
      return { ...prev, whatsIncluded: updated.length ? updated : [''] };
    });
  };

  // Entry requirement handlers
  const handleCardEntryChange = (field: 'title' | 'data', value: string) => {
    setCardEntry(prev => ({ ...prev, [field]: value }));
  };

  const handleEntryTypeChange = (type: 'string' | 'array', idx: number) => {
    setEntryRequirements(prev => prev.map((req, i) => {
      if (i !== idx) return req;
      return type === 'string'
        ? { type: 'string', title: '', description: '' }
        : { type: 'array', title: '', items: [''] };
    }));
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

  const handleSectionToggle = (section: keyof typeof enabledSections) => {
    setEnabledSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  // Image upload
  const uploadImageAndGetUrl = async (file: File | null, label?: string): Promise<string> => {
    if (!file) return '';
    const formData = new FormData();
    formData.append('file', file);
    try {
      const { apiFetch } = await import('../lib/api');
      const response = await apiFetch('https://api.partywalah.in/api/admin/file-upload', {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) throw new Error('Image upload failed');
      const data = await response.json();
      const url = data?.data?.url || '';
      if (label) {
        console.log(`${label} uploaded URL:`, url);
      }
      return url;
    } catch (err) {
      console.error('Image upload error:', err);
      return '';
    }
  };

  // ============================================
  // Form submission (WITH CORRECTED PAYLOAD)
  // ============================================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const selectedEventType = meta?.eventType.find(type => type._id === formData.eventType);
      const selectedSubType = meta?.eventSubType.find(sub => sub._id === formData.eventSubType);
      const venueType = formData.venueType ? [{ id: formData.venueType, name: formData.venueTypeName || '' }] : [];
      const foodPreferences = formData.foodPreferences ? [{ id: formData.foodPreferences, name: formData.foodPreferencesName || '' }] : [];

      const entryReqPayload: Array<{
          type: string;
          title: string;
          description: string;
          list: string[];
        }> = [];

      if (cardEntry.title.trim()) {
        entryReqPayload.push({
            type: 'Card Entry',
            title: cardEntry.title,
            description: cardEntry.data,
            list: [],
        });
      }

      entryRequirements.forEach((req) => {
        if (!req.title.trim()) return;
        if (req.type === 'string') {
          entryReqPayload.push({
            type: req.type,
            title: req.title,
            description: req.description,
            list: [],
          });
        } else if (req.type === 'array') {
          const filteredItems = req.items.filter(item => item.trim() !== '');
          if (filteredItems.length > 0) {
            entryReqPayload.push({
              type: req.type,
              title: req.title,
              description: '',
              list: filteredItems,
            });
          }
        }
      });

      // --- CORRECTED PAYLOAD ---
      const apiData: any = {
        name: {
          id: formData.eventType,
          name: selectedEventType?.name || '',
        },
        subType: selectedSubType ? [{ id: selectedSubType._id, name: selectedSubType.name }] : undefined,
        startDate: formData.startDate && formData.time
          ? new Date(`${formData.startDate}T${formData.time}`).toISOString()
          : new Date(formData.startDate).toISOString(),
        endDate: formData.startDate && formData.time
          ? new Date(`${formData.startDate}T${formData.time}`).toISOString()
          : new Date(formData.startDate).toISOString(),
        numberOfGuests: formData.numberOfGuests ? parseInt(formData.numberOfGuests) : undefined,
        venueType: venueType.length > 0 ? venueType : undefined,
        foodPreferences: foodPreferences.length > 0 ? foodPreferences : undefined,
        specialRequirements: formData.specialRequirements || undefined,
        
        title: formData.name,
        image: formData.eventImageUrl || undefined,
        description: formData.description || undefined,
        
        // --- THIS IS THE FIX ---
        themeIds: formData.theme ? [formData.theme] : [],
        // -----------------------
        
        price: formData.price ? parseFloat(formData.price) : undefined,
        location: formData.location || undefined,
        tags: formData.tags.length ? formData.tags : undefined,
        whatsIncluded: formData.whatsIncluded.filter(item => item.trim()),
        hostedBy: formData.hostName ? {
          image: formData.hostImageUrl || undefined,
          name: formData.hostName,
          location: formData.hostLocation || undefined,
          description: formData.hostDescription || undefined
        } : undefined,
        partneredBy: formData.partnerName ? {
          image: formData.partnerImageUrl || undefined,
          name: formData.partnerName,
          location: formData.partnerLocation || undefined,
          description: formData.partnerDescription || undefined,
          url: formData.partnerUrl || undefined,
        } : undefined,
        entryRequirements: entryReqPayload.length > 0 ? entryReqPayload : undefined,
      };

      console.groupCollapsed('🚀 Sending Data to API...');
      console.log('Event Title:', apiData.title);
      console.log('✅ Main Event Image URL:', apiData.image);
      console.log('🎨 Theme IDs:', apiData.themeIds);
      console.log('Host Info:', apiData.hostedBy);
      console.log('Partner Info:', apiData.partneredBy);
      console.log('Entry Requirements:', apiData.entryRequirements);
      console.log('--- Full Payload Below ---');
      console.log(JSON.stringify(apiData, null, 2));
      console.groupEnd();

      const { apiFetch } = await import('../lib/api');
      const response = await apiFetch('https://api.partywalah.in/api/admin/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create event');
      }

      await response.json();
      toast({
        title: "Event Created Successfully!",
        description: "Your event has been saved and is ready for review.",
      });

    } catch (error) {
      console.error('Error creating event:', error);
      toast({
        title: "Error Creating Event",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };


  // Fetch metadata
  useEffect(() => {
    import('../lib/api').then(({ apiFetch }) => {
      apiFetch('https://api.partywalah.in/api/events/get-event-meta')
        .then(res => {
          if (!res.ok) throw new Error('Network response was not ok');
          return res.json();
        })
        .then((data) => {
          console.log('Event metadata:', data);
          setMeta(data as EventMeta);
        })
        .catch(err => console.error('Failed to fetch metadata:', err));
    });
  }, []);

  // ============================================================================
  // JSX Rendering
  // ============================================================================
  return (
    <DashboardLayout>
      <div className="p-8 max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Event</h1>
          <p className="text-gray-600">Fill in the details below to create your event listing.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* Event Type Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <input type="checkbox" checked={enabledSections.eventType} onChange={() => handleSectionToggle('eventType')} />
                <CardTitle>Event type</CardTitle>
              </div>
              <CardDescription>Describe the type of event</CardDescription>
            </CardHeader>
            <CardContent>
              <Label htmlFor="eventType">Event Type *</Label>
              {meta && meta.eventType ? (
                <Select
                  value={formData.eventType}
                  onValueChange={value => handleInputChange('eventType', value)}
                  required
                >
                  <SelectTrigger className="w-full h-11">
                    <SelectValue placeholder="Select event type" />
                  </SelectTrigger>
                  <SelectContent>
                    {meta.eventType.map((type) => (
                      <SelectItem key={type._id} value={type._id}>{type.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Select disabled>
                  <SelectTrigger className="w-full h-11">
                    <SelectValue placeholder="Loading event types..." />
                  </SelectTrigger>
                </Select>
              )}
            </CardContent>
          </Card>
          
          {/* Event Subtype Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <input type="checkbox" checked={enabledSections.eventSubType} onChange={() => handleSectionToggle('eventSubType')} />
                <CardTitle>Event Subtype</CardTitle>
              </div>
              <CardDescription>Select a subtype for the selected event type</CardDescription>
            </CardHeader>
            {enabledSections.eventSubType && (
              <CardContent>
                <Label htmlFor="eventSubType">Event Subtype</Label>
                <Select
                  value={formData.eventSubType}
                  onValueChange={(value) => handleInputChange('eventSubType', value)}
                  disabled={!formData.eventType || filteredSubTypes.length === 0}
                >
                  <SelectTrigger className="w-full h-11">
                    <SelectValue placeholder={
                      formData.eventType
                        ? (filteredSubTypes.length ? "Select event subtype" : "No subtypes available")
                        : "Select event type first"
                    } />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredSubTypes.map((sub) => (
                      <SelectItem key={sub._id} value={sub._id}>
                        {sub.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            )}
          </Card>

          {/* Theme Section */}
          <Card>
            <CardHeader>
                <CardTitle>Event Theme</CardTitle>
                <CardDescription>Select a theme for your event (optional).</CardDescription>
            </CardHeader>
            <CardContent>
                <Label htmlFor="theme">Theme</Label>
                {meta && meta.theme ? (
                <Select
                    value={formData.theme}
                    onValueChange={value => handleInputChange('theme', value)}
                >
                    <SelectTrigger className="w-full h-11">
                    <SelectValue placeholder="Select a theme" />
                    </SelectTrigger>
                    <SelectContent>
                    {meta.theme.map((theme) => (
                        <SelectItem key={theme._id} value={theme._id}>{theme.name}</SelectItem>
                    ))}
                    </SelectContent>
                </Select>
                ) : (
                <Select disabled>
                    <SelectTrigger className="w-full h-11">
                    <SelectValue placeholder="Loading themes..." />
                    </SelectTrigger>
                </Select>
                )}
            </CardContent>
          </Card>


          {/* Basic Event Details Section */}
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
                    <Label htmlFor="description">Event Description *</Label>
                    <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Enter event description"
                    className="min-h-24"
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
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="space-y-2">
                    <Label htmlFor="price">Price *</Label>
                    <div className="flex">
                    <Select value={formData.currency} onValueChange={(value) => handleInputChange('currency', value)}>
                        <SelectTrigger className="w-20"><SelectValue /></SelectTrigger>
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
                    <Label htmlFor="numberOfGuests">Number of Guests *</Label>
                    <Input
                    id="numberOfGuests"
                    type="number"
                    value={formData.numberOfGuests}
                    onChange={(e) => handleInputChange('numberOfGuests', e.target.value)}
                    placeholder="0"
                    className="h-11"
                    required
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="startDate">Date *</Label>
                    <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => handleInputChange('startDate', e.target.value)}
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
          
          <Card>
            <CardHeader>
              <CardTitle>Event Image</CardTitle>
              <CardDescription>Upload the main image for your event. This is required.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="eventImage">Event Image *</Label>
                <Input
                  id="eventImage"
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0] || null;
                    setFormData((prev) => ({ ...prev, eventImage: file }));
                    if (file) {
                      const url = await uploadImageAndGetUrl(file, 'Event Image');
                      setFormData((prev) => ({ ...prev, eventImageUrl: url }));
                    } else {
                      setFormData((prev) => ({ ...prev, eventImageUrl: '' }));
                    }
                  }}
                  className="h-11"
                  required
                />
                {formData.eventImageUrl && (
                  <div className="mt-2">
                    <img src={formData.eventImageUrl} alt="Event" className="w-48 h-32 object-cover rounded shadow" />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
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
                <div className="flex items-center gap-2 mt-2">
                  <Input
                    value={currentTag}
                    onChange={e => setCurrentTag(e.target.value)}
                    placeholder="Add custom tag"
                    className="h-9 w-40"
                    onKeyDown={e => { 
                      if (e.key === 'Enter') { 
                        e.preventDefault(); 
                        addTag(currentTag); 
                      } 
                    }}
                  />
                  <Button 
                    type="button" 
                    size="sm" 
                    onClick={() => addTag(currentTag)}
                    disabled={!currentTag.trim() || formData.tags.includes(currentTag.trim())}
                  >
                    Add
                  </Button>
                </div>
                <p className="text-sm text-gray-500">Select from suggestions or add your own tags.</p>
              </CardContent>
            )}
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <input type="checkbox" checked={enabledSections.host} onChange={() => handleSectionToggle('host')} />
                <CardTitle>Host Information</CardTitle>
              </div>
              <CardDescription>Details about the event host (optional)</CardDescription>
            </CardHeader>
            {enabledSections.host && (
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="hostName">Host Name</Label>
                      <Input id="hostName" value={formData.hostName} onChange={(e) => handleInputChange('hostName', e.target.value)} placeholder="Name of the host" className="h-11" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="hostLocation">Host Location</Label>
                      <Input id="hostLocation" value={formData.hostLocation} onChange={(e) => handleInputChange('hostLocation', e.target.value)} placeholder="Host's location" className="h-11" />
                    </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="hostImage">Host Image</Label>
                    <Input
                      id="hostImage"
                      type="file"
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files?.[0] || null;
                        setFormData((prev) => ({ ...prev, hostImage: file }));
                        if (file) {
                          const url = await uploadImageAndGetUrl(file, 'Host image');
                          setFormData((prev) => ({ ...prev, hostImageUrl: url }));
                        } else {
                          setFormData((prev) => ({ ...prev, hostImageUrl: '' }));
                        }
                      }}
                      className="h-11"
                    />
                    {formData.hostImageUrl && (
                      <div className="mt-2">
                        <img src={formData.hostImageUrl} alt="Host" className="w-32 h-32 object-cover rounded-full shadow" />
                      </div>
                    )}
                </div>
              </CardContent>
            )}
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <input type="checkbox" checked={enabledSections.partner} onChange={() => handleSectionToggle('partner')} />
                <CardTitle>Partner Information</CardTitle>
              </div>
              <CardDescription>Details about the event partner (optional)</CardDescription>
            </CardHeader>
            {enabledSections.partner && (
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="partnerName">Partner Name</Label>
                      <Input id="partnerName" value={formData.partnerName} onChange={(e) => handleInputChange('partnerName', e.target.value)} placeholder="Name of the partner" className="h-11" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="partnerLocation">Partner Location</Label>
                      <Input id="partnerLocation" value={formData.partnerLocation} onChange={(e) => handleInputChange('partnerLocation', e.target.value)} placeholder="Partner's location" className="h-11" />
                    </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="partnerImage">Partner Image</Label>
                    <Input
                      id="partnerImage"
                      type="file"
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files?.[0] || null;
                        setFormData((prev) => ({ ...prev, partnerImage: file }));
                        if (file) {
                          const url = await uploadImageAndGetUrl(file, 'Partner image');
                          setFormData((prev) => ({ ...prev, partnerImageUrl: url }));
                        } else {
                          setFormData((prev) => ({ ...prev, partnerImageUrl: '' }));
                        }
                      }}
                      className="h-11"
                    />
                    {formData.partnerImageUrl && (
                      <div className="mt-2">
                        <img src={formData.partnerImageUrl} alt="Partner" className="w-32 h-32 object-cover rounded-full shadow" />
                      </div>
                    )}
                </div>
              </CardContent>
            )}
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <input type="checkbox" checked={enabledSections.whatsIncluded} onChange={() => handleSectionToggle('whatsIncluded')} />
                <CardTitle>What's Included</CardTitle>
              </div>
              <CardDescription>Specify what items or services are included in the event</CardDescription>
            </CardHeader>
            {enabledSections.whatsIncluded && (
              <CardContent className="space-y-4">
                <div className="flex flex-col gap-2">
                  {formData.whatsIncluded.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <Input
                        value={item}
                        onChange={(e) => handleIncludedChange(idx, e.target.value)}
                        placeholder="Enter included item"
                        className="flex-1 h-10"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeIncludedItem(idx)}
                        className="h-10"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
                <Button
                  type="button"
                  onClick={addIncludedItem}
                  className="w-full h-10"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Another Item
                </Button>
                <p className="text-sm text-gray-500">Specify what is included in the event, like food, drinks, or materials.</p>
              </CardContent>
            )}
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <input type="checkbox" checked={enabledSections.entryRequirements} onChange={() => handleSectionToggle('entryRequirements')} />
                <CardTitle>Entry Requirements</CardTitle>
              </div>
              <CardDescription>Specify any entry requirements for the event</CardDescription>
            </CardHeader>
            {enabledSections.entryRequirements && (
              <CardContent className="space-y-6">
                <div className="p-4 border rounded-lg shadow-sm bg-gray-50">
                  <h3 className="text-lg font-semibold mb-3">Card Entry</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="cardEntryTitle">Card Title</Label>
                      <Input
                        id="cardEntryTitle"
                        value={cardEntry.title}
                        onChange={e => handleCardEntryChange('title', e.target.value)}
                        placeholder="Enter card title"
                        className="h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cardEntryData">Card Data</Label>
                      <Input
                        id="cardEntryData"
                        value={cardEntry.data}
                        onChange={e => handleCardEntryChange('data', e.target.value)}
                        placeholder="Enter card data"
                        className="h-11"
                      />
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-4">
                  {entryRequirements.map((req, idx) => (
                    <div key={idx} className="p-4 border rounded-lg shadow-sm bg-gray-50">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold">Requirement {idx + 1}</h4>
                        <button
                          type="button"
                          onClick={() => removeEntryRequirement(idx)}
                          className="text-gray-400 hover:text-red-500"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor={`entryType-${idx}`}>Type</Label>
                          <Select
                            value={req.type}
                            onValueChange={value => handleEntryTypeChange(value as 'string' | 'array', idx)}
                          >
                            <SelectTrigger className="h-11">
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="string">Text</SelectItem>
                              <SelectItem value="array">List</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`entryTitle-${idx}`}>Title</Label>
                          <Input
                            id={`entryTitle-${idx}`}
                            value={req.title}
                            onChange={e => handleEntryChange(idx, 'title', e.target.value)}
                            placeholder="Enter a title"
                            className="h-11"
                          />
                        </div>
                      </div>
                      {req.type === 'string' && (
                        <div className="space-y-2 mt-4">
                          <Label htmlFor={`entryDescription-${idx}`}>Description</Label>
                          <Textarea
                            id={`entryDescription-${idx}`}
                            value={req.description}
                            onChange={e => handleEntryChange(idx, 'description', e.target.value)}
                            placeholder="Enter a description"
                            className="min-h-24"
                          />
                        </div>
                      )}
                      {req.type === 'array' && (
                        <div className="space-y-2 mt-4">
                          <Label htmlFor={`entryList-${idx}`}>List Items</Label>
                          <div className="flex flex-col gap-2">
                            {req.items.map((item, itemIdx) => (
                              <div key={itemIdx} className="flex items-center gap-2">
                                <Input
                                  value={item}
                                  onChange={e => handleEntryArrayItemChange(idx, itemIdx, e.target.value)}
                                  placeholder="Enter list item"
                                  className="flex-1 h-11"
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
                              className="flex items-center gap-1 text-emerald-600 hover:text-emerald-800 font-medium"
                            >
                              <Plus className="w-4 h-4" /> Add another item
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                  <Button
                    type="button"
                    onClick={addEntryRequirement}
                    variant="outline"
                  >
                    <Plus className="w-4 h-4 mr-1" /> Add Entry Requirement
                  </Button>
                </div>
              </CardContent>
            )}
          </Card>

          {/* Form Actions */}
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setFormData({
                  name: '',
                  description: '',
                  price: '',
                  currency: '₹',
                  location: '',
                  startDate: '',
                  time: '',
                  numberOfGuests: '',
                  hostName: '',
                  hostImage: null,
                  hostImageUrl: '',
                  hostLocation: '',
                  hostDescription: '',
                  partnerName: '',
                  partnerImage: null,
                  partnerImageUrl: '',
                  partnerUrl: '',
                  partnerDescription: '',
                  partnerLocation: '',
                  eventType: '',
                  eventSubType: '',
                  theme: '', 
                  whatsIncluded: [''],
                  tags: [],
                  venueType: '',
                  venueTypeName: '',
                  foodPreferences: '',
                  foodPreferencesName: '',
                  specialRequirements: '',
                  eventImage: null,
                  eventImageUrl: ''
                });
                setCardEntry({ title: '', data: '' });
                setEntryRequirements([]);
              }}
              className="h-10"
            >
              Reset Form
            </Button>
            <Button type="submit" className="h-10" disabled={isSubmitting}>
              {isSubmitting ? 'Creating Event...' : 'Create Event'}
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default CreateEvent;