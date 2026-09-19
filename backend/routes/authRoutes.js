const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../config/db");

const router = express.Router();

function createToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      name: user.name
    },
    process.env.JWT_SECRET || "dev_secret_change_me",
    { expiresIn: "7d" }
  );
}

router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email and password are required."
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters."
      });
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    const [existing] = await db.execute(
      "SELECT id FROM users WHERE email = ? LIMIT 1",
      [normalizedEmail]
    );

    if (existing.length > 0) {
      return res.status(409).json({
        message: "An account with this email already exists."
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await db.execute(
      `INSERT INTO users (name, email, password)
       VALUES (?, ?, ?)`,
      [String(name).trim(), normalizedEmail, hashedPassword]
    );

    const user = {
      id: result.insertId,
      name: String(name).trim(),
      email: normalizedEmail
    };

    const token = createToken(user);

    res.status(201).json({
      message: "Registration successful.",
      token,
      user
    });
  } catch (error) {
    console.error("REGISTER ERROR:", error);
    res.status(500).json({
      message: "Unable to register right now."
    });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required."
      });
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    const [rows] = await db.execute(
      "SELECT id, name, email, password FROM users WHERE email = ? LIMIT 1",
      [normalizedEmail]
    );

    if (rows.length === 0) {
      return res.status(401).json({
        message: "Invalid email or password."
      });
    }

    const userRow = rows[0];

    const passwordMatches = await bcrypt.compare(
      password,
      userRow.password
    );

    if (!passwordMatches) {
      return res.status(401).json({
        message: "Invalid email or password."
      });
    }

    const user = {
      id: userRow.id,
      name: userRow.name,
      email: userRow.email
    };

    const token = createToken(user);

    res.json({
      message: "Login successful.",
      token,
      user
    });
  } catch (error) {
    console.error("LOGIN ERROR:", error);
    res.status(500).json({
      message: "Unable to log in right now."
    });
  }
});

module.exports = router;
