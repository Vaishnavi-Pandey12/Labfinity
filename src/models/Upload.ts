import mongoose from "mongoose";

const UploadSchema = new mongoose.Schema({
  studentId: String,
  experimentId: String,
  imageUrl: String,
  uploadedAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Upload ||
  mongoose.model("Upload", UploadSchema);
