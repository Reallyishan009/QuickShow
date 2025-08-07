import mongoose from "mongoose";

const connectDB = async() => {
    try {
        mongoose.connection.on('connected', () => console.log('Database Connected'));
        // ✅ Remove the /QuickShow append - include it in your .env instead
        await mongoose.connect(process.env.MONGODB_URI);
    } catch (error) {
        console.log(error.message);
    }
}

export default connectDB;
