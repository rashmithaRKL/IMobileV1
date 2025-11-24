import { Router } from 'express'
import { listHandler } from './list'
import { categoriesHandler } from './categories'

const router = Router()

router.get('/list', listHandler)
router.get('/categories', categoriesHandler)

export default router

