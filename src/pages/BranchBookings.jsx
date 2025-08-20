import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { backendUrl } from '../App'
import { toast } from 'react-toastify'

const BranchBookings = ({ token }) => {
	const [bookings, setBookings] = useState([])
	const [gymName, setGymName] = useState('')
	const [loading, setLoading] = useState(false)

	const fetchBranchBookings = async () => {
		if (!token) return
		setLoading(true)
		try {
			const response = await axios.get(`${backendUrl}/api/bookings/branch/bookings`, { 
				headers: { token } 
			})
			if (response.data.success) {
				setBookings(response.data.bookings)
				setGymName(response.data.gym)
			} else {
				toast.error(response.data.message)
			}
		} catch (error) {
			console.error('Error fetching branch bookings:', error)
			toast.error(error.response?.data?.message || 'Failed to fetch bookings')
		} finally {
			setLoading(false)
		}
	}

	useEffect(() => {
		fetchBranchBookings()
	}, [token])

	return (
		<div className='bg-white p-6 rounded-lg shadow'>
			<div className='flex justify-between items-center mb-6'>
				<div>
					<h3 className='text-[#052659] text-2xl font-bold'>Branch Bookings</h3>
					{gymName && (
						<p className='text-sm text-gray-600 mt-1'>{gymName}</p>
					)}
				</div>
				<div className='text-sm text-gray-600'>
					{bookings.length} bookings found
				</div>
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
							{bookings.length === 0 ? (
								<tr>
									<td className='p-8 text-center text-gray-500' colSpan={5}>
										No bookings found for this branch
									</td>
								</tr>
							) : (
								bookings.map((b) => (
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

export default BranchBookings 