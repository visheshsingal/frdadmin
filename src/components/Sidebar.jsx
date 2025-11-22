import React from 'react'
import { NavLink } from 'react-router-dom'
import { assets } from '../assets/assets'

const Sidebar = ({ userRole }) => {
  return (
    <div className='w-[18%] min-h-screen bg-white border-r'>
      <div className='flex flex-col gap-4 pt-6 pl-[20%] text-[15px]'>
        {userRole === 'admin' ? (
          <>
            <NavLink
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-l transition border-l-4 ${
                  isActive ? 'border-[#052659] bg-[#f0f4ff] text-[#052659]' : 'border-transparent hover:bg-gray-100'
                }`
              }
              to="/add"
            >
              <img className='w-5 h-5' src={assets.add_icon} alt="" />
              <p className='hidden md:block'>Add Items</p>
            </NavLink>

            <NavLink
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-l transition border-l-4 ${
                  isActive ? 'border-[#052659] bg-[#f0f4ff] text-[#052659]' : 'border-transparent hover:bg-gray-100'
                }`
              }
              to="/banners"
            >
              <img className='w-5 h-5' src={assets.upload_area} alt="" />
              <p className='hidden md:block'>Banners</p>
            </NavLink>

            <NavLink
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-l transition border-l-4 ${
                  isActive ? 'border-[#052659] bg-[#f0f4ff] text-[#052659]' : 'border-transparent hover:bg-gray-100'
                }`
              }
              to="/media"
            >
              <img className='w-5 h-5' src={assets.upload_area} alt="" />
              <p className='hidden md:block'>Media</p>
            </NavLink>

            <NavLink
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-l transition border-l-4 ${
                  isActive ? 'border-[#052659] bg-[#f0f4ff] text-[#052659]' : 'border-transparent hover:bg-gray-100'
                }`
              }
              to="/list"
            >
              <img className='w-5 h-5' src={assets.order_icon} alt="" />
              <p className='hidden md:block'>List Items</p>
            </NavLink>

            <NavLink
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-l transition border-l-4 ${
                  isActive ? 'border-[#052659] bg-[#f0f4ff] text-[#052659]' : 'border-transparent hover:bg-gray-100'
                }`
              }
              to="/orders"
            >
              <img className='w-5 h-5' src={assets.order_icon} alt="" />
              <p className='hidden md:block'>Orders</p>
            </NavLink>

            {/* Settings link removed per request */}

            {/* <NavLink
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-l transition border-l-4 ${
                  isActive ? 'border-[#052659] bg-[#f0f4ff] text-[#052659]' : 'border-transparent hover:bg-gray-100'
                }`
              }
              to="/bookings"
            >
              <img className='w-5 h-5' src={assets.order_icon} alt="" />
              <p className='hidden md:block'>Bookings</p>
            </NavLink> */}
          </>
        ) : userRole === 'branch' ? (
          <>
            <NavLink
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-l transition border-l-4 ${
                  isActive ? 'border-[#052659] bg-[#f0f4ff] text-[#052659]' : 'border-transparent hover:bg-gray-100'
                }`
              }
              to="/branch-bookings"
            >
              <img className='w-5 h-5' src={assets.order_icon} alt="" />
              <p className='hidden md:block'>Branch Bookings</p>
            </NavLink>

            <NavLink
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-l transition border-l-4 ${
                  isActive ? 'border-[#052659] bg-[#f0f4ff] text-[#052659]' : 'border-transparent hover:bg-gray-100'
                }`
              }
              to="/branch-members"
            >
              <img className='w-5 h-5' src={assets.order_icon} alt="" />
              <p className='hidden md:block'>Branch Members</p>
            </NavLink>
          </>
        ) : null}
      </div>
    </div>
  )
}

export default Sidebar