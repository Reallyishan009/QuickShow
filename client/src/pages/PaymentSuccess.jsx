import React, { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { CheckCircle, Clock, Mail } from 'lucide-react'
import { useAppContext } from '../context/AppContext'
import toast from 'react-hot-toast'

const PaymentSuccess = () => {
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const { axios, getToken } = useAppContext()
    const [verifying, setVerifying] = useState(true)
    const [paymentVerified, setPaymentVerified] = useState(false)
    const [bookingDetails, setBookingDetails] = useState(null)

    const sessionId = searchParams.get('session_id')

    const verifyPayment = async () => {
        if (!sessionId) {
            toast.error('Invalid payment session')
            navigate('/my-bookings')
            return
        }

        try {
            setVerifying(true)
            
            // Call a verification endpoint
            const response = await axios.post('/api/booking/verify-payment', {
                sessionId
            }, {
                headers: { Authorization: `Bearer ${await getToken()}` }
            })

            if (response.data.success) {
                setPaymentVerified(true)
                setBookingDetails(response.data.booking)
                toast.success('Payment confirmed! Booking updated.')
            } else {
                toast.error('Payment verification failed')
                navigate('/my-bookings')
            }
        } catch (error) {
            console.error('Payment verification error:', error)
            toast.error('Error verifying payment')
            navigate('/my-bookings')
        } finally {
            setVerifying(false)
        }
    }

    useEffect(() => {
        verifyPayment()
    }, [sessionId])

    if (verifying) {
        return (
            <div className='min-h-screen flex flex-col items-center justify-center px-6'>
                <div className='text-center'>
                    <div className='animate-spin rounded-full h-16 w-16 border-4 border-primary border-t-transparent mx-auto mb-6'></div>
                    <h2 className='text-2xl font-bold text-white mb-2'>Verifying Payment...</h2>
                    <p className='text-gray-400'>Please wait while we confirm your payment</p>
                </div>
            </div>
        )
    }

    return (
        <div className='min-h-screen flex flex-col items-center justify-center px-6'>
            <div className='max-w-md w-full text-center'>
                {paymentVerified ? (
                    <>
                        <CheckCircle className='w-20 h-20 text-green-500 mx-auto mb-6' />
                        <h1 className='text-3xl font-bold text-white mb-4'>Payment Successful!</h1>
                        <p className='text-gray-300 mb-6'>
                            Your booking has been confirmed. You should receive a confirmation email shortly.
                        </p>
                        
                        {bookingDetails && (
                            <div className='bg-gray-800 rounded-lg p-6 mb-6 text-left'>
                                <h3 className='text-lg font-semibold text-white mb-4'>Booking Details</h3>
                                <div className='space-y-2 text-sm'>
                                    <p className='text-gray-300'>
                                        <span className='text-white'>Movie:</span> {bookingDetails.movieTitle}
                                    </p>
                                    <p className='text-gray-300'>
                                        <span className='text-white'>Amount:</span> ${bookingDetails.amount}
                                    </p>
                                    <p className='text-gray-300'>
                                        <span className='text-white'>Seats:</span> {bookingDetails.seats?.join(', ')}
                                    </p>
                                    <p className='text-gray-300'>
                                        <span className='text-white'>Status:</span> 
                                        <span className='text-green-400 ml-1'>CONFIRMED</span>
                                    </p>
                                </div>
                            </div>
                        )}

                        <div className='flex items-center justify-center gap-2 text-blue-400 mb-6'>
                            <Mail className='w-5 h-5' />
                            <span className='text-sm'>Confirmation email sent</span>
                        </div>

                        <div className='space-y-3'>
                            <button
                                onClick={() => navigate('/my-bookings')}
                                className='w-full px-6 py-3 bg-primary hover:bg-primary-dull text-white rounded-lg transition-colors'
                            >
                                View My Bookings
                            </button>
                            <button
                                onClick={() => navigate('/movies')}
                                className='w-full px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors'
                            >
                                Book More Movies
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                        <Clock className='w-20 h-20 text-yellow-500 mx-auto mb-6' />
                        <h1 className='text-3xl font-bold text-white mb-4'>Payment Processing</h1>
                        <p className='text-gray-300 mb-6'>
                            Your payment is being processed. This may take a few moments.
                        </p>
                        <button
                            onClick={() => navigate('/my-bookings')}
                            className='px-6 py-3 bg-primary hover:bg-primary-dull text-white rounded-lg transition-colors'
                        >
                            Check My Bookings
                        </button>
                    </>
                )}
            </div>
        </div>
    )
}

export default PaymentSuccess