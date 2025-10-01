import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { backendUrl } from '../App';
import axios from 'axios';

const AdminSettings = ({ token }) => {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newEmail: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [showPasswords, setShowPasswords] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.currentPassword) {
      toast.error('Current password is required');
      return;
    }

    if (!formData.newEmail && !formData.newPassword) {
      toast.error('Please provide either new email or new password');
      return;
    }

    if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const requestData = {
        currentPassword: formData.currentPassword
      };

      if (formData.newEmail) {
        requestData.newEmail = formData.newEmail;
      }

      if (formData.newPassword) {
        requestData.newPassword = formData.newPassword;
      }

      const response = await axios.post(
        `${backendUrl}/api/user/admin/change-credentials`,
        requestData,
        {
          headers: { token }
        }
      );

      if (response.data.success) {
        toast.success('Admin credentials updated successfully!');
        setFormData({
          currentPassword: '',
          newEmail: '',
          newPassword: '',
          confirmPassword: ''
        });
      } else {
        toast.error(response.data.message || 'Failed to update credentials');
      }
    } catch (error) {
      console.error('Error updating credentials:', error);
      toast.error(error.response?.data?.message || 'Failed to update credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Admin Settings</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Change Admin Credentials</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Current Password */}
          <div>
            <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
              Current Password *
            </label>
            <input
              type={showPasswords ? "text" : "password"}
              id="currentPassword"
              name="currentPassword"
              value={formData.currentPassword}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {/* New Email */}
          <div>
            <label htmlFor="newEmail" className="block text-sm font-medium text-gray-700 mb-1">
              New Email (Optional)
            </label>
            <input
              type="email"
              id="newEmail"
              name="newEmail"
              value={formData.newEmail}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter new email address"
            />
          </div>

          {/* New Password */}
          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
              New Password (Optional)
            </label>
            <input
              type={showPasswords ? "text" : "password"}
              id="newPassword"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter new password"
            />
          </div>

          {/* Confirm New Password */}
          {formData.newPassword && (
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Confirm New Password *
              </label>
              <input
                type={showPasswords ? "text" : "password"}
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Confirm new password"
                required
              />
            </div>
          )}

          {/* Show Passwords Toggle */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="showPasswords"
              checked={showPasswords}
              onChange={(e) => setShowPasswords(e.target.checked)}
              className="mr-2"
            />
            <label htmlFor="showPasswords" className="text-sm text-gray-600">
              Show passwords
            </label>
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
            >
              {loading ? 'Updating...' : 'Update Credentials'}
            </button>
          </div>
        </form>

        {/* Password Requirements */}
        <div className="mt-6 p-4 bg-gray-50 rounded-md">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Password Requirements:</h3>
          <ul className="text-xs text-gray-600 space-y-1">
            <li>• At least 8 characters long</li>
            <li>• Contains at least one uppercase letter</li>
            <li>• Contains at least one lowercase letter</li>
            <li>• Contains at least two special characters (!@#$%^&*()_+-=[]&#123;&#125;|;&#39;:&quot;,.&lt;&gt;?)</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;