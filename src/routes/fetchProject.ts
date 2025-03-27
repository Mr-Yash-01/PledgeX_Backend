import { Router } from "express";
import { firestore } from "firebase-admin";

const fetchProjectRouter = Router();

fetchProjectRouter.get("/", async (req, res) => {
     try {

          const projectId = req.query.projectId as string;

          if (!projectId) {
               res.status(400).json({ error: "Missing projectId parameter" });
          }

          
          const projectDoc = await firestore().collection("Projects").doc(projectId).get();

          if (!projectDoc.exists) {
               res.status(404).json({ error: "Project not found" });
          }

          const projectData = projectDoc.data();

          res.status(200).json({ projectData });
     } catch (error) {
          console.error("Error fetching project:", error);
          res.status(500).json({ error: "Internal server error" });
     }
});

export default fetchProjectRouter;
