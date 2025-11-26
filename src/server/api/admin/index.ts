import { Router } from 'express'
import { generateOtpHandler, verifyOtpHandler } from './otp'
import { getOrdersHandler, getCustomersHandler, getMessagesHandler, getStatsHandler } from './data'

const router = Router()

router.post('/otp/generate', generateOtpHandler)
router.post('/otp/verify', verifyOtpHandler)

// Admin data endpoints (use service role key)
router.get('/data/orders', getOrdersHandler)
router.get('/data/customers', getCustomersHandler)
router.get('/data/messages', getMessagesHandler)
router.get('/data/stats', getStatsHandler)

export default router

