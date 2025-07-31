import React, { useState } from 'react';
import { Calendar, Send, Upload, X } from 'lucide-react';

const NotificationSender = () => {
  const [formData, setFormData] = useState({
    title: '',
    body: '',
    date: new Date().toISOString().split('T')[0],
    imageUrl: '',
    receiver: 'all',
    notificationType: 'normal',
    fcmTokens: ''
  });

  const [sending, setSending] = useState(false);
  const [result, setResult] = useState(null);

  const FIREBASE_FUNCTION_URL = 'https://sendnotification-6j7qfbsfkq-uc.a.run.app';

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async () => {
    setSending(true);
    setResult(null);

    try {
      const tokensArray = formData.fcmTokens
        .split('\n')
        .map(token => token.trim())
        .filter(Boolean);

      if (tokensArray.length === 0) {
        throw new Error('Please provide at least one FCM token');
      }

      const payload = {
        title: formData.title,
        body: formData.body,
        date: formData.date,
        imageUrl: formData.imageUrl || undefined,
        receiver: formData.receiver,
        notificationType: formData.notificationType,
        fcmTokens: tokensArray
      };

      const response = await fetch(FIREBASE_FUNCTION_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to send notification');
      }

      const { successCount, totalTokens, failureCount, failedTokens } = data.details;

      setResult({
        type: 'success',
        message: `Notification sent successfully! ${successCount}/${totalTokens} delivered`,
        details: data.details
      });

      // Clear form only on success
      setFormData({
        title: '',
        body: '',
        date: new Date().toISOString().split('T')[0],
        imageUrl: '',
        receiver: 'all',
        notificationType: 'normal',
        fcmTokens: ''
      });

    } catch (error) {
      console.error('Error sending notification:', error);
      setResult({
        type: 'error',
        message: error.message || 'Failed to send notification'
      });
    } finally {
      setSending(false);
    }
  };

  const clearResult = () => setResult(null);

  const tokenCount = formData.fcmTokens
    .split('\n')
    .map(t => t.trim())
    .filter(Boolean).length;

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
        Send Push Notification
      </h2>

      {result && (
        <div
          className={`mb-6 p-4 rounded-lg flex flex-col gap-3 ${
            result.type === 'success'
              ? 'bg-green-50 border border-green-200'
              : 'bg-red-50 border border-red-200'
          }`}
        >
          <div className="flex justify-between">
            <p
              className={`font-medium ${
                result.type === 'success'
                  ? 'text-green-800'
                  : 'text-red-800'
              }`}
            >
              {result.message}
            </p>
            <button onClick={clearResult} className="text-gray-400 hover:text-gray-600">
              <X size={20} />
            </button>
          </div>

          {result.details && (
            <div className="text-sm text-gray-600">
              <p><strong>Receiver:</strong> {result.details.receiver}</p>
              <p><strong>Type:</strong> {result.details.notificationType}</p>
              <p><strong>Date:</strong> {result.details.date}</p>
              {result.details.hasImage && <p>✓ Image included</p>}
              {result.details.failureCount > 0 && (
                <div className="mt-2">
                  <p className="font-medium text-red-700">Failed Tokens:</p>
                  <ul className="list-disc ml-5">
                    {result.details.failedTokens.map((f, idx) => (
                      <li key={idx}>
                        {f.token} – {f.error}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <div className="space-y-6">
        {/* Inputs */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            maxLength={100}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter notification title"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Message *</label>
          <textarea
            name="body"
            value={formData.body}
            onChange={handleInputChange}
            maxLength={500}
            required
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter notification message"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Date *</label>
          <div className="relative">
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Calendar className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Image URL (Optional)</label>
          <div className="relative">
            <input
              type="url"
              name="imageUrl"
              value={formData.imageUrl}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="https://example.com/image.jpg"
            />
            <Upload className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Receiver *</label>
          <select
            name="receiver"
            value={formData.receiver}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Users</option>
            <option value="specific">Specific Users</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Notification Type *</label>
          <select
            name="notificationType"
            value={formData.notificationType}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="normal">Normal</option>
            <option value="promotional">Promotional</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            FCM Tokens * (One per line) – {tokenCount} token(s)
          </label>
          <textarea
            name="fcmTokens"
            value={formData.fcmTokens}
            onChange={handleInputChange}
            required
            rows={6}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
            placeholder="Enter FCM tokens, one per line..."
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={sending}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 flex items-center justify-center gap-2 font-medium"
        >
          {sending ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              Sending...
            </>
          ) : (
            <>
              <Send size={20} />
              Send Notification
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default NotificationSender;
