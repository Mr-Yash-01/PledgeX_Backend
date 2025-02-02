import { Request, Response } from 'express';

export const submitProject = (req: Request, res: Response) => {
  res.status(200).json({ message: 'List of users' });
};
