import express, { Request, Response } from "express";
import signinRouter from "./signinRoutes";
import dotenv from 'dotenv';
import signupRouter from "./signupRoutes";

dotenv.config();

const authRouter = express.Router();

// routes
authRouter.use('/signin', signinRouter);
authRouter.use('/signup', signupRouter);

authRouter.post('/signout', (req: Request, res: Response) => {
    res.clearCookie('token');
    res.status(200).send('Signed out successfully');
    });

export default authRouter;
