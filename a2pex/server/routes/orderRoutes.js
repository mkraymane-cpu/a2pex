const express = require('express');
const router = express.Router();
const {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
  deleteOrder,
} = require('../controllers/orderController');
const { protect } = require('../middleware/auth');
const { validateOrder } = require('../middleware/validate');

router.post('/', validateOrder, createOrder);
router.get('/', protect, getOrders);
router.get('/:id', protect, getOrderById);
router.patch('/:id/status', protect, updateOrderStatus);
router.delete('/:id', protect, deleteOrder);

module.exports = router;
