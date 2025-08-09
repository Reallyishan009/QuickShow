import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true }, // Clerk or external user ID as string
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true }, // Add unique constraint
    image: { type: String }, // Optional; remove 'required' if you want to allow blank avatars
  },
  { timestamps: true }
);

const User = mongoose.model('User', userSchema);

export default User;
