import { useState, useEffect, FormEvent } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from '@/hooks/use-toast'; // Assuming you use shadcn/ui's use-toast
import DashboardLayout from '../components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Loader2, Save, HelpCircle } from 'lucide-react';

const FaqEdit = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const token = localStorage.getItem('token') || '';

  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(true); // For initial data fetch
  const [submitting, setSubmitting] = useState(false); // For form submission
  const [error, setError] = useState<string | null>(null);

  // Fetch the existing FAQ data to populate the form
  useEffect(() => {
    if (!id) {
      toast({ title: "Error", description: "FAQ ID is missing.", variant: 'destructive' });
      navigate('/faq/list');
      return;
    }

    const fetchFaqData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`https://api.partywalah.in/api/admin/faq/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) {
          throw new Error('Failed to fetch FAQ data.');
        }
        const data = await response.json();
        const faq = data.data || data;
        setQuestion(faq.question);
        setAnswer(faq.answer || '');
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
        setError(errorMessage);
        toast({ title: 'Error', description: 'Could not load FAQ data.', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    };

    fetchFaqData();
  }, [id, navigate, token]);

  // Handle form submission to update the FAQ
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!question.trim() || !answer.trim()) {
      toast({
        title: "Validation Error",
        description: "Question and Answer fields cannot be empty.",
        variant: 'destructive'
      });
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(`https://api.partywalah.in/api/admin/faq/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'accept': 'application/json',
        },
        body: JSON.stringify({ question: question.trim(), answer: answer.trim() })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update the FAQ.');
      }

      toast({ title: 'Success', description: 'FAQ updated successfully!' });
      navigate('/faq/list');

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred during submission.';
      toast({ title: 'Submission Error', description: errorMessage, variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full p-8">
          <Loader2 className="w-8 h-8 animate-spin text-gray-600" />
          <p className="ml-3 text-gray-600">Loading FAQ for editing...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="p-8 text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button asChild variant="outline">
            <Link to="/faq/list">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to FAQ List
            </Link>
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-4 md:p-8">
        <div className="mb-6">
          <Button asChild variant="outline">
            <Link to="/faq/list">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to FAQ List
            </Link>
          </Button>
        </div>
        
        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <div className="flex items-center gap-3">
              <HelpCircle className="w-7 h-7 text-indigo-600" />
              <div>
                <CardTitle className="text-2xl">Edit FAQ</CardTitle>
                <CardDescription>Update the question and answer for this FAQ.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="question">Question</Label>
                <Textarea
                  id="question"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="e.g., What is the cancellation policy?"
                  rows={3}
                  required
                  disabled={submitting}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="answer">Answer</Label>
                <Textarea
                  id="answer"
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder="Provide the detailed answer here..."
                  rows={6}
                  required
                  disabled={submitting}
                />
              </div>
              <div className="flex justify-end pt-4">
                <Button type="submit" disabled={submitting || !question.trim() || !answer.trim()}>
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default FaqEdit;