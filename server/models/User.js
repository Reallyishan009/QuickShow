import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true }, // Clerk user ID as string
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    image: { type: String }, 
    favorites: [{ type: String }] // ✅ Added favorites array to store movie IDs
  },
  { timestamps: true }
);

const User = mongoose.model('User', userSchema);

export default User;
