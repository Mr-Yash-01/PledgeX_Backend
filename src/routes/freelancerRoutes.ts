import { Router } from "express";
import admin from "../utils/firebase";
import checkSPEmail from "../middlewares/checkSPEmail";
import checkSPClientEmail from "../middlewares/checkSPClientEmail";

const freelancerRouter = Router();

freelancerRouter.post('/sp',checkSPEmail,checkSPClientEmail, async (req, res, next) => {
    try {
        console.log(req.body);
        
        const projectData = req.body.projectData;
        const projectRef = admin.firestore().collection('Projects');
        await projectRef.add(projectData);
        res.status(201).json({ message: 'Project created successfully' });
        
    } catch (error: any) {
        console.error('Error uploading doc:', error);
        next(error);
        
    }
});

export default freelancerRouter;
