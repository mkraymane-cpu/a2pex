const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProductByIdOrSlug,
  getRelatedProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} = require('../controllers/productController');
const { protect } = require('../middleware/auth');
const { validateProduct } = require('../middleware/validate');

router.get('/', getProducts);
router.get('/:id/related', getRelatedProducts);
router.get('/:idOrSlug', getProductByIdOrSlug);
router.post('/', protect, validateProduct, createProduct);
router.put('/:id', protect, updateProduct);
router.delete('/:id', protect, deleteProduct);

module.exports = router;
