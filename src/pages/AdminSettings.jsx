import React from 'react';

const AdminSettings = () => {
  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Admin Settings</h1>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Manage Admin</h2>
        <p className="text-sm text-gray-600">For security reasons, admin credentials cannot be changed from this UI. If you need to update admin email or password, update the server environment variables or contact the system administrator.</p>
      </div>
    </div>
  )
}

export default AdminSettings;