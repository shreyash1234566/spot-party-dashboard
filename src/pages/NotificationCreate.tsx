// src/pages/NotificationSender.tsx

import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { Calendar, Send, X, CheckCircle, AlertCircle, Users, Loader2, RefreshCw } from 'lucide-react';

// Define a type for the User object for better type safety
type User = {
  _id: string;
  full_name?: string;
  email?: string;
  phone?: string | number;
  userType: 'customer' | 'agent';
  isDeleted: boolean;
  deviceToken?: string;
};

// Define a type for the API response for better clarity
type Result = {
  type: 'success' | 'error';
  message: string;
  details?: any;
};

const NotificationSender = () => {
  // ============================================================================
  // State
  // ============================================================================
  const [formData, setFormData] = useState({
    title: '',
    body: '',
    date: new Date().toISOString().split('T')[0],
    imageUrl: '',
    receiver: 'all',
    notificationType: 'normal',
    selectedUsers: [] as string[],
    fcmTokens: ''
  });

  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);

  // API Endpoints
  const FIREBASE_FUNCTION_URL = 'https://sendnotification-6j7qfbsfkq-uc.a.run.app';
  const FILE_UPLOAD_URL = 'https://api.partywalah.in/api/admin/file-upload';
  const USERS_API_URL = 'https://api.partywalah.in/api/admin/users';

  // ============================================================================
  // User Management Functions
  // ============================================================================
  const fetchUsers = async () => {
    setIsLoadingUsers(true);
    try {
      let allUsers: User[] = [];
      let page = 1;
      let hasMorePages = true;

      while (hasMorePages) {
        const response = await fetch(`${USERS_API_URL}?page=${page}&limit=100`, {
          method: 'GET',
          headers: { 'accept': '*/*' }
        });
        
        if (!response.ok) throw new Error(`Failed to fetch users: ${response.status}`);
        
        const data = await response.json();
        const pageUsers = data.data?.data || [];
        
        const customers = pageUsers.filter((user: User) => 
          user.userType === 'customer' && !user.isDeleted
        );
        
        allUsers = [...allUsers, ...customers];
        hasMorePages = page < (data.data?.totalPages || 1);
        page++;
      }

      setUsers(allUsers);
      setFilteredUsers(allUsers);
    } catch (error: any) {
      console.error('Error fetching users:', error);
      setResult({ type: 'error', message: `Failed to fetch users: ${error.message}` });
    } finally {
      setIsLoadingUsers(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (!userSearchTerm.trim()) {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter(user => {
        const searchLower = userSearchTerm.toLowerCase();
        const fullName = user.full_name || '';
        const email = user.email || '';
        const phone = user.phone?.toString() || '';
        return fullName.toLowerCase().includes(searchLower) ||
               email.toLowerCase().includes(searchLower) ||
               phone.includes(searchLower);
      });
      setFilteredUsers(filtered);
    }
  }, [userSearchTerm, users]);

  const handleUserSelection = (userId: string) => {
    setFormData(prev => ({
      ...prev,
      selectedUsers: prev.selectedUsers.includes(userId)
        ? prev.selectedUsers.filter(id => id !== userId)
        : [...prev.selectedUsers, userId]
    }));
  };

  const selectAllUsers = () => setFormData(prev => ({ ...prev, selectedUsers: filteredUsers.map(user => user._id) }));
  const clearAllUsers = () => setFormData(prev => ({ ...prev, selectedUsers: [] }));
  
  const getSelectedUsersTokens = () => {
    const selectedUserMap = new Set(formData.selectedUsers);
    return users
      .filter(user => selectedUserMap.has(user._id))
      .map(user => user.deviceToken)
      .filter((token): token is string => !!token && typeof token === 'string' && token.trim() !== '' && token !== 'string');
  };

  // ============================================================================
  // Form Handlers
  // ============================================================================
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: value,
      ...(name === 'receiver' && { selectedUsers: [] })
    }));
  };

  const handleImageUpload = async (file: File | null) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setUploadError('Please select a valid image file.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('File size must be less than 5MB.');
      return;
    }

    setIsUploading(true);
    setUploadError(null);
    setFormData(prev => ({...prev, imageUrl: ''}));

    const uploadFormData = new FormData();
    uploadFormData.append('file', file);

    try {
      const response = await fetch(FILE_UPLOAD_URL, { method: 'POST', body: uploadFormData });
      if (!response.ok) throw new Error(`Upload failed with status: ${response.status}`);
      const data = await response.json();
      const imageUrlFromServer = data?.url || data?.data?.url;
      if (!imageUrlFromServer) throw new Error('Image URL not found in the server response.');
      setFormData(prev => ({ ...prev, imageUrl: imageUrlFromServer }));
    } catch (error: any) {
      console.error('Upload error:', error);
      setUploadError(error.message || 'Failed to upload image.');
    } finally {
      setIsUploading(false);
    }
  };
  
  const clearImage = () => {
    setFormData(prev => ({ ...prev, imageUrl: '' }));
    setUploadError(null);
    const fileInput = document.getElementById('notification-image-upload');
    if (fileInput) (fileInput as HTMLInputElement).value = '';
  };

  const handleSubmit = async () => {
    setIsSending(true);
    setResult(null);

    try {
      // 1. Client-side validation
      if (!formData.title.trim() || !formData.body.trim() || !formData.date) {
        throw new Error('Title, Message, and Date are required.');
      }

      // 2. Prepare FCM tokens based on the selected receiver type
      let finalTokensArray: string[] = [];
      if (formData.receiver === 'specific') {
        if (formData.selectedUsers.length === 0) throw new Error('Please select at least one user.');
        finalTokensArray = getSelectedUsersTokens();
        if (finalTokensArray.length === 0) throw new Error('The selected users do not have any valid device tokens.');
      } else if (formData.receiver === 'manual') {
        finalTokensArray = formData.fcmTokens.split('\n').map(t => t.trim()).filter(Boolean);
        if (finalTokensArray.length === 0) throw new Error('Please provide at least one FCM token.');
      }
      // For 'all' receiver, finalTokensArray will correctly be empty.

      const dateObj = new Date(formData.date);
      if (isNaN(dateObj.getTime())) throw new Error('Please provide a valid date.');

      // 3. Construct the payload that matches the Cloud Function's expectations
      const payload = {
        title: formData.title.trim(),
        body: formData.body.trim(),
        date: dateObj.toISOString(),
        receiver: formData.receiver,
        notificationType: formData.notificationType,
        fcmTokens: finalTokensArray, // Will be empty for 'all', which is correct for your backend
        ...(formData.imageUrl && { imageUrl: encodeURI(formData.imageUrl) }),
      };

      console.log('Sending payload to Cloud Function:', payload);

      // 4. Make the API call
      const response = await fetch(FIREBASE_FUNCTION_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const data = await response.json();
      console.log('Parsed response from Cloud Function:', data);

      // 5. Handle responses robustly, checking both HTTP status and the 'success' flag
      if (!response.ok || data.success === false) {
        // Create a more informative error message from the server response
        const errorMessage = Array.isArray(data?.details)
          ? data.details.join(', ') // For validation errors
          : data?.error || data?.message || `Server responded with status: ${response.status}`;
          
        const serverError = {
          message: errorMessage,
          details: data?.details || data || null, // Pass the full details object for display
        };
        throw serverError;
      }

      // 6. Handle a successful response
      setResult({ type: 'success', message: data.message || 'Notification processed!', details: data.details });
      
      // Reset the form to its initial state
      setFormData({
        title: '', body: '', date: new Date().toISOString().split('T')[0],
        imageUrl: '', receiver: 'all', notificationType: 'normal', 
        selectedUsers: [], fcmTokens: ''
      });
      clearImage();

    } catch (error: any) {
      console.error('Error in handleSubmit:', error);

      let errorMessage = 'An unexpected error occurred.';
      let errorDetails = null;

      if (error instanceof Error) { // Catches network errors, client-side validation, etc.
        errorMessage = error.message;
      } else if (typeof error === 'object' && error !== null && 'message' in error) { // Catches our custom server error object
        errorMessage = error.message;
        if ('details' in error) errorDetails = error.details;
      }
      
      setResult({ type: 'error', message: errorMessage, details: errorDetails });
    } finally {
      setIsSending(false);
    }
  };

  const clearResult = () => setResult(null);

  const getTokenCount = () => {
    if (formData.receiver === 'all') return users.length; // For 'all', we target the total number of users
    if (formData.receiver === 'specific') return formData.selectedUsers.length;
    if (formData.receiver === 'manual') return formData.fcmTokens.split('\n').map(t => t.trim()).filter(Boolean).length;
    return 0;
  };

  const tokenCount = getTokenCount();

  return (
    <DashboardLayout>
       <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                  <div className="bg-white/20 p-2 rounded-lg"><Send size={28} /></div>
                  Push Notification Center
                </h2>
                <p className="text-blue-100 mt-1 text-lg">Send targeted push notifications to your users.</p>
              </div>
              <div className="text-right text-white/80">
                <p className="text-sm">Target Users</p>
                <p className="text-2xl font-bold">{tokenCount}</p>
              </div>
            </div>
          </div>
          
          <div className="p-8">
            {result && (
              <div className={`mb-8 rounded-xl border-2 p-6 shadow-lg ${
                result.type === 'success' 
                  ? 'bg-green-50 border-green-200 shadow-green-100' 
                  : 'bg-red-50 border-red-200 shadow-red-100'
              }`}>
                <div className="flex justify-between items-start">
                  <div className="flex items-start gap-4">
                    <div className={`p-2 rounded-full ${ 
                      result.type === 'success' ? 'bg-green-100' : 'bg-red-100' 
                    }`}>
                      {result.type === 'success' ? (
                        <CheckCircle className="w-6 h-6 text-green-600" />
                      ) : (
                        <AlertCircle className="w-6 h-6 text-red-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className={`font-semibold text-lg break-words ${ 
                        result.type === 'success' ? 'text-green-800' : 'text-red-800' 
                      }`}>
                        {result.message}
                      </p>
                      {result.details && (
                        <div className="mt-3 text-sm text-gray-700">
                          <details className="cursor-pointer">
                            <summary className="font-medium text-gray-600 hover:text-gray-800">
                              View Details
                            </summary>
                            <div className="mt-2 p-3 bg-gray-100 rounded border max-h-64 overflow-auto">
                              {typeof result.details === 'object' ? (
                                <pre className="whitespace-pre-wrap text-xs">
                                  {JSON.stringify(result.details, null, 2)}
                                </pre>
                              ) : (
                                <p className="text-sm">{result.details}</p>
                              )}
                            </div>
                          </details>
                        </div>
                      )}
                    </div>
                  </div>
                  <button 
                    onClick={clearResult} 
                    className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-white/50"
                  >
                    <X size={24} />
                  </button>
                </div>
              </div>
            )}
            
            {/* The rest of your JSX form remains the same... */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column */}
              <div className="space-y-6">
                {/* Message Content */}
                <div className="bg-gray-50 rounded-xl p-6 border">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Message Content</h3>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                        Title <span className="text-red-500">*</span>
                      </label>
                      <input 
                        id="title"
                        type="text" 
                        name="title" 
                        value={formData.title} 
                        onChange={handleInputChange} 
                        required 
                        maxLength={100}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter notification title..."
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        {formData.title.length}/100 characters
                      </p>
                    </div>
                    <div>
                      <label htmlFor="body" className="block text-sm font-medium text-gray-700 mb-1">
                        Message <span className="text-red-500">*</span>
                      </label>
                      <textarea 
                        id="body"
                        name="body" 
                        value={formData.body} 
                        onChange={handleInputChange} 
                        required 
                        rows={4} 
                        maxLength={500}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        placeholder="Enter notification message..."
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        {formData.body.length}/500 characters
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Target Users */}
                <div className="bg-gray-50 rounded-xl p-6 border">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                      <Users size={20} />
                      Target Users ({users.length} total customers)
                    </h3>
                    <button
                      onClick={fetchUsers}
                      disabled={isLoadingUsers}
                      className="p-2 text-gray-600 hover:text-blue-600 disabled:opacity-50"
                      title="Refresh users"
                    >
                      <RefreshCw size={16} className={isLoadingUsers ? 'animate-spin' : ''} />
                    </button>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="receiver" className="block text-sm font-medium text-gray-700 mb-2">
                        Receiver Type <span className="text-red-500">*</span>
                      </label>
                      <select 
                        id="receiver"
                        name="receiver" 
                        value={formData.receiver} 
                        onChange={handleInputChange} 
                        required 
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="all">All Customers</option>
                        <option value="specific">Specific Users</option>
                        <option value="manual">Manual FCM Tokens</option>
                      </select>
                    </div>

                    {formData.receiver === 'specific' && (
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="block text-sm font-medium text-gray-700">
                            Select Users ({formData.selectedUsers.length} selected)
                          </label>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={selectAllUsers}
                              className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                            >
                              Select All ({filteredUsers.length})
                            </button>
                            <button
                              type="button"
                              onClick={clearAllUsers}
                              className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                            >
                              Clear All
                            </button>
                          </div>
                        </div>
                        <input
                          type="text"
                          placeholder="Search users by name, email, or phone..."
                          value={userSearchTerm}
                          onChange={(e) => setUserSearchTerm(e.target.value)}
                          className="w-full px-3 py-2 mb-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg">
                          {isLoadingUsers ? (
                            <div className="flex items-center justify-center p-4">
                              <Loader2 className="w-5 h-5 animate-spin mr-2" />
                              Loading users...
                            </div>
                          ) : filteredUsers.length === 0 ? (
                            <div className="p-4 text-center text-gray-500">
                              {userSearchTerm ? 'No users found.' : 'No customers available.'}
                            </div>
                          ) : (
                            filteredUsers.map((user) => (
                              <div
                                key={user._id}
                                className="flex items-center p-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                              >
                                <input
                                  type="checkbox"
                                  id={`user-${user._id}`}
                                  checked={formData.selectedUsers.includes(user._id)}
                                  onChange={() => handleUserSelection(user._id)}
                                  className="mr-3 h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                                />
                                <label
                                  htmlFor={`user-${user._id}`}
                                  className="flex-1 cursor-pointer"
                                >
                                  <div className="font-medium text-gray-900">
                                    {user.full_name || 'Unknown User'}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {user.email || 'No email'} • {user.phone}
                                  </div>
                                </label>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    )}

                    {formData.receiver === 'manual' && (
                      <div>
                        <label htmlFor="fcmTokens" className="block text-sm font-medium text-gray-700 mb-1">
                          FCM Tokens (one per line) <span className="text-red-500">*</span>
                        </label>
                        <textarea 
                          id="fcmTokens"
                          name="fcmTokens" 
                          value={formData.fcmTokens} 
                          onChange={handleInputChange} 
                          rows={8} 
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none" 
                          placeholder="fGH6k2M9R3e...
dK7j3N8mP2f...
(one token per line)"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          {formData.fcmTokens.split('\n').map(t => t.trim()).filter(Boolean).length} tokens entered
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Right Column */}
              <div className="space-y-6">
                {/* Settings */}
                <div className="bg-gray-50 rounded-xl p-6 border">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Settings</h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="notificationType" className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                        <select 
                          id="notificationType"
                          name="notificationType" 
                          value={formData.notificationType} 
                          onChange={handleInputChange} 
                          required 
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="normal">Normal</option>
                          <option value="promotional">Promotional</option>
                        </select>
                      </div>
                      <div>
                        <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                          Internal Date <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <input 
                            id="date"
                            type="date" 
                            name="date" 
                            value={formData.date} 
                            onChange={handleInputChange} 
                            required 
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                          <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400"/>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Internal tracking only
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Image Upload */}
                <div className="bg-gray-50 rounded-xl p-6 border">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Notification Image (Optional)
                  </h3>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Upload Image</label>
                    <input 
                      id="notification-image-upload" 
                      type="file" 
                      accept="image/*" 
                      onChange={(e) => handleImageUpload(e.target.files?.[0] || null)} 
                      disabled={isUploading} 
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50"
                    />
                    {isUploading && (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                        <p className="text-sm text-blue-600">Uploading...</p>
                      </div>
                    )}
                    {uploadError && (
                      <p className="text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle size={16} />
                        {uploadError}
                      </p>
                    )}
                  </div>
                  {formData.imageUrl && !isUploading && (
                    <div className="mt-4 relative w-40">
                      <p className="text-sm font-medium text-green-700 mb-2 flex items-center gap-1">
                        <CheckCircle size={16} />
                        Image uploaded:
                      </p>
                      <div className="relative">
                        <img 
                          src={formData.imageUrl} 
                          alt="Preview" 
                          className="w-full h-auto object-cover rounded-lg shadow-md border"
                        />
                        <button 
                          onClick={clearImage} 
                          className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 shadow-lg"
                          title="Remove image"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Submit Button */}
                <div className="pt-2">
                  <button 
                    onClick={handleSubmit} 
                    disabled={
                      isSending || 
                      isUploading || 
                      !formData.title.trim() || 
                      !formData.body.trim() || 
                      !formData.date ||
                      (formData.receiver !== 'all' && tokenCount === 0)
                    } 
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-6 rounded-lg font-semibold text-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all duration-200"
                  >
                    {isSending ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send size={20} />
                        Send to {formData.receiver === 'all' ? 'All' : tokenCount} Users
                      </>
                    )}
                  </button>
                  <div className="mt-2 text-xs text-gray-500 text-center">
                    {!formData.title.trim() && <p>• Title is required</p>}
                    {!formData.body.trim() && <p>• Message is required</p>}
                    {formData.receiver !== 'all' && tokenCount === 0 && <p>• At least one target user/token is required</p>}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default NotificationSender;