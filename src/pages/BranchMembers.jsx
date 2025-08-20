import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { backendUrl } from '../App'
import { toast } from 'react-toastify'

const BranchMembers = ({ token }) => {
	const [members, setMembers] = useState([])
	const [gymName, setGymName] = useState('')
	const [loading, setLoading] = useState(false)

	const fetchBranchMembers = async () => {
		if (!token) return
		setLoading(true)
		try {
			const response = await axios.get(`${backendUrl}/api/bookings/branch/members`, { 
				headers: { token } 
			})
			if (response.data.success) {
				setMembers(response.data.members)
				setGymName(response.data.gym)
			} else {
				toast.error(response.data.message)
			}
		} catch (error) {
			console.error('Error fetching branch members:', error)
			toast.error(error.response?.data?.message || 'Failed to fetch members')
		} finally {
			setLoading(false)
		}
	}

	useEffect(() => {
		fetchBranchMembers()
	}, [token])

	return (
		<div className='bg-white p-6 rounded-lg shadow'>
			<div className='flex justify-between items-center mb-6'>
				<div>
					<h3 className='text-[#052659] text-2xl font-bold'>Branch Members</h3>
					{gymName && (
						<p className='text-sm text-gray-600 mt-1'>{gymName}</p>
					)}
				</div>
				<div className='text-sm text-gray-600'>
					{members.length} members found
				</div>
			</div>

			{/* Members Table */}
			<div className='overflow-x-auto'>
				{loading ? (
					<div className='text-center py-8'>
						<div className='inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#052659]'></div>
						<p className='mt-2 text-gray-600'>Loading members...</p>
					</div>
				) : (
					<table className='min-w-full text-sm'>
						<thead>
							<tr className='text-left border-b-2 border-gray-200'>
								<th className='p-3 font-semibold text-gray-700'>Member Name</th>
								<th className='p-3 font-semibold text-gray-700'>Email</th>
								<th className='p-3 font-semibold text-gray-700'>Phone</th>
								<th className='p-3 font-semibold text-gray-700'>First Booking</th>
								<th className='p-3 font-semibold text-gray-700'>Total Bookings</th>
							</tr>
						</thead>
						<tbody>
							{members.length === 0 ? (
								<tr>
									<td className='p-8 text-center text-gray-500' colSpan={5}>
										No members found for this branch
									</td>
								</tr>
							) : (
								members.map((member, index) => (
									<tr key={index} className='border-b hover:bg-gray-50 transition-colors'>
										<td className='p-3 font-medium'>{member.name}</td>
										<td className='p-3 text-blue-600'>{member.email}</td>
										<td className='p-3 font-mono'>{member.phone}</td>
										<td className='p-3'>
											<div className='font-medium'>{new Date(member.firstBooking).toLocaleDateString()}</div>
											<div className='text-xs text-gray-500'>{new Date(member.firstBooking).toLocaleTimeString()}</div>
										</td>
										<td className='p-3'>
											<span className='px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full font-medium'>
												{member.bookingCount} {member.bookingCount === 1 ? 'booking' : 'bookings'}
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

export default BranchMembers 