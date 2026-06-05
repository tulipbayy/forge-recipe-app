import express from "express";
import cors from "cors";
import "dotenv/config";
import recipeRoutes from "./routes/recipes.js";
import commentsRouter from "./routes/comments.js";
import chatRouter from './routes/chatbot.js';
import adminRoutes from './routes/admin.js';
import savedRecipeRoutes from './routes/savedRecipes.js';
import usersRouter from "./routes/users.js";

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/admin', adminRoutes);

app.use("/api/recipes", recipeRoutes);

const PORT = process.env.PORT || 5001;

app.get("/", (req, res) => {
  res.json({ message: "Forge Recipe App backend is running. Use /api/recipes or /api/comments." });
});

// just to test if connection works
app.get("/api/ping", (req, res) => {
  res.json({ message: "Express server is running!" });
});

app.use("/api", commentsRouter);
app.use('/api/chat', chatRouter);
app.use('/api/savedRecipes', savedRecipeRoutes);
app.use("/api/users", usersRouter);

const server = app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

server.on("error", (error) => {
  console.error("Failed to start server:", error);
});

export default server;
