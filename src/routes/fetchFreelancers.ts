import { Router } from "express";
import { firestore } from "firebase-admin";

const fetchFreelancersRoute = Router();

fetchFreelancersRoute.get("/", async (req, res) => {
    try {
        const snapshot = await firestore().collection("Freelancers").get();
        const freelancers = snapshot.docs.map(doc => doc.data());
        res.status(200).json({ freelancers });
        
    } catch (error) {
        console.log("Error fetching freelancers:", error);
        
    }
});

export default fetchFreelancersRoute;