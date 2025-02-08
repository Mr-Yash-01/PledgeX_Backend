import { Router } from "express";
import admin from "../utils/firebase";

const signupRouter = Router();

// routes
signupRouter.post("/", async (req, res) => {
    const { uid, email, password, role, picture, name, about, publicAddress } = req.body;

    console.log(uid, email, password, role, picture, name, about, publicAddress);
    

    if (!uid) {
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
                projects: [],
                about,
                publicAddress
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
                role,
                projects: [],
                about,
                publicAddress
            });

            res.status(201).send({ message: 'User data inserted successfully' });
        } catch (error) {
            console.error('Error inserting user data:', error);
            res.status(500).send({ message: 'Error inserting user data', error });
        }
    }
});

signupRouter.post("/gggh", async (req, res) => {
    try {
        const { token } = req.body;
        const decodedToken = await admin.auth().verifyIdToken(token);
        const { uid, email, name, picture } = decodedToken;

        res.status(200).json({ user: { uid, email, name, picture } });


    } catch (error) {
        console.error('Error creating user:', error);
        
    }
});

export default signupRouter;
