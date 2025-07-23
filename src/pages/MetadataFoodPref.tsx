import DashboardLayout from '../components/DashboardLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useState, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '../contexts/AuthContext';

interface FoodPref {
  _id: string;
  name: string;
}

const MetadataFoodPref = () => {
  const [foodPref, setFoodPref] = useState('');
  const [foodPrefs, setFoodPrefs] = useState<FoodPref[]>([]);
  const [editIdx, setEditIdx] = useState<number | null>(null);
  const [editValue, setEditValue] = useState('');
  const { user } = useAuth();
  const token = localStorage.getItem('token') || '';
  const [loading, setLoading] = useState(false);

  // Fetch all food preferences
  const fetchFoodPrefs = async () => {
    try {
      const res = await fetch('https://api.partywalah.in/api/events/get-event-meta', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch food preferences');
      const data = await res.json();
      setFoodPrefs(data.foodPrefs || []);
    } catch (err) {
      toast({ title: 'Error', description: 'Could not fetch food preferences', variant: 'destructive' });
    }
  };

  useEffect(() => {
    fetchFoodPrefs();
    // eslint-disable-next-line
  }, []);

  const handleAdd = async () => {
    if (foodPref.trim()) {
      setLoading(true);
      try {
        const res = await fetch('https://api.partywalah.in/api/events/create-food-pref', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ name: foodPref.trim() }),
        });
        if (!res.ok) throw new Error('Failed to create food preference');
        setFoodPref('');
        toast({ title: 'Success', description: 'Food preference created!' });
        fetchFoodPrefs();
      } catch (err) {
        toast({ title: 'Error', description: 'Could not create food preference', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    }
  };

  const handleEdit = (idx: number) => {
    setEditIdx(idx);
    setEditValue(foodPrefs[idx].name);
  };

  const handleSave = async (idx: number) => {
    if (editValue.trim() && foodPrefs[idx].name !== editValue.trim()) {
      setLoading(true);
      try {
        const res = await fetch(`https://api.partywalah.in/api/admin/food-pref/${foodPrefs[idx]._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ name: editValue.trim(), description: 'Updated food preference' }),
        });
        if (!res.ok) throw new Error('Failed to update food preference');
        setEditIdx(null);
        setEditValue('');
        toast({ title: 'Success', description: 'Food preference updated!' });
        fetchFoodPrefs();
      } catch (err) {
        toast({ title: 'Error', description: 'Could not update food preference', variant: 'destructive' });
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
      const res = await fetch(`https://api.partywalah.in/api/admin/food-pref/${foodPrefs[idx]._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error('Failed to delete food preference');
      setEditIdx(null);
      setEditValue('');
      toast({ title: 'Success', description: 'Food preference deleted!' });
      fetchFoodPrefs();
    } catch (err) {
      toast({ title: 'Error', description: 'Could not delete food preference', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-xl mx-auto p-8">
        <Card>
          <CardHeader>
            <CardTitle>Food Preferences</CardTitle>
            <p className="text-gray-500 text-sm">Create, view, edit, and delete food preferences for your events.</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="foodPref">Add New Food Preference <span className="text-red-500">*</span></Label>
              <div className="flex gap-2">
                <Input id="foodPref" value={foodPref} onChange={e => setFoodPref(e.target.value)} placeholder="e.g. Vegetarian, Vegan" className="h-11" />
                <Button onClick={handleAdd} disabled={!foodPref.trim() || loading}>{loading ? 'Submitting...' : 'Add'}</Button>
              </div>
            </div>
            <div>
              <Label>Existing Food Preferences</Label>
              <ul className="mt-2 space-y-1">
                {foodPrefs.length === 0 && <li className="text-gray-400 text-sm">No food preferences yet.</li>}
                {foodPrefs.map((pref, idx) => (
                  <li key={pref._id} className="bg-gray-100 rounded px-3 py-1 inline-block mr-2 mb-2 text-sm">
                    {editIdx === idx ? (
                      <span className="flex gap-2 items-center">
                        <Input value={editValue} onChange={e => setEditValue(e.target.value)} className="h-8 w-32" />
                        <Button size="sm" onClick={() => handleSave(idx)} disabled={!editValue.trim() || loading}>Save</Button>
                        <Button size="sm" variant="outline" onClick={() => setEditIdx(null)}>Cancel</Button>
                      </span>
                    ) : (
                      <span className="flex gap-2 items-center">
                        {pref.name}
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

export default MetadataFoodPref;
