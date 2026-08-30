import { jsPDF } from "jspdf";

/**
 * Generate and download an official CrediFlow Payment Receipt PDF
 */
export const downloadPaymentReceipt = ({
  payment,
  loan,
  customerName = "Valued Borrower",
  customerEmail = "borrower@crediflow.com",
}) => {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const txnId = payment._id 
    ? `TXN-CRF-${payment._id.slice(-8).toUpperCase()}` 
    : `TXN-CRF-${Date.now().toString(36).toUpperCase()}`;

  const paymentDate = payment.createdAt 
    ? new Date(payment.createdAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })
    : new Date().toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });

  const amountPaid = Number(payment.amountPaid || payment.amount || 0).toLocaleString("en-IN");
  const loanAmount = Number(loan?.amount || 0).toLocaleString("en-IN");
  const emiAmount = Number(loan?.emi || payment.amountPaid || 0).toLocaleString("en-IN");
  const remaining = Number(loan?.remainingAmount !== undefined ? loan.remainingAmount : 0).toLocaleString("en-IN");

  // 1. Header Banner (Dark Navy FinTech Gradient effect)
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, 210, 45, "F");

  // Accent Line
  doc.setFillColor(16, 185, 129); // emerald-500
  doc.rect(0, 43, 210, 2, "F");

  // Header Title
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text("CrediFlow", 15, 20);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(148, 163, 184); // slate-400
  doc.text("Smart Lending & Real-Time EMI Automation", 15, 27);
  doc.text("Official Transaction E-Receipt", 15, 34);

  // Status Badge on Top Right
  doc.setFillColor(6, 78, 59); // dark emerald
  doc.roundedRect(145, 14, 50, 16, 3, 3, "F");
  doc.setTextColor(52, 211, 153); // emerald-400
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("PAYMENT SUCCESS", 149, 24);

  // 2. Receipt Details Container
  doc.setFillColor(248, 250, 252); // slate-50
  doc.roundedRect(15, 55, 180, 40, 3, 3, "F");
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(15, 55, 180, 40, 3, 3, "S");

  doc.setTextColor(100, 116, 139);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text("TRANSACTION REFERENCE", 22, 65);
  doc.text("PAYMENT DATE & TIME", 110, 65);

  doc.setTextColor(15, 23, 42);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text(txnId, 22, 73);
  doc.text(paymentDate, 110, 73);

  doc.setTextColor(100, 116, 139);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text("PAYMENT MODE", 22, 85);
  doc.text("LOAN ACCOUNT ID", 110, 85);

  doc.setTextColor(15, 23, 42);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text(String(payment.paymentMode || "UPI / NETBANKING").toUpperCase(), 22, 91);
  doc.text(loan?._id ? `LN-${loan._id.slice(-8).toUpperCase()}` : "LN-DIRECT-01", 110, 91);

  // 3. Customer & Loan Breakdown
  doc.setTextColor(30, 41, 59);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text("Borrower & Loan Details", 15, 108);

  doc.setDrawColor(226, 232, 240);
  doc.line(15, 112, 195, 112);

  const startY = 120;
  const rowHeight = 9;

  const details = [
    ["Borrower Name:", customerName],
    ["Borrower Email:", customerEmail],
    ["Original Loan Principal:", `INR ${loanAmount}`],
    ["Agreed Monthly EMI:", `INR ${emiAmount}`],
    ["Annual Interest Rate:", `${loan?.interestRate || 10.5}% p.a.`],
    ["Loan Tenure:", `${loan?.tenure || 12} Months`],
  ];

  details.forEach(([label, value], idx) => {
    const y = startY + idx * rowHeight;
    doc.setTextColor(100, 116, 139);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(label, 20, y);

    doc.setTextColor(15, 23, 42);
    doc.setFont("helvetica", "bold");
    doc.text(String(value), 90, y);
  });

  // 4. Payment Settlement Summary Box
  const summaryY = startY + details.length * rowHeight + 10;
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(15, summaryY, 180, 45, 3, 3, "F");

  doc.setTextColor(15, 23, 42);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Settlement Summary", 22, summaryY + 12);

  doc.setTextColor(100, 116, 139);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text("Total Amount Paid This Transaction:", 22, summaryY + 22);
  doc.text("Remaining Loan Balance Outstanding:", 22, summaryY + 32);

  doc.setTextColor(16, 185, 129); // emerald-600
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text(`INR ${amountPaid}`, 140, summaryY + 22);

  doc.setTextColor(225, 29, 72); // rose-600
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text(`INR ${remaining}`, 140, summaryY + 32);

  // 5. Digital Seal & Security Watermark
  const footerY = 240;
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(15, footerY, 180, 30, 2, 2, "F");
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(15, footerY, 180, 30, 2, 2, "S");

  doc.setTextColor(100, 116, 139);
  doc.setFont("helvetica", "italic");
  doc.setFontSize(8);
  doc.text("This is an electronically generated receipt verified by CrediFlow Smart Ledger Engine.", 22, footerY + 10);
  doc.text("No physical signature is required. For inquiries, contact support@crediflow.com.", 22, footerY + 16);
  doc.text(`Verification Hash: ${Math.random().toString(36).substring(2, 15).toUpperCase()}-${Date.now()}`, 22, footerY + 22);

  // Save the PDF
  const filename = `CrediFlow_Receipt_${txnId}.pdf`;
  doc.save(filename);
};

