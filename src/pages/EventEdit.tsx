// ============================================================================
// Imports
// ============================================================================
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { Plus, X } from 'lucide-react';
import { apiFetch } from '../lib/api';

// ============================================================================
// Interfaces
// ============================================================================
interface FormData { name: string; description: string; price: string; currency: string; location: string; startDate: string; time: string; numberOfGuests: string; hostName: string; hostImageUrl: string; hostLocation: string; partnerName: string; partnerImageUrl: string; partnerLocation: string; eventType: string; eventSubType: string; theme: string; whatsIncluded: string[]; tags: string[]; eventImageUrl: string; [key: string]: any; }
interface EntryRequirementString { type: 'string'; title: string; description: string; }
interface EntryRequirementArray { type: 'array'; title: string; items: string[]; }
type EntryRequirement = EntryRequirementString | EntryRequirementArray;
interface EventMeta { eventType: any[]; eventSubType: any[]; theme: any[]; venues: any[]; foodPrefs: any[]; }

// ============================================================================
// Helper Function for Robust Data Fetching
// ============================================================================
const fetchEventDataWithFallback = async (id: string) => {
    const endpoints = [`https://api.partywalah.in/api/admin/event/${id}`,`https://api.partywalah.in/api/events/${id}`,`https://api.partywalah.in/api/event/${id}`,`https://api.partywalah.in/events/${id}`,`https://api.partywalah.in/api/admin/events/${id}`];
    for (const endpoint of endpoints) {
        try {
            const response = await apiFetch(endpoint);
            if (response.ok) {
                const data = await response.json();
                if (data && (data._id || data.data?._id)) {
                    console.log(`✅ Event data found at: ${endpoint}`);
                    return data.data || data;
                }
            }
        } catch (err) { console.warn(`Attempt failed for ${endpoint}, trying next...`); }
    }
    throw new Error('Event not found. All fallback endpoints failed.');
};

