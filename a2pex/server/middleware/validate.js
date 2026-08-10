const VALID_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];
const VALID_KIT_TYPES = ['Home', 'Away', 'Third', 'Goalkeeper'];

function validateProduct(req, res, next) {
  const { clubName, season, kitType, brand, price, stockQuantity } = req.body;
  const errors = [];

  if (!clubName || !String(clubName).trim()) errors.push('clubName is required.');
  if (!season || !String(season).trim()) errors.push('season is required.');
  if (kitType && !VALID_KIT_TYPES.includes(kitType)) {
    errors.push(`kitType must be one of: ${VALID_KIT_TYPES.join(', ')}.`);
  }
  if (!brand || !String(brand).trim()) errors.push('brand is required.');
  if (price === undefined || price === null || isNaN(Number(price)) || Number(price) < 0) {
    errors.push('price must be a non-negative number.');
  }
  if (
    stockQuantity !== undefined &&
    (isNaN(Number(stockQuantity)) || Number(stockQuantity) < 0)
  ) {
    errors.push('stockQuantity must be a non-negative number.');
  }

  if (req.body.sizes) {
    let sizes = req.body.sizes;
    if (typeof sizes === 'string') {
      try {
        sizes = JSON.parse(sizes);
      } catch {
        sizes = sizes.split(',').map((s) => s.trim());
      }
    }
    const invalidSizes = sizes.filter((s) => !VALID_SIZES.includes(s));
    if (invalidSizes.length) {
      errors.push(`Invalid sizes: ${invalidSizes.join(', ')}. Allowed: ${VALID_SIZES.join(', ')}.`);
    }
  }

  if (errors.length) {
    return res.status(400).json({ message: 'Validation failed', errors });
  }
  next();
}

function validateOrder(req, res, next) {
  const { customerName, email, phone, address, items } = req.body;
  const errors = [];

  if (!customerName || !String(customerName).trim()) errors.push('customerName is required.');
  if (!email || !/^\S+@\S+\.\S+$/.test(email)) errors.push('A valid email is required.');
  if (!phone || !String(phone).trim()) errors.push('phone is required.');
  if (!address || !String(address).trim()) errors.push('address is required.');
  if (!Array.isArray(items) || items.length === 0) {
    errors.push('items must be a non-empty array.');
  } else {
    items.forEach((item, i) => {
      if (!item.productId) errors.push(`items[${i}].productId is required.`);
      if (!item.size) errors.push(`items[${i}].size is required.`);
      if (!item.quantity || Number(item.quantity) < 1) errors.push(`items[${i}].quantity must be >= 1.`);
    });
  }

  if (errors.length) {
    return res.status(400).json({ message: 'Validation failed', errors });
  }
  next();
}

function validateLogin(req, res, next) {
  const { username, password } = req.body;
  const errors = [];
  if (!username || !String(username).trim()) errors.push('username is required.');
  if (!password) errors.push('password is required.');
  if (errors.length) {
    return res.status(400).json({ message: 'Validation failed', errors });
  }
  next();
}

module.exports = { validateProduct, validateOrder, validateLogin, VALID_SIZES, VALID_KIT_TYPES };
