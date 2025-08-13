import express from 'express'
import { 
    debugBookings, 
    manuallyMarkPaid, 
    getUnpaidBookings, 
    testEmailDirect, 
    triggerEmailViaInngest 
} from '../controllers/debugController.js'

const debugRouter = express.Router()

// Debug routes for troubleshooting
debugRouter.get('/bookings', debugBookings)
debugRouter.get('/unpaid-bookings', getUnpaidBookings)
debugRouter.post('/mark-paid', manuallyMarkPaid)
debugRouter.post('/test-email', testEmailDirect)
debugRouter.post('/trigger-email', triggerEmailViaInngest)

export default debugRouter