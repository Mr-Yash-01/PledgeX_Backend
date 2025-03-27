import { Router } from "express";
import admin from "../utils/firebase";
import checkSPEmail from "../middlewares/checkSPEmail";
import checkSPClientEmail from "../middlewares/checkSPClientEmail";
import { v4 as uuidv4 } from "uuid";

const freelancerRouter = Router();

freelancerRouter.post('/sp', checkSPEmail, checkSPClientEmail, async (req, res, next) => {
    try {
        
        const { clientPublicAddress, freelanceruid, clientId, projectData } = req.body;
        
        
        if (!clientPublicAddress) {
            res.status(400).json({ error: "Client wallet address missing" });
        }

        //  Generate projectId manually before adding to Firestore
        const projectId = uuidv4(); 

        //  Add projectId to projectData
        projectData.projectId = projectId;

        //  Firestore: Store project data with custom projectId
        const projectRef = admin.firestore().collection('Projects').doc(projectId);
        await projectRef.set(projectData);

        //  Firestore: Link project to Freelancer
        const freelancerRef = admin.firestore().collection('Freelancers').doc(freelanceruid);
        await freelancerRef.update({
            projects: admin.firestore.FieldValue.arrayUnion(projectId)
        });

        //  Firestore: Link project to Client
        const clientRef = admin.firestore().collection('Clients').doc(clientId);
        await clientRef.update({
            projects: admin.firestore.FieldValue.arrayUnion(projectId)
        });

        //  Send response with projectId for escrow deposit
        res.status(201).json({ 
            message: 'Project created successfully', 
            projectId,
            clientPublicAddress 
        });

    } catch (error) {
        console.error('Error creating project:', error);
        
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
