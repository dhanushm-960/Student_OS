import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "StudentProfile",
      required: true,
    },
    driveId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RecruitmentDrive",
      required: true,
    },
    status: {
      type: String,
      enum: ["applied", "in_process", "accepted", "rejected"],
      default: "applied",
    },
    proofs: [
      {
        stage: {
          type: String,
          enum: ["applied", "interview", "offer_letter"],
          required: true,
        },
        fileUrl: {
          type: String,
          required: true,
        },
        uploadedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Prevent multiple applications to the same drive by the same student
applicationSchema.index({ studentId: 1, driveId: 1 }, { unique: true });

const Application = mongoose.model("Application", applicationSchema);
export default Application;
