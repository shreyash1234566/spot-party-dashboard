import React, { useState } from 'react';
import { Upload, Image, Save, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
interface CarouselData {
  imageUrl: string;
  title: string;
  description: string;
  isActive: boolean;
}

const CarouselCreate: React.FC = () => {
  const [formData, setFormData] = useState<CarouselData>({
    imageUrl: '',
    title: '',
    description: '',
    isActive: true
  });
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      // Create preview URL
      const preview = URL.createObjectURL(file);
      setPreviewUrl(preview);
      setMessage(null);
    }
  };

  const uploadImage = async (): Promise<string> => {
    if (!selectedFile) throw new Error('No file selected');

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await fetch('https://api.partywalah.in/api/admin/file-upload', {
        method: 'POST',
        headers: {
          'accept': '*/*'
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      // Assuming the API returns the URL in a field like 'url' or 'imageUrl'
      // Adjust this based on your actual API response structure
      return result.url || result.imageUrl || result.data?.url;
    } catch (error) {
      throw new Error(`Image upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsUploading(false);
    }
  };

  const createCarousel = async (imageUrl: string) => {
    const carouselPayload = {
      imageUrl,
      title: formData.title,
      description: formData.description,
      isActive: formData.isActive
    };

    const response = await fetch('https://api.partywalah.in/api/admin/carousel', {
      method: 'POST',
      headers: {
        'accept': '*/*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(carouselPayload)
    });

    if (!response.ok) {
      throw new Error(`Carousel creation failed: ${response.status} ${response.statusText}`);
    }

    return response.json();
  };

  const handleSubmit = async () => {
    
    if (!selectedFile) {
      setMessage({ type: 'error', text: 'Please select an image file' });
      return;
    }

    if (!formData.title.trim()) {
      setMessage({ type: 'error', text: 'Please enter a title' });
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    try {
      // First upload the image
      const imageUrl = await uploadImage();
      
      // Then create the carousel with the uploaded image URL
      await createCarousel(imageUrl);
      
      setMessage({ type: 'success', text: 'Carousel created successfully!' });
      
      // Reset form
      setFormData({
        imageUrl: '',
        title: '',
        description: '',
        isActive: true
      });
      setSelectedFile(null);
      setPreviewUrl('');
      
      // Reset file input
      const fileInput = document.getElementById('file-input') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'An error occurred' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof CarouselData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <DashboardLayout>
    
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <Image className="w-6 h-6" />
        Create New Carousel
      </h2>

      <div onSubmit={handleSubmit} className="space-y-6">
        {/* Image Upload */}
        <div className="space-y-3">
          <div className="block text-sm font-medium text-gray-700">
            Carousel Image *
          </div>
          <div className="flex items-center justify-center w-full">
            <div className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
                 onClick={() => document.getElementById('file-input')?.click()}>
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-8 h-8 mb-4 text-gray-500" />
                  <p className="mb-2 text-sm text-gray-500">
                    <span className="font-semibold">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                </div>
              )}
              <input
                id="file-input"
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleFileSelect}
              />
            </div>
          </div>
        </div>

        {/* Title */}
        <div className="space-y-2">
          <div className="block text-sm font-medium text-gray-700">
            Title *
          </div>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            placeholder="Enter carousel title"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        {/* Description */}
        <div className="space-y-2">
          <div className="block text-sm font-medium text-gray-700">
            Description
          </div>
          <textarea
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            placeholder="Enter carousel description"
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Active Status */}
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="isActive"
            checked={formData.isActive}
            onChange={(e) => handleInputChange('isActive', e.target.checked)}
            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
          />
          <div className="text-sm font-medium text-gray-700 cursor-pointer" onClick={() => handleInputChange('isActive', !formData.isActive)}>
            Make carousel active
          </div>
        </div>

        {/* Message */}
        {message && (
          <div className={`p-3 rounded-md flex items-center gap-2 ${
            message.type === 'success' 
              ? 'bg-green-50 text-green-800 border border-green-200' 
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {message.type === 'success' ? (
              <CheckCircle className="w-4 h-4" />
            ) : (
              <AlertCircle className="w-4 h-4" />
            )}
            <span className="text-sm">{message.text}</span>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting || isUploading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {(isSubmitting || isUploading) ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              {isUploading ? 'Uploading Image...' : 'Creating Carousel...'}
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Create Carousel
            </>
          )}
        </button>
      </div>
    </div>
    </DashboardLayout>
  );
};

export default CarouselCreate;