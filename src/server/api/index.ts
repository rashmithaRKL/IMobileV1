import { Router, Request, Response, NextFunction } from 'express'
import authRouter from './auth'
import productsRouter from './products'
import { testEnvHandler } from './test-env'

const router = Router()

// Async error wrapper for route handlers
const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch((error) => {
      console.error('[API Router] Unhandled async error:', error)
      if (!res.headersSent) {
        res.status(error.status || 500).json({
          error: error.message || 'Internal Server Error',
          ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
        })
      }
    })
  }
}

// Mount route handlers
router.use('/auth', authRouter)
router.use('/products', productsRouter)
router.get('/test-env', asyncHandler(testEnvHandler))

export default router

