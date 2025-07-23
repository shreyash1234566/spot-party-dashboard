// ============================================================================
// Imports
// ============================================================================
import { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '../contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { FileImage } from 'lucide-react';

// ============================================================================
// Interfaces
// ============================================================================
interface ParentType {
  _id: string;
  name: string;
}

interface SubType {
  _id: string;
  name: string;
  parent: string; // This is the ID of the parent
  image: string | null;
}

// ============================================================================
// Component Definition
// ============================================================================
const MetadataSubType = () => {
  // State for creating a new sub-type
  const [newSubType, setNewSubType] = useState({
    name: '',
    parentId: '',
    imageFile: null as File | null,
    imageUrl: '',
  });

  // State for the lists of data
  const [parentTypes, setParentTypes] = useState<ParentType[]>([]);
  const [subTypes, setSubTypes] = useState<SubType[]>([]);
  
  // General component state
  const [loading, setLoading] = useState(false);
  const [editIdx, setEditIdx] = useState<number | null>(null);
  const [editValue, setEditValue] = useState('');
  const [editParentId, setEditParentId] = useState('');

  const { user } = useAuth();
  const token = localStorage.getItem('token') || '';

  // ============================================================================
  // Data Fetching & Helpers
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

  const fetchMeta = async () => {
    setLoading(true);
    try {
      const res = await fetch('https://api.partywalah.in/api/events/get-event-meta', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch metadata');
      const data = await res.json();
      setParentTypes(data.eventType || []);
      setSubTypes(data.eventSubType || []);
    } catch (err) {
      toast({ title: 'Error', description: 'Could not fetch metadata.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeta();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ============================================================================
  // Handlers
  // ============================================================================

  const handleAdd = async () => {
    if (newSubType.name.trim() && newSubType.parentId && newSubType.imageUrl) {
      setLoading(true);
      try {
        const res = await fetch('https://api.partywalah.in/api/events/create-event-sub-type', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: newSubType.name.trim(),
            parent: newSubType.parentId,
            image: newSubType.imageUrl,
          }),
        });
        if (!res.ok) {
           const errorData = await res.json();
           throw new Error(errorData.message || 'Failed to create sub-type');
        }
        setNewSubType({ name: '', parentId: '', imageFile: null, imageUrl: '' });
        toast({ title: 'Success', description: 'Sub-type created!' });
        await fetchMeta(); // Refresh both lists
      } catch (err: any) {
        toast({ title: 'Error', description: err.message, variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    } else {
      toast({ title: 'Missing Information', description: 'Please provide a parent type, a name, and an image.', variant: 'destructive' });
    }
  };

  const handleDelete = async (subTypeId: string) => {
    setLoading(true);
    try {
      const res = await fetch(`https://api.partywalah.in/api/admin/event-subtype/${subTypeId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to delete sub-type');
      toast({ title: 'Success', description: 'Sub-type deleted!' });
      await fetchMeta();
    } catch (err) {
      toast({ title: 'Error', description: 'Could not delete sub-type', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const getParentName = (parentId: string) => {
    return parentTypes.find(p => p._id === parentId)?.name || 'Unknown Parent';
  };

  const handleEdit = (idx: number) => {
    setEditIdx(idx);
    setEditValue(subTypes[idx].name);
    setEditParentId(subTypes[idx].parent);
  };

  const handleSave = async (idx: number) => {
    if (editValue.trim() && editParentId) {
      setLoading(true);
      try {
        const res = await fetch(`https://api.partywalah.in/api/admin/event-subtype/${subTypes[idx]._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ 
            name: editValue.trim(), 
            parent: editParentId,
            image: subTypes[idx].image 
          }),
        });
        if (!res.ok) throw new Error('Failed to update sub-type');
        setEditIdx(null);
        setEditValue('');
        setEditParentId('');
        toast({ title: 'Success', description: 'Sub-type updated!' });
        await fetchMeta();
      } catch (err) {
        toast({ title: 'Error', description: 'Could not update sub-type', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    } else {
      setEditIdx(null);
      setEditValue('');
      setEditParentId('');
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto p-4 sm:p-8">
        <Card>
          <CardHeader>
            <CardTitle>Event Sub-Types</CardTitle>
            <CardDescription>Manage specific variations for each main event type.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* Section for Adding New Sub-Type */}
            <div className="space-y-4 p-4 border rounded-lg">
              <h3 className="font-semibold">Add New Sub-Type</h3>
              <div className="space-y-2">
                <Label htmlFor="parentType">Parent Event Type <span className="text-red-500">*</span></Label>
                <Select
                  value={newSubType.parentId}
                  onValueChange={(value) => setNewSubType(prev => ({ ...prev, parentId: value }))}
                >
                  <SelectTrigger className="w-full h-11">
                    <SelectValue placeholder="Select a parent event type" />
                  </SelectTrigger>
                  <SelectContent>
                    {parentTypes.map((type) => (
                      <SelectItem key={type._id} value={type._id}>{type.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="subTypeName">Sub-Type Name <span className="text-red-500">*</span></Label>
                <Input
                  id="subTypeName"
                  value={newSubType.name}
                  onChange={e => setNewSubType(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g. Haldi, Sangeet, Mehendi"
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="subTypeImage">Sub-Type Image <span className="text-red-500">*</span></Label>
                <Input
                  id="subTypeImage"
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0] || null;
                    setNewSubType(prev => ({ ...prev, imageFile: file, imageUrl: '' }));
                    if (file) {
                      const url = await uploadImageAndGetUrl(file);
                      setNewSubType(prev => ({ ...prev, imageUrl: url }));
                    }
                  }}
                  className="h-11"
                />
                {newSubType.imageUrl && (
                  <div className="mt-2">
                    <img src={newSubType.imageUrl} alt="Preview" className="w-24 h-24 object-cover rounded shadow" />
                  </div>
                )}
              </div>
              <Button onClick={handleAdd} disabled={!newSubType.name.trim() || !newSubType.parentId || !newSubType.imageUrl || loading}>
                {loading ? 'Adding...' : 'Add Sub-Type'}
              </Button>
            </div>
            
            {/* Section for Listing Existing Sub-Types */}
            <div>
              <Label>Existing Sub-Types</Label>
              <div className="mt-2 space-y-2">
                {loading && subTypes.length === 0 && <p className="text-gray-400 text-sm">Loading...</p>}
                {!loading && subTypes.length === 0 && <p className="text-gray-400 text-sm">No sub-types have been created yet.</p>}
                {subTypes.map((sub, idx) => (
                  <div key={sub._id} className="flex items-center justify-between bg-gray-50 p-2 rounded-md">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 rounded-md">
                        <AvatarImage src={sub.image || undefined} />
                        <AvatarFallback className="rounded-md bg-gray-200">
                          <FileImage className="h-5 w-5 text-gray-400" />
                        </AvatarFallback>
                      </Avatar>
                      {editIdx === idx ? (
                        <div className="space-y-2">
                          <Input 
                            value={editValue} 
                            onChange={e => setEditValue(e.target.value)} 
                            className="h-9" 
                            placeholder="Sub-type name"
                          />
                          <Select value={editParentId} onValueChange={setEditParentId}>
                            <SelectTrigger className="h-9">
                              <SelectValue placeholder="Select parent" />
                            </SelectTrigger>
                            <SelectContent>
                              {parentTypes.map((type) => (
                                <SelectItem key={type._id} value={type._id}>{type.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      ) : (
                        <div>
                          <div className="font-medium">{sub.name}</div>
                          <div className="text-xs text-gray-500">Parent: {getParentName(sub.parent)}</div>
                        </div>
                      )}
                    </div>
                    
                    {editIdx === idx ? (
                      <div className="flex gap-2 items-center">
                        <Button size="sm" onClick={() => handleSave(idx)} disabled={!editValue.trim() || !editParentId || loading}>
                          {loading ? '...' : 'Save'}
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => {
                          setEditIdx(null);
                          setEditValue('');
                          setEditParentId('');
                        }}>Cancel</Button>
                      </div>
                    ) : (
                      <div className="flex gap-2 items-center">
                        <Button size="sm" variant="outline" onClick={() => handleEdit(idx)}>Edit</Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDelete(sub._id)} disabled={loading}>Delete</Button>
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

export default MetadataSubType;