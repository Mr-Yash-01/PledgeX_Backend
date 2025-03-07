import { Request, Response, NextFunction } from 'express';
import admin from '../utils/firebase';

const checkSPClientEmail = async (req: Request, res: Response, next: NextFunction) => {
    const { freelancerEmail } = req.body;  

    console.log('Freelancer Email:', freelancerEmail);
    
    
    if (!freelancerEmail) {
        res.status(400).json({ message: 'Email is required' });
    } else{
        try {
            const userRecord = await admin.auth().getUserByEmail(freelancerEmail);
            if (userRecord) {
                req.body.freelancerUId = userRecord.uid;
                next();
            }

        } catch (error: unknown) {
            // Assert error as FirebaseAuthError
            if ((error as any).code === 'auth/user-not-found') {
                res.status(404).json({msg:"notExist", message: 'Freelancer does not exist.' });
            } else {
                console.log('Error fetching user data:', error);
                res.status(500).json({ message: 'Internal server error' });
            }
        }
    }

    
};

export default checkSPClientEmail;