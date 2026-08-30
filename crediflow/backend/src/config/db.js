import mongoose from "mongoose";

const connectDB = async () => {
  const uri =
    process.env.MONGO_URI ||
    process.env.MONGO_URL ||
    process.env.MONGODB_URI ||
    "mongodb://127.0.0.1:27017/crediflow";
  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log("MongoDB Connected Successfully");
  } catch (error) {
    console.error("=================================================");
    console.error("❌ MongoDB Connection Error:", error.message);
    console.error("👉 Please ensure MongoDB is running locally on port 27017,");
    console.error("   or add your MongoDB Atlas connection string to backend/.env");
    console.error("   Example: MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/crediflow");
    console.error("=================================================");
  }
};

export default connectDB;

