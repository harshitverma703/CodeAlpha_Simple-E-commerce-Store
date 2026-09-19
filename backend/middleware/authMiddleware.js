const jwt = require("jsonwebtoken");

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization || "";

  if (!authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      message: "Authentication required. Please log in."
    });
  }

  const token = authHeader.substring(7);

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "dev_secret_change_me"
    );

    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      message: "Invalid or expired login token."
    });
  }
}

module.exports = authMiddleware;
