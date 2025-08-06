import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { ArrowLeft, HelpCircle, Plus, Trash2 } from 'lucide-react';

// Define the shape of a single FAQ item
interface FaqItem {
  id: number;
  question: string;
  answer: string;
}

const FaqCreate = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token') || '';

  // State now holds an array of FAQ items, starting with one empty item
  const [faqs, setFaqs] = useState<FaqItem[]>([
    { id: Date.now(), question: '', answer: '' },
  ]);
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- Handlers for the dynamic array ---

  // Adds a new, empty FAQ item to the state
  const addFaqItem = () => {
    setFaqs(prevFaqs => [...prevFaqs, { id: Date.now(), question: '', answer: '' }]);
  };

  // Removes an FAQ item by its unique ID
  const removeFaqItem = (idToRemove: number) => {
    // Prevent removing the very last item
    if (faqs.length <= 1) return; 
    setFaqs(prevFaqs => prevFaqs.filter(faq => faq.id !== idToRemove));
  };

  // Updates a specific field (question or answer) of a specific FAQ item
  const handleFaqChange = (id: number, field: 'question' | 'answer', value: string) => {
    setFaqs(prevFaqs => 
      prevFaqs.map(faq => 
        faq.id === id ? { ...faq, [field]: value } : faq
      )
    );
  };
  
  // --- Submission Logic ---

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate that no question or answer is empty
    const isInvalid = faqs.some(faq => !faq.question.trim() || !faq.answer.trim());
    if (isInvalid) {
      toast({
        title: 'Missing Information',
        description: 'Please fill out all question and answer fields.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    
    // Prepare the data for the API (remove the client-side 'id' field)
    const payload = {
      faqs: faqs.map(({ question, answer }) => ({ 
        question: question.trim(), 
        answer: answer.trim() 
      })),
    };

    try {
      // NOTE: Assumed API endpoint. Please change if it's different.
      const res = await fetch('https://api.partywalah.in/api/admin/faq', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to create FAQs');
      }

      toast({
        title: 'Success',
        description: 'FAQs created successfully!',
      });

      navigate('/faq/list');
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
  
  const isFormInvalid = faqs.some(faq => !faq.question.trim() || !faq.answer.trim());

  return (
    <DashboardLayout>
      <div className="p-4 md:p-8">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <Button
              variant="ghost"
              onClick={() => navigate('/faq/list')}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to FAQ List
            </Button>
            
            <div className="flex items-center mb-2">
              <HelpCircle className="w-8 h-8 text-indigo-600 mr-3" />
              <h1 className="text-3xl font-bold text-gray-900">Create New FAQs</h1>
            </div>
            <p className="text-gray-600">Add one or more questions and answers.</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>FAQ Details</CardTitle>
              <CardDescription>
                Enter the questions and their corresponding answers below.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Dynamically render form blocks for each FAQ item */}
                {faqs.map((faq, index) => (
                  <div key={faq.id} className="p-4 border rounded-lg relative space-y-4 bg-gray-50/50">
                    <h3 className="font-semibold text-gray-700">FAQ #{index + 1}</h3>
                    
                    {/* Only show remove button if it's not the last one */}
                    {faqs.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2 text-red-500 hover:bg-red-100 hover:text-red-600"
                        onClick={() => removeFaqItem(faq.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor={`question-${faq.id}`}>
                        Question <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id={`question-${faq.id}`}
                        type="text"
                        placeholder="e.g., What is the cancellation policy?"
                        value={faq.question}
                        onChange={(e) => handleFaqChange(faq.id, 'question', e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`answer-${faq.id}`}>
                        Answer <span className="text-red-500">*</span>
                      </Label>
                      <Textarea
                        id={`answer-${faq.id}`}
                        placeholder="Provide a clear and concise answer..."
                        value={faq.answer}
                        onChange={(e) => handleFaqChange(faq.id, 'answer', e.target.value)}
                        rows={4}
                        required
                      />
                    </div>
                  </div>
                ))}
                
                {/* Button to add a new FAQ block */}
                <Button
                  type="button"
                  variant="outline"
                  onClick={addFaqItem}
                  className="w-full"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add another FAQ
                </Button>

                {/* Form action buttons */}
                <div className="flex flex-col sm:flex-row gap-4 pt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/faq/list')}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting || isFormInvalid}
                    className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
                  >
                    {isSubmitting ? 'Creating...' : 'Create FAQs'}
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

export default FaqCreate;