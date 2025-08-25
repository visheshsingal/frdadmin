import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'

// Assume backendUrl is imported or defined elsewhere in your project
const backendUrl = "http://localhost:4000";

const BranchBookings = ({ token }) => {
    // Original state for fetching all bookings and gym name
    const [bookings, setBookings] = useState([]);
    const [gymName, setGymName] = useState('');
    const [loading, setLoading] = useState(false);

    // New state for filters and filtered data
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedFacility, setSelectedFacility] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [filteredBookings, setFilteredBookings] = useState([]);

    // State to hold unique facilities for the dropdown filter
    const [facilities, setFacilities] = useState([]);

    // Function to fetch all bookings from the backend
    const fetchBranchBookings = async () => {
        if (!token) return;
        setLoading(true);
        try {
            const response = await axios.get(`${backendUrl}/api/bookings/branch/bookings`, {
                headers: { token }
            });
            if (response.data.success) {
                setBookings(response.data.bookings);
                setFilteredBookings(response.data.bookings); // Initialize filtered bookings with all bookings
                setGymName(response.data.gym);

                // Extract unique facilities to populate the filter dropdown
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

    // Effect to fetch bookings when the token changes
    useEffect(() => {
        fetchBranchBookings();
    }, [token]);

    // Effect to handle filtering whenever filter states or bookings change
    useEffect(() => {
        let updatedBookings = [...bookings];

        // 1. Filter by Search Term (Name, Email, or Phone)
        if (searchTerm) {
            const lowercasedSearchTerm = searchTerm.toLowerCase();
            updatedBookings = updatedBookings.filter(b =>
                b.name.toLowerCase().includes(lowercasedSearchTerm) ||
                b.email.toLowerCase().includes(lowercasedSearchTerm) ||
                (b.phone && b.phone.toLowerCase().includes(lowercasedSearchTerm))
            );
        }

        // 2. Filter by Facility
        if (selectedFacility) {
            updatedBookings = updatedBookings.filter(b => b.facility === selectedFacility);
        }

        // 3. Filter by Date Range
        if (startDate || endDate) {
            updatedBookings = updatedBookings.filter(b => {
                const bookingDate = new Date(b.createdAt);
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
    }, [bookings, searchTerm, selectedFacility, startDate, endDate]);

    // Function to clear all filters
    const clearFilters = () => {
        setSearchTerm('');
        setSelectedFacility('');
        setStartDate('');
        setEndDate('');
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
                {/* Search Input */}
                <input
                    type='text'
                    placeholder='Search by name, email, or phone...'
                    className='p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#052659]'
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />

                {/* Facility Filter */}
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

                {/* Start Date Filter */}
                <input
                    type='date'
                    className='p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#052659]'
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                />

                {/* End Date Filter */}
                <input
                    type='date'
                    className='p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#052659]'
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                />

                {/* Clear Filters Button */}
                {(searchTerm || selectedFacility || startDate || endDate) && (
                    <button
                        className='bg-gray-200 text-gray-700 font-semibold py-2 px-4 rounded-md hover:bg-gray-300 transition-colors'
                        onClick={clearFilters}
                    >
                        Clear Filters
                    </button>
                )}
            </div>

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
                                <th className='p-3 font-semibold text-gray-700'>Date & Time</th>
                                <th className='p-3 font-semibold text-gray-700'>Facility</th>
                                <th className='p-3 font-semibold text-gray-700'>Customer Name</th>
                                <th className='p-3 font-semibold text-gray-700'>Email</th>
                                <th className='p-3 font-semibold text-gray-700'>Phone</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredBookings.length === 0 ? (
                                <tr>
                                    <td className='p-8 text-center text-gray-500' colSpan={5}>
                                        No bookings found with the current filters.
                                    </td>
                                </tr>
                            ) : (
                                filteredBookings.map((b) => (
                                    <tr key={b._id} className='border-b hover:bg-gray-50 transition-colors'>
                                        <td className='p-3'>
                                            <div className='font-medium'>{new Date(b.createdAt).toLocaleDateString()}</div>
                                            <div className='text-xs text-gray-500'>{new Date(b.createdAt).toLocaleTimeString()}</div>
                                        </td>
                                        <td className='p-3'>
                                            <span className='px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full'>
                                                {b.facility}
                                            </span>
                                        </td>
                                        <td className='p-3 font-medium'>{b.name}</td>
                                        <td className='p-3 text-blue-600'>{b.email}</td>
                                        <td className='p-3 font-mono'>{b.phone}</td>
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
