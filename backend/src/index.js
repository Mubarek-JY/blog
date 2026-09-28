import express from "express";
import authRoutes from "./routes/authRoutes.js";
import postRoutes from "./routes/postRoutes.js";
import authMiddleware from "./middleware/authMiddleware.js";
import cors from "cors";

const app = express();
const PORT = process.env.PORT;

app.use(express.json());
app.use(cors({ origin: "http://localhost:5173" }));

app.use("/auth", authRoutes);
app.use("/post", authMiddleware, postRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
