import { Router } from 'express'
import { listHandler } from './list'
import { categoriesHandler } from './categories'
import { detailHandler } from './detail'

const router = Router()

router.get('/list', listHandler)
router.get('/categories', categoriesHandler)
router.get('/:id', detailHandler)

export default router

