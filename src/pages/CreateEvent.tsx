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
    date: '',
    time: '',
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
  interface EventMeta {
    eventType: EventTypeMeta[];
  }

  // State to store metadata fetched from the server, such as available event types.
  const [meta, setMeta] = useState<EventMeta | null>(null);

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
   */
  const handleEntryTypeChange = (type: 'string' | 'array') => {
    setEntryType(type);
    setEntryRequirements(prev => {
      if (prev.length === 1) { // If only the first item exists, just switch its type
        return [
          type === 'string'
            ? { type: 'string', title: '', description: '' }
            : { type: 'array', title: '', items: [''] }
        ];
      }
      return prev;
    });
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

  // --- Form Submission ---
  /**
   * Handles the final form submission. Currently, it prevents the default
   * form action, logs the data to the console, and shows a success toast.
   * In a real application, this would send the data to a backend API.
   * @param e - The form event.
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault(); // Prevent page reload
    console.log('Event data submitted:', formData);
    console.log('Entry requirements submitted:', entryRequirements);
    toast({
      title: "Event Created Successfully!",
      description: "Your event has been saved and is ready for review.",
    });
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
              <CardDescription>Select a subtype for the event (optional)</CardDescription>
            </CardHeader>
            {enabledSections.eventSubType && (
              <CardContent>
                <Label htmlFor="eventSubType">Event Subtype</Label>
                {/* This is a static dropdown for now, but could be made dynamic */}
                <Select value={formData.eventSubType || ''} onValueChange={value => handleInputChange('eventSubType', value)}>
                  <SelectTrigger className="w-full h-11">
                    <SelectValue placeholder="Select event subtype" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="haldi">Haldi</SelectItem>
                    <SelectItem value="sangeet">Sangeet</SelectItem>
                    <SelectItem value="reception">Reception</SelectItem>
                    <SelectItem value="engagement">Engagement</SelectItem>
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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                    <Label htmlFor="date">Date *</Label>
                    <Input id="date" type="date" value={formData.date} onChange={(e) => handleInputChange('date', e.target.value)} className="h-11" required />
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
              <CardDescription>Details about event partners (optional)</CardDescription>
            </CardHeader>
            {enabledSections.partner && (
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="partnerName">Partner Name</Label>
                    <Input id="partnerName" value={formData.partnerName} onChange={(e) => handleInputChange('partnerName', e.target.value)} placeholder="Name of the partner" className="h-11" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="partnerUrl">Partner Website</Label>
                    <Input id="partnerUrl" value={formData.partnerUrl} onChange={(e) => handleInputChange('partnerUrl', e.target.value)} placeholder="https://partner-website.com" className="h-11" />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="partnerLocation">Partner Location</Label>
                    <Input id="partnerLocation" value={formData.partnerLocation} onChange={(e) => handleInputChange('partnerLocation', e.target.value)} placeholder="Partner's location" className="h-11" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="partnerImage">Partner Image</Label>
                    <Input id="partnerImage" type="file" accept="image/*" onChange={(e) => handleFileChange('partnerImage', e.target.files?.[0] || null)} className="h-11" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="partnerDescription">Partner Description</Label>
                  <Textarea id="partnerDescription" value={formData.partnerDescription} onChange={(e) => handleInputChange('partnerDescription', e.target.value)} placeholder="Brief description about the partner..." className="min-h-20" />
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
              <CardDescription>Describe what attendees will get with their ticket</CardDescription>
            </CardHeader>
            {enabledSections.whatsIncluded && (
              <CardContent>
                <div className="space-y-2">
                  <Label>Include Details</Label>
                  <div className="space-y-3">
                    {/* Map over the whatsIncluded array to create a dynamic list of inputs */}
                    {formData.whatsIncluded.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 text-emerald-600">
                          <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                        </span>
                        <Input value={item} onChange={e => handleIncludedChange(idx, e.target.value)} placeholder="e.g. VIP entrance" className="flex-1 h-11" />
                        {/* Show remove button only if there's more than one item */}
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
                  <p className="text-sm text-gray-500">Add each included item as a separate point.</p>
                </div>
              </CardContent>
            )}
          </Card>

          {/* --- Entry Requirements Section --- */}
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
                  {/* Map over the entryRequirements state to render each requirement */}
                  {entryRequirements.map((req, idx) => (
                    <div key={idx} className="p-4 border rounded-lg shadow-sm bg-gray-50">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-semibold">Requirement {idx + 1}</h3>
                        <button type="button" onClick={() => removeEntryRequirement(idx)} className="text-gray-400 hover:text-red-500">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor={`entryType-${idx}`}>Type</Label>
                          <Select value={req.type} onValueChange={value => handleEntryTypeChange(value as 'string' | 'array')}>
                            <SelectTrigger className="h-11"><SelectValue placeholder="Select type" /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="string">Text</SelectItem>
                              <SelectItem value="array">List</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`entryTitle-${idx}`}>Title</Label>
                          <Input id={`entryTitle-${idx}`} value={req.title} onChange={e => handleEntryChange(idx, 'title', e.target.value)} placeholder="Enter a title" className="h-11" />
                        </div>
                      </div>

                      {/* Conditionally render fields based on requirement type */}
                      {req.type === 'string' && (
                        <div className="space-y-2 mt-4">
                          <Label htmlFor={`entryDescription-${idx}`}>Description</Label>
                          <Textarea id={`entryDescription-${idx}`} value={req.description} onChange={e => handleEntryChange(idx, 'description', e.target.value)} placeholder="Enter a description" className="min-h-24" />
                        </div>
                      )}
                      {req.type === 'array' && (
                        <div className="space-y-2 mt-4">
                          <Label>List Items</Label>
                          <div className="flex flex-col gap-2">
                            {req.items.map((item, itemIdx) => (
                              <div key={itemIdx} className="flex items-center gap-2">
                                <Input value={item} onChange={e => handleEntryArrayItemChange(idx, itemIdx, e.target.value)} placeholder="Enter list item" className="flex-1 h-11" />
                                {req.items.length > 1 && (
                                  <button type="button" onClick={() => removeEntryArrayItem(idx, itemIdx)} className="text-gray-400 hover:text-red-500">
                                    <X className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            ))}
                            <button type="button" onClick={() => addEntryArrayItem(idx)} className="flex items-center gap-1 text-emerald-600 hover:text-emerald-800 font-medium">
                              <Plus className="w-4 h-4" /> Add another item
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                  {/* Button to add a new requirement block */}
                  <Button type="button" onClick={addEntryRequirement} variant="outline">
                    <Plus className="w-4 h-4 mr-1" /> Add Entry Requirement
                  </Button>
                </div>
              </CardContent>
            )}
          </Card>
          
          {/* --- Form Action Buttons --- */}
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

// Export the component for use in other parts of the application.
export default CreateEvent;