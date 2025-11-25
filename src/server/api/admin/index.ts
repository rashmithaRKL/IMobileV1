import { Router } from 'express'
import { generateOtpHandler, verifyOtpHandler } from './otp'

const router = Router()

router.post('/otp/generate', generateOtpHandler)
router.post('/otp/verify', verifyOtpHandler)

export default router

