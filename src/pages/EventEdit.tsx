import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface EventType {
  _id: string;
  name?: { name?: string };
  title?: string;
  startDate?: string;
  location?: string;
  price?: number;
  numberOfGuests?: number;
  tags?: string[];
  whatsIncluded?: string[];
  hostedBy?: { name?: string };
  partneredBy?: { name?: string };
  [key: string]: unknown;
}

const EventEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState<EventType | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<EventType | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [allEvents, setAllEvents] = useState<EventType[]>([]);

  useEffect(() => {
    setLoading(true);
    setError(null);
    setAllEvents([]);

    if (!id) {
      setError('No event ID provided');
      setLoading(false);
      return;
    }

    fetch('http://44.203.188.5:3000/api/admin/events', {
      headers: { 'accept': '*/*' }
    })
      .then(res => res.json())
      .then(data => {
        const events = Array.isArray(data) ? data : data.data || [];
        setAllEvents(events);
        const foundEvent = events.find((event: EventType) => event._id === id);
        if (foundEvent) {
          setEvent(foundEvent);
          setForm(foundEvent);
          setLoading(false);
          return;
        }
        tryDifferentEndpoints();
      })
      .catch(() => {
        tryDifferentEndpoints();
      });

    const tryDifferentEndpoints = async () => {
      const endpoints = [
        `http://44.203.188.5:3000/api/admin/events/${id}`,
        `http://44.203.188.5:3000/api/admin/event/${id}`,
        `http://44.203.188.5:3000/api/events/${id}`,
        `http://44.203.188.5:3000/api/event/${id}`,
        `http://44.203.188.5:3000/events/${id}`,
        `http://44.203.188.5:3000/event/${id}`
      ];
      for (const endpoint of endpoints) {
        try {
          const response = await fetch(endpoint, { headers: { 'accept': '*/*' } });
          if (response.ok) {
            const data = await response.json();
            if (data && data._id) {
              setEvent(data);
              setForm(data);
              setLoading(false);
              return;
            } else if (data && data.data && data.data._id) {
              setEvent(data.data);
              setForm(data.data);
              setLoading(false);
              return;
            } else if (Array.isArray(data) && data.length > 0) {
              setEvent(data[0]);
              setForm(data[0]);
              setLoading(false);
              return;
            }
          }
        } catch (err) {
          // Error intentionally ignored while trying different endpoints
        }
      }
      setError('Event not found in any endpoint');
      setLoading(false);
    };
  }, [id]);

  const handleChange = (field: string, value: unknown) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    // Try all possible endpoints for PUT, just like for GET
    const endpoints = [
      `http://44.203.188.5:3000/api/admin/events/${id}`,
      `http://44.203.188.5:3000/api/admin/event/${id}`,
      `http://44.203.188.5:3000/api/events/${id}`,
      `http://44.203.188.5:3000/api/event/${id}`,
      `http://44.203.188.5:3000/events/${id}`,
      `http://44.203.188.5:3000/event/${id}`
    ];
    let success = false;
    for (const endpoint of endpoints) {
      try {
        const res = await fetch(endpoint, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'accept': '*/*' },
          body: JSON.stringify(form)
        });
        if (res.ok) {
          success = true;
          break;
        }
      } catch {
        // Error intentionally ignored while trying different endpoints
      }
    }
    setSaving(false);
    if (success) {
      navigate(-1);
    } else {
      alert('Failed to update event. No endpoint accepted the update.');
    }
  };

  if (loading) return <DashboardLayout><div className="p-8">Loading...</div></DashboardLayout>;
  if (error) return <DashboardLayout><div className="p-8 text-red-600">{error}</div></DashboardLayout>;
  if (!event) return <DashboardLayout><div className="p-8">Event not found.</div></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="p-8 max-w-3xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Edit: {form?.name?.name}</CardTitle>
            <CardDescription>{form?.title}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div><strong>Date:</strong> <Input type="datetime-local" value={form?.startDate?.slice(0,16)} onChange={e => handleChange('startDate', e.target.value)} /></div>
            <div><strong>Location:</strong> <Input value={form?.location} onChange={e => handleChange('location', e.target.value)} /></div>
            <div><strong>Price:</strong> <Input type="number" value={form?.price} onChange={e => handleChange('price', parseFloat(e.target.value))} /></div>
            <div><strong>Number of Guests:</strong> <Input type="number" value={form?.numberOfGuests} onChange={e => handleChange('numberOfGuests', parseInt(e.target.value))} /></div>
            <div><strong>Tags:</strong> <Input value={form?.tags?.join(', ')} onChange={e => handleChange('tags', e.target.value.split(',').map((t:string)=>t.trim()))} /></div>
            <div><strong>What's Included:</strong> <Textarea value={form?.whatsIncluded?.join('\n')} onChange={e => handleChange('whatsIncluded', e.target.value.split('\n'))} /></div>
            <div><strong>Hosted By:</strong> <Input value={form?.hostedBy?.name} onChange={e => handleChange('hostedBy', { ...form.hostedBy, name: e.target.value })} /></div>
            <div><strong>Partnered By:</strong> <Input value={form?.partneredBy?.name} onChange={e => handleChange('partneredBy', { ...form.partneredBy, name: e.target.value })} /></div>
            <div className="flex gap-2 mt-4">
              <Button variant="outline" onClick={() => navigate(-1)}>Cancel</Button>
              <Button onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default EventEdit;
