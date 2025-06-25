import express from "express";
import {
  makePayment,
  getPaymentsByLoan,
} from "../controllers/paymentController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.post("/", protect, authorizeRoles("customer"), makePayment);
router.get("/:loanId", protect, getPaymentsByLoan);

export default router;
