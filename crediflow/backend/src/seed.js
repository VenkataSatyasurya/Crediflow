import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "./models/User.js";

dotenv.config();

const seedDatabase = async () => {
  const uri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/crediflow";
  try {
    await mongoose.connect(uri);
    console.log("Connected to MongoDB for seeding...");

    const defaultUsers = [
      {
        name: "Admin User",
        email: "admin@crediflow.com",
        password: "adminpassword123",
        role: "admin",
      },
      {
        name: "Customer User",
        email: "customer@crediflow.com",
        password: "customerpassword123",
        role: "customer",
      },
    ];

    for (const u of defaultUsers) {
      const existing = await User.findOne({ email: u.email });
      if (!existing) {
        const hashedPassword = await bcrypt.hash(u.password, 10);
        await User.create({
          name: u.name,
          email: u.email,
          password: hashedPassword,
          role: u.role,
        });
        console.log(`Created ${u.role} account: ${u.email} (password: ${u.password})`);
      } else {
        console.log(`Account ${u.email} already exists.`);
      }
    }

    console.log("Seeding completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Seeding failed:", error.message);
    process.exit(1);
  }
};

seedDatabase();
