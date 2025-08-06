import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Edit, HelpCircle, FileText, Calendar, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';

// Define the FAQ interface, consistent with your FaqList component
interface Faq {
  _id: string;
  question: string;
  answer: string;
  createdAt: string;
  updatedAt: string;
}

const FaqView = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const token = localStorage.getItem('token') || '';

  const [faq, setFaq] = useState<Faq | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setError("No FAQ ID provided.");
      setLoading(false);
      return;
    }

    const fetchFaq = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`https://api.partywalah.in/api/admin/faq/${id}`, {
          headers: {
            'accept': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch FAQ details.');
        }

        const data = await response.json();
        setFaq(data.data || data); 
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      } finally {
        setLoading(false);
      }
    };

    fetchFaq();
  }, [id, token]);

  // A helper component for rendering detail rows
  const renderDetailRow = (Icon: React.ElementType, label: string, value: string | undefined) => (
    <div className="flex items-start py-3 border-b border-gray-100 last:border-b-0">
      <Icon className="w-5 h-5 mr-4 text-gray-500 mt-0.5 flex-shrink-0" />
      <div className="flex flex-col">
        <span className="text-sm font-medium text-gray-500">{label}</span>
        <span className="text-md text-gray-800">{value || 'N/A'}</span>
      </div>
    </div>
  );

  // Skeleton loader for a better loading experience
  const ViewSkeleton = () => (
    <Card className="max-w-4xl mx-auto">
        <CardHeader>
            <div className="flex justify-between items-center">
                <div>
                    <Skeleton className="h-8 w-64 mb-2" />
                    <Skeleton className="h-4 w-48" />
                </div>
                <Skeleton className="h-10 w-24" />
            </div>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
        </CardContent>
    </Card>
  );

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

        {loading && <ViewSkeleton />}

        {error && !loading && (
            <div className="text-center py-10">
                <p className="text-red-600 mb-4">{error}</p>
                <Button asChild variant="outline">
                    <Link to="/faq/list">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to FAQ List
                    </Link>
                </Button>
            </div>
        )}

        {faq && !loading && (
          <Card className="max-w-4xl mx-auto">
            <CardHeader>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex-1">
                  <CardTitle className="text-2xl md:text-3xl font-bold flex items-start gap-3">
                    <HelpCircle className="w-8 h-8 mr-1 text-indigo-600 flex-shrink-0 mt-1" />
                    <span>{faq.question}</span>
                  </CardTitle>
                </div>
                <Button onClick={() => navigate(`/faq/edit/${faq._id}`)}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit FAQ
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
                <h3 className="text-sm font-semibold text-gray-600 mb-2 flex items-center">
                    <FileText className="w-4 h-4 mr-2"/> Answer
                </h3>
                <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">{faq.answer}</p>
              </div>

              <div className="space-y-1">
                {renderDetailRow(Calendar, 'Date Created', faq.createdAt ? format(new Date(faq.createdAt), 'PPP p') : 'N/A')}
                {renderDetailRow(Clock, 'Last Updated', faq.updatedAt ? format(new Date(faq.updatedAt), 'PPP p') : 'N/A')}
                <div className="flex items-start py-3">
                  <span className="w-5 h-5 mr-4 text-gray-500 mt-0.5 font-mono text-lg">#</span>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-500">FAQ ID</span>
                    <span className="text-md text-gray-800 font-mono break-all">{faq._id}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default FaqView;