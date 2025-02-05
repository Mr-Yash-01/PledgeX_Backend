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


freelancerRouter.put('/sm', async (req, res, next) => {
    try {
        const { projectId, index } = req.body;
        
        const milestoneDocRef = admin.firestore().collection('Projects').doc(projectId);
        
        const milestoneData = (await milestoneDocRef.get()).data();

        if (milestoneData && milestoneData.milestones && milestoneData.milestones[index]) {
            milestoneData.milestones[index].status = 'sent';
            await milestoneDocRef.update({ milestones: milestoneData.milestones });
        } else {
            res.status(400).json({ message: 'Invalid project ID or milestone index' });
            return;
        }

        res.status(200).json({ message: 'Milestone status updated successfully' });

    } catch (error: any) {
        console.error('Error updating milestone status:', error);
        next(error);
    }
});

export default freelancerRouter;
