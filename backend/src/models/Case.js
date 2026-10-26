
import mongoose from "mongoose";

const caseSchema = new mongoose.Schema(
  {
    caseNumber: {
      type: String,
      required: true,
      unique: true,
    },
    title: {
      type: String,
      required: true,
    },
    policeStation: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      default: "REGISTERED",
      enum: [
        "REGISTERED",
        "UNDER_INVESTIGATION",
        "CLOSED",
        "ACQUITTED",
        "CONVICTED",
      ],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

export default mongoose.models.Case ||
  mongoose.model("Case", caseSchema);
