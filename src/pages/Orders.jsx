import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { backendUrl, currency } from '../App'
import { toast } from 'react-toastify'
import { assets } from '../assets/assets'

const Orders = ({ token }) => {
  const [orders, setOrders] = useState([])
  const [filter, setFilter] = useState('All')
  const [dateFilter, setDateFilter] = useState('')

  const fetchAllOrders = async () => {
    if (!token) return null

    try {
      const response = await axios.post(backendUrl + '/api/order/list', {}, { headers: { token } })
      if (response.data.success) {
        setOrders(response.data.orders.reverse())
      } else {
        toast.error(response.data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  const statusHandler = async (event, orderId) => {
    const newStatus = event.target.value
    try {
      await axios.post(
        backendUrl + '/api/order/status',
        { orderId, status: newStatus },
        { headers: { token } }
      )
      await fetchAllOrders()
    } catch (error) {
      toast.error(error.message)
    }
  }

  useEffect(() => {
    fetchAllOrders()
  }, [token])

  const filteredOrders = orders.filter((order) => {
    const statusMatch =
      filter === 'All' ||
      order.status === filter
    const dateMatch =
      !dateFilter ||
      new Date(order.date).toLocaleDateString('en-CA') === dateFilter
    return statusMatch && dateMatch
  })

  return (
    <div className='bg-white p-4 rounded shadow'>
      <h3 className='text-[#052659] text-xl font-bold mb-4'>All Orders</h3>

      {/* Filters */}
      <div className='flex flex-wrap gap-3 mb-4'>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className='p-2 border rounded text-sm'
        >
          <option value='All'>All</option>
          <option value='Order Placed'>Placed</option>
          <option value='Packing'>Packing</option>
          <option value='Shipped'>Shipped</option>
          <option value='Out for delivery'>Out for Delivery</option>
          <option value='Delivered'>Delivered (Fulfilled)</option>
          <option value='Top Priority'>Top Priority</option>
        </select>

        <input
          type='date'
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className='p-2 border rounded text-sm'
        />

        <button
          onClick={() => {
            setFilter('All')
            setDateFilter('')
          }}
          className='p-2 bg-[#052659] text-white rounded text-sm'
        >
          Clear Filters
        </button>
      </div>

      {/* Orders List */}
      <div className='flex flex-col gap-4'>
        {filteredOrders.length === 0 && (
          <p className='text-gray-500 text-center'>No orders found.</p>
        )}

        {filteredOrders.map((order, index) => (
          <div
            key={index}
            className='border rounded shadow-sm p-4 grid grid-cols-1 sm:grid-cols-[0.5fr_2fr_1fr] lg:grid-cols-[0.5fr_2fr_1fr_1fr_1fr] gap-3 items-start hover:bg-gray-50 transition'
          >
            <img
              className='w-12 h-12 object-contain'
              src={assets.parcel_icon}
              alt='Parcel Icon'
            />

            <div className='text-gray-700'>
              <div>
                {order.items.map((item, idx) => (
                  <p className='py-0.5' key={idx}>
                    {item.name} x {item.quantity}{' '}
                    {item.size && <span>({item.size})</span>}
                    {idx !== order.items.length - 1 && ','}
                  </p>
                ))}
              </div>
              <p className='mt-3 mb-2 font-semibold text-[#052659]'>
                {order.address.firstName} {order.address.lastName}
              </p>
              <div className='text-xs'>
                <p>{order.address.street},</p>
                <p>
                  {order.address.city}, {order.address.state},{' '}
                  {order.address.country}, {order.address.zipcode}
                </p>
                <p>Phone: {order.address.phone}</p>
              </div>
            </div>

            <div className='text-gray-700 text-xs sm:text-sm'>
              <p>Items: {order.items.length}</p>
              <p>Method: {order.paymentMethod}</p>
              <p>Payment: {order.payment ? 'Done' : 'Pending'}</p>
              <p>
                Date:{' '}
                {new Date(order.date).toLocaleDateString('en-CA')}
              </p>
            </div>

            {/* Amount, Status Dropdown */}
            <div className='flex flex-col gap-2'>
              <p className='text-[#052659] font-semibold text-sm sm:text-base'>
                {currency}{order.amount}
              </p>

              <select
                onChange={(event) => statusHandler(event, order._id)}
                value={order.status}
                className='p-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#052659] text-xs sm:text-sm'
              >
                <option value='Order Placed'>Order Placed</option>
                <option value='Packing'>Packing</option>
                <option value='Shipped'>Shipped</option>
                <option value='Out for delivery'>Out for delivery</option>
                <option value='Delivered'>Delivered</option>
                <option value='Top Priority'>Top Priority</option>
              </select>

            </div>

          </div>
        ))}
      </div>
    </div>
  )
}

export default Orders
