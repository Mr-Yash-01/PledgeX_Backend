import { Router } from "express";
import admin from "../utils/firebase";
import checkSPEmail from "../middlewares/checkSPEmail";
import checkSPClientEmail from "../middlewares/checkSPClientEmail";

const freelancerRouter = Router();

freelancerRouter.post('/sp',checkSPEmail,checkSPClientEmail, async (req, res, next) => {
    try {
        
        const projectData = req.body.projectData;
        const projectRef = admin.firestore().collection('Projects');
        const response = await projectRef.add(projectData);
        const projectId = response.id;

        
        
        const freelanceruid = req.body.freelanceruid;
        const clientuid = req.body.clientId;
        
        const freelancerRef = admin.firestore().collection('Freelancers').doc(freelanceruid);
        await freelancerRef.update({
            projects: admin.firestore.FieldValue.arrayUnion(projectId)
        });
        
        const clientRef = admin.firestore().collection('Clients').doc(clientuid);
        await clientRef.update({
            projects: admin.firestore.FieldValue.arrayUnion(projectId)
        });

        res.status(201).json({ message: 'Project created successfully' });

    } catch (error: any) {
        console.error('Error uploading doc:', error);
        next(error);
        
    }
});

export default freelancerRouter;
