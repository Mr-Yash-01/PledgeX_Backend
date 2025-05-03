import express, { Request, Response } from 'express';
import admin from '../utils/firebase'; // Assuming this imports the initialized Firebase Admin SDK
import jwt from 'jsonwebtoken';

const signinRouter = express.Router();

// POST endpoint for verifying Firebase ID token sent from the client
signinRouter.post('/ep', async (req: Request, res: Response) => {
    try {
        const { email } = req.body;
        
        // Use Firebase Admin SDK to get user by email
        const userRecord = await admin.auth().getUserByEmail(email);

        // Fetch user document from Firestore
        // Fetch user document from the first collection
        let userDoc = await admin.firestore().collection('Clients').doc(userRecord.uid).get();
        if (!userDoc.exists) {
            // If not found, fetch user document from the second collection
            userDoc = await admin.firestore().collection('Freelancers').doc(userRecord.uid).get();
            if (!userDoc.exists) {
            res.status(404).json({ error: 'User document does not exist in both collections' });
            return;
            }
        }

        const user = userDoc.data();

        const jwtToken = generateJwtToken(user?.uid, user?.email, user?.role);
        res.cookie('token', jwtToken, {
            httpOnly: true,
            maxAge: 7 * 24 * 60 * 60 * 1000,
            sameSite: 'lax',
        });

        // If successful, return the user record and Firestore document
        res.status(200).json({ user });

    } catch (error: any) {
        if (error.code === 'auth/user-not-found') {
            // Handle the case when the user does not exist
            res.status(404).json({ error: 'User does not exist' });
        } else {
            // Handle other errors
            console.error('Error fetching user:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
});


// Example for Google sign-in endpoint (might require specific integration logic)
signinRouter.post('/gg', async (req: Request, res: Response) => {
    try {
        const { token } = req.body;
        const decodedToken = await admin.auth().verifyIdToken(token);
        const { uid, email, name, picture } = decodedToken;

        // Fetch user document from Firestore
        let userDoc = await admin.firestore().collection('Clients').doc(uid).get();
        if (!userDoc.exists) {
            // If not found, fetch user document from the second collection
            userDoc = await admin.firestore().collection('Freelancers').doc(uid).get();
            if (!userDoc.exists) {
                res.json({path : 'signup' });
                return;
            }
        }

        const user = userDoc.data();

        const jwtToken = generateJwtToken(uid, email as string, user?.role);
        res.cookie('token', jwtToken, {
            httpOnly: true,
            maxAge: 7 * 24 * 60 * 60 * 1000,
            sameSite: 'lax',
        });

        res.status(200).json({ user: { uid, email, name, picture, ...user } });
    } catch (error: any) {
        if (error.code === 'auth/user-not-found') {
            res.json({ path : 'signup' });
        } else {
            console.error('Error fetching user:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
});

// Example for handling other post request
signinRouter.post('/gh', async (req: Request, res: Response) => {
    try {
        const { token } = req.body;
        const decodedToken = await admin.auth().verifyIdToken(token);
        const { uid, email, name, picture } = decodedToken;

        // Fetch user document from Firestore
        let userDoc = await admin.firestore().collection('Clients').doc(uid).get();
        if (!userDoc.exists) {
            // If not found, fetch user document from the second collection
            userDoc = await admin.firestore().collection('Freelancers').doc(uid).get();
            if (!userDoc.exists) {
                res.json({path : 'signup' });
                return;
            }
        }

        const user = userDoc.data();

        const jwtToken = generateJwtToken(uid, email as string, user?.role);
        res.cookie('token', jwtToken, {
            httpOnly: true,
            maxAge: 7 * 24 * 60 * 60 * 1000,
            sameSite: 'lax',
        });

        res.status(200).json({ user: { uid, email, name, picture, ...user } });
    } catch (error: any) {
        if (error.code === 'auth/user-not-found') {
            res.json({path : 'signup' });
        } else {
            console.error('Error fetching user:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
});

// Default 404 for invalid routes
signinRouter.post('/', (req: Request, res: Response) => {
    res.status(404).send('Not Found after signin');
});


function generateJwtToken(uid: string, email: string, role?:string): string {
    const payload = { uid, email, role };
    const token = jwt.sign(payload, process.env.JWT_SECRET as string, { expiresIn: '7d' });
    return token;
}

export default signinRouter;

