import express, { Request, Response } from "express";
import signinRouter from "./signinRoutes";
import dotenv from "dotenv";
import signupRouter from "./signupRoutes";
import jwt from "jsonwebtoken";
import admin from "../utils/firebase";
import { json } from "body-parser";

dotenv.config();

const authRouter = express.Router();

// routes
authRouter.use("/signin", signinRouter);
authRouter.use("/signup", signupRouter);

authRouter.post("/signout", (req: Request, res: Response) => {
  res.clearCookie("token");
  res.status(200).send("Signed out successfully");
});

authRouter.post("/verify", async (req: Request, res: Response) => {
    const token = req.body.token;

    if (!token) {
        res.status(401).json({ error: "Access denied. No token provided." });
    }

    try {
        // Decode JWT token
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { email: string, role: string };

        if (!decoded.email) {
            res.status(400).json({ error: "Invalid token: No email found" });
        }

        // 🔹 Fix: Pass only the email string, not the whole object
        const userRecord = await admin.auth().getUserByEmail(decoded.email);

        if (!userRecord) {
            res.status(404).json({ error: "User not found" });
        } else {
            res.status(200).json({ email: userRecord.email, role: decoded.role });
            
        }


    

    } catch (err) {
        console.error("Error verifying token:", err);
        res.status(400).json({ error: "Invalid token" });
    }
});

export default authRouter;
