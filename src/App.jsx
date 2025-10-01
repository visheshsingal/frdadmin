import React, { useEffect, useState } from 'react'
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'
import { Routes, Route } from 'react-router-dom'
import Add from './pages/Add'
import List from './pages/List'
import Orders from './pages/Orders'
import Bookings from './pages/Bookings'
import BranchBookings from './pages/BranchBookings'
import BranchMembers from './pages/BranchMembers'
import AdminSettings from './pages/AdminSettings'
import Login from './components/Login'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export const backendUrl = import.meta.env.VITE_BACKEND_URL
export const currency = '₹'

const App = () => {

  const [token, setToken] = useState(localStorage.getItem('token')?localStorage.getItem('token'):'');
  const [userRole, setUserRole] = useState('');

  useEffect(()=>{
    localStorage.setItem('token',token)
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        console.log('Token payload:', payload);
        setUserRole(payload.role);
        console.log('User role set to:', payload.role);
      } catch (error) {
        console.error('Error parsing token:', error);
        setUserRole('');
      }
    } else {
      setUserRole('');
    }
  },[token])

  return (
    <div className='bg-gray-50 min-h-screen'>
      <ToastContainer />
      {token === ""
        ? <Login setToken={setToken} />
        : <>
          <Navbar setToken={setToken} />
          <hr />
          <div className='flex w-full'>
            <Sidebar userRole={userRole} />
            <div className='w-[70%] mx-auto ml-[max(5vw,25px)] my-8 text-gray-600 text-base'>
              <Routes>
                {userRole === 'admin' ? (
                  <>
                    <Route path='/' element={<Add token={token} />} />
                    <Route path='/add' element={<Add token={token} />} />
                    <Route path='/list' element={<List token={token} />} />
                    <Route path='/orders' element={<Orders token={token} />} />
                    <Route path='/bookings' element={<Bookings token={token} />} />
                    <Route path='/settings' element={<AdminSettings token={token} />} />
                  </>
                ) : userRole === 'branch' ? (
                  <>
                    <Route path='/' element={<BranchBookings token={token} />} />
                    <Route path='/branch-bookings' element={<BranchBookings token={token} />} />
                    <Route path='/branch-members' element={<BranchMembers token={token} />} />
                  </>
                ) : null}              </Routes>
            </div>
          </div>
        </>
      }
    </div>
  )
}

export default App