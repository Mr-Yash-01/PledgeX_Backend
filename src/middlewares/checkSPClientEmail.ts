import { Request, Response, NextFunction } from 'express';
import admin from '../utils/firebase';

const checkSPClientEmail = async (req: Request, res: Response, next: NextFunction) => {
    const { clientEmail } = req.body;
    console.log(clientEmail);
    console.log(req.headers.token);
    
    
    if (!clientEmail) {
        res.status(400).json({ message: 'Email is required' });
    } else{
        try {
            const userRecord = await admin.auth().getUserByEmail(clientEmail);
            console.log(userRecord);
            if (userRecord) {
                next();
            }

        } catch (error: unknown) {
            // Assert error as FirebaseAuthError
            if ((error as any).code === 'auth/user-not-found') {
                res.status(404).json({msg:"notExist", message: 'Client does not exist.' });
            } else {
                console.log('Error fetching user data:', error);
                res.status(500).json({ message: 'Internal server error' });
            }
        }
    }

    
};

export default checkSPClientEmail;