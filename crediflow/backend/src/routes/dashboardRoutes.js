import express from "express";
import { getDashboardStats } from "../controllers/dashboardController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Both admin and customer can access their respective dashboard stats
router.get("/stats", protect, getDashboardStats);

export default router;
