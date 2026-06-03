import express from "express";
import cors from "cors";
import "dotenv/config";
import recipeRoutes from "./routes/recipes.js";
import commentsRouter from "./routes/comments.js";
const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/recipes", recipeRoutes);

const PORT = process.env.PORT || 5001;

// just to test if connection works
app.get("/api/ping", (req, res) => {
  res.json({ message: "Express server is running!" });
});

app.use("/api", commentsRouter);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
