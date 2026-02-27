const express = require('express');
const db = require('../database/db');
const requireAuth = require('../middleware/auth');

const router = express.Router();

router.use(requireAuth);

router.post('/', (req, res) => {
  try {
    const { shippingAddress } = req.body;

    if (!shippingAddress) {
      return res.status(400).json({ error: 'Shipping address is required' });
    }

    const cartItems = db.prepare(`
      SELECT
        cart_items.product_id,
        cart_items.quantity,
        products.price,
        products.stock
      FROM cart_items
      JOIN products ON cart_items.product_id = products.id
      WHERE cart_items.user_id = ?
    `).all(req.userId);

    if (cartItems.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }

    let total = 0;
    for (const item of cartItems) {
      if (item.stock < item.quantity) {
        return res.status(400).json({ error: 'Not enough stock for one or more items' });
      }
      total += item.price * item.quantity;
    }

    total = Math.round(total * 100) / 100;

    const createOrder = db.transaction(() => {
      const orderResult = db.prepare(
        'INSERT INTO orders (user_id, total, status, shipping_address) VALUES (?, ?, ?, ?)'
      ).run(req.userId, total, 'pending', shippingAddress);

      const orderId = orderResult.lastInsertRowid;

      const insertOrderItem = db.prepare(
        'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)'
      );
      const updateStock = db.prepare(
        'UPDATE products SET stock = stock - ? WHERE id = ?'
      );

      for (const item of cartItems) {
        insertOrderItem.run(orderId, item.product_id, item.quantity, item.price);
        updateStock.run(item.quantity, item.product_id);
      }

      db.prepare('DELETE FROM cart_items WHERE user_id = ?').run(req.userId);

      return orderId;
    });

    const orderId = createOrder();

    const order = db.prepare('SELECT id, total, status, shipping_address, created_at FROM orders WHERE id = ?').get(orderId);
    res.status(201).json({ order });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/', (req, res) => {
  try {
    const orders = db.prepare(
      'SELECT id, total, status, shipping_address, created_at FROM orders WHERE user_id = ? ORDER BY created_at DESC'
    ).all(req.userId);

    res.json({ orders });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', (req, res) => {
  try {
    const order = db.prepare(
      'SELECT id, total, status, shipping_address, created_at FROM orders WHERE id = ? AND user_id = ?'
    ).get(req.params.id, req.userId);

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const items = db.prepare(`
      SELECT
        order_items.id,
        order_items.product_id,
        order_items.quantity,
        order_items.price,
        products.name
      FROM order_items
      JOIN products ON order_items.product_id = products.id
      WHERE order_items.order_id = ?
    `).all(req.params.id);

    res.json({ order: { ...order, items } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
