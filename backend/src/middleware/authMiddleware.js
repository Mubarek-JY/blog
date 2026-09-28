import jwt from "jsonwebtoken";

const authMiddleware = (req, res, next) => {
  const token = req.headers["authorization"];

  if (!token) {
    return res.json({ message: "No token provided" });
  }
  jwt.verify(token, process.env.JWT_SECRET, (error, decoded) => {
    if (error) {
      return res.json({ message: "Invalid or expired token" });
    }
    req.id = decoded.id;
    next();
  });
};

export default authMiddleware;
