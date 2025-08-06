import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { ArrowLeft, Plus, Trash2 , FileText} from 'lucide-react';

// Define the shape of a singleDescription item
interface DescriptionItem {
  id: number;
  question: string;
  answer: string;
}

const DescriptionCreate = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token') || '';

  // State now holds an array of Description items, starting with one empty item
  const [Descriptions, setDescriptions] = useState<DescriptionItem[]>([
    { id: Date.now(), question: '', answer: '' },
  ]);
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- Handlers for the dynamic array ---

  // Adds a new, empty Description item to the state
  const addDescriptionItem = () => {
    setDescriptions(prevDescriptions => [...prevDescriptions, { id: Date.now(), question: '', answer: '' }]);
  };

  // Removes an Description item by its unique ID
  const removeDescriptionItem = (idToRemove: number) => {
    // Prevent removing the very last item
    if (Descriptions.length <= 1) return; 
    setDescriptions(prevDescriptions => prevDescriptions.filter(Description => Description.id !== idToRemove));
  };

  // Updates a specific field (question or answer) of a specific Description item
  const handleDescriptionChange = (id: number, field: 'question' | 'answer', value: string) => {
    setDescriptions(prevDescriptions => 
      prevDescriptions.map(Description => 
        Description.id === id ? { ...Description, [field]: value } : Description
      )
    );
  };
  
  // --- Submission Logic ---

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate that no question or answer is empty
    const isInvalid = Descriptions.some(Description => !Description.question.trim() || !Description.answer.trim());
    if (isInvalid) {
      toast({
        title: 'Missing Information',
        description: 'Please fill out all question and answer fields.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    
    const payload = Descriptions.map(({ question, answer }) => ({
  question: question.trim(),
  answer: answer.trim()
}));


    try {
      // NOTE: Assumed API endpoint. Please change if it's different.
      const res = await fetch('https://party.free.beeceptor.com', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          //'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to create Descriptions');
      }

      toast({
        title: 'Success',
        description: 'Descriptions created successfully!',
      });

      navigate('/Description/list');
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const isFormInvalid = Descriptions.some(Description => !Description.question.trim() || !Description.answer.trim());

  return (
    <DashboardLayout>
      <div className="p-4 md:p-8">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <Button
              variant="ghost"
              onClick={() => navigate('/Description/list')}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Description List
            </Button>
            
            <div className="flex items-center mb-2">
              < FileText  className="w-8 h-8 text-indigo-600 mr-3" />
              <h1 className="text-3xl font-bold text-gray-900">Create New Descriptions</h1>
            </div>
            <p className="text-gray-600">Add one or more questions and answers.</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Description Details</CardTitle>
              <CardDescription>
                Enter the questions and their corresponding answers below.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Dynamically render form blocks for each Description item */}
                {Descriptions.map((Description, index) => (
                  <div key={Description.id} className="p-4 border rounded-lg relative space-y-4 bg-gray-50/50">
                    <h3 className="font-semibold text-gray-700">Description #{index + 1}</h3>
                    
                    {/* Only show remove button if it's not the last one */}
                    {Descriptions.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2 text-red-500 hover:bg-red-100 hover:text-red-600"
                        onClick={() => removeDescriptionItem(Description.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor={`question-${Description.id}`}>
                        Question <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id={`question-${Description.id}`}
                        type="text"
                        placeholder="e.g., What is the cancellation policy?"
                        value={Description.question}
                        onChange={(e) => handleDescriptionChange(Description.id, 'question', e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`answer-${Description.id}`}>
                        Answer <span className="text-red-500">*</span>
                      </Label>
                      <Textarea
                        id={`answer-${Description.id}`}
                        placeholder="Provide a clear and concise answer..."
                        value={Description.answer}
                        onChange={(e) => handleDescriptionChange(Description.id, 'answer', e.target.value)}
                        rows={4}
                        required
                      />
                    </div>
                  </div>
                ))}
                
                {/* Button to add a new Description block */}
                <Button
                  type="button"
                  variant="outline"
                  onClick={addDescriptionItem}
                  className="w-full"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add another Description
                </Button>

                {/* Form action buttons */}
                <div className="flex flex-col sm:flex-row gap-4 pt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/Description/list')}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting || isFormInvalid}
                    className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
                  >
                    {isSubmitting ? 'Creating...' : 'Create Descriptions'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DescriptionCreate;