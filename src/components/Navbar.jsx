import React, { useState } from 'react'

const Navbar = ({ setToken }) => {
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false)
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage({ type: '', text: '' })

    try {
      const token = localStorage.getItem('adminToken') || localStorage.getItem('token')
      
      if (!token) {
        setMessage({ type: 'error', text: 'No authentication token found. Please login again.' })
        setLoading(false)
        return
      }

      const response = await fetch('/api/user/admin/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      })

      // Check if response is OK
      if (!response.ok) {
        const errorText = await response.text()
        console.error('Server response not OK:', response.status, errorText)
        throw new Error(`Server error: ${response.status} ${response.statusText}`)
      }

      // Try to parse JSON
      const text = await response.text()
      let data
      try {
        data = text ? JSON.parse(text) : {}
      } catch (parseError) {
        console.error('JSON parse error:', parseError, 'Response text:', text)
        throw new Error('Invalid response from server')
      }

      if (data.success) {
        setMessage({ type: 'success', text: data.message })
        setFormData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        })
        setTimeout(() => {
          setIsPasswordModalOpen(false)
          setMessage({ type: '', text: '' })
        }, 2000)
      } else {
        setMessage({ type: 'error', text: data.message || 'Password change failed' })
      }
    } catch (error) {
      console.error('Password change error:', error)
      setMessage({ 
        type: 'error', 
        text: error.message || 'Network error. Please check your connection and try again.' 
      })
    } finally {
      setLoading(false)
    }
  }

  const validatePassword = (password) => {
    const minLength = password.length >= 8
    const hasUpperCase = /[A-Z]/.test(password)
    const hasLowerCase = /[a-z]/.test(password)
    const specialChars = password.match(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/g)
    const hasTwoSpecialChars = specialChars && specialChars.length >= 2

    return minLength && hasUpperCase && hasLowerCase && hasTwoSpecialChars
  }

  const closeModal = () => {
    setIsPasswordModalOpen(false)
    setFormData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    })
    setMessage({ type: '', text: '' })
  }

  const isFormValid = () => {
    return (
      formData.currentPassword &&
      formData.newPassword &&
      formData.confirmPassword &&
      formData.newPassword === formData.confirmPassword &&
      validatePassword(formData.newPassword)
    )
  }

  return (
    <>
      <div className='flex items-center py-2 px-[4%] justify-between bg-white shadow-md'>
        <h1 className='text-[#052659] text-xl font-bold'>FRD Nutrition</h1>
        <div className='flex gap-3'>
          <button
            onClick={() => setIsPasswordModalOpen(true)}
            className='bg-[#052659] hover:bg-[#041d47] text-white px-4 py-2 sm:px-5 sm:py-2 rounded-full text-xs sm:text-sm transition'
          >
            Change Password
          </button>
          <button
            onClick={() => {
              localStorage.removeItem('adminToken')
              localStorage.removeItem('token')
              setToken('')
            }}
            className='bg-red-600 hover:bg-red-700 text-white px-4 py-2 sm:px-5 sm:py-2 rounded-full text-xs sm:text-sm transition'
          >
            Logout
          </button>
        </div>
      </div>

      {/* Password Change Modal */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div 
            className="bg-white rounded-lg w-full max-w-md mx-auto shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-[#052659]">Change Admin Password</h2>
              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700 text-lg w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
                disabled={loading}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handlePasswordSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Password
                </label>
                <input
                  type="password"
                  name="currentPassword"
                  value={formData.currentPassword}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#052659] focus:border-transparent transition-colors"
                  placeholder="Enter current password"
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#052659] focus:border-transparent transition-colors"
                  placeholder="Enter new password"
                  required
                  disabled={loading}
                />
                {formData.newPassword && !validatePassword(formData.newPassword) && (
                  <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-xs text-red-600 font-medium mb-1">Password must contain:</p>
                    <ul className="text-xs text-red-600 list-disc list-inside space-y-1">
                      <li>At least 8 characters</li>
                      <li>One uppercase letter (A-Z)</li>
                      <li>One lowercase letter (a-z)</li>
                      <li>At least two special characters (!@#$%^&* etc.)</li>
                    </ul>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#052659] focus:border-transparent transition-colors"
                  placeholder="Confirm new password"
                  required
                  disabled={loading}
                />
                {formData.confirmPassword && formData.newPassword !== formData.confirmPassword && (
                  <p className="text-xs text-red-600 mt-2">⚠️ Passwords do not match</p>
                )}
                {formData.confirmPassword && formData.newPassword === formData.confirmPassword && validatePassword(formData.newPassword) && (
                  <p className="text-xs text-green-600 mt-2">✅ Passwords match and meet requirements</p>
                )}
              </div>

              {message.text && (
                <div className={`p-4 rounded-md border ${
                  message.type === 'success' 
                    ? 'bg-green-50 text-green-800 border-green-200' 
                    : 'bg-red-50 text-red-800 border-red-200'
                }`}>
                  <div className="flex items-center">
                    <span className={`mr-2 ${message.type === 'success' ? 'text-green-500' : 'text-red-500'}`}>
                      {message.type === 'success' ? '✅' : '❌'}
                    </span>
                    {message.text}
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={loading}
                  className="flex-1 px-4 py-3 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!isFormValid() || loading}
                  className="flex-1 px-4 py-3 bg-[#052659] text-white rounded-md hover:bg-[#041d47] disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Changing...
                    </>
                  ) : (
                    'Change Password'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}

export default Navbar