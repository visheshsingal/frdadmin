import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { backendUrl, currency } from '../App'
import { toast } from 'react-toastify'
import { assets } from '../assets/assets'

const Orders = ({ token }) => {
  const [orders, setOrders] = useState([])
  const [filter, setFilter] = useState('All')
  const [dateFilter, setDateFilter] = useState('')
  const [productImages, setProductImages] = useState({}) // Store product images by ID

  const fetchAllOrders = async () => {
    if (!token) return null
    try {
      // FIXED: Using correct admin endpoint '/api/order/list'
      const response = await axios.post(backendUrl + '/api/order/list', {}, { headers: { token } })
      if (response.data.success) {
        const ordersData = response.data.orders.reverse()
        setOrders(ordersData)
        
        // Extract all unique product IDs to fetch their images
        const productIds = [];
        ordersData.forEach(order => {
          order.items.forEach(item => {
            if (item.id && !productIds.includes(item.id)) {
              productIds.push(item.id);
            }
          });
        });
        
        // Fetch product images for all products in orders
        if (productIds.length > 0) {
          fetchProductImages(productIds);
        }
      } else {
        toast.error(response.data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  const fetchProductImages = async (productIds) => {
    try {
      const imagesMap = {};
      // Fetch each product's details to get the image
      for (const productId of productIds) {
        try {
          const response = await axios.post(backendUrl + '/api/product/single', { 
            productId 
          }, { headers: { token } });
          
          if (response.data.success && response.data.product) {
            const product = response.data.product;
            // Use the first image if available
            if (product.image && product.image.length > 0) {
              imagesMap[productId] = Array.isArray(product.image) ? product.image[0] : product.image;
            }
          }
        } catch (error) {
          console.error(`Error fetching product ${productId}:`, error);
        }
      }
      setProductImages(imagesMap);
    } catch (error) {
      console.error('Error fetching product images:', error);
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

  const cancelOrder = async (orderId, userEmail) => {
    try {
      const response = await axios.post(
        backendUrl + '/api/order/cancel',
        { orderId, userEmail },
        { headers: { token } }
      )

      if (response.data.success) {
        toast.success('Order cancelled successfully')
        await fetchAllOrders()
      } else {
        toast.error(response.data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  useEffect(() => {
    fetchAllOrders()
  }, [token])

  const filteredOrders = orders.filter((order) => {
    const statusMatch = filter === 'All' || order.status === filter
    const dateMatch = !dateFilter || new Date(order.date).toLocaleDateString('en-CA') === dateFilter
    return statusMatch && dateMatch
  })

  const calculateDiscountedAmount = (items) => {
    let total = 0
    for (let item of items) {
      const price = item.price
      const discount = item.discount || 0
      const finalPrice = Math.round(price - (price * discount / 100))
      total += finalPrice * item.quantity
    }
    return total
  }

  // Get image for a product
  const getProductImage = (item) => {
    // First try to get from productImages map
    if (item.id && productImages[item.id]) {
      return productImages[item.id];
    }
    // Then try item.image directly
    if (item.image) {
      return Array.isArray(item.image) ? item.image[0] : item.image;
    }
    // Fallback to placeholder
    return 'https://via.placeholder.com/60x60?text=No+Image';
  }

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
          <option value='Cancelled'>Cancelled</option>
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

        {filteredOrders.map((order, index) => {
          const actualTotal = calculateDiscountedAmount(order.items)
          return (
            <div
              key={index}
              className='border rounded shadow-sm p-4 grid grid-cols-1 sm:grid-cols-[auto_2fr_1fr] lg:grid-cols-[auto_2fr_1fr_1fr_1fr] gap-4 items-start hover:bg-gray-50 transition'
            >
              {/* Product Images */}
              <div className='flex flex-col gap-2 min-w-[80px]'>
                {order.items.map((item, idx) => (
                  <img
                    key={idx}
                    className='w-16 h-16 object-contain rounded border p-1 bg-white'
                    src={getProductImage(item)}
                    alt={item.name}
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/60x60?text=No+Image'
                    }}
                  />
                ))}
              </div>

              <div className='text-gray-700'>
                <div className='mb-3'>
                  {order.items.map((item, idx) => {
                    const discounted = item.discount
                      ? Math.round(item.price - (item.price * item.discount) / 100)
                      : item.price
                    return (
                      <div key={idx} className='mb-2 pb-2 border-b last:border-b-0'>
                        <p className='font-medium text-sm'>{item.name}</p>
                        <p className='text-xs text-gray-600'>
                          {item.quantity} × {currency}{discounted}
                          {item.discount > 0 && (
                            <span className='ml-2 text-green-600'>
                              ({item.discount}% off)
                            </span>
                          )}
                          {item.size && <span className='ml-2'>• Size: {item.size}</span>}
                        </p>
                        {item.id && (
                          <p className='text-xs text-gray-400'>Product ID: {item.id}</p>
                        )}
                      </div>
                    )
                  })}
                </div>
                <div className='mt-3'>
                  <p className='font-semibold text-[#052659] text-sm'>
                    {order.address.firstName} {order.address.lastName}
                  </p>
                  <div className='text-xs text-gray-600 mt-1'>
                    <p>{order.address.street},</p>
                    <p>
                      {order.address.city}, {order.address.state},{' '}
                      {order.address.country}, {order.address.zipcode}
                    </p>
                    <p>📞 {order.address.phone}</p>
                    <p>✉️ {order.address.email}</p>
                  </div>
                </div>
              </div>

              <div className='text-gray-700 text-xs sm:text-sm space-y-1'>
                <p><span className='font-medium'>Items:</span> {order.items.length}</p>
                <p><span className='font-medium'>Method:</span> {order.paymentMethod}</p>
                <p>
                  <span className='font-medium'>Payment:</span> 
                  <span className={order.payment ? 'text-green-600 ml-1' : 'text-orange-600 ml-1'}>
                    {order.payment ? 'Done' : 'Pending'}
                  </span>
                </p>
                <p><span className='font-medium'>Date:</span> {new Date(order.date).toLocaleDateString()}</p>
                <p><span className='font-medium'>Time:</span> {new Date(order.date).toLocaleTimeString()}</p>
              </div>

              <div className='text-[#052659] font-semibold text-sm sm:text-base'>
                <p className='text-lg'>Total: {currency}{actualTotal}</p>
                {actualTotal !== order.amount && (
                  <p className='text-gray-500 text-xs line-through mt-1'>
                    Original: {currency}{order.amount}
                  </p>
                )}
                {actualTotal < order.amount && (
                  <p className='text-green-600 text-xs mt-1'>
                    Saved: {currency}{order.amount - actualTotal}
                  </p>
                )}
              </div>

              <div className='flex flex-col gap-2'>
                {order.status !== 'Cancelled' ? (
                  <>
                    <select
                      onChange={(event) => statusHandler(event, order._id)}
                      value={order.status}
                      className='p-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#052659] text-xs sm:text-sm bg-white'
                    >
                      <option value='Order Placed'>Order Placed</option>
                      <option value='Packing'>Packing</option>
                      <option value='Shipped'>Shipped</option>
                      <option value='Out for delivery'>Out for delivery</option>
                      <option value='Delivered'>Delivered</option>
                      <option value='Top Priority'>Top Priority</option>
                    </select>

                    <button
                      onClick={() => cancelOrder(order._id, order.address.email)}
                      className='p-2 bg-red-500 text-white rounded text-sm hover:bg-red-600 transition-colors'
                    >
                      Cancel Order
                    </button>
                  </>
                ) : (
                  <div className='text-center p-2 bg-red-100 rounded'>
                    <span className='text-red-600 font-semibold text-sm'>Cancelled</span>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default Orders