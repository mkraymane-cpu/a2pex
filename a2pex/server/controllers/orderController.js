const { pool } = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');

function computeFinalPrice(price, discountPercent) {
  const p = Number(price);
  const d = Number(discountPercent) || 0;
  return d > 0 ? +(p * (1 - d / 100)).toFixed(2) : p;
}

// POST /api/orders  (public checkout — prices/stock are recalculated
// server-side; the client's cart is only used for productId/size/quantity)
const createOrder = asyncHandler(async (req, res) => {
  const { customerName, email, phone, address, city, notes, items } = req.body;

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    let subtotal = 0;
    const preparedItems = [];

    for (const item of items) {
      const [rows] = await connection.query('SELECT * FROM products WHERE id = ? FOR UPDATE', [
        item.productId,
      ]);
      if (rows.length === 0) {
        throw Object.assign(new Error(`Product ${item.productId} does not exist.`), { statusCode: 400 });
      }
      const product = rows[0];
      const quantity = Number(item.quantity);

      if (product.stock_quantity < quantity) {
        throw Object.assign(
          new Error(`Not enough stock for "${product.club_name}" (${product.stock_quantity} left).`),
          { statusCode: 409 }
        );
      }

      const unitPrice = computeFinalPrice(product.price, product.discount_percent);
      const itemSubtotal = +(unitPrice * quantity).toFixed(2);
      subtotal += itemSubtotal;

      preparedItems.push({
        productId: product.id,
        clubName: product.club_name,
        size: item.size,
        quantity,
        unitPrice,
        subtotal: itemSubtotal,
      });

      await connection.query('UPDATE products SET stock_quantity = stock_quantity - ? WHERE id = ?', [
        quantity,
        product.id,
      ]);
    }

    const total = +subtotal.toFixed(2);

    const [orderResult] = await connection.query(
      `INSERT INTO orders (customer_name, email, phone, address, city, subtotal, total_amount, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [customerName, email, phone, address, city || null, subtotal, total, notes || null]
    );
    const orderId = orderResult.insertId;

    const itemValues = preparedItems.map((i) => [
      orderId,
      i.productId,
      i.clubName,
      i.size,
      i.quantity,
      i.unitPrice,
      i.subtotal,
    ]);
    await connection.query(
      `INSERT INTO order_items (order_id, product_id, club_name, size, quantity, unit_price, subtotal)
       VALUES ?`,
      [itemValues]
    );

    await connection.commit();

    res.status(201).json({
      order: {
        id: orderId,
        customerName,
        email,
        phone,
        address,
        city: city || null,
        status: 'pending',
        subtotal,
        totalAmount: total,
        items: preparedItems,
      },
    });
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
});

// GET /api/orders  (admin)
const getOrders = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  const where = [];
  const params = [];
  if (status) {
    where.push('status = ?');
    params.push(status);
  }
  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

  const pageNum = Math.max(1, Number(page) || 1);
  const limitNum = Math.min(100, Math.max(1, Number(limit) || 20));
  const offset = (pageNum - 1) * limitNum;

  const [countRows] = await pool.query(`SELECT COUNT(*) AS total FROM orders ${whereSql}`, params);
  const [orders] = await pool.query(
    `SELECT * FROM orders ${whereSql} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
    [...params, limitNum, offset]
  );

  res.json({
    orders: orders.map(serializeOrder),
    pagination: {
      total: countRows[0].total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.max(1, Math.ceil(countRows[0].total / limitNum)),
    },
  });
});

// GET /api/orders/:id  (admin)
const getOrderById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const [orders] = await pool.query('SELECT * FROM orders WHERE id = ?', [id]);
  if (orders.length === 0) {
    return res.status(404).json({ message: 'Order not found.' });
  }
  const [items] = await pool.query('SELECT * FROM order_items WHERE order_id = ?', [id]);

  res.json({
    order: {
      ...serializeOrder(orders[0]),
      items: items.map((i) => ({
        id: i.id,
        productId: i.product_id,
        clubName: i.club_name,
        size: i.size,
        quantity: i.quantity,
        unitPrice: Number(i.unit_price),
        subtotal: Number(i.subtotal),
      })),
    },
  });
});

// PATCH /api/orders/:id/status  (admin)
const updateOrderStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ message: `status must be one of: ${validStatuses.join(', ')}.` });
  }
  const [existing] = await pool.query('SELECT id FROM orders WHERE id = ?', [id]);
  if (existing.length === 0) {
    return res.status(404).json({ message: 'Order not found.' });
  }
  await pool.query('UPDATE orders SET status = ? WHERE id = ?', [status, id]);
  res.json({ message: 'Order status updated.', status });
});

// DELETE /api/orders/:id  (admin)
const deleteOrder = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const [existing] = await pool.query('SELECT id FROM orders WHERE id = ?', [id]);
  if (existing.length === 0) {
    return res.status(404).json({ message: 'Order not found.' });
  }
  await pool.query('DELETE FROM orders WHERE id = ?', [id]);
  res.json({ message: 'Order deleted.' });
});

function serializeOrder(row) {
  return {
    id: row.id,
    customerName: row.customer_name,
    email: row.email,
    phone: row.phone,
    address: row.address,
    city: row.city,
    status: row.status,
    subtotal: Number(row.subtotal),
    totalAmount: Number(row.total_amount),
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

module.exports = { createOrder, getOrders, getOrderById, updateOrderStatus, deleteOrder };
