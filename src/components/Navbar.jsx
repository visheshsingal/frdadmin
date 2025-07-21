import React from 'react'

const Navbar = ({ setToken }) => {
  return (
    <div className='flex items-center py-2 px-[4%] justify-between bg-white shadow-md'>
      <h1 className='text-[#052659] text-xl font-bold'>FRD Nutrition</h1>
      <button
        onClick={() => setToken('')}
        className='bg-[#052659] hover:bg-[#041d47] text-white px-5 py-2 sm:px-7 sm:py-2 rounded-full text-xs sm:text-sm transition'
      >
        Logout
      </button>
    </div>
  )
}

export default Navbar
