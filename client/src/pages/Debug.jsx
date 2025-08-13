import React, { useState, useEffect } from 'react'
import { useAppContext } from '../context/AppContext'
import toast from 'react-hot-toast'

const Debug = () => {
    const { axios, getToken } = useAppContext()
    const [bookings, setBookings] = useState([])
    const [unpaidBookings, setUnpaidBookings] = useState([])
    const [loading, setLoading] = useState(false)

    const fetchBookings = async () => {
        try {
            setLoading(true)
            const response = await axios.get('/api/debug/bookings')
            if (response.data.success) {
                setBookings(response.data.bookings)
            }
        } catch (error) {
            console.error('Error fetching bookings:', error)
            toast.error('Failed to fetch bookings')
        } finally {
            setLoading(false)
        }
    }

    const fetchUnpaidBookings = async () => {
        try {
            const response = await axios.get('/api/debug/unpaid-bookings')
            if (response.data.success) {
                setUnpaidBookings(response.data.unpaidBookings)
            }
        } catch (error) {
            console.error('Error fetching unpaid bookings:', error)
            toast.error('Failed to fetch unpaid bookings')
        }
    }

    const markAsPaid = async (bookingId) => {
        try {
            const response = await axios.post('/api/debug/mark-paid', { bookingId })
            if (response.data.success) {
                toast.success('Booking marked as paid and email sent!')
                fetchBookings()
                fetchUnpaidBookings()
            } else {
                toast.error(response.data.message)
            }
        } catch (error) {
            console.error('Error marking as paid:', error)
            toast.error('Failed to mark as paid')
        }
    }

    const testEmail = async (bookingId) => {
        try {
            const response = await axios.post('/api/debug/test-email', { bookingId })
            if (response.data.success) {
                toast.success('Test email sent successfully!')
            } else {
                toast.error(response.data.message)
            }
        } catch (error) {
            console.error('Error sending test email:', error)
            toast.error('Failed to send test email')
        }
    }

    useEffect(() => {
        fetchBookings()
        fetchUnpaidBookings()
    }, [])

    return (
        <div className='min-h-screen pt-32 pb-20 px-6 md:px-16 lg:px-40'>
            <div className='max-w-6xl mx-auto'>
                <h1 className='text-3xl font-bold text-white mb-8'>Debug Panel</h1>
                
                <div className='grid gap-8'>
                    {/* Unpaid Bookings Section */}
                    <div className='bg-gray-800 rounded-xl p-6'>
                        <div className='flex justify-between items-center mb-6'>
                            <h2 className='text-xl font-bold text-white'>Unpaid Bookings</h2>
                            <button 
                                onClick={fetchUnpaidBookings}
                                className='px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors'
                            >
                                Refresh
                            </button>
                        </div>
                        
                        {unpaidBookings.length === 0 ? (
                            <p className='text-gray-400'>No unpaid bookings found</p>
                        ) : (
                            <div className='space-y-4'>
                                {unpaidBookings.map((booking) => (
                                    <div key={booking.id} className='bg-gray-700 rounded-lg p-4'>
                                        <div className='flex justify-between items-start'>
                                            <div>
                                                <h3 className='text-white font-medium'>{booking.movieTitle}</h3>
                                                <p className='text-gray-300 text-sm'>Amount: ${booking.amount}</p>
                                                <p className='text-gray-300 text-sm'>Seats: {booking.seats.join(', ')}</p>
                                                <p className='text-gray-300 text-sm'>Created: {new Date(booking.createdAt).toLocaleString()}</p>
                                                <p className='text-gray-300 text-sm'>Payment Link: {booking.hasPaymentLink ? 'Yes' : 'No'}</p>
                                            </div>
                                            <div className='flex gap-2'>
                                                <button
                                                    onClick={() => markAsPaid(booking.id)}
                                                    className='px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm rounded transition-colors'
                                                >
                                                    Mark as Paid
                                                </button>
                                                <button
                                                    onClick={() => testEmail(booking.id)}
                                                    className='px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors'
                                                >
                                                    Test Email
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* All Bookings Section */}
                    <div className='bg-gray-800 rounded-xl p-6'>
                        <div className='flex justify-between items-center mb-6'>
                            <h2 className='text-xl font-bold text-white'>All Bookings</h2>
                            <button 
                                onClick={fetchBookings}
                                className='px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors'
                                disabled={loading}
                            >
                                {loading ? 'Loading...' : 'Refresh'}
                            </button>
                        </div>
                        
                        {bookings.length === 0 ? (
                            <p className='text-gray-400'>No bookings found</p>
                        ) : (
                            <div className='overflow-x-auto'>
                                <table className='w-full text-left'>
                                    <thead>
                                        <tr className='border-b border-gray-600'>
                                            <th className='text-white py-2'>Movie</th>
                                            <th className='text-white py-2'>Amount</th>
                                            <th className='text-white py-2'>Status</th>
                                            <th className='text-white py-2'>Payment Link</th>
                                            <th className='text-white py-2'>Created</th>
                                            <th className='text-white py-2'>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {bookings.map((booking) => (
                                            <tr key={booking.id} className='border-b border-gray-700'>
                                                <td className='text-gray-300 py-2'>{booking.movieTitle}</td>
                                                <td className='text-gray-300 py-2'>${booking.amount}</td>
                                                <td className='py-2'>
                                                    <span className={`px-2 py-1 rounded text-xs ${
                                                        booking.isPaid 
                                                            ? 'bg-green-600 text-white' 
                                                            : 'bg-red-600 text-white'
                                                    }`}>
                                                        {booking.isPaid ? 'PAID' : 'UNPAID'}
                                                    </span>
                                                </td>
                                                <td className='text-gray-300 py-2'>{booking.paymentLink}</td>
                                                <td className='text-gray-300 py-2 text-xs'>
                                                    {new Date(booking.createdAt).toLocaleDateString()}
                                                </td>
                                                <td className='py-2'>
                                                    {!booking.isPaid && (
                                                        <button
                                                            onClick={() => markAsPaid(booking.id)}
                                                            className='px-2 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded transition-colors'
                                                        >
                                                            Fix Payment
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Debug