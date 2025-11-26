import { Router } from 'express'
import { generateOtpHandler, verifyOtpHandler } from './otp'
import { getOrdersHandler, getCustomersHandler, getMessagesHandler, getStatsHandler } from './data'
import {
  createProductHandler,
  updateProductHandler,
  deleteProductHandler,
  updateOrderStatusHandler,
  updateMessageStatusHandler,
  updateCustomerHandler,
  deleteCustomerHandler,
  deleteMessageHandler,
} from './crud'

const router = Router()

router.post('/otp/generate', generateOtpHandler)
router.post('/otp/verify', verifyOtpHandler)

// Admin data endpoints (use service role key)
router.get('/data/orders', getOrdersHandler)
router.get('/data/customers', getCustomersHandler)
router.get('/data/messages', getMessagesHandler)
router.get('/data/stats', getStatsHandler)

// Admin CRUD endpoints (use service role key)
router.post('/products', createProductHandler)
router.put('/products/:id', updateProductHandler)
router.delete('/products/:id', deleteProductHandler)

router.put('/orders/:id/status', updateOrderStatusHandler)

router.put('/customers/:id', updateCustomerHandler)
router.delete('/customers/:id', deleteCustomerHandler)

router.put('/messages/:id/status', updateMessageStatusHandler)
router.delete('/messages/:id', deleteMessageHandler)

export default router

