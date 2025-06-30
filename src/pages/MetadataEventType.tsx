import DashboardLayout from '../components/DashboardLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useState, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '../contexts/AuthContext';

interface EventType {
  _id: string;
  name: string;
}

const MetadataEventType = () => {
  const [eventType, setEventType] = useState('');
  const [eventTypes, setEventTypes] = useState<EventType[]>([]);
  const [loading, setLoading] = useState(false);
  const [editIdx, setEditIdx] = useState<number | null>(null);
  const [editValue, setEditValue] = useState('');
  const { user } = useAuth();
  // Use token from localStorage for API auth
  const token = localStorage.getItem('token') || '';

  // Fetch all event types
  const fetchEventTypes = async () => {
    try {
      const res = await fetch('http://44.203.188.5:3000/api/events/get-event-meta', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch event types');
      const data = await res.json();
      setEventTypes(data.eventTypes || []);
    } catch (err) {
      toast({ title: 'Error', description: 'Could not fetch event types', variant: 'destructive' });
    }
  };

  useEffect(() => {
    fetchEventTypes();
    // eslint-disable-next-line
  }, []);

  const handleAdd = async () => {
    if (eventType.trim()) {
      setLoading(true);
      try {
        const res = await fetch('http://44.203.188.5:3000/api/events/create-event-type', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ name: eventType.trim() }),
        });
        if (!res.ok) throw new Error('Failed to create event type');
        setEventType('');
        toast({ title: 'Success', description: 'Event type created!' });
        fetchEventTypes();
      } catch (err) {
        toast({ title: 'Error', description: 'Could not create event type', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
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
        const res = await fetch(`http://44.203.188.5:3000/api/events/update-event-type/${eventTypes[idx]._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ name: editValue.trim() }),
        });
        if (!res.ok) throw new Error('Failed to update event type');
        setEditIdx(null);
        setEditValue('');
        toast({ title: 'Success', description: 'Event type updated!' });
        fetchEventTypes();
      } catch (err) {
        toast({ title: 'Error', description: 'Could not update event type', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    } else {
      setEditIdx(null);
      setEditValue('');
    }
  };

  const handleDelete = async (idx: number) => {
    setLoading(true);
    try {
      const res = await fetch(`http://44.203.188.5:3000/api/events/delete-event-type/${eventTypes[idx]._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error('Failed to delete event type');
      setEditIdx(null);
      setEditValue('');
      toast({ title: 'Success', description: 'Event type deleted!' });
      fetchEventTypes();
    } catch (err) {
      toast({ title: 'Error', description: 'Could not delete event type', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-xl mx-auto p-8">
        <Card>
          <CardHeader>
            <CardTitle>Event Types</CardTitle>
            <p className="text-gray-500 text-sm">Create, view, edit, and delete event types for your events.</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="eventType">Add New Event Type <span className="text-red-500">*</span></Label>
              <div className="flex gap-2">
                <Input id="eventType" value={eventType} onChange={e => setEventType(e.target.value)} placeholder="e.g. Birthday, Conference" className="h-11" />
                <Button onClick={handleAdd} disabled={!eventType.trim() || loading}>{loading ? 'Adding...' : 'Add'}</Button>
              </div>
            </div>
            <div>
              <Label>Existing Event Types</Label>
              <ul className="mt-2 space-y-1">
                {eventTypes.length === 0 && <li className="text-gray-400 text-sm">No event types yet.</li>}
                {eventTypes.map((type, idx) => (
                  <li key={type._id} className="bg-gray-100 rounded px-3 py-1 inline-block mr-2 mb-2 text-sm">
                    {editIdx === idx ? (
                      <span className="flex gap-2 items-center">
                        <Input value={editValue} onChange={e => setEditValue(e.target.value)} className="h-8 w-32" />
                        <Button size="sm" onClick={() => handleSave(idx)} disabled={!editValue.trim() || loading}>{loading ? 'Saving...' : 'Save'}</Button>
                        <Button size="sm" variant="outline" onClick={() => setEditIdx(null)}>Cancel</Button>
                      </span>
                    ) : (
                      <span className="flex gap-2 items-center">
                        {type.name}
                        <Button size="sm" variant="outline" onClick={() => handleEdit(idx)}>Edit</Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDelete(idx)} disabled={loading}>Delete</Button>
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default MetadataEventType;
