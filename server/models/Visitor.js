import mongoose from "mongoose";

const visitorSchema = new mongoose.Schema(
  {
    // Visitor information
    fullName: {
      type: String,
      required: true,
      trim: true,
    },

    visitorSignature: {
      type: String,
      required: true,
      trim: true,
    },

    company: {
      type: String,
      trim: true,
      default: "",
    },
    identificationTypes: {
      type: [String],
      enum: ["CDL", "DL", "OTH"],
      default: [],
    },
    personToVisit: {
      type: String,
      required: true,
      trim: true,
    },

    department: {
      type: String,
      required: true,
      trim: true,
    },

    purposeOfVisit: {
      type: String,
      required: true,
      trim: true,
    },

    // Digital acknowledgment
    confidentialityAccepted: {
      type: Boolean,
      required: true,
      default: false,
    },

    escortPolicyAccepted: {
      type: Boolean,
      required: true,
      default: false,
    },

    // Visit tracking
    badgeNumber: {
      type: String,
      default: "",
    },

    timeIn: {
      type: Date,
      default: Date.now,
    },

    timeOut: {
      type: Date,
      default: null,
    },

    status: {
      type: String,
      enum: [
        "Registered",
        "Waiting for Department",
        "Escort Requested",
        "Escort Accepted",
        "Escort in Progress",
        "Checked Out",
        "Cancelled",
      ],
      default: "Registered",
    },

    // Assigned escort
    escortName: {
      type: String,
      default: "",
    },
    // Dashboard visibility
    hiddenFromDashboard: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

const Visitor = mongoose.model("Visitor", visitorSchema);

export default Visitor;
