import express, { Application, Request, Response } from "express";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import authRouter from "./routes/authRoutes";

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(
    cors({
        origin: 'http://localhost:3000', // Your frontend URL
        credentials: true, // Allow cookies to be sent and received
    })
);

app.use(bodyParser.json());

// Routes
// app.use("/api/auth", authRoutes);
app.use('/auth', authRouter);

// Default Route
app.get("/", (req: Request, res: Response) => {
  res.send("Backend is running!");
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
