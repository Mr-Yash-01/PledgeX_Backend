import { Router } from "express";
import { ethers } from "ethers"; // ✅ Import ethers
import { escrowContract } from "../utils/contract";
import checkSPEmails from "../middlewares/checkSPEmail";
import checkSPClientEmail from "../middlewares/checkSPClientEmail";
import admin from "../utils/firebase";

const clientRouter = Router();

clientRouter.post(
  "/gt",
  checkSPEmails,
  checkSPClientEmail,
  async (req, res) => {
    const { projectId, amount } = req.body;

    try {
      const amountInWei = ethers.parseEther(amount.toString());

      // Create a transaction object (unsigned)
      const txData = {
        to: process.env.ESCROW_ADDRESS,
        value: amountInWei,
        data: escrowContract.interface.encodeFunctionData("depositFunds", [
          projectId,
        ]),
      };

      res.json({
        success: true,
        txData: {
          ...txData,
          value: amountInWei.toString(), // ✅ Convert BigInt to string
        },
      });
    } catch (error) {
      console.error("Error creating transaction:", error);
      res.status(500).json({ success: false, error: error || error });
    }
  }
);

clientRouter.post(
  "/sp",
  checkSPEmails,
  checkSPClientEmail,
  async (req, res) => {
    try {
      const { clientUId, freelancerUId, projectData } = req.body;

      //  Add projectId to projectData
      const projectId = projectData.projectId;

      console.log(1);

      console.log(projectId);
      console.log(projectData);

      console.log(projectData.projectId);

      //  Firestore: Store project data with custom projectId
      const projectRef = admin
        .firestore()
        .collection("Projects")
        .doc(projectId);
      await projectRef.set(projectData);

      console.log(2);

      //  Firestore: Link project to Client
      const clientRef = admin.firestore().collection("Clients").doc(clientUId);
      await clientRef.update({
        projects: admin.firestore.FieldValue.arrayUnion(projectId),
      });
      console.log(3);

      //  Firestore: Link project to Freelancer
      const freelancerRef = admin
        .firestore()
        .collection("Freelancers")
        .doc(freelancerUId);
      await freelancerRef.update({
        projects: admin.firestore.FieldValue.arrayUnion(projectId),
      });

      //  Send response with projectId for escrow deposit
      res.status(201).json({
        message: "Project created successfully",
        projectId,
      });
    } catch (error) {
      console.error("Error creating project:", error);
    }
  }
);

clientRouter.put("/sm", async (req, res) => {
  try {
    const { freelancerPublicAddress, totalAmount, projectId, index } = req.body;

    const tx = await escrowContract.releaseFunds(
      projectId,
      freelancerPublicAddress,
      totalAmount
    );
    const txResult = await tx.wait();

    if (txResult.status === 1) {
      const milestoneDocRef = admin
        .firestore()
        .collection("Projects")
        .doc(projectId);

      const milestoneData = (await milestoneDocRef.get()).data();

      if (
        milestoneData &&
        milestoneData.milestones &&
        milestoneData.milestones[index]
      ) {
        milestoneData.milestones[index].status = "sent";
        await milestoneDocRef.update({ milestones: milestoneData.milestones });
      } else {
        res
          .status(400)
          .json({ message: "Invalid project ID or milestone index" });
        return;
      }
      res.status(200).json({ message: "Milestone status updated successfully" });
    } else {
      res.status(400).json({ message: "Error while releasing funds" });
    }
  } catch (error: any) {
    console.error("Error updating milestone status:", error);
  }
});

export default clientRouter;