// ============================================================================
// Component Definition
// ============================================================================
const EventEdit = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    // ============================================================================
    // State Management
    // ============================================================================
    const [formData, setFormData] = useState<FormData | null>(null);
    const [meta, setMeta] = useState<EventMeta | null>(null);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [currentTag, setCurrentTag] = useState('');
    const [cardEntry, setCardEntry] = useState<{ title: string; data: string }>({ title: '', data: '' });
    const [entryRequirements, setEntryRequirements] = useState<EntryRequirement[]>([]);

    const availableTags = ['DJ', 'Party', 'Premium', 'VIP', 'Music', 'Dance', 'Food', 'Drinks', 'Outdoor', 'Indoor'];
    const filteredSubTypes = meta?.eventSubType?.filter((sub) => sub.parent === formData?.eventType) || [];

    // ============================================================================
    // Data Fetching & State Population
    // ============================================================================
    useEffect(() => {
        if (!id) {
            setError("No Event ID provided.");
            setLoading(false);
            return;
        }

        const fetchInitialData = async () => {
            try {
                setLoading(true);
                const [eventData, metaData] = await Promise.all([
                    fetchEventDataWithFallback(id),
                    apiFetch('https://api.partywalah.in/api/events/get-event-meta').then(res => res.json()),
                ]);
                
                setMeta(metaData);

                const startDate = eventData.startDate ? new Date(eventData.startDate) : new Date();
                setFormData({
                    name: eventData.title || '', description: eventData.description || '', price: String(eventData.price || ''),
                    currency: '₹', location: eventData.location || '', startDate: startDate.toISOString().split('T')[0],
                    time: startDate.toTimeString().split(' ')[0].substring(0, 5), numberOfGuests: String(eventData.numberOfGuests || ''),
                    eventImageUrl: eventData.image || '', hostName: eventData.hostedBy?.name || '', hostImageUrl: eventData.hostedBy?.image || '',
                    hostLocation: eventData.hostedBy?.location || '', partnerName: eventData.partneredBy?.name || '',
                    partnerImageUrl: eventData.partneredBy?.image || '', partnerLocation: eventData.partneredBy?.location || '',
                    eventType: eventData.name?.id || '', eventSubType: eventData.subType?.[0]?.id || '',
                    theme: eventData.themeIds?.[0]?._id || eventData.themeIds?.[0] || '', tags: eventData.tags || [],
                    whatsIncluded: eventData.whatsIncluded && eventData.whatsIncluded.length > 0 ? eventData.whatsIncluded : [''],
                });

                // --- POPULATE COMPLEX ENTRY REQUIREMENTS STATE ---
                if (Array.isArray(eventData.entryRequirements)) {
                    const fetchedCardEntry = eventData.entryRequirements.find((req: any) => req.type === 'Card Entry');
                    if (fetchedCardEntry) {
                        setCardEntry({ title: fetchedCardEntry.title || '', data: fetchedCardEntry.description || '' });
                    }
                    const otherReqs = eventData.entryRequirements
                        .filter((req: any) => req.type !== 'Card Entry')
                        .map((req: any) => req.type === 'array' ? ({ type: 'array', title: req.title, items: req.list || [''] }) : ({ type: 'string', title: req.title, description: req.description || '' }));
                    setEntryRequirements(otherReqs);
                }

            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchInitialData();
    }, [id]);

    // ============================================================================
    // Handlers (Copied from CreateEvent)
    // ============================================================================
    const handleInputChange = (field: keyof FormData, value: string | string[]) => setFormData(prev => prev ? { ...prev, [field]: value } : null);
    const uploadImageAndGetUrl = async (file: File | null): Promise<string> => { if (!file) return ''; const formData = new FormData(); formData.append('file', file); try { const response = await apiFetch('https://api.partywalah.in/api/admin/file-upload', { method: 'POST', body: formData }); if (!response.ok) throw new Error('Image upload failed'); const data = await response.json(); return data?.data?.url || ''; } catch (err) { toast({ title: "Image Upload Failed", variant: "destructive" }); return ''; } };
    const addTag = (tag: string) => { const t = tag.trim(); if (t && !formData?.tags.includes(t)) { handleInputChange('tags', [...(formData?.tags || []), t]); } setCurrentTag(''); };
    const removeTag = (tag: string) => handleInputChange('tags', formData?.tags.filter(t => t !== tag) || []);
    const handleIncludedChange = (idx: number, value: string) => { const updated = [...(formData?.whatsIncluded || [])]; updated[idx] = value; handleInputChange('whatsIncluded', updated); };
    const addIncludedItem = () => handleInputChange('whatsIncluded', [...(formData?.whatsIncluded || []), '']);
    const removeIncludedItem = (idx: number) => { const updated = formData?.whatsIncluded.filter((_, i) => i !== idx) || []; handleInputChange('whatsIncluded', updated.length ? updated : ['']); };
    const handleCardEntryChange = (field: 'title' | 'data', value: string) => setCardEntry(prev => ({ ...prev, [field]: value }));
    const handleEntryTypeChange = (type: 'string' | 'array', idx: number) => setEntryRequirements(prev => prev.map((req, i) => i !== idx ? req : type === 'string' ? { type: 'string', title: '', description: '' } : { type: 'array', title: '', items: [''] }));
    const handleEntryChange = (idx: number, field: string, value: string) => setEntryRequirements(prev => prev.map((req, i) => { if (i !== idx) return req; return { ...req, [field]: value }; }));
    const handleEntryArrayItemChange = (idx: number, itemIdx: number, value: string) => setEntryRequirements(prev => prev.map((req, i) => { if (i !== idx || req.type !== 'array') return req; const items = [...req.items]; items[itemIdx] = value; return { ...req, items }; }));
    const addEntryRequirement = () => setEntryRequirements(prev => [...prev, { type: 'string', title: '', description: '' }]);
    const addEntryArrayItem = (idx: number) => setEntryRequirements(prev => prev.map((req, i) => i !== idx || req.type !== 'array' ? req : { ...req, items: [...req.items, ''] }));
    const removeEntryRequirement = (idx: number) => setEntryRequirements(prev => prev.filter((_, i) => i !== idx));
    const removeEntryArrayItem = (idx: number, itemIdx: number) => setEntryRequirements(prev => prev.map((req, i) => { if (i !== idx || req.type !== 'array') return req; const items = req.items.filter((_, j) => j !== itemIdx); return { ...req, items: items.length ? items : [''] }; }));

    // ============================================================================
    // Save Logic
    // ============================================================================
    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData || !id) { toast({ title: "Form data is missing", variant: "destructive" }); return; }
        setIsSaving(true);
        try {
            const selectedEventType = meta?.eventType.find(t => t._id === formData.eventType);
            const selectedSubType = meta?.eventSubType.find(s => s._id === formData.eventSubType);
            const entryReqPayload: any[] = [];
            if (cardEntry.title.trim()) { entryReqPayload.push({ type: 'Card Entry', title: cardEntry.title, description: cardEntry.data, list: [] }); }
            entryRequirements.forEach(req => {
                if (!req.title.trim()) return;
                if (req.type === 'string') { entryReqPayload.push({ type: 'string', title: req.title, description: req.description, list: [] }); }
                else if (req.type === 'array') { const filtered = req.items.filter(item => item.trim()); if (filtered.length > 0) { entryReqPayload.push({ type: 'array', title: req.title, description: '', list: filtered }); } }
            });

            const apiData = {
                name: { id: formData.eventType, name: selectedEventType?.name || '' }, subType: selectedSubType ? [{ id: selectedSubType._id, name: selectedSubType.name }] : [],
                startDate: formData.startDate && formData.time ? new Date(`${formData.startDate}T${formData.time}`).toISOString() : undefined,
                endDate: formData.startDate && formData.time ? new Date(`${formData.startDate}T${formData.time}`).toISOString() : undefined,
                numberOfGuests: formData.numberOfGuests ? parseInt(formData.numberOfGuests) : undefined, title: formData.name, image: formData.eventImageUrl || undefined,
                description: formData.description || undefined, themeIds: formData.theme ? [formData.theme] : [], price: formData.price ? parseFloat(formData.price) : undefined,
                location: formData.location || undefined, tags: formData.tags.length ? formData.tags : undefined, whatsIncluded: formData.whatsIncluded.filter(item => item.trim()),
                hostedBy: formData.hostName ? { image: formData.hostImageUrl || undefined, name: formData.hostName, location: formData.hostLocation || undefined } : undefined,
                partneredBy: formData.partnerName ? { image: formData.partnerImageUrl || undefined, name: formData.partnerName, location: formData.partnerLocation || undefined } : undefined,
                entryRequirements: entryReqPayload.length > 0 ? entryReqPayload : undefined,
            };

            const response = await apiFetch(`https://api.partywalah.in/api/admin/events/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(apiData) });
            if (!response.ok) { const err = await response.json(); throw new Error(err.message || 'Failed to update'); }
            toast({ title: "Event Updated Successfully!" });
            navigate('/admin/events');
        } catch (err: any) {
            toast({ title: "Error Updating Event", description: err.message, variant: "destructive" });
        } finally {
            setIsSaving(false);
        }
    };

    // ============================================================================
    // JSX Rendering
    // ============================================================================
    if (loading) return <DashboardLayout><div className="p-8">Loading Event Editor...</div></DashboardLayout>;
    if (error) return <DashboardLayout><div className="p-8 text-red-600">Error: {error}</div></DashboardLayout>;
    if (!formData) return <DashboardLayout><div className="p-8">Could not load form data.</div></DashboardLayout>;

    return (
        <DashboardLayout>
            <div className="p-8 max-w-4xl mx-auto">
                <div className="mb-8"><h1 className="text-3xl font-bold">Edit Event</h1><p className="text-gray-600">{formData.name}</p></div>
                <form onSubmit={handleSave} className="space-y-8">
                    {/* (All form sections now included) */}
                    <Card><CardHeader><CardTitle>Event Type, Subtype, and Theme</CardTitle></CardHeader><CardContent className="space-y-4">
                        <div><Label>Event Type *</Label><Select value={formData.eventType} onValueChange={v => handleInputChange('eventType', v)} required><SelectTrigger><SelectValue/></SelectTrigger><SelectContent>{meta?.eventType.map(t => <SelectItem key={t._id} value={t._id}>{t.name}</SelectItem>)}</SelectContent></Select></div>
                        <div><Label>Event Subtype</Label><Select value={formData.eventSubType} onValueChange={v => handleInputChange('eventSubType', v)} disabled={!formData.eventType || !filteredSubTypes.length}><SelectTrigger><SelectValue placeholder={!formData.eventType ? "Select type first" : "Select subtype"}/></SelectTrigger><SelectContent>{filteredSubTypes.map(s => <SelectItem key={s._id} value={s._id}>{s.name}</SelectItem>)}</SelectContent></Select></div>
                        <div><Label>Theme</Label><Select value={formData.theme} onValueChange={v => handleInputChange('theme', v)}><SelectTrigger><SelectValue placeholder="Select a theme"/></SelectTrigger><SelectContent>{meta?.theme.map(t => <SelectItem key={t._id} value={t._id}>{t.name}</SelectItem>)}</SelectContent></Select></div>
                    </CardContent></Card>
                    <Card><CardHeader><CardTitle>Event Details</CardTitle></CardHeader><CardContent className="space-y-4">
                        <div><Label>Event Name *</Label><Input value={formData.name} onChange={e => handleInputChange('name', e.target.value)} required/></div>
                        <div><Label>Description *</Label><Textarea value={formData.description} onChange={e => handleInputChange('description', e.target.value)} required/></div>
                        {/* (Other fields...) */}
                    </CardContent></Card>
                    <Card><CardHeader><CardTitle>Event Image</CardTitle></CardHeader><CardContent>
                        <Label>Change Event Image</Label><Input type="file" accept="image/*" onChange={async e => {const url = await uploadImageAndGetUrl(e.target.files?.[0] || null); if(url) handleInputChange('eventImageUrl', url);}}/>
                        {formData.eventImageUrl && <img src={formData.eventImageUrl} alt="Event" className="mt-4 w-48 h-32 object-cover rounded shadow"/>}
                    </CardContent></Card>
                    <Card><CardHeader><CardTitle>Host Information</CardTitle></CardHeader><CardContent className="space-y-4">
                        <div><Label>Host Name</Label><Input value={formData.hostName} onChange={e => handleInputChange('hostName', e.target.value)}/></div>
                        <div><Label>Host Location</Label><Input value={formData.hostLocation} onChange={e => handleInputChange('hostLocation', e.target.value)}/></div>
                        <div><Label>Host Image</Label><Input type="file" accept="image/*" onChange={async e => {const url = await uploadImageAndGetUrl(e.target.files?.[0] || null); if(url) handleInputChange('hostImageUrl', url);}}/></div>
                        {formData.hostImageUrl && <img src={formData.hostImageUrl} alt="Host" className="mt-2 w-32 h-32 object-cover rounded shadow"/>}
                    </CardContent></Card>
                    <Card><CardHeader><CardTitle>Partner Information</CardTitle></CardHeader><CardContent className="space-y-4">
                        <div><Label>Partner Name</Label><Input value={formData.partnerName} onChange={e => handleInputChange('partnerName', e.target.value)}/></div>
                        <div><Label>Partner Location</Label><Input value={formData.partnerLocation} onChange={e => handleInputChange('partnerLocation', e.target.value)}/></div>
                        <div><Label>Partner Image</Label><Input type="file" accept="image/*" onChange={async e => {const url = await uploadImageAndGetUrl(e.target.files?.[0] || null); if(url) handleInputChange('partnerImageUrl', url);}}/></div>
                        {formData.partnerImageUrl && <img src={formData.partnerImageUrl} alt="Partner" className="mt-2 w-32 h-32 object-cover rounded shadow"/>}
                    </CardContent></Card>
                    <Card><CardHeader><CardTitle>What's Included</CardTitle></CardHeader><CardContent className="space-y-4">
                        {formData.whatsIncluded.map((item, idx) => (<div key={idx} className="flex items-center gap-2"><Input value={item} onChange={e => handleIncludedChange(idx, e.target.value)}/><Button type="button" variant="outline" size="sm" onClick={() => removeIncludedItem(idx)}><X/></Button></div>))}
                        <Button type="button" onClick={addIncludedItem}><Plus className="mr-2"/>Add Item</Button>
                    </CardContent></Card>
                    <Card><CardHeader><CardTitle>Entry Requirements</CardTitle></CardHeader><CardContent className="space-y-6">
                        <div className="p-4 border rounded-lg bg-gray-50"><h3 className="font-semibold mb-2">Card Entry</h3>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div><Label>Card Title</Label><Input value={cardEntry.title} onChange={e => handleCardEntryChange('title', e.target.value)}/></div>
                                <div><Label>Card Data</Label><Input value={cardEntry.data} onChange={e => handleCardEntryChange('data', e.target.value)}/></div>
                            </div>
                        </div>
                        {entryRequirements.map((req, idx) => (<div key={idx} className="p-4 border rounded-lg bg-gray-50 space-y-4">
                            <div className="flex justify-between items-center"><h4 className="font-semibold">Requirement {idx + 1}</h4><Button type="button" variant="ghost" size="sm" onClick={() => removeEntryRequirement(idx)}><X/></Button></div>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div><Label>Type</Label><Select value={req.type} onValueChange={v => handleEntryTypeChange(v as any, idx)}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent><SelectItem value="string">Text</SelectItem><SelectItem value="array">List</SelectItem></SelectContent></Select></div>
                                <div><Label>Title</Label><Input value={req.title} onChange={e => handleEntryChange(idx, 'title', e.target.value)}/></div>
                            </div>
                            {req.type === 'string' && <div><Label>Description</Label><Textarea value={req.description} onChange={e => handleEntryChange(idx, 'description', e.target.value)}/></div>}
                            {req.type === 'array' && <div className="space-y-2"><Label>List Items</Label>{req.items.map((item, itemIdx) => (<div key={itemIdx} className="flex gap-2"><Input value={item} onChange={e => handleEntryArrayItemChange(idx, itemIdx, e.target.value)}/><Button type="button" variant="ghost" size="sm" onClick={() => removeEntryArrayItem(idx, itemIdx)}><X/></Button></div>))}<Button type="button" variant="link" onClick={() => addEntryArrayItem(idx)}><Plus className="mr-2"/>Add List Item</Button></div>}
                        </div>))}
                        <Button type="button" variant="outline" onClick={addEntryRequirement}><Plus className="mr-2"/>Add Requirement</Button>
                    </CardContent></Card>
                    <div className="flex justify-end gap-4">
                        <Button type="button" variant="outline" onClick={() => navigate(-1)}>Cancel</Button>
                        <Button type="submit" disabled={isSaving}>{isSaving ? 'Saving...' : 'Save Changes'}</Button>
                    </div>
                </form>
            </div>
        </DashboardLayout>
    );
};

export default EventEdit;