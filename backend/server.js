const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const db = require("./config/db");

dotenv.config();

const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const orderRoutes = require("./routes/orderRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: true,
  credentials: true
}));

app.use(express.json());

app.get("/api", (req, res) => {
  res.json({
    message: "ShopEase API is running",
    endpoints: {
      auth: "/api/auth",
      products: "/api/products",
      orders: "/api/orders"
    }
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);

app.use((req, res) => {
  res.status(404).json({
    message: `Route not found: ${req.method} ${req.originalUrl}`
  });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({
    message: "Internal server error."
  });
});

async function startServer() {
  try {
    const connection = await db.getConnection();
    console.log("MySQL connected successfully.");
    connection.release();

    app.listen(PORT, () => {
      console.log(`ShopEase API running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Could not connect to MySQL.");
    console.error(error.message);
    process.exit(1);
  }
}

startServer();
