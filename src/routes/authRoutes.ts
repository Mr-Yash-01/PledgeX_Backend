import express, { Request, Response } from "express";
import signinRouter from "./signinRoutes";
import dotenv from 'dotenv';
import signupRouter from "./signupRoutes";

dotenv.config();

const authRouter = express.Router();

// routes
authRouter.use('/signin', signinRouter);
authRouter.use('/signup', signupRouter);

export default authRouter;
