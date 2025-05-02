import { Router } from "express";
import { firestore } from "firebase-admin";

const fetchProjectsRouter = Router();

fetchProjectsRouter.get("/", async (req, res) => {
  try {
    const role = req.query.role as string;
    const userId = req.query.uid as string;

    if (!role || !userId) {
      res.status(400).json({ error: "Missing role or uid parameters" });
    } else {
      const userDoc = await firestore().collection(role).doc(userId).get();

      if (!userDoc.exists) {
        res.status(404).json({ error: "User not found or has no projects" });
      } else {
        const projectIds: string[] = userDoc.data()?.projects || [];

        if (projectIds.length === 0) {
          res.status(200).json({ message: "No projects found", projects: [] });
        } else {
          const projectDocs = await Promise.all(
            projectIds.map((projectId) =>
              firestore().collection("Projects").doc(projectId).get()
            )
          );

          const projects = projectDocs
            .filter((doc) => doc.exists)
            .map((doc) => ({ id: doc.id, ...doc.data() }));

          res.status(200).json({ projects });
        }
      }
    }
  } catch (error) {
    console.error("Error fetching projects:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});


export default fetchProjectsRouter;
