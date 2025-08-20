import axios from 'axios'
import React, { useState } from 'react'
import { backendUrl } from '../App'
import { toast } from 'react-toastify'

const Login = ({ setToken }) => {
    const [email, setEmail] = useState('frdgym@gmail.com')
    const [password, setPassword] = useState('')
    const [role, setRole] = useState('admin')
    const [loading, setLoading] = useState(false)

    const onSubmitHandler = async (e) => {
        e.preventDefault();
        setLoading(true)
        
        try {
            const payload = { email, password, role }
            const response = await axios.post(backendUrl + '/api/user/admin', payload)
            if (response.data.success) {
                setToken(response.data.token)
                toast.success('Login successful!')
            } else {
                toast.error(response.data.message)
            }
        } catch (error) {
            console.log(error);
            toast.error(error.response?.data?.message || error.message)
        } finally {
            setLoading(false)
        }
    }

    const handleRoleChange = (newRole) => {
        setRole(newRole)
    }

    return (
        <div className='min-h-screen flex items-center justify-center w-full bg-white'>
            <div className='bg-white shadow-md rounded-lg px-8 py-6 max-w-md border border-gray-200'>
                <h1 className='text-2xl font-bold mb-4 text-[#052659] text-center'>
                    {role === 'admin' ? 'Admin Panel' : 'Branch Portal'}
                </h1>
                
                <form onSubmit={onSubmitHandler}>
                    <div className='mb-4'>
                        <p className='text-sm font-medium text-gray-700 mb-2'>Select Role</p>
                        <div className='flex gap-2'>
                            <button
                                type='button'
                                onClick={() => handleRoleChange('admin')}
                                className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition ${
                                    role === 'admin' 
                                        ? 'bg-[#052659] text-white' 
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                                Admin Panel
                            </button>
                            <button
                                type='button'
                                onClick={() => handleRoleChange('branch')}
                                className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition ${
                                    role === 'branch' 
                                        ? 'bg-[#052659] text-white' 
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                                Branch Portal
                            </button>
                        </div>
                    </div>

                    <div className='mb-3'>
                        <p className='text-sm font-medium text-gray-700 mb-2'>Email Address</p>
                        <input
                            onChange={(e) => setEmail(e.target.value)}
                            value={email}
                            className='rounded-md w-full px-3 py-2 border border-gray-300 outline-none focus:ring-2 focus:ring-[#052659]'
                            type="email"
                            placeholder='your@email.com'
                            required
                            disabled
                        />
                        <p className='text-xs text-gray-500 mt-1'>Fixed email for security</p>
                    </div>

                    <div className='mb-3'>
                        <p className='text-sm font-medium text-gray-700 mb-2'>Password</p>
                        <input
                            onChange={(e) => setPassword(e.target.value)}
                            value={password}
                            className='rounded-md w-full px-3 py-2 border border-gray-300 outline-none focus:ring-2 focus:ring-[#052659]'
                            type="password"
                            placeholder={role === 'admin' ? 'Admin password' : 'Branch password'}
                            required
                        />
                    </div>

                    <button
                        className='mt-2 w-full py-2 px-4 rounded-md text-white bg-[#052659] hover:bg-[#041d47] transition disabled:opacity-50'
                        type="submit"
                        disabled={loading}
                    >
                        {loading ? 'Processing...' : 'Login'}
                    </button>
                </form>
            </div>
        </div>
          )
  }
 
export default Login
