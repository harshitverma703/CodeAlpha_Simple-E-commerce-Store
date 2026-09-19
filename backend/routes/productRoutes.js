const express = require("express");
const db = require("../config/db");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const [products] = await db.execute(
      `SELECT id, name, description, price, image, stock, category, created_at
       FROM products
       ORDER BY id DESC`
    );

    res.json(products);
  } catch (error) {
    console.error("GET PRODUCTS ERROR:", error);
    res.status(500).json({
      message: "Unable to load products."
    });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const [products] = await db.execute(
      `SELECT id, name, description, price, image, stock, category, created_at
       FROM products
       WHERE id = ?
       LIMIT 1`,
      [req.params.id]
    );

    if (products.length === 0) {
      return res.status(404).json({
        message: "Product not found."
      });
    }

    res.json({
      product: products[0]
    });
  } catch (error) {
    console.error("GET PRODUCT ERROR:", error);
    res.status(500).json({
      message: "Unable to load product."
    });
  }
});

module.exports = router;
