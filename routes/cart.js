const express = require('express');
const db = require('../database/db');
const requireAuth = require('../middleware/auth');

const router = express.Router();

router.use(requireAuth);

router.get('/', (req, res) => {
  try {
    const items = db.prepare(`
      SELECT
        cart_items.id,
        cart_items.quantity,
        cart_items.product_id,
        products.name AS name,
        products.price AS price,
        products.image AS image,
        products.stock AS stock
      FROM cart_items
      JOIN products ON cart_items.product_id = products.id
      WHERE cart_items.user_id = ?
    `).all(req.userId);

    res.json({ items });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', (req, res) => {
  try {
    const { productId, quantity } = req.body;

    if (!productId || !quantity || quantity < 1) {
      return res.status(400).json({ error: 'Valid productId and quantity are required' });
    }

    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(productId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    if (product.stock < quantity) {
      return res.status(400).json({ error: 'Not enough stock' });
    }

    const result = db.prepare(`
      INSERT INTO cart_items (user_id, product_id, quantity)
      VALUES (?, ?, ?)
      ON CONFLICT(user_id, product_id) DO UPDATE SET quantity = ?
    `).run(req.userId, productId, quantity, quantity);

    const item = db.prepare(`
      SELECT
        cart_items.id,
        cart_items.quantity,
        cart_items.product_id,
        products.name AS name,
        products.price AS price,
        products.image AS image,
        products.stock AS stock
      FROM cart_items
      JOIN products ON cart_items.product_id = products.id
      WHERE cart_items.user_id = ? AND cart_items.product_id = ?
    `).get(req.userId, productId);

    res.status(201).json({ item });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', (req, res) => {
  try {
    const { quantity } = req.body;
    const cartItem = db.prepare('SELECT * FROM cart_items WHERE id = ? AND user_id = ?').get(req.params.id, req.userId);

    if (!cartItem) {
      return res.status(404).json({ error: 'Cart item not found' });
    }

    if (quantity <= 0) {
      db.prepare('DELETE FROM cart_items WHERE id = ? AND user_id = ?').run(req.params.id, req.userId);
      return res.json({ message: 'Item removed from cart' });
    }

    db.prepare('UPDATE cart_items SET quantity = ? WHERE id = ? AND user_id = ?').run(quantity, req.params.id, req.userId);

    const item = db.prepare(`
      SELECT
        cart_items.id,
        cart_items.quantity,
        cart_items.product_id,
        products.name AS name,
        products.price AS price,
        products.image AS image,
        products.stock AS stock
      FROM cart_items
      JOIN products ON cart_items.product_id = products.id
      WHERE cart_items.id = ?
    `).get(req.params.id);

    res.json({ item });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', (req, res) => {
  try {
    const cartItem = db.prepare('SELECT * FROM cart_items WHERE id = ? AND user_id = ?').get(req.params.id, req.userId);

    if (!cartItem) {
      return res.status(404).json({ error: 'Cart item not found' });
    }

    db.prepare('DELETE FROM cart_items WHERE id = ? AND user_id = ?').run(req.params.id, req.userId);
    res.json({ message: 'Removed' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
