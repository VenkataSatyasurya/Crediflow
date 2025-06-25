import express from "express";
import {
  createLoan,
  updateLoanStatus,
  getLoans,
} from "../controllers/loanController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.post("/", protect, authorizeRoles("customer"), createLoan);
router.get("/", protect, getLoans);
router.put(
  "/:id/status",
  protect,
  authorizeRoles("admin", "agent"),
  updateLoanStatus
);

export default router;
