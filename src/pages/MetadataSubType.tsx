import DashboardLayout from '../components/DashboardLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState } from 'react';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '../contexts/AuthContext';

const eventTypeOptions = ['Birthday', 'Conference', 'Wedding']; // Replace with API data

const MetadataSubType = () => {
  const [subType, setSubType] = useState('');
  const [parentType, setParentType] = useState('');
  const [subTypes, setSubTypes] = useState<{name: string, parent: string}[]>([]);
  const [editIdx, setEditIdx] = useState<number | null>(null);
  const [editValue, setEditValue] = useState('');
  const [editParent, setEditParent] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const token = (user && (user.token as string)) || localStorage.getItem('token') || '';

  const handleAdd = async () => {
    if (subType.trim() && parentType) {
      setLoading(true);
      try {
        const res = await fetch('https://api.partywalah.in/api/events/create-event-sub-type', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ name: subType.trim(), parent: parentType }),
        });
        if (!res.ok) throw new Error('Failed to create sub type');
        toast({ title: 'Success', description: 'Sub type created!' });
        setSubTypes([...subTypes, { name: subType.trim(), parent: parentType }]);
        setSubType('');
      } catch (err) {
        toast({ title: 'Error', description: 'Could not create sub type', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    }
  };

  const handleEdit = (idx: number) => {
    setEditIdx(idx);
    setEditValue(subTypes[idx].name);
    setEditParent(subTypes[idx].parent);
  };

  const handleSave = async (idx: number) => {
    if (editValue.trim() && editParent) {
      setLoading(true);
      try {
        const res = await fetch('https://api.partywalah.in/api/events/update-event-sub-type', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ name: editValue.trim(), parent: editParent }),
        });
        if (!res.ok) throw new Error('Failed to update sub type');
        toast({ title: 'Success', description: 'Sub type updated!' });
        const updatedSubTypes = [...subTypes];
        updatedSubTypes[idx] = { name: editValue.trim(), parent: editParent };
        setSubTypes(updatedSubTypes);
        setEditIdx(null);
        setEditValue('');
        setEditParent('');
      } catch (err) {
        toast({ title: 'Error', description: 'Could not update sub type', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    }
  };

  const handleDelete = async (idx: number) => {
    setLoading(true);
    try {
      const res = await fetch('https://api.partywalah.in/api/events/delete-event-sub-type', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ name: subTypes[idx].name, parent: subTypes[idx].parent }),
      });
      if (!res.ok) throw new Error('Failed to delete sub type');
      toast({ title: 'Success', description: 'Sub type deleted!' });
      setSubTypes(subTypes.filter((_, i) => i !== idx));
      if (editIdx === idx) {
        setEditIdx(null);
        setEditValue('');
        setEditParent('');
      }
    } catch (err) {
      toast({ title: 'Error', description: 'Could not delete sub type', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-xl mx-auto p-8">
        <Card>
          <CardHeader>
            <CardTitle>Event Sub-Types</CardTitle>
            <p className="text-gray-500 text-sm">Create, view, edit, and delete sub-types for each event type.</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="parentType">Parent Event Type <span className="text-red-500">*</span></Label>
              <Select value={parentType} onValueChange={setParentType}>
                <SelectTrigger className="w-full h-11">
                  <SelectValue placeholder="Select event type" />
                </SelectTrigger>
                <SelectContent>
                  {eventTypeOptions.map((type, idx) => (
                    <SelectItem key={idx} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="subType">Add New Sub-Type <span className="text-red-500">*</span></Label>
              <div className="flex gap-2">
                <Input id="subType" value={subType} onChange={e => setSubType(e.target.value)} placeholder="e.g. Kids, Corporate" className="h-11" />
                <Button onClick={handleAdd} disabled={!subType.trim() || !parentType} isLoading={loading}>Add</Button>
              </div>
            </div>
            <div>
              <Label>Existing Sub-Types</Label>
              <ul className="mt-2 space-y-1">
                {subTypes.length === 0 && <li className="text-gray-400 text-sm">No sub-types yet.</li>}
                {subTypes.map((sub, idx) => (
                  <li key={idx} className="bg-gray-100 rounded px-3 py-1 inline-block mr-2 mb-2 text-sm">
                    {editIdx === idx ? (
                      <span className="flex gap-2 items-center">
                        <Input value={editValue} onChange={e => setEditValue(e.target.value)} className="h-8 w-32" />
                        <Select value={editParent} onValueChange={setEditParent}>
                          <SelectTrigger className="h-8 w-32">
                            <SelectValue placeholder="Parent" />
                          </SelectTrigger>
                          <SelectContent>
                            {eventTypeOptions.map((type, i) => (
                              <SelectItem key={i} value={type}>{type}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button size="sm" onClick={() => handleSave(idx)} disabled={!editValue.trim() || !editParent} isLoading={loading}>Save</Button>
                        <Button size="sm" variant="outline" onClick={() => setEditIdx(null)}>Cancel</Button>
                      </span>
                    ) : (
                      <span className="flex gap-2 items-center">
                        {sub.name} <span className="text-gray-400">({sub.parent})</span>
                        <Button size="sm" variant="outline" onClick={() => handleEdit(idx)}>Edit</Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDelete(idx)}>Delete</Button>
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

export default MetadataSubType;
