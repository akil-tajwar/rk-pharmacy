import { Router } from 'express'
import { completeOrderController, confirmOrderController, createOrderController, deleteOrderController, getAllOrdersController, getOrdersByUserIdController } from '../controllers/order.controller'

const router = Router()

router.post('/create', createOrderController)
router.get('/getAll', getAllOrdersController)
router.get('/getByUserId/:userId', getOrdersByUserIdController)
router.delete('/delete-order/:orderMasterId', deleteOrderController)
router.patch('/confirm-order/:id', confirmOrderController)
router.patch('/complete-order/:id', completeOrderController)


export default router
