import express, { Request, Response } from "express";
import signinRouter from "./signinRoutes";
import admin from 'firebase-admin';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const authRouter = express.Router();

// routes
authRouter.use('/signin', signinRouter);

// Sign In
authRouter.post("/signup", async (req: Request, res: Response) => {

    const { uid, email, password, role, picture, name } = req.body;


    if (!req.body.uid) {
        try {

            // Create user in Firebase Authentication
            const userRecord = await admin.auth().createUser({
                email,
                password,
            });


            // Create user document in Firestore
            await admin.firestore().collection(role).doc(userRecord.uid).set({
                uid: userRecord.uid,
                email,
                picture,
                name,
                role,
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                projects: []
            });

            res.status(201).send({ message: 'User created successfully', userRecord });
        } catch (error) {
            console.error('Error creating user:', error);
            res.status(500).send({ message: 'Error creating user', error });
        }

    } else {
        try {

            // Create user document in Firestore
            await admin.firestore().collection(role).doc(uid).set({
                uid,
                email,
                picture,
                name,
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
            });

            res.status(201).send({ message: 'User data inserted successfully' });
        } catch (error) {
            console.error('Error inserting user data:', error);
            res.status(500).send({ message: 'Error inserting user data', error });
        }
    }

});

authRouter.get('/', async (req: Request, res: Response) => {

    const token = req.headers.authorization?.split(' ')[1];

    if (token) {

        try {
            const decoded = jwt.verify(token as string, process.env.JWT_SECRET as string);
            console.log(decoded);

            const { uid, email, role } = decoded as { uid: string, email: string, role: string };

            // Verify user in Firebase Authentication
            try {
                const userRecord = await admin.auth().getUser(uid);
                if (userRecord.email !== email) {
                    res.status(401);
                } else {
                    const userDoc = await admin.firestore().collection(role).doc(uid).get();
                    if (!userDoc.exists) {
                        res.status(404).send({ message: 'User document not found' });
                        return;
                    }
                    const userData = userDoc.data();
                    console.log(userData);
                    
                    res.status(200).send({ userData });
                    
                }
            } catch (error) {
                console.error('Error verifying user in Firebase Authentication:', error);
                res.status(401).send({ message: 'User verification failed', error });
                return;
            }

        } catch (error) {
            console.error('Error decoding token:', error);
            res.status(401).send({ message: 'Invalid token', error });
        }
    }
});

export default authRouter;
