const express = require("express");
const db = require("../config/db");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", authMiddleware, async (req, res) => {
  const connection = await db.getConnection();

  try {
    const {
      items,
      shipping_name,
      shipping_email,
      shipping_address,
      shipping_city,
      shipping_state,
      shipping_postal_code
    } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        message: "Your cart is empty."
      });
    }

    const requiredShipping = [
      shipping_name,
      shipping_email,
      shipping_address,
      shipping_city,
      shipping_state,
      shipping_postal_code
    ];

    if (requiredShipping.some((value) => !value)) {
      return res.status(400).json({
        message: "All shipping fields are required."
      });
    }

    await connection.beginTransaction();

    let totalAmount = 0;
    const checkedItems = [];

    for (const item of items) {
      const quantity = Number(item.quantity);

      if (!Number.isInteger(quantity) || quantity < 1) {
        throw new Error("Invalid product quantity.");
      }

      const [products] = await connection.execute(
        `SELECT id, name, price, stock
         FROM products
         WHERE id = ?
         FOR UPDATE`,
        [item.product_id]
      );

      if (products.length === 0) {
        throw new Error(`Product ${item.product_id} was not found.`);
      }

      const product = products[0];

      if (product.stock < quantity) {
        throw new Error(
          `${product.name} has only ${product.stock} item(s) in stock.`
        );
      }

      const lineTotal = Number(product.price) * quantity;

      totalAmount += lineTotal;

      checkedItems.push({
        productId: product.id,
        quantity,
        price: Number(product.price)
      });
    }

    const shippingCharge = totalAmount > 999 ? 0 : 80;
    totalAmount += shippingCharge;

    const [orderResult] = await connection.execute(
      `INSERT INTO orders
        (user_id, total_amount, status,
         shipping_name, shipping_email, shipping_address,
         shipping_city, shipping_state, shipping_postal_code)
       VALUES (?, ?, 'processing', ?, ?, ?, ?, ?, ?)`,
      [
        req.user.id,
        totalAmount,
        String(shipping_name).trim(),
        String(shipping_email).trim().toLowerCase(),
        String(shipping_address).trim(),
        String(shipping_city).trim(),
        String(shipping_state).trim(),
        String(shipping_postal_code).trim()
      ]
    );

    const orderId = orderResult.insertId;

    for (const item of checkedItems) {
      await connection.execute(
        `INSERT INTO order_items
          (order_id, product_id, quantity, price)
         VALUES (?, ?, ?, ?)`,
        [
          orderId,
          item.productId,
          item.quantity,
          item.price
        ]
      );

      await connection.execute(
        `UPDATE products
         SET stock = stock - ?
         WHERE id = ?`,
        [item.quantity, item.productId]
      );
    }

    await connection.commit();

    res.status(201).json({
      message: "Order placed successfully.",
      order: {
        id: orderId,
        total_amount: totalAmount,
        status: "processing"
      }
    });
  } catch (error) {
    await connection.rollback();
    console.error("CREATE ORDER ERROR:", error);

    res.status(400).json({
      message: error.message || "Unable to place order."
    });
  } finally {
    connection.release();
  }
});

router.get("/my-orders", authMiddleware, async (req, res) => {
  try {
    const [orders] = await db.execute(
      `SELECT id, total_amount, status, shipping_name,
              shipping_email, shipping_address, shipping_city,
              shipping_state, shipping_postal_code, created_at
       FROM orders
       WHERE user_id = ?
       ORDER BY created_at DESC`,
      [req.user.id]
    );

    for (const order of orders) {
      const [items] = await db.execute(
        `SELECT oi.product_id, oi.quantity, oi.price, p.name
         FROM order_items oi
         JOIN products p ON p.id = oi.product_id
         WHERE oi.order_id = ?`,
        [order.id]
      );

      order.items = items;
    }

    res.json({
      orders
    });
  } catch (error) {
    console.error("GET ORDERS ERROR:", error);
    res.status(500).json({
      message: "Unable to load orders."
    });
  }
});

module.exports = router;
