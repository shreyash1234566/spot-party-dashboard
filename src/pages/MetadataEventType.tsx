// ============================================================================
// Imports
// ============================================================================
import { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '../contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'; // Import Avatar
import { FileImage } from 'lucide-react'; // Import an icon for fallback

// ============================================================================
// Interfaces
// ============================================================================
interface EventType {
  _id: string;
  name: string;
  image: string | null; // The image URL can be null
}

// ============================================================================
// Component Definition
// ============================================================================
const MetadataEventType = () => {
  // State for creating a NEW event type
  const [newEventType, setNewEventType] = useState({
    name: '',
    imageFile: null as File | null,
    imageUrl: '',
  });
  
  // State for the list of existing event types
  const [eventTypes, setEventTypes] = useState<EventType[]>([]);
  const [loading, setLoading] = useState(false);
  
  // State for inline editing
  const [editIdx, setEditIdx] = useState<number | null>(null);
  const [editValue, setEditValue] = useState('');

  const { user } = useAuth(); // Assuming this is for auth checks
  const token = localStorage.getItem('token') || '';

  // ============================================================================
  // Helper Functions
  // ============================================================================
  const uploadImageAndGetUrl = async (file: File | null): Promise<string> => {
    if (!file) return '';
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await fetch('https://api.partywalah.in/api/admin/file-upload', {
        method: 'POST',
        body: formData,
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Image upload failed');
      const data = await res.json();
      return data?.data?.url || '';
    } catch (err) {
      console.error('Image upload error:', err);
      toast({ title: 'Error', description: 'Image upload failed.', variant: 'destructive' });
      return '';
    }
  };

  const fetchEventTypes = async () => {
    setLoading(true);
    try {
      const res = await fetch('https://api.partywalah.in/api/events/get-event-meta', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch event types');
      const data = await res.json();
      
      // ===================================================================
      // THE FIX IS HERE: Access eventType directly from the data object
      // ===================================================================
      setEventTypes(data.eventType || []);
      
    } catch (err) {
      toast({ title: 'Error', description: 'Could not fetch event types.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEventTypes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ============================================================================
  // Handlers
  // ============================================================================
  const handleAdd = async () => {
    if (newEventType.name.trim() && newEventType.imageUrl) {
      setLoading(true);
      try {
        const res = await fetch('https://api.partywalah.in/api/events/create-event-type', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: newEventType.name.trim(),
            image: newEventType.imageUrl,
          }),
        });
        if (!res.ok) {
           const errorData = await res.json();
           throw new Error(errorData.message || 'Failed to create event type');
        }
        setNewEventType({ name: '', imageFile: null, imageUrl: '' });
        toast({ title: 'Success', description: 'Event type created!' });
        await fetchEventTypes(); // Refresh the list
      } catch (err: any) {
        toast({ title: 'Error', description: err.message, variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    } else {
        toast({ title: 'Missing Information', description: 'Please provide both a name and an image.', variant: 'destructive' });
    }
  };

  const handleEdit = (idx: number) => {
    setEditIdx(idx);
    setEditValue(eventTypes[idx].name);
  };

  const handleSave = async (idx: number) => {
    if (editValue.trim() && eventTypes[idx].name !== editValue.trim()) {
      setLoading(true);
      try {
        // NOTE: The update endpoint may also need to support image updates in the future.
        const res = await fetch(`https://api.partywalah.in/api/admin/event-type/${eventTypes[idx]._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ name: editValue.trim(), image: eventTypes[idx].image }),
        });
        if (!res.ok) throw new Error('Failed to update event type');
        setEditIdx(null); setEditValue('');
        toast({ title: 'Success', description: 'Event type updated!' });
        await fetchEventTypes();
      } catch (err) {
        toast({ title: 'Error', description: 'Could not update event type', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    } else {
      setEditIdx(null); setEditValue('');
    }
  };

  const handleDelete = async (idx: number) => {
    setLoading(true);
    try {
      const id = eventTypes[idx]._id;
      const res = await fetch(`https://api.partywalah.in/api/admin/event-type/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to delete event type');
      toast({ title: 'Success', description: 'Event type deleted!' });
      await fetchEventTypes();
    } catch (err) {
      toast({ title: 'Error', description: 'Could not delete event type', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto p-4 sm:p-8">
        <Card>
          <CardHeader>
            <CardTitle>Event Types</CardTitle>
            <CardDescription>Create, view, and manage event types.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* Section for Adding New Event Type */}
            <div className="space-y-4 p-4 border rounded-lg">
              <h3 className="font-semibold">Add New Event Type</h3>
              <div className="space-y-2">
                <Label htmlFor="new-event-type-name">Type Name <span className="text-red-500">*</span></Label>
                <Input
                  id="new-event-type-name"
                  value={newEventType.name}
                  onChange={e => setNewEventType(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g. Wedding, Birthday Party"
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-event-type-image">Type Image <span className="text-red-500">*</span></Label>
                <Input
                  id="new-event-type-image"
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0] || null;
                    setNewEventType(prev => ({ ...prev, imageFile: file, imageUrl: '' }));
                    if (file) {
                      const url = await uploadImageAndGetUrl(file);
                      setNewEventType(prev => ({ ...prev, imageUrl: url }));
                    }
                  }}
                  className="h-11"
                />
                {newEventType.imageUrl && (
                  <div className="mt-2">
                    <img src={newEventType.imageUrl} alt="Preview" className="w-24 h-24 object-cover rounded shadow" />
                  </div>
                )}
              </div>
              <Button onClick={handleAdd} disabled={!newEventType.name.trim() || !newEventType.imageUrl || loading}>
                {loading ? 'Adding...' : 'Add Event Type'}
              </Button>
            </div>
            
            {/* Section for Listing Existing Types */}
            <div>
              <Label>Existing Event Types</Label>
              <div className="mt-2 space-y-2">
                {loading && eventTypes.length === 0 && <p className="text-gray-400 text-sm">Loading...</p>}
                {!loading && eventTypes.length === 0 && <p className="text-gray-400 text-sm">No event types have been created yet.</p>}
                {eventTypes.map((type, idx) => (
                  <div key={type._id} className="flex items-center justify-between bg-gray-50 p-2 rounded-md">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 rounded-md">
                        <AvatarImage src={type.image || undefined} />
                        <AvatarFallback className="rounded-md bg-gray-200">
                           <FileImage className="h-5 w-5 text-gray-400" />
                        </AvatarFallback>
                      </Avatar>
                      {editIdx === idx ? (
                        <Input value={editValue} onChange={e => setEditValue(e.target.value)} className="h-9" />
                      ) : (
                        <span className="font-medium">{type.name}</span>
                      )}
                    </div>
                    
                    {editIdx === idx ? (
                      <div className="flex gap-2 items-center">
                        <Button size="sm" onClick={() => handleSave(idx)} disabled={!editValue.trim() || loading}>{loading ? '...' : 'Save'}</Button>
                        <Button size="sm" variant="outline" onClick={() => setEditIdx(null)}>Cancel</Button>
                      </div>
                    ) : (
                      <div className="flex gap-2 items-center">
                        <Button size="sm" variant="outline" onClick={() => handleEdit(idx)}>Edit</Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDelete(idx)} disabled={loading}>Delete</Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default MetadataEventType;