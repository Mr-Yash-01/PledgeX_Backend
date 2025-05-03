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
      // ✅ Ensure amount has at most 18 decimals
      const fixedAmount = Number(amount).toFixed(18); // Limits to 18 decimals
      const amountInWei = ethers.parseEther(fixedAmount);

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
      res.status(500).json({ success: false, error: error });
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


      //  Firestore: Store project data with custom projectId
      const projectRef = admin
        .firestore()
        .collection("Projects")
        .doc(projectId);
      await projectRef.set(projectData);


      //  Firestore: Link project to Client
      const clientRef = admin.firestore().collection("Clients").doc(clientUId);
      await clientRef.update({
        projects: admin.firestore.FieldValue.arrayUnion(projectId),
      });

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
    const { freelancerPublicAddress, totalAmount, projectId, index, milestoneAmount } = req.body;

    
    const formattedFreelancerPUblicAddress = ethers.getAddress(
      freelancerPublicAddress
    );

    if (!projectId) {
      res.status(400).json({ message: "Invalid projectId" });
      return;
    }

    if (!totalAmount || isNaN(totalAmount)) {
      res.status(400).json({ message: "Invalid totalAmount" });
      return;
    }

    console.log(1);
    
    const balance = await escrowContract.getBalance(projectId);


    if (balance < milestoneAmount) {
      res.status(400).json({ message: "Insufficient balance" });
      return;
    }

    const formattedAmount = ethers.parseUnits(milestoneAmount.toFixed(18), "ether");
    
    const tx = await escrowContract.releaseFunds(
      projectId,
      formattedFreelancerPUblicAddress,
      formattedAmount
    );

    const txResult = await tx.wait();

    if (txResult.status === 1) {
      const projectDocRef = admin
        .firestore()
        .collection("Projects")
        .doc(projectId);
      const projectData = (await projectDocRef.get()).data();

      if (
        projectData &&
        projectData.milestones &&
        projectData.milestones[index]
      ) {
        projectData.milestones[index].status = "approved";
        projectData.statistics.milestonesCompleted += 1;
        projectData.statistics.paymentDone += milestoneAmount;
        await projectDocRef.update({ milestones: projectData.milestones, statistics: projectData.statistics });
      } else {
        res
          .status(400)
          .json({ message: "Invalid project ID or milestone index" });
        return;
      }
      
      res
        .status(200)
        .json({ message: "Milestone status updated successfully" });
    } else {
      res.status(400).json({ message: "Error while releasing funds" });
    }
  } catch (error: any) {
    console.error("Error updating milestone status:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
});

export default clientRouter;