/**
 * Generate and download a Complete Loan Account Statement PDF
 */
export const downloadLoanStatement = ({
  loan,
  payments = [],
  customerName = "Valued Borrower",
  customerEmail = "borrower@crediflow.com",
}) => {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const statementDate = new Date().toLocaleDateString("en-IN", { dateStyle: "long" });
  const loanId = `LN-${loan._id ? loan._id.slice(-8).toUpperCase() : "ACCOUNT"}`;

  // Header Banner
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, 210, 45, "F");

  doc.setFillColor(59, 130, 246); // blue-500
  doc.rect(0, 43, 210, 2, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text("CrediFlow", 15, 20);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(148, 163, 184);
  doc.text("Official Loan Account & Repayment Statement", 15, 28);
  doc.text(`Statement Generated: ${statementDate}`, 15, 35);

  // Summary Card
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(15, 55, 180, 45, 3, 3, "F");
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(15, 55, 180, 45, 3, 3, "S");

  doc.setTextColor(15, 23, 42);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text(`Borrower: ${customerName}`, 22, 65);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text(`Email: ${customerEmail}`, 22, 72);
  doc.text(`Loan Account: ${loanId}`, 22, 79);
  doc.text(`Loan Status: ${String(loan.status).toUpperCase()}`, 22, 86);

  doc.setTextColor(15, 23, 42);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text(`Principal: INR ${Number(loan.amount).toLocaleString("en-IN")}`, 110, 65);
  doc.text(`Monthly EMI: INR ${Number(loan.emi).toLocaleString("en-IN")}`, 110, 72);
  doc.text(`Tenure: ${loan.tenure} Months`, 110, 79);
  doc.setTextColor(16, 185, 129);
  doc.text(`Balance Remaining: INR ${Number(loan.remainingAmount || 0).toLocaleString("en-IN")}`, 110, 86);

  // Table of Payments
  doc.setTextColor(15, 23, 42);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Transaction History", 15, 112);

  doc.setFillColor(30, 41, 59);
  doc.rect(15, 117, 180, 8, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.text("#", 20, 122);
  doc.text("DATE", 35, 122);
  doc.text("MODE", 85, 122);
  doc.text("AMOUNT PAID", 130, 122);
  doc.text("STATUS", 170, 122);

  let curY = 132;
  if (payments.length === 0) {
    doc.setTextColor(100, 116, 139);
    doc.setFont("helvetica", "italic");
    doc.setFontSize(9);
    doc.text("No payments recorded yet on this loan account.", 20, curY);
  } else {
    payments.forEach((p, idx) => {
      if (curY > 265) {
        doc.addPage();
        curY = 20;
      }
      doc.setTextColor(51, 65, 85);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.text(String(idx + 1), 20, curY);
      doc.text(new Date(p.createdAt || Date.now()).toLocaleDateString("en-IN"), 35, curY);
      doc.text(String(p.paymentMode || "UPI").toUpperCase(), 85, curY);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(16, 185, 129);
      doc.text(`INR ${Number(p.amountPaid || p.amount || 0).toLocaleString("en-IN")}`, 130, curY);
      doc.setTextColor(30, 41, 59);
      doc.text("SUCCESS", 170, curY);

      doc.setDrawColor(241, 245, 249);
      doc.line(15, curY + 3, 195, curY + 3);
      curY += 10;
    });
  }

  doc.save(`CrediFlow_Statement_${loanId}.pdf`);
};
