import express from "express";
import mongoose from "mongoose";
import Visitor from "../models/Visitor.js";

const router = express.Router();

// ==========================================
// POST: Register a new visitor
// ==========================================
router.post("/", async (req, res) => {
  try {
    const {
      fullName,
      visitorSignature,
      company,
      personToVisit,
      department,
      purposeOfVisit,
      confidentialityAccepted,
      escortPolicyAccepted,
    } = req.body;

    if (
      !fullName?.trim() ||
      !visitorSignature?.trim() ||
      !personToVisit?.trim() ||
      !department?.trim() ||
      !purposeOfVisit?.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Please complete all required fields.",
      });
    }

    if (confidentialityAccepted !== true || escortPolicyAccepted !== true) {
      return res.status(400).json({
        success: false,
        message: "Both policy acknowledgments are required.",
      });
    }

    const visitor = await Visitor.create({
      fullName,
      visitorSignature,
      company,
      personToVisit,
      department,
      purposeOfVisit,
      confidentialityAccepted,
      escortPolicyAccepted,
      status: "Registered",
    });

    return res.status(201).json({
      success: true,
      message: "Visitor registered successfully!",
      visitor,
    });
  } catch (error) {
    console.error("Visitor registration error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to register visitor.",
    });
  }
});

// ==========================================
// GET: Retrieve all visitors
// ==========================================
router.get("/", async (req, res) => {
  try {
    const visitors = await Visitor.find().sort({
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      count: visitors.length,
      visitors,
    });
  } catch (error) {
    console.error("Retrieve visitors error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to retrieve visitors.",
    });
  }
});

// ==========================================
// GET: Retrieve one visitor by ID
// ==========================================
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid visitor ID.",
      });
    }

    const visitor = await Visitor.findById(id);

    if (!visitor) {
      return res.status(404).json({
        success: false,
        message: "Visitor not found.",
      });
    }

    return res.status(200).json({
      success: true,
      visitor,
    });
  } catch (error) {
    console.error("Retrieve visitor error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to retrieve visitor.",
    });
  }
});

// ==========================================
// PATCH: Update visitor status
// ==========================================
router.patch("/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowedStatuses = [
      "Registered",
      "Waiting for Department",
      "Escort Requested",
      "Escort Accepted",
      "Escort in Progress",
      "Checked Out",
      "Cancelled",
    ];

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid visitor ID.",
      });
    }

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid visitor status.",
      });
    }

    const visitor = await Visitor.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true },
    );

    if (!visitor) {
      return res.status(404).json({
        success: false,
        message: "Visitor not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Visitor status updated successfully.",
      visitor,
    });
  } catch (error) {
    console.error("Update visitor status error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to update visitor status.",
    });
  }
});

// ==========================================
// PATCH: Check out a visitor
// ==========================================
router.patch("/:id/checkout", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid visitor ID.",
      });
    }

    const visitor = await Visitor.findById(id);

    if (!visitor) {
      return res.status(404).json({
        success: false,
        message: "Visitor not found.",
      });
    }

    if (visitor.status === "Checked Out") {
      return res.status(400).json({
        success: false,
        message: "Visitor has already checked out.",
      });
    }

    const updatedVisitor = await Visitor.findByIdAndUpdate(
      id,
      {
        $set: {
          timeOut: new Date(),
          status: "Checked Out",
        },
      },
      {
        new: true,
        runValidators: false,
      },
    );

    return res.status(200).json({
      success: true,
      message: "Visitor checked out successfully.",
      visitor: updatedVisitor,
    });
  } catch (error) {
    console.error("Visitor checkout error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to check out visitor.",
    });
  }
});

// ==========================================
// PATCH: Request an escort
// ==========================================
router.patch("/:id/escort-request", async (req, res) => {
  try {
    const visitor = await Visitor.findByIdAndUpdate(
      req.params.id,
      { status: "Escort Requested" },
      { new: true, runValidators: true },
    );

    if (!visitor) {
      return res.status(404).json({
        success: false,
        message: "Visitor not found.",
      });
    }

    return res.json({
      success: true,
      message: "Escort requested successfully.",
      visitor,
    });
  } catch (error) {
    console.error("Escort request error:", error);
    return res.status(500).json({
      success: false,
      message: "Could not request escort.",
    });
  }
});

// ==========================================
// PATCH: Assign an escort
// ==========================================
router.patch("/:id/escort", async (req, res) => {
  try {
    const { escortName } = req.body;

    if (!escortName || !escortName.trim()) {
      return res.status(400).json({
        success: false,
        message: "Escort employee name is required.",
      });
    }

    const visitor = await Visitor.findByIdAndUpdate(
      req.params.id,
      {
        escortName: escortName.trim(),
        status: "Escort Accepted",
      },
      { new: true, runValidators: true },
    );

    if (!visitor) {
      return res.status(404).json({
        success: false,
        message: "Visitor not found.",
      });
    }

    return res.json({
      success: true,
      message: "Escort assigned successfully.",
      visitor,
    });
  } catch (error) {
    console.error("Assign escort error:", error);
    return res.status(500).json({
      success: false,
      message: "Could not assign escort.",
    });
  }
});

export default router;
