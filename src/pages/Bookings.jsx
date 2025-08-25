import React, { useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import { backendUrl } from '../App'
import { toast } from 'react-toastify'

const Bookings = ({ token }) => {
	console.log('Bookings component mounted with token:', token)
	const [bookings, setBookings] = useState([])
	const [gymFilter, setGymFilter] = useState('All')
	const [facilityFilter, setFacilityFilter] = useState('All')
	const [searchTerm, setSearchTerm] = useState('')
	const [loading, setLoading] = useState(false)

	const facilities = [
		"Workout Sessions (Strength Training, Cardio, Group Classes)",
		"Steam Bath / Sauna",
		"Personal Training (1:1 Coaching)",
		"Weight Loss Program",
		"Weight Gain Program",
		"Height Improvement Program",
		"Nutrition & Diet Consultation"
	]

	const gyms = useMemo(() => Array.from({ length: 100 }, (_, i) => `Forever Fitness Branch #${i + 1}`), [])

	const fetchBookings = async () => {
		if (!token) {
			console.log('No token provided')
			return
		}
		setLoading(true)
		try {
			console.log('Fetching bookings with token:', token)
			const response = await axios.get(backendUrl + '/api/bookings/list', { headers: { token } })
			console.log('Bookings response:', response.data)
			if (response.data.success) {
				setBookings(response.data.bookings)
			} else {
				toast.error(response.data.message)
			}
		} catch (error) {
			console.error('Error fetching bookings:', error)
			console.error('Error response:', error.response?.data)
			toast.error(error.response?.data?.message || error.message || 'Failed to fetch bookings')
		} finally {
			setLoading(false)
		}
	}

	useEffect(() => { 
		console.log('useEffect triggered with token:', token)
		fetchBookings() 
	}, [token])

	const filtered = useMemo(() => {
		return bookings.filter(b => {
			const gymOk = gymFilter === 'All' || b.gym === gymFilter
			const facilityOk = facilityFilter === 'All' || b.facility === facilityFilter
			const searchOk = !searchTerm || 
				b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
				b.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
				b.phone.includes(searchTerm) ||
				b.gym.toLowerCase().includes(searchTerm.toLowerCase()) ||
				b.facility.toLowerCase().includes(searchTerm.toLowerCase()) ||
				b.timeSlot.toLowerCase().includes(searchTerm.toLowerCase())
			return gymOk && facilityOk && searchOk
		})
	}, [bookings, gymFilter, facilityFilter, searchTerm])

	const clearFilters = () => {
		setGymFilter('All')
		setFacilityFilter('All')
		setSearchTerm('')
	}

	const getFilterStats = () => {
		const total = bookings.length
		const filteredCount = filtered.length
		return { total, filtered: filteredCount }
	}

	// Format booking date for display
	const formatBookingDate = (dateString) => {
		const date = new Date(dateString);
		return date.toLocaleDateString('en-US', {
			weekday: 'short',
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		});
	};

	const stats = getFilterStats()

	console.log('Bookings component rendering with token:', token, 'bookings:', bookings.length)
	
	return (
		<div className='bg-white p-6 rounded-lg shadow'>
			<div className='flex justify-between items-center mb-6'>
				<h3 className='text-[#052659] text-2xl font-bold'>Facility Bookings</h3>
				<div className='text-sm text-gray-600'>
					Showing {stats.filtered} of {stats.total} bookings
				</div>
			</div>

			{/* Filters Section */}
			<div className='bg-gray-50 p-4 rounded-lg mb-6'>
				<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4'>
					<div>
						<label className='block text-sm font-medium text-gray-700 mb-1'>Gym Branch</label>
						<select 
							value={gymFilter} 
							onChange={(e) => setGymFilter(e.target.value)} 
							className='w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
						>
							<option value='All'>All Gyms ({bookings.length})</option>
							{gyms.map((g, i) => {
								const count = bookings.filter(b => b.gym === g).length
								return count > 0 ? <option key={i} value={g}>{g} ({count})</option> : null
							})}
						</select>
					</div>
					
					<div>
						<label className='block text-sm font-medium text-gray-700 mb-1'>Facility</label>
						<select 
							value={facilityFilter} 
							onChange={(e) => setFacilityFilter(e.target.value)} 
							className='w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
						>
							<option value='All'>All Facilities ({bookings.length})</option>
							{facilities.map((f, i) => {
								const count = bookings.filter(b => b.facility === f).length
								return count > 0 ? <option key={i} value={f}>{f} ({count})</option> : null
							})}
						</select>
					</div>

					<div>
						<label className='block text-sm font-medium text-gray-700 mb-1'>Search</label>
						<input
							type='text'
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							placeholder='Search by name, email, phone, time slot...'
							className='w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
						/>
					</div>

					<div className='flex items-end'>
						<button 
							onClick={clearFilters} 
							className='w-full p-2 bg-gray-500 text-white rounded-md text-sm hover:bg-gray-600 transition-colors'
						>
							Clear Filters
						</button>
					</div>
				</div>

				{/* Active Filters Display */}
				{(gymFilter !== 'All' || facilityFilter !== 'All' || searchTerm) && (
					<div className='flex flex-wrap gap-2'>
						<span className='text-sm text-gray-600'>Active filters:</span>
						{gymFilter !== 'All' && (
							<span className='px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full'>
								Gym: {gymFilter}
							</span>
						)}
						{facilityFilter !== 'All' && (
							<span className='px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full'>
								Facility: {facilityFilter}
							</span>
						)}
						{searchTerm && (
							<span className='px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full'>
								Search: "{searchTerm}"
							</span>
						)}
					</div>
				)}
			</div>

			{/* Table Section */}
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
								<th className='p-3 font-semibold text-gray-700'>Gym Branch</th>
								<th className='p-3 font-semibold text-gray-700'>Facility</th>
								<th className='p-3 font-semibold text-gray-700'>Customer Name</th>
								<th className='p-3 font-semibold text-gray-700'>Email</th>
								<th className='p-3 font-semibold text-gray-700'>Phone</th>
								<th className='p-3 font-semibold text-gray-700'>Status</th>
							</tr>
						</thead>
						<tbody>
							{filtered.length === 0 ? (
								<tr>
									<td className='p-8 text-center text-gray-500' colSpan={8}>
										{bookings.length === 0 ? 'No bookings found.' : 'No bookings match your filters.'}
									</td>
								</tr>
							) : (
								filtered.map((b) => (
									<tr key={b._id} className='border-b hover:bg-gray-50 transition-colors'>
										<td className='p-3'>
											<div className='font-medium'>{formatBookingDate(b.date)}</div>
											<div className='text-xs text-gray-500'>
												Booked on: {new Date(b.createdAt).toLocaleDateString()}
											</div>
										</td>
										<td className='p-3 font-medium text-blue-700'>{b.timeSlot}</td>
										<td className='p-3 font-medium text-[#052659]'>{b.gym}</td>
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
													: 'bg-green-100 text-green-800'
											}`}>
												{b.status || 'confirmed'}
											</span>
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

export default Bookings