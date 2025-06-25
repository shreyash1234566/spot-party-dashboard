// ============================================================================
// Imports
// ============================================================================
// React hooks for state management and side effects.
import { useState, useEffect } from 'react';
// Layout and UI components imported from a custom component library (likely shadcn/ui).
import DashboardLayout from '../components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
// Icons from the lucide-react library for a clean and consistent look.
import { Calendar as CalendarIcon, MapPin, Plus, X } from 'lucide-react';

// ============================================================================
// Component Definition
// ============================================================================
const CreateEvent = () => {
  // ============================================================================
  // State Management
  // ============================================================================

  // --- Main Form State ---
  // A single state object to hold all the data for the event form.
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    currency: '₹', // Default currency
    location: '',
    startDate: '', // Changed from date to match schema
    time: '',
    numberOfGuests: '', // Added for schema
    hostName: '',
    hostImage: null as File | null, // To store the uploaded host image file
    hostLocation: '',
    hostDescription: '',
    partnerName: '',
    partnerImage: null as File | null, // To store the uploaded partner image file
    partnerUrl: '',
    partnerDescription: '',
    partnerLocation: '',
    eventType: '',      // Stores the ID of the selected event type
    eventSubType: '',   // Stores the value of the selected event sub-type
    whatsIncluded: [''], // An array to hold a dynamic list of included items, starts with one empty item
    tags: [] as string[] // An array to hold selected or custom tags
  });

  // --- Loading State ---
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- Tag Management State ---
  // State to hold the value of the input for adding a new custom tag.
  const [currentTag, setCurrentTag] = useState('');
  // A predefined list of suggested tags for the user to choose from.
  const availableTags = ['DJ', 'Party', 'Premium', 'VIP', 'Music', 'Dance', 'Food', 'Drinks', 'Outdoor', 'Indoor'];

  // --- Entry Requirement State ---
  // Define TypeScript interfaces for the two types of entry requirements.
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
  // A union type for a single entry requirement.
  type EntryRequirement = EntryRequirementString | EntryRequirementArray;

  // State to manage a dynamic list of entry requirements. Starts with one default text-based requirement.
  const [entryRequirements, setEntryRequirements] = useState<EntryRequirement[]>([
    { type: 'string', title: '', description: '' }
  ]);
  
  // State to track which type of requirement ('string' or 'array') will be added next.
  const [entryType, setEntryType] = useState<'string' | 'array'>('string');

  // --- Section Visibility State ---
  // State to control which sections of the form are visible and enabled.
  // This allows the user to collapse or hide sections they are not using.
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

  // --- Metadata State ---
  // Define TypeScript interfaces for the expected structure of the metadata API response.
  interface EventTypeMeta {
    _id: string;
    name: string;
  }
  interface EventSubTypeMeta {
    _id: string;
    name: string;
    parent: string;
    image: string;
  }
  interface EventMeta {
    eventType: EventTypeMeta[];
    eventSubType: EventSubTypeMeta[];
  }

  // State to store metadata fetched from the server, such as available event types.
  const [meta, setMeta] = useState<EventMeta | null>(null);

  // Compute filtered subtypes before rendering
  const filteredSubTypes = meta?.eventSubType?.filter(
    (sub) => sub.parent === formData.eventType
  ) || [];

  // ============================================================================
  // Handlers and Logic
  // ============================================================================

  // --- Form Input Handlers ---

  /**
   * A generic handler to update a field in the main `formData` state.
   * @param field - The key of the formData object to update.
   * @param value - The new value for the field.
   */
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  /**
   * A handler specifically for file inputs to update the `formData` state.
   * @param field - The key of the formData object to update (e.g., 'hostImage').
   * @param file - The file object from the input, or null.
   */
  const handleFileChange = (field: string, file: File | null) => {
    setFormData(prev => ({ ...prev, [field]: file }));
  };

  // --- Tag Management Handlers ---

  /**
   * Adds a new tag to the `formData.tags` array if it's not empty and not already present.
   * @param tag - The tag string to add.
   */
  const addTag = (tag: string) => {
    if (tag && !formData.tags.includes(tag)) {
      setFormData(prev => ({ ...prev, tags: [...prev.tags, tag] }));
    }
    setCurrentTag(''); // Reset the input field after adding a tag.
  };

  /**
   * Removes a tag from the `formData.tags` array.
   * @param tagToRemove - The tag string to remove.
   */
  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  // --- "What's Included" Handlers ---

  /**
   * Updates the value of a specific item in the `whatsIncluded` array.
   * @param idx - The index of the item to update.
   * @param value - The new string value for the item.
   */
  const handleIncludedChange = (idx: number, value: string) => {
    setFormData(prev => {
      const updated = [...prev.whatsIncluded];
      updated[idx] = value;
      return { ...prev, whatsIncluded: updated };
    });
  };

  /**
   * Adds a new empty string to the `whatsIncluded` array, creating a new input field.
   */
  const addIncludedItem = () => {
    setFormData(prev => ({ ...prev, whatsIncluded: [...prev.whatsIncluded, ''] }));
  };

  /**
   * Removes an item from the `whatsIncluded` array by its index.
   * Ensures there is always at least one item (even if empty) in the array.
   * @param idx - The index of the item to remove.
   */
  const removeIncludedItem = (idx: number) => {
    setFormData(prev => {
      const updated = prev.whatsIncluded.filter((_, i) => i !== idx);
      return { ...prev, whatsIncluded: updated.length ? updated : [''] };
    });
  };
  
  // --- Entry Requirement Handlers ---

  /**
   * Handles changing the type of an entry requirement.
   * If there's only one default item, it switches its structure.
   * @param type - The new type, 'string' or 'array'.
   * @param idx - The index of the requirement to change.
   */
  const handleEntryTypeChange = (type: 'string' | 'array', idx: number) => {
    setEntryRequirements(prev => prev.map((req, i) => {
      if (i !== idx) return req;
      return type === 'string'
        ? { type: 'string', title: '', description: '' }
        : { type: 'array', title: '', items: [''] };
    }));
  };
  
  /**
   * Updates a field (title or description) for a specific entry requirement.
   * @param idx - The index of the requirement in the array.
   * @param field - The field to update ('title' or 'description').
   * @param value - The new value.
   */
  const handleEntryChange = (idx: number, field: string, value: string) => {
    setEntryRequirements(prev => prev.map((req, i) => {
      if (i !== idx) return req; // Not the item we want to change
      if (req.type === 'string') {
        return { ...req, [field]: value };
      } else { // For array type, only the title can be changed here
        if (field === 'title') return { ...req, title: value };
        return req;
      }
    }));
  };

  /**
   * Updates a specific list item within an 'array' type entry requirement.
   * @param idx - The index of the requirement in the main array.
   * @param itemIdx - The index of the item within the requirement's `items` array.
   * @param value - The new value for the list item.
   */
  const handleEntryArrayItemChange = (idx: number, itemIdx: number, value: string) => {
    setEntryRequirements(prev => prev.map((req, i) => {
      if (i !== idx || req.type !== 'array') return req; // Ignore if not the correct item or type
      const items = [...req.items];
      items[itemIdx] = value;
      return { ...req, items };
    }));
  };

  /**
   * Adds a new, empty entry requirement to the list based on the currently selected `entryType`.
   */
  const addEntryRequirement = () => {
    setEntryRequirements(prev => [
      ...prev,
      entryType === 'string'
        ? { type: 'string', title: '', description: '' }
        : { type: 'array', title: '', items: [''] }
    ]);
  };
  
  /**
   * Adds a new empty list item to a specific 'array' type entry requirement.
   * @param idx - The index of the requirement to add the item to.
   */
  const addEntryArrayItem = (idx: number) => {
    setEntryRequirements(prev => prev.map((req, i) => {
      if (i !== idx || req.type !== 'array') return req;
      return { ...req, items: [...req.items, ''] };
    }));
  };

  /**
   * Removes an entire entry requirement from the list.
   * @param idx - The index of the requirement to remove.
   */
  const removeEntryRequirement = (idx: number) => {
    setEntryRequirements(prev => prev.filter((_, i) => i !== idx));
  };
  
  /**
   * Removes a list item from an 'array' type entry requirement.
   * @param idx - The index of the requirement.
   * @param itemIdx - The index of the item to remove from the list.
   */
  const removeEntryArrayItem = (idx: number, itemIdx: number) => {
    setEntryRequirements(prev => prev.map((req, i) => {
      if (i !== idx || req.type !== 'array') return req;
      const items = req.items.filter((_, j) => j !== itemIdx);
      // Ensure there's always at least one item field.
      return { ...req, items: items.length ? items : [''] };
    }));
  };

  // --- Section Visibility Handler ---

  /**
   * Toggles the visibility of a form section.
   * @param section - The key of the section in the `enabledSections` state.
   */
  const handleSectionToggle = (section: keyof typeof enabledSections) => {
    setEnabledSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  // --- Data Transformation Helper ---
  /**
   * Transforms form data to match the API schema for /api/admin/events (only required fields)
   */
  const transformFormDataForAPI = () => {
    const selectedEventType = meta?.eventType.find(type => type._id === formData.eventType);
    return {
      name: {
        id: formData.eventType,
        name: selectedEventType?.name || ''
      },
      startDate: formData.startDate && formData.time
        ? new Date(`${formData.startDate}T${formData.time}`).toISOString()
        : new Date(formData.startDate).toISOString(),
      numberOfGuests: formData.numberOfGuests ? parseInt(formData.numberOfGuests) : undefined,
      title: formData.name,
      price: formData.price ? parseFloat(formData.price) : undefined,
      location: formData.location || undefined,
      tags: formData.tags.length ? formData.tags : undefined,
      whatsIncluded: formData.whatsIncluded.filter(item => item.trim()),
      hostedBy: formData.hostName ? {
        image: '', // Set to actual image URL if available
        name: formData.hostName,
        location: formData.hostLocation,
        description: formData.hostDescription
      } : undefined,
      partneredBy: formData.partnerName ? {
        image: '', // Set to actual image URL if available
        name: formData.partnerName,
        location: formData.partnerLocation,
        description: formData.partnerDescription
      } : undefined
    };
  };

  // --- Form Submission ---
  /**
   * Handles the final form submission.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Transform form data for API
      const apiData = transformFormDataForAPI();
      console.log('Sending data to API:', apiData);

      // Make API call to the new endpoint
      const response = await fetch('http://44.203.188.5:3000/api/admin/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'accept': '*/*',
        },
        body: JSON.stringify(apiData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create event');
      }

      const result = await response.json();
      console.log('Event created successfully:', result);

      toast({
        title: "Event Created Successfully!",
        description: "Your event has been saved and is ready for review.",
      });

      // Reset form or redirect as needed
      // setFormData({ ... reset to initial state ... });

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

  // ============================================================================
  // Side Effects (Data Fetching)
  // ============================================================================

  // Fetches metadata (like event types) from the backend when the component mounts.
  useEffect(() => {
    // The empty dependency array `[]` ensures this effect runs only once after the initial render.
    fetch('http://44.203.188.5:3000/api/events/get-event-meta', {
      headers: {
        'accept': '*/*',
        // NOTE: The Authorization token is hardcoded here. In a real app,
        // this should be retrieved from a more secure location (e.g., context, auth store).
        // 'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2ODRiZjJjMTg2MGUzNWQzZjgzZDA1NTIiLCJwaG9uZSI6OTc4MjQxOTE3MywiaWF0IjoxNzUwNzY0NTE0LCJleHAiOjE3NTEzNjkzMTR9.Lj8fcyCoSlQGn9NQ3Y2EP9aE3cEznDGsxJRJgmwsLjA'
      }
    })
      .then(res => {
        if (!res.ok) throw new Error('Network response was not ok');
        return res.json();
      })
      .then((data) => setMeta(data as EventMeta)) // Set the fetched data into state
      .catch(err => console.error('Failed to fetch metadata:', err));
  }, []);

  // ============================================================================
  // JSX Rendering
  // ============================================================================
  return (
    <DashboardLayout>
      <div className="p-8 max-w-4xl mx-auto">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Event</h1>
          <p className="text-gray-600">Fill in the details below to create your event listing.</p>
        </div>

        {/* The main form element */}
        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* --- Event Type Section --- */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <input type="checkbox" checked={enabledSections.eventType} onChange={() => handleSectionToggle('eventType')} />
                <CardTitle>Event type</CardTitle>
              </div>
              <CardDescription>Describe the type of event</CardDescription>
            </CardHeader>
            {/* The Select component is populated with data fetched from the API */}
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
                // Display a disabled loading state while data is being fetched
                <Select disabled>
                  <SelectTrigger className="w-full h-11">
                    <SelectValue placeholder="Loading event types..." />
                  </SelectTrigger>
                </Select>
              )}
            </CardContent>
          </Card>
          
          {/* --- Event Subtype Section --- */}
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

          {/* --- Basic Event Details Section --- */}
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
                    <Input id="name" value={formData.name} onChange={(e) => handleInputChange('name', e.target.value)} placeholder="Enter event name" className="h-11" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Location *</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                      <Input id="location" value={formData.location} onChange={(e) => handleInputChange('location', e.target.value)} placeholder="Event location" className="pl-10 h-11" required />
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea id="description" value={formData.description} onChange={(e) => handleInputChange('description', e.target.value)} placeholder="Describe your event in detail..." className="min-h-24" required />
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
                      <Input id="price" type="number" value={formData.price} onChange={(e) => handleInputChange('price', e.target.value)} placeholder="0" className="flex-1 ml-2 h-11" required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="numberOfGuests">Number of Guests *</Label>
                    <Input id="numberOfGuests" type="number" value={formData.numberOfGuests} onChange={(e) => handleInputChange('numberOfGuests', e.target.value)} placeholder="0" className="h-11" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Date *</Label>
                    <Input id="startDate" type="date" value={formData.startDate} onChange={(e) => handleInputChange('startDate', e.target.value)} className="h-11" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="time">Time *</Label>
                    <Input id="time" type="time" value={formData.time} onChange={(e) => handleInputChange('time', e.target.value)} className="h-11" required />
                  </div>
                </div>
              </CardContent>
            )}
          </Card>

          {/* --- Tags Section --- */}
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
                {/* Display currently selected tags */}
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map(tag => (
                    <span key={tag} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-indigo-100 text-indigo-800">
                      {tag}
                      <button type="button" onClick={() => removeTag(tag)} className="ml-2 text-indigo-600 hover:text-indigo-800">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
                {/* Display available suggested tags */}
                <div className="flex flex-wrap gap-2">
                  {availableTags.filter(tag => !formData.tags.includes(tag)).map(tag => (
                    <button key={tag} type="button" onClick={() => addTag(tag)} className="px-3 py-1 rounded-full text-sm border border-gray-300 hover:bg-gray-50 transition-colors">
                      <Plus className="w-3 h-3 inline mr-1" />
                      {tag}
                    </button>
                  ))}
                </div>
                {/* Input for adding custom tags */}
                <div className="flex items-center gap-2 mt-2">
                  <Input
                    value={currentTag}
                    onChange={e => setCurrentTag(e.target.value)}
                    placeholder="Add custom tag"
                    className="h-9 w-40"
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag(currentTag.trim()); } }}
                  />
                  <Button type="button" size="sm" onClick={() => addTag(currentTag.trim())} disabled={!currentTag.trim() || formData.tags.includes(currentTag.trim())}>
                    Add
                  </Button>
                </div>
                <p className="text-sm text-gray-500">Select from suggestions or add your own tags.</p>
              </CardContent>
            )}
          </Card>

          {/* --- Host Information Section --- */}
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
                      <Input id="hostName" value={formData.hostName} onChange={(e) => handleInputChange('hostName', e.target.value)} placeholder="Name of the host" className="h-11" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="hostLocation">Host Location</Label>
                      <Input id="hostLocation" value={formData.hostLocation} onChange={(e) => handleInputChange('hostLocation', e.target.value)} placeholder="Host's location" className="h-11" />
                    </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="hostDescription">Host Description</Label>
                    <Textarea id="hostDescription" value={formData.hostDescription} onChange={(e) => handleInputChange('hostDescription', e.target.value)} placeholder="Brief description about the host..." className="min-h-20" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="hostImage">Host Image</Label>
                    <Input id="hostImage" type="file" accept="image/*" onChange={(e) => handleFileChange('hostImage', e.target.files?.[0] || null)} className="h-11" />
                </div>
              </CardContent>
            )}
          </Card>

          {/* --- Partner Information Section --- */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <input type="checkbox" checked={enabledSections.partner} onChange={() => handleSectionToggle('partner')} />
                <CardTitle>Partner Information</CardTitle>
              </div>
              <CardDescription>Details about the event partner</CardDescription>
            </CardHeader>
            {enabledSections.partner && (
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="partnerName">Partner Name *</Label>
                      <Input id="partnerName" value={formData.partnerName} onChange={(e) => handleInputChange('partnerName', e.target.value)} placeholder="Name of the partner" className="h-11" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="partnerLocation">Partner Location</Label>
                      <Input id="partnerLocation" value={formData.partnerLocation} onChange={(e) => handleInputChange('partnerLocation', e.target.value)} placeholder="Partner's location" className="h-11" />
                    </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="partnerDescription">Partner Description</Label>
                    <Textarea id="partnerDescription" value={formData.partnerDescription} onChange={(e) => handleInputChange('partnerDescription', e.target.value)} placeholder="Brief description about the partner..." className="min-h-20" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="partnerImage">Partner Image</Label>
                    <Input id="partnerImage" type="file" accept="image/*" onChange={(e) => handleFileChange('partnerImage', e.target.files?.[0] || null)} className="h-11" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="partnerUrl">Partner URL</Label>
                    <Input id="partnerUrl" value={formData.partnerUrl} onChange={(e) => handleInputChange('partnerUrl', e.target.value)} placeholder="Website or social media link" className="h-11" />
                </div>
              </CardContent>
            )}
          </Card>

          {/* --- What's Included Section --- */}
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
                {/* Display currently included items */}
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
                {/* Button to add more items */}
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

          {/* --- Entry Requirements Section --- */}
          {/* Entry Requirements */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <input type="checkbox" checked={enabledSections.entryRequirements} onChange={() => handleSectionToggle('entryRequirements')} />
                <CardTitle>Entry Requirements</CardTitle>
              </div>
              <CardDescription>Specify any entry requirements for the event</CardDescription>
            </CardHeader>
            {enabledSections.entryRequirements && (
              <CardContent className="space-y-4">
                <div className="flex flex-col gap-4">
                  {entryRequirements.map((req, idx) => (
                    <div key={idx} className="p-4 border rounded-lg shadow-sm bg-gray-50">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-semibold">Requirement {idx + 1}</h3>
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

          {/* --- Form Actions --- */}
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setFormData({
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
                hostLocation: '',
                hostDescription: '',
                partnerName: '',
                partnerImage: null,
                partnerUrl: '',
                partnerDescription: '',
                partnerLocation: '',
                eventType: '',
                eventSubType: '',
                whatsIncluded: [''],
                tags: []
              })}
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