import { Router } from 'express';
import freelancerRouter from './freelancerRoutes';
import clientRouter from './clientRoutes';

const userRouter = Router();

userRouter.use('/f', freelancerRouter);
userRouter.use('/c', clientRouter);


export default userRouter;
