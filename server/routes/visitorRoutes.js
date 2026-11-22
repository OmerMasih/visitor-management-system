import express from "express";
import Visitor from "../models/Visitor.js";

const router = express.Router();

// POST: Register a new visitor
router.post("/", async (req, res) => {
  try {
    const {
      fullName,
      company,
      personToVisit,
      department,
      purposeOfVisit,
      confidentialityAccepted,
      escortPolicyAccepted,
    } = req.body;

    // Validate required fields
    if (!fullName || !personToVisit || !department || !purposeOfVisit) {
      return res.status(400).json({
        success: false,
        message: "Please complete all required fields.",
      });
    }

    // Require policy acknowledgments
    if (confidentialityAccepted !== true || escortPolicyAccepted !== true) {
      return res.status(400).json({
        success: false,
        message: "Both policy acknowledgments are required.",
      });
    }

    // Create visitor
    const visitor = await Visitor.create({
      fullName,
      company,
      personToVisit,
      department,
      purposeOfVisit,
      confidentialityAccepted,
      escortPolicyAccepted,
    });

    res.status(201).json({
      success: true,
      message: "Visitor registered successfully!",
      visitor,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to register visitor.",
      error: error.message,
    });
  }
});

// GET: Retrieve all visitors
router.get("/", async (req, res) => {
  try {
    const visitors = await Visitor.find().sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      count: visitors.length,
      visitors,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to retrieve visitors.",
    });
  }
});

export default router;
