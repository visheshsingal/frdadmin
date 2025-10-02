import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { backendUrl, currency } from '../App'
import { toast } from 'react-toastify'

const Orders = ({ token }) => {
  const [orders, setOrders] = useState([])
  const [filter, setFilter] = useState('All')
  const [dateFilter, setDateFilter] = useState('')
  const [productImages, setProductImages] = useState({})
  const [showAnalytics, setShowAnalytics] = useState(false)
  const [analyticsData, setAnalyticsData] = useState({})
  const [selectedMonth, setSelectedMonth] = useState('all')
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [showNotesModal, setShowNotesModal] = useState(false)
  const [currentOrderId, setCurrentOrderId] = useState('')
  const [noteText, setNoteText] = useState('')
  const [showViewNotesModal, setShowViewNotesModal] = useState(false)
  const [viewNotesText, setViewNotesText] = useState('')
  const [showTrackingModal, setShowTrackingModal] = useState(false)
  const [trackingUrlText, setTrackingUrlText] = useState('')

  const fetchAllOrders = async () => {
    if (!token) return null
    try {
      const response = await axios.post(backendUrl + '/api/order/list', {}, { headers: { token } })
      if (response.data.success) {
        const ordersData = response.data.orders
        setOrders(ordersData)
        
        const productIds = [];
        ordersData.forEach(order => {
          order.items.forEach(item => {
            if (item.id && !productIds.includes(item.id)) {
              productIds.push(item.id);
            }
          });
        });
        
        if (productIds.length > 0) {
          fetchProductImages(productIds);
        }
      } else {
        toast.error(response.data.message)
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
      toast.error('Failed to fetch orders')
    }
  }

  const fetchProductImages = async (productIds) => {
    try {
      const imagesMap = {};
      for (const productId of productIds) {
        try {
          const response = await axios.post(backendUrl + '/api/product/single', { 
            productId 
          }, { headers: { token } });
          
          if (response.data.success && response.data.product) {
            const product = response.data.product;
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

  // ✅ Calculate discounted amount for order
  const calculateDiscountedAmount = (items) => {
    let total = 0;
    for (let item of items) {
      const price = item.price;
      const discount = item.discount || 0;
      const finalPrice = Math.round(price - (price * discount / 100));
      total += finalPrice * item.quantity;
    }
    return total;
  };

  // ✅ Get payment status for order
const getPaymentStatus = (order) => {
  if (order.status === 'Cancelled' || order.status === 'Cancel and Refund') {
    return order.status === 'Cancel and Refund' ? 'refunded' : 'cancelled';
  } else if (order.status === 'Delivered' || (order.paymentMethod === 'Razorpay' && order.payment === true)) {
    return 'paid';
  } else {
    return 'pending';
  }
}

  // ✅ Improved Analytics Calculation with proper payment status
  const calculateAnalytics = () => {
    let filteredOrders = orders;

    // Apply month filter if selected
    if (selectedMonth !== 'all') {
      const month = parseInt(selectedMonth);
      filteredOrders = filteredOrders.filter(order => {
        const orderDate = new Date(order.date);
        return orderDate.getMonth() === month && orderDate.getFullYear() === selectedYear;
      });
    }
    
    // Apply date filter if selected
    if (dateFilter) {
      filteredOrders = filteredOrders.filter(order => 
        new Date(order.date).toLocaleDateString('en-CA') === dateFilter
      );
    }

    // Calculate actual totals for ALL orders
    const allOrdersWithActualTotal = orders.map(order => ({
      ...order,
      actualTotal: calculateDiscountedAmount(order.items)
    }));

    const filteredOrdersWithActualTotal = filteredOrders.map(order => ({
      ...order,
      actualTotal: calculateDiscountedAmount(order.items)
    }));

    // Categorize ALL orders for total calculations
    const allPaidOrders = allOrdersWithActualTotal.filter(order => order.status === 'Delivered');
    const allCancelledOrders = allOrdersWithActualTotal.filter(order => order.status === 'Cancelled');
    const allRefundedOrders = allOrdersWithActualTotal.filter(order => order.status === 'Cancel and Refund');
    const allCancelledAndRefunded = allOrdersWithActualTotal.filter(order => order.status === 'Cancelled' || order.status === 'Cancel and Refund');
    
    // Categorize FILTERED orders for filtered calculations
    const filteredPaidOrders = filteredOrdersWithActualTotal.filter(order => order.status === 'Delivered');
    const filteredPendingOrders = filteredOrdersWithActualTotal.filter(order => 
      order.status !== 'Cancelled' && 
      order.status !== 'Cancel and Refund' && 
      order.status !== 'Delivered'
    );
    const filteredCancelledOrders = filteredOrdersWithActualTotal.filter(order => order.status === 'Cancelled');
    const filteredRefundedOrders = filteredOrdersWithActualTotal.filter(order => order.status === 'Cancel and Refund');
    const filteredCancelledAndRefunded = filteredOrdersWithActualTotal.filter(order => order.status === 'Cancelled' || order.status === 'Cancel and Refund');
    const filteredActiveOrders = filteredOrdersWithActualTotal.filter(order => order.status !== 'Cancelled' && order.status !== 'Cancel and Refund');

    // Calculate amounts for ALL data using actualTotal
    const totalAllSales = allPaidOrders.reduce((sum, order) => sum + order.actualTotal, 0);
    const totalAllRefunded = allRefundedOrders.reduce((sum, order) => sum + order.actualTotal, 0);
    const totalAllCancelled = allCancelledOrders.reduce((sum, order) => sum + order.actualTotal, 0);

    // Calculate amounts for FILTERED data using actualTotal
    const totalFilteredSales = filteredPaidOrders.reduce((sum, order) => sum + order.actualTotal, 0);
    const totalFilteredRefunded = filteredRefundedOrders.reduce((sum, order) => sum + order.actualTotal, 0);
    const totalFilteredCancelled = filteredCancelledOrders.reduce((sum, order) => sum + order.actualTotal, 0);
    const pendingAmount = filteredPendingOrders.reduce((sum, order) => sum + order.actualTotal, 0);

    // Annual monthly chart data (always show full year with proper scaling)
    const monthlyChartData = [];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    // Find maximum sales for proper chart scaling
    let maxMonthlySales = 1; // Start with 1 to avoid division by zero
    
    for (let month = 0; month < 12; month++) {
      const monthOrders = orders.filter(order => {
        const orderDate = new Date(order.date);
        return orderDate.getMonth() === month && orderDate.getFullYear() === selectedYear;
      });

      // Calculate actual total for each order in this month
      const monthOrdersWithActualTotal = monthOrders.map(order => ({
        ...order,
        actualTotal: calculateDiscountedAmount(order.items)
      }));

      const monthPaidOrders = monthOrdersWithActualTotal.filter(order => order.status === 'Delivered');
      
      const monthSales = monthPaidOrders.reduce((sum, order) => sum + order.actualTotal, 0);
      const monthActiveOrders = monthOrdersWithActualTotal.filter(order => 
        order.status !== 'Cancelled' && order.status !== 'Cancel and Refund'
      ).length;
      const monthCancelled = monthOrdersWithActualTotal.filter(order => 
        order.status === 'Cancelled' || order.status === 'Cancel and Refund'
      ).length;

      monthlyChartData.push({
        month: months[month],
        sales: monthSales,
        orders: monthActiveOrders,
        cancelled: monthCancelled
      });

      // Update max sales for scaling
      if (monthSales > maxMonthlySales) {
        maxMonthlySales = monthSales;
      }
    }

    // Last 7 days sales
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toLocaleDateString('en-CA');
      
      const dayOrders = orders.filter(order => 
        new Date(order.date).toLocaleDateString('en-CA') === dateStr
      );

      // Calculate actual total for each order
      const dayOrdersWithActualTotal = dayOrders.map(order => ({
        ...order,
        actualTotal: calculateDiscountedAmount(order.items)
      }));

      const dayPaidOrders = dayOrdersWithActualTotal.filter(order => order.status === 'Delivered');
      
      const daySales = dayPaidOrders.reduce((sum, order) => sum + order.actualTotal, 0);
      
      last7Days.push({
        date: date.toLocaleDateString('en-IN'),
        sales: daySales,
        orders: dayPaidOrders.length
      });
    }

    setAnalyticsData({
      // Total metrics (ALL data)
      totalAllSales,
      totalAllRefunded,
      totalAllCancelled,
      totalAllOrders: allOrdersWithActualTotal.length,
      totalAllActive: allOrdersWithActualTotal.filter(order => order.status !== 'Cancelled' && order.status !== 'Cancel and Refund').length,
      totalAllPaid: allPaidOrders.length,
      totalAllPending: allOrdersWithActualTotal.filter(order => 
        order.status !== 'Cancelled' && 
        order.status !== 'Cancel and Refund' && 
        order.status !== 'Delivered'
      ).length,
      totalAllCancelledCount: allCancelledOrders.length,
      totalAllRefundedCount: allRefundedOrders.length,
      
      // Filtered metrics (based on month/date selection)
      totalFilteredSales,
      totalFilteredRefunded,
      totalFilteredCancelled,
      filteredOrders: filteredActiveOrders.length,
      filteredDelivered: filteredPaidOrders.length,
      filteredPending: filteredPendingOrders.length,
      filteredCancelled: filteredCancelledOrders.length,
      filteredRefunded: filteredRefundedOrders.length,
      
      // Filtered totals for dashboard boxes
      totalFilteredOrders: filteredActiveOrders.length,
      totalFilteredPaid: filteredPaidOrders.length,
      totalFilteredPending: filteredPendingOrders.length,
      totalFilteredCancelledCount: filteredCancelledOrders.length,
      totalFilteredRefundedCount: filteredRefundedOrders.length,
      
      // Payment metrics (based on month/date selection)
      paymentBreakdown: {
        paid: {
          count: filteredPaidOrders.length,
          amount: totalFilteredSales
        },
        pending: {
          count: filteredPendingOrders.length,
          amount: pendingAmount
        },
        refunded: {
          count: filteredRefundedOrders.length,
          amount: totalFilteredRefunded
        },
        cancelled: {
          count: filteredCancelledOrders.length,
          amount: totalFilteredCancelled
        }
      },
      
      // Annual monthly data (always full year)
      monthlyChartData,
      maxMonthlySales: maxMonthlySales,
      
      // Last 7 days (always last 7 days)
      last7Days,
      
      // Current filter info
      currentFilter: selectedMonth !== 'all' ? 
        `${months[parseInt(selectedMonth)]} ${selectedYear}` : 
        (dateFilter ? `Date: ${dateFilter}` : 'All Time')
    });
  }

  const statusHandler = async (event, orderId) => {
    const newStatus = event.target.value;
    const order = orders.find(o => o._id === orderId);
    
    try {
      await axios.post(
        backendUrl + '/api/order/status',
        { 
          orderId, 
          status: newStatus
        },
        { headers: { token } }
      );

      if (newStatus === 'Cancelled') {
        toast.success('Order cancelled successfully!');
      } else if (newStatus === 'Delivered') {
        toast.success('Order marked as delivered!');
      } else {
        toast.success(`Order status updated to ${newStatus}`);
      }
      
      await fetchAllOrders();
    } catch (error) {
      console.error('Error updating order status:', error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Failed to update order status');
      }
    }
  }

  const handleAddNote = async (orderId, currentNotes) => {
    setCurrentOrderId(orderId)
    setNoteText(currentNotes || '')
    setShowNotesModal(true)
  }

  const handleViewNotes = (notes) => {
    setViewNotesText(notes)
    setShowViewNotesModal(true)
  }

  const handleAddTracking = (orderId, currentTrackingUrl) => {
    setCurrentOrderId(orderId)
    setTrackingUrlText(currentTrackingUrl || '')
    setShowTrackingModal(true)
  }

  const saveTrackingUrl = async () => {
    try {
      await axios.post(
        backendUrl + '/api/order/tracking',
        { 
          orderId: currentOrderId, 
          trackingUrl: trackingUrlText
        },
        { headers: { token } }
      );
      
      toast.success('Tracking URL updated successfully!');
      setShowTrackingModal(false);
      setTrackingUrlText('');
      setCurrentOrderId('');
      await fetchAllOrders();
    } catch (error) {
      console.error('Error updating tracking URL:', error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Failed to update tracking URL');
      }
    }
  }

  const saveNotes = async () => {
    try {
      await axios.post(
        backendUrl + '/api/order/notes',
        { 
          orderId: currentOrderId, 
          adminNotes: noteText
        },
        { headers: { token } }
      );
      
      toast.success('Notes updated successfully!');
      setShowNotesModal(false)
      setNoteText('')
      setCurrentOrderId('')
      await fetchAllOrders();
    } catch (error) {
      console.error('Error updating notes:', error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Failed to update notes');
      }
    }
  }

  const cancelOrder = async (orderId, userEmail) => {
    try {
      const response = await axios.post(
        backendUrl + '/api/order/cancel',
        { 
          orderId, 
          userEmail
        },
        { headers: { token } }
      );

      if (response.data.success) {
        if (response.data.message) {
          toast.success(response.data.message);
        } else {
          toast.success('Order cancelled successfully!');
        }
        await fetchAllOrders();
      } else {
        toast.error(response.data.message || 'Failed to cancel order');
      }
    } catch (error) {
      console.error('Error cancelling order:', error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Failed to cancel order');
      }
    }
  }

  useEffect(() => {
    fetchAllOrders();
  }, [token]);

  useEffect(() => {
    if (orders.length > 0) {
      calculateAnalytics();
    }
  }, [orders, selectedMonth, selectedYear, dateFilter]);

  // ✅ Sort orders by date - most recent first
  const sortedOrders = [...orders].sort((a, b) => new Date(b.date) - new Date(a.date));

  // ✅ Search functionality
  const searchOrders = (orders, searchTerm) => {
    if (!searchTerm.trim()) return orders;
    
    const searchLower = searchTerm.toLowerCase();
    return orders.filter(order => 
      order._id.toLowerCase().includes(searchLower) ||
      order.address.firstName.toLowerCase().includes(searchLower) ||
      order.address.lastName.toLowerCase().includes(searchLower) ||
      order.address.email.toLowerCase().includes(searchLower) ||
      order.address.phone.includes(searchTerm) ||
      order.items.some(item => 
        item.name.toLowerCase().includes(searchLower)
      ) ||
      order.status.toLowerCase().includes(searchLower)
    );
  };

const filteredOrders = searchOrders(sortedOrders, searchTerm).filter((order) => {
  const statusMatch = filter === 'All' || order.status === filter;
  const dateMatch = !dateFilter || new Date(order.date).toLocaleDateString('en-CA') === dateFilter;
  
  // ✅ ADD THIS LINE: Remove failed Razorpay payments
  if (order.paymentMethod === 'Razorpay' && order.payment !== true) {
    return false;
  }
  
  return statusMatch && dateMatch;
});
  const getProductImage = (item) => {
    if (item.id && productImages[item.id]) {
      return productImages[item.id];
    }
    if (item.image) {
      return Array.isArray(item.image) ? item.image[0] : item.image;
    }
    return 'https://via.placeholder.com/60x60?text=No+Image';
  };

  // Month options for dropdown
  const months = [
    'All Months', 'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Year options (last 3 years + current year)
  const currentYear = new Date().getFullYear();
  const years = [currentYear - 2, currentYear - 1, currentYear, currentYear + 1];

  // Clear all filters
  const clearFilters = () => {
    setSelectedMonth('all');
    setSelectedYear(new Date().getFullYear());
    setDateFilter('');
    setFilter('All');
    setSearchTerm('');
  };

  return (
    <div className='bg-white p-4 rounded shadow'>
      <div className="flex justify-between items-center mb-4">
        <h3 className='text-[#052659] text-xl font-bold'>All Orders</h3>
        <button
          onClick={() => setShowAnalytics(!showAnalytics)}
          className='bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors'
        >
          {showAnalytics ? 'Hide Analytics' : 'Show Analytics Dashboard'}
        </button>
      </div>

      {/* Improved Analytics Dashboard */}
      {showAnalytics && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
          <h4 className="text-[#052659] text-lg font-bold mb-4">📈 Sales Analytics</h4>
          
          {/* Filters Section */}
          <div className="mb-6 p-4 bg-white rounded border">
            <div className="flex flex-wrap gap-4 items-end">
              <div>
                <label className="text-sm text-gray-600 font-medium">Select Month</label>
                <div className="flex gap-2 mt-1">
                  <select
                    value={selectedMonth}
                    onChange={(e) => {
                      setSelectedMonth(e.target.value);
                      setDateFilter(''); // Clear date filter when month is selected
                    }}
                    className="p-2 border rounded text-sm"
                  >
                    {months.map((month, index) => (
                      <option key={index} value={index === 0 ? 'all' : index - 1}>
                        {month}
                      </option>
                    ))}
                  </select>
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                    className="p-2 border rounded text-sm"
                  >
                    {years.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div>
                <label className="text-sm text-gray-600 font-medium">Or Select Specific Date</label>
                <input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => {
                    setDateFilter(e.target.value);
                    setSelectedMonth('all'); // Clear month filter when date is selected
                  }}
                  className="p-2 border rounded text-sm mt-1"
                />
              </div>
              
              <div>
                <button
                  onClick={clearFilters}
                  className="p-2 bg-gray-500 text-white rounded text-sm hover:bg-gray-600"
                >
                  Clear Filters
                </button>
              </div>
            </div>
            
            {/* Current Filter Info */}
            <div className="mt-3 p-2 bg-blue-50 rounded">
              <p className="text-sm text-blue-700 font-medium">
                📊 Showing data for: <span className="font-bold">{analyticsData.currentFilter || 'All Time'}</span>
              </p>
            </div>
          </div>

          {/* Total Overview Cards - Only 2 boxes for Sales and Refund */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {/* Total Sales (All Time) */}
            <div className="bg-white p-4 rounded-lg border text-center shadow-sm">
              <p className="text-2xl font-bold text-green-600">{currency}{analyticsData.totalAllSales || 0}</p>
              <p className="text-gray-600 text-sm">Total Sales</p>
              <p className="text-xs text-gray-400 mt-1">All Time (After Discounts)</p>
            </div>
            
            {/* Total Refunded (All Time) */}
            <div className="bg-white p-4 rounded-lg border text-center shadow-sm">
              <p className="text-2xl font-bold text-red-600">{currency}{analyticsData.totalAllRefunded || 0}</p>
              <p className="text-gray-600 text-sm">Total Refunded</p>
              <p className="text-xs text-gray-400 mt-1">All Time (After Discounts)</p>
            </div>
          </div>

          {/* Order Status Overview - Updates with filters */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded border text-center">
              <p className="text-2xl font-bold text-blue-700">
                {analyticsData.totalFilteredOrders || 0}
              </p>
              <p className="text-gray-600 text-sm font-medium">Total Orders</p>
              <p className="text-xs text-gray-400 mt-1">{analyticsData.currentFilter || 'All Time'}</p>
            </div>
            <div className="bg-green-50 p-4 rounded border text-center">
              <p className="text-2xl font-bold text-green-700">
                {analyticsData.totalFilteredPaid || 0}
              </p>
              <p className="text-gray-600 text-sm font-medium">Delivered Orders</p>
              <p className="text-xs text-gray-400 mt-1">{analyticsData.currentFilter || 'All Time'}</p>
            </div>
            <div className="bg-yellow-50 p-4 rounded border text-center">
              <p className="text-2xl font-bold text-yellow-700">
                {analyticsData.totalFilteredPending || 0}
              </p>
              <p className="text-gray-600 text-sm font-medium">Pending Orders</p>
              <p className="text-xs text-gray-400 mt-1">{analyticsData.currentFilter || 'All Time'}</p>
            </div>
            <div className="bg-red-50 p-4 rounded border text-center">
              <p className="text-2xl font-bold text-red-700">
                {(analyticsData.totalFilteredCancelledCount || 0) + (analyticsData.totalFilteredRefundedCount || 0)}
              </p>
              <p className="text-gray-600 text-sm font-medium">Cancelled Orders</p>
              <p className="text-xs text-gray-400 mt-1">{analyticsData.currentFilter || 'All Time'}</p>
            </div>
          </div>

          {/* Payment Breakdown - These update based on filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-green-50 p-4 rounded border text-center">
              <p className="text-xl font-bold text-green-700">
                {currency}{analyticsData.paymentBreakdown?.paid?.amount || 0}
              </p>
              <p className="text-gray-600 text-sm">Paid ({analyticsData.paymentBreakdown?.paid?.count || 0} orders)</p>
              <p className="text-xs text-gray-400 mt-1">{analyticsData.currentFilter || 'All Time'}</p>
            </div>
            <div className="bg-yellow-50 p-4 rounded border text-center">
              <p className="text-xl font-bold text-yellow-700">
                {currency}{analyticsData.paymentBreakdown?.pending?.amount || 0}
              </p>
              <p className="text-gray-600 text-sm">Pending ({analyticsData.paymentBreakdown?.pending?.count || 0} orders)</p>
              <p className="text-xs text-gray-400 mt-1">{analyticsData.currentFilter || 'All Time'}</p>
            </div>
            <div className="bg-orange-50 p-4 rounded border text-center">
              <p className="text-xl font-bold text-orange-700">
                {currency}{analyticsData.paymentBreakdown?.cancelled?.amount || 0}
              </p>
              <p className="text-gray-600 text-sm">Cancelled ({analyticsData.paymentBreakdown?.cancelled?.count || 0} orders)</p>
              <p className="text-xs text-gray-400 mt-1">{analyticsData.currentFilter || 'All Time'}</p>
            </div>
            <div className="bg-red-50 p-4 rounded border text-center">
              <p className="text-xl font-bold text-red-700">
                {currency}{analyticsData.paymentBreakdown?.refunded?.amount || 0}
              </p>
              <p className="text-gray-600 text-sm">Refunded ({analyticsData.paymentBreakdown?.refunded?.count || 0} orders)</p>
              <p className="text-xs text-gray-400 mt-1">{analyticsData.currentFilter || 'All Time'}</p>
            </div>
          </div>

          {/* Annual Monthly Chart - Fixed scaling */}
          <div className="mb-6 p-4 bg-white rounded border">
            <h5 className="font-semibold mb-4 text-[#052659] text-center">
              Monthly Sales Report - {selectedYear}
            </h5>
            
            {/* Chart Container */}
            <div className="bg-gray-50 p-4 rounded-lg border">
              <div className="flex items-end justify-between h-48 gap-2 mb-4">
                {analyticsData.monthlyChartData?.map((monthData, index) => (
                  <div key={index} className="flex flex-col items-center flex-1">
                    {/* Sales Bar - Proper scaling with actual height */}
                    <div className="flex flex-col items-center w-full h-full justify-end" style={{ height: '160px' }}>
                      <div 
                        className="bg-gradient-to-t from-green-500 to-green-400 w-8 rounded-t transition-all duration-300 hover:from-green-600 hover:to-green-500 cursor-pointer relative group"
                        style={{ 
                          height: `${(monthData.sales / analyticsData.maxMonthlySales) * 100}%`,
                          minHeight: monthData.sales > 0 ? '5px' : '0px',
                          maxHeight: '160px'
                        }}
                        title={`${monthData.month}: ${currency}${monthData.sales}`}
                      >
                        {/* Hover Tooltip */}
                        <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs p-2 rounded opacity-0 group-hover:opacity-100 transition-opacity z-10 whitespace-nowrap">
                          <div className="font-semibold">{monthData.month}</div>
                          <div>Sales: {currency}{monthData.sales}</div>
                          <div>Orders: {monthData.orders}</div>
                          <div>Cancelled: {monthData.cancelled}</div>
                        </div>
                      </div>
                      
                      {/* Sales Amount */}
                      {monthData.sales > 0 && (
                        <p className="text-xs text-green-600 font-bold mt-1">
                          {currency}{monthData.sales > 1000 ? `${(monthData.sales/1000).toFixed(1)}k` : monthData.sales}
                        </p>
                      )}
                    </div>
                    
                    {/* Month Label */}
                    <p className="text-xs font-semibold text-gray-600 mt-2">
                      {monthData.month}
                    </p>
                  </div>
                ))}
              </div>
              
              {/* Chart Stats */}
              <div className="text-center text-xs text-gray-500 mt-2">
                Chart Scale: {currency}0 to {currency}{analyticsData.maxMonthlySales || 0}
              </div>
            </div>
          </div>

          {/* Last 7 Days Sales */}
          <div className="p-4 bg-white rounded border">
            <h5 className="font-semibold mb-3 text-[#052659]">Last 7 Days Sales</h5>
            <div className="grid grid-cols-2 md:grid-cols-7 gap-2">
              {analyticsData.last7Days?.map((day, index) => (
                <div key={index} className="text-center p-2 bg-gray-50 rounded border">
                  <p className="text-xs font-semibold text-gray-600">
                    {day.date.split('/')[0]}/{day.date.split('/')[1]}
                  </p>
                  <p className="text-green-600 font-bold text-sm">
                    {currency}{day.sales}
                  </p>
                  <p className="text-xs text-gray-500">{day.orders} orders</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Rest of the code remains the same for orders list */}
      {/* Search and Filters */}
      <div className='flex flex-wrap gap-3 mb-4'>
        {/* Search Bar */}
        <div className="flex-1 min-w-[200px]">
          <input
            type="text"
            placeholder="Search by Order ID, Name, Email, Phone, Product..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className='p-2 border rounded text-sm w-full'
          />
        </div>

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
          <option value='Delivered'>Delivered</option>
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
          onClick={clearFilters}
          className='p-2 bg-[#052659] text-white rounded text-sm'
        >
          Clear All
        </button>
      </div>

      {/* Orders Count */}
      <div className='mb-4 p-3 bg-blue-50 rounded'>
        <p className='text-[#052659] font-semibold'>
          📊 Showing {filteredOrders.length} orders {searchTerm && `for "${searchTerm}"`} • Most recent first
        </p>
      </div>

      {/* Orders List */}
      <div className='flex flex-col gap-4'>
        {filteredOrders.length === 0 && (
          <p className='text-gray-500 text-center py-8'>No orders found.</p>
        )}

        {filteredOrders.map((order, index) => {
          const actualTotal = calculateDiscountedAmount(order.items)
          const paymentStatus = getPaymentStatus(order)
          const isPaid = paymentStatus === 'paid'
          const isPending = paymentStatus === 'pending'
          const isRefunded = paymentStatus === 'refunded'
          
          return (
            <div
              key={order._id}
              className='border rounded shadow-sm p-4 grid grid-cols-1 sm:grid-cols-[auto_2fr_1fr] lg:grid-cols-[auto_2fr_1fr_1fr_1fr] gap-4 items-start hover:bg-gray-50 transition overflow-hidden'
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

              {/* Rest of order details */}
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
                <p><span className='font-medium'>Order ID:</span> {order._id}</p>
                <p><span className='font-medium'>Items:</span> {order.items.length}</p>
                <p><span className='font-medium'>Method:</span> {order.paymentMethod}</p>
                <p>
                  <span className='font-medium'>Payment:</span> 
                  {isRefunded ? (
                    <span className='text-red-600 ml-1 font-semibold'>REFUNDED</span>
                  ) : isPaid ? (
                    <span className='text-green-600 ml-1 font-semibold'>PAID</span>
                  ) : (
                    <span className='text-orange-600 ml-1 font-semibold'>PENDING</span>
                  )}
                </p>
                <p><span className='font-medium'>Date:</span> {new Date(order.date).toLocaleDateString()}</p>
                <p><span className='font-medium'>Time:</span> {new Date(order.date).toLocaleTimeString()}</p>
                <p className='text-blue-600 text-xs font-medium'>
                  🕒 {index === 0 ? 'MOST RECENT' : ''}
                </p>
              </div>

              <div className='text-[#052659] font-semibold text-sm sm:text-base'>
                <p className='text-lg'>Total: {currency}{actualTotal}</p>
                {actualTotal !== order.amount && (
                  <p className='text-gray-500 text-xs line-through mt-1'>
                    {/* Original: {currency}{order.amount} */}
                  </p>
                )}
                {actualTotal < order.amount && (
                  <p className='text-green-600 text-xs mt-1'>
                    {/* Saved: {currency}{order.amount - actualTotal} */}
                  </p>
                )}
                {isRefunded && (
                  <p className='text-red-600 text-xs mt-1 font-semibold'>
                    💸 Refunded: {currency}{actualTotal}
                  </p>
                )}
              </div>

              <div className='flex flex-col gap-2 min-w-0'>
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
                  <option value='Cancelled'>Cancel</option>
                  <option value='Cancel and Refund'>Cancel and Refund</option>
                </select>

                <div className='text-xs text-gray-600 p-2 bg-gray-100 rounded'>
                  <p>
                    <strong>Payment Status:</strong> 
                    {isRefunded ? ' 💸 REFUNDED' : isPaid ? ' ✅ PAID' : ' ❌ PENDING'}
                  </p>
                  {order.status === 'Delivered' && isPending && (
                    <p className='text-green-600 font-semibold mt-1'>
                      Will be auto-paid on delivery
                    </p>
                  )}
                </div>

                <button
                  onClick={() => handleAddNote(order._id, order.adminNotes || '')}
                  className='p-2 bg-blue-500 text-white rounded text-xs hover:bg-blue-600 transition'
                >
                  📝 Add Notes
                </button>

                <button
                  onClick={() => handleAddTracking(order._id, order.trackingUrl || '')}
                  className='p-2 bg-green-500 text-white rounded text-xs hover:bg-green-600 transition'
                >
                  🚚 {order.trackingUrl ? 'Edit Tracking' : 'Add Tracking'}
                </button>

                {order.trackingUrl && (
                  <div className='text-xs bg-green-50 p-2 rounded border-l-4 border-green-400 w-full min-w-0'>
                    <strong className='text-green-700'>Tracking URL:</strong>
                    <div className='text-gray-700 mt-1 w-full min-w-0'>
                      <a 
                        href={order.trackingUrl} 
                        target='_blank' 
                        rel='noopener noreferrer'
                        className='text-blue-600 hover:text-blue-800 underline break-words'
                      >
                        {order.trackingUrl.length > 50 ? order.trackingUrl.substring(0, 50) + '...' : order.trackingUrl}
                      </a>
                    </div>
                  </div>
                )}

                {order.adminNotes && (
                  <div className='text-xs bg-yellow-50 p-2 rounded border-l-4 border-yellow-400 w-full min-w-0'>
                    <strong className='text-yellow-700'>Admin Notes:</strong>
                    <div className='text-gray-700 mt-1 w-full min-w-0'>
                      {order.adminNotes.length > 100 ? (
                        <>
                          <p className='break-words break-all word-wrap-break-word w-full min-w-0 overflow-hidden'>{order.adminNotes.substring(0, 100)}...</p>
                          <button 
                            onClick={() => handleViewNotes(order.adminNotes)}
                            className='text-blue-600 hover:text-blue-800 underline mt-1 text-xs'
                          >
                            View Full Notes
                          </button>
                        </>
                      ) : (
                        <p className='break-words break-all word-wrap-break-word w-full min-w-0 overflow-hidden'>{order.adminNotes}</p>
                      )}
                    </div>
                  </div>
                )}

                {order.userNotes && (
                  <div className='text-xs bg-blue-50 p-2 rounded border-l-4 border-blue-400 w-full min-w-0'>
                    <strong className='text-blue-700'>Customer Special Request:</strong>
                    <div className='text-gray-700 mt-1 w-full min-w-0'>
                      {order.userNotes.length > 100 ? (
                        <>
                          <p className='break-words break-all word-wrap-break-word w-full min-w-0 overflow-hidden'>{order.userNotes.substring(0, 100)}...</p>
                          <button 
                            onClick={() => handleViewNotes(order.userNotes)}
                            className='text-blue-600 hover:text-blue-800 underline mt-1 text-xs'
                          >
                            View Full Request
                          </button>
                        </>
                      ) : (
                        <p className='break-words break-all word-wrap-break-word w-full min-w-0 overflow-hidden'>{order.userNotes}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Notes Modal */}
      {showNotesModal && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
          <div className='bg-white p-6 rounded-lg shadow-lg w-96 max-w-full'>
            <h3 className='text-lg font-semibold mb-4 text-[#052659]'>Add Admin Notes</h3>
            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder='Enter notes for this order...'
              className='w-full h-32 p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-[#052659] focus:border-[#052659]'
            />
            <div className='flex gap-3 mt-4'>
              <button
                onClick={saveNotes}
                className='flex-1 bg-[#052659] text-white py-2 px-4 rounded-lg hover:bg-[#041d47] transition'
              >
                Save Notes
              </button>
              <button
                onClick={() => {
                  setShowNotesModal(false)
                  setNoteText('')
                  setCurrentOrderId('')
                }}
                className='flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition'
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Notes Modal */}
      {showViewNotesModal && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
          <div className='bg-white p-6 rounded-lg shadow-lg w-96 max-w-full max-h-96'>
            <h3 className='text-lg font-semibold mb-4 text-[#052659]'>Admin Notes</h3>
            <div className='max-h-64 overflow-y-auto border border-gray-200 rounded p-3 bg-gray-50'>
              <p className='text-gray-700 text-sm break-words whitespace-pre-wrap'>{viewNotesText}</p>
            </div>
            <div className='flex justify-end mt-4'>
              <button
                onClick={() => {
                  setShowViewNotesModal(false)
                  setViewNotesText('')
                }}
                className='bg-[#052659] text-white py-2 px-4 rounded-lg hover:bg-[#041d47] transition'
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tracking Modal */}
      {showTrackingModal && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
          <div className='bg-white p-6 rounded-lg shadow-lg w-96 max-w-full'>
            <h3 className='text-lg font-semibold mb-4 text-[#052659]'>
              {trackingUrlText ? 'Update Tracking URL' : 'Add Tracking URL'}
            </h3>
            <input
              type="url"
              value={trackingUrlText}
              onChange={(e) => setTrackingUrlText(e.target.value)}
              placeholder='Enter Shiprocket tracking URL...'
              className='w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#052659] focus:border-[#052659]'
            />
            <div className='flex gap-3 mt-4'>
              <button
                onClick={saveTrackingUrl}
                className='flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition'
              >
                Save Tracking
              </button>
              <button
                onClick={() => {
                  setShowTrackingModal(false)
                  setTrackingUrlText('')
                  setCurrentOrderId('')
                }}
                className='flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition'
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Orders