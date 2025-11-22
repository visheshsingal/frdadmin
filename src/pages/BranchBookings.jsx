import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'

// Assume backendUrl is imported or defined elsewhere in your project
const backendUrl = "https://frdbackend.onrender.com";

const BranchBookings = ({ token }) => {
    const [bookings, setBookings] = useState([]);
    const [gymName, setGymName] = useState('');
    const [loading, setLoading] = useState(false);
    const [cancelingId, setCancelingId] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedFacility, setSelectedFacility] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [filteredBookings, setFilteredBookings] = useState([]);
    const [facilities, setFacilities] = useState([]);
    const [showTodaysBookings, setShowTodaysBookings] = useState(false);

    // Fetch bookings
    const fetchBranchBookings = async () => {
        if (!token) return;
        setLoading(true);
        try {
            const response = await axios.get(`${backendUrl}/api/bookings/branch/bookings`, {
                headers: { token }
            });
            if (response.data.success) {
                setBookings(response.data.bookings);
                setFilteredBookings(response.data.bookings);
                setGymName(response.data.gym);

                const uniqueFacilities = [...new Set(response.data.bookings.map(b => b.facility))];
                setFacilities(uniqueFacilities);
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            console.error('Error fetching branch bookings:', error);
            toast.error(error.response?.data?.message || 'Failed to fetch bookings');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBranchBookings();
    }, [token]);

    // Today's Bookings function
    const filterTodaysBookings = () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        return bookings.filter(b => {
            const bookingDate = new Date(b.date);
            return bookingDate >= today && bookingDate < tomorrow;
        });
    };

    // Filter bookings whenever filters change
    useEffect(() => {
        let updatedBookings = [...bookings];

        // Apply today's filter if enabled
        if (showTodaysBookings) {
            updatedBookings = filterTodaysBookings();
        }

        if (searchTerm) {
            const lowercasedSearchTerm = searchTerm.toLowerCase();
            updatedBookings = updatedBookings.filter(b =>
                b.name.toLowerCase().includes(lowercasedSearchTerm) ||
                b.email.toLowerCase().includes(lowercasedSearchTerm) ||
                (b.phone && b.phone.toLowerCase().includes(lowercasedSearchTerm)) ||
                b.timeSlot.toLowerCase().includes(lowercasedSearchTerm)
            );
        }

        if (selectedFacility) {
            updatedBookings = updatedBookings.filter(b => b.facility === selectedFacility);
        }

        if (startDate || endDate) {
            updatedBookings = updatedBookings.filter(b => {
                const bookingDate = new Date(b.date);
                const start = startDate ? new Date(startDate) : null;
                const end = endDate ? new Date(endDate) : null;

                if (start && end) {
                    return bookingDate >= start && bookingDate <= end;
                } else if (start) {
                    return bookingDate >= start;
                } else if (end) {
                    return bookingDate <= end;
                }
                return true;
            });
        }

        setFilteredBookings(updatedBookings);
    }, [bookings, searchTerm, selectedFacility, startDate, endDate, showTodaysBookings]);

    const clearFilters = () => {
        setSearchTerm('');
        setSelectedFacility('');
        setStartDate('');
        setEndDate('');
        setShowTodaysBookings(false);
        setFilteredBookings(bookings);
    };

    // Cancel booking function
    const cancelBooking = async (bookingId, customerEmail, customerName) => {
        if (!window.confirm(`Are you sure you want to cancel this booking for ${customerName}? An email will be sent to ${customerEmail}.`)) {
            return;
        }

        setCancelingId(bookingId);
        try {
            const response = await axios.post(
                `${backendUrl}/api/bookings/cancel/${bookingId}`,
                {},
                {
                    headers: { token }
                }
            );

            if (response.data.success) {
                toast.success('Booking canceled successfully and email sent to customer');
                // Refresh the bookings list
                fetchBranchBookings();
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            console.error('Error canceling booking:', error);
            toast.error(error.response?.data?.message || 'Failed to cancel booking');
        } finally {
            setCancelingId(null);
        }
    };

    // Format date for display
    const formatBookingDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    return (
        <div className='bg-white p-6 rounded-lg shadow'>
            <div className='flex flex-col sm:flex-row justify-between items-center mb-6'>
                <div>
                    <h3 className='text-[#052659] text-2xl font-bold'>Branch Bookings</h3>
                    {gymName && (
                        <p className='text-sm text-gray-600 mt-1'>{gymName}</p>
                    )}
                </div>
                <div className='text-sm text-gray-600 mt-4 sm:mt-0'>
                    {filteredBookings.length} of {bookings.length} bookings found
                </div>
            </div>

            {/* Filter Controls */}
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6'>
                <input
                    type='text'
                    placeholder='Search by name, email, phone, or time slot...'
                    className='p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#052659]'
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />

                <select
                    className='p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#052659]'
                    value={selectedFacility}
                    onChange={(e) => setSelectedFacility(e.target.value)}
                >
                    <option value=''>All Facilities</option>
                    {facilities.map(fac => (
                        <option key={fac} value={fac}>{fac}</option>
                    ))}
                </select>

                <input
                    type='date'
                    className='p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#052659]'
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    placeholder='From Date'
                />

                <input
                    type='date'
                    className='p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#052659]'
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    placeholder='To Date'
                />
            </div>

            {/* Extra Buttons */}
            <div className='flex gap-2 mb-6'>
                <button
                    onClick={() => setShowTodaysBookings(!showTodaysBookings)}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                        showTodaysBookings 
                            ? 'bg-[#052659] text-white hover:bg-[#07377a]' 
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                >
                    {showTodaysBookings ? 'Show All Bookings' : "Today's Bookings"}
                </button>

                {(searchTerm || selectedFacility || startDate || endDate || showTodaysBookings) && (
                    <button
                        className='bg-gray-200 text-gray-700 font-semibold py-2 px-4 rounded-md hover:bg-gray-300 transition-colors'
                        onClick={clearFilters}
                    >
                        Clear Filters
                    </button>
                )}
            </div>

            {/* Active Filters Display */}
            {(searchTerm || selectedFacility || startDate || endDate || showTodaysBookings) && (
                <div className='flex flex-wrap gap-2 mb-4'>
                    <span className='text-sm text-gray-600'>Active filters:</span>
                    {showTodaysBookings && (
                        <span className='px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full'>
                            Today's Bookings
                        </span>
                    )}
                    {selectedFacility && (
                        <span className='px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full'>
                            Facility: {selectedFacility}
                        </span>
                    )}
                    {startDate && (
                        <span className='px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full'>
                            From: {new Date(startDate).toLocaleDateString()}
                        </span>
                    )}
                    {endDate && (
                        <span className='px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full'>
                            To: {new Date(endDate).toLocaleDateString()}
                        </span>
                    )}
                    {searchTerm && (
                        <span className='px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full'>
                            Search: "{searchTerm}"
                        </span>
                    )}
                </div>
            )}

            {/* Bookings Table */}
            <div className='overflow-x-auto'>
                {loading ? (
                    <div className='text-center py-8'>
                        <div className='inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#052659]'></div>
                        <p className='mt-2 text-gray-600'>Loading bookings...</p>
                    </div>
                ) : (
                    <table className='min-w-full text-sm'>
                        <thead>
                            <tr className='text-left border-b-2 border-gray-200'>
                                <th className='p-3 font-semibold text-gray-700'>Booking Date</th>
                                <th className='p-3 font-semibold text-gray-700'>Time Slot</th>
                                <th className='p-3 font-semibold text-gray-700'>Facility</th>
                                <th className='p-3 font-semibold text-gray-700'>Customer Name</th>
                                <th className='p-3 font-semibold text-gray-700'>Email</th>
                                <th className='p-3 font-semibold text-gray-700'>Phone</th>
                                <th className='p-3 font-semibold text-gray-700'>Status</th>
                                <th className='p-3 font-semibold text-gray-700'>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredBookings.length === 0 ? (
                                <tr>
                                    <td className='p-8 text-center text-gray-500' colSpan={8}>
                                        No bookings found with the current filters.
                                    </td>
                                </tr>
                            ) : (
                                filteredBookings.map((b) => (
                                    <tr key={b._id} className='border-b hover:bg-gray-50 transition-colors'>
                                        <td className='p-3'>
                                            <div className='font-medium'>{formatBookingDate(b.date)}</div>
                                            <div className='text-xs text-gray-500'>
                                                Booked on: {new Date(b.createdAt).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td className='p-3 font-medium text-blue-700'>{b.timeSlot}</td>
                                        <td className='p-3'>
                                            <span className='px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full'>
                                                {b.facility}
                                            </span>
                                        </td>
                                        <td className='p-3 font-medium'>{b.name}</td>
                                        <td className='p-3 text-blue-600'>{b.email}</td>
                                        <td className='p-3 font-mono'>{b.phone}</td>
                                        <td className='p-3'>
                                            <span className={`px-2 py-1 text-xs rounded-full ${
                                                b.status === 'cancelled' 
                                                    ? 'bg-red-100 text-red-800' 
                                                    : 'bg-blue-100 text-blue-800'
                                            }`}>
                                                {b.status || 'confirmed'}
                                            </span>
                                        </td>
                                        <td className='p-3'>
                                            {b.status !== 'cancelled' && (
                                                <button
                                                    onClick={() => cancelBooking(b._id, b.email, b.name)}
                                                    disabled={cancelingId === b._id}
                                                    className={`px-3 py-1 text-xs rounded-md ${
                                                        cancelingId === b._id 
                                                            ? 'bg-gray-400 cursor-not-allowed' 
                                                            : 'bg-red-600 hover:bg-red-700 text-white'
                                                    }`}
                                                >
                                                    {cancelingId === b._id ? 'Canceling...' : 'Cancel'}
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    )
}

export default BranchBookings;