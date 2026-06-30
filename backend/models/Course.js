import mongoose from "mongoose";

const courseSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    code: {
      type: String,
      default: "",
    },
    instructor: {
      type: String,
      default: "",
    },
    progress: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    grade: {
      type: String,
      default: "",
    },
    semester: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

const Course = mongoose.model("Course", courseSchema);
export default Course;
