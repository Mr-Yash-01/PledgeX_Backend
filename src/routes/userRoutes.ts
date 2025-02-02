import { Router } from 'express';
import { getUsers } from '../controllers/userController';
import freelancerRouter from './freelancerRoutes';
import clientRouter from './clientRoutes';

const userRouter = Router();

userRouter.use('/f', freelancerRouter);
userRouter.use('/c', clientRouter);


userRouter.get('/', getUsers);

export default userRouter;
