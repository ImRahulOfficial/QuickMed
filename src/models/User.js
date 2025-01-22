const express = require("express");
const router = express.Router();
const verifyRole = require("./middlewares/verifyRole");

// Example routes with role-based access
router.get("/admin/dashboard", verifyRole(["superAdmin"]), (req, res) => {
  res.status(200).json({ message: "Welcome to the Super Admin Dashboard!" });
});

router.get("/subadmin/orders", verifyRole(["subAdmin"]), (req, res) => {
  res.status(200).json({ message: "Here are your orders." });
});

router.post("/staff/sales", verifyRole(["staff", "subAdmin"]), (req, res) => {
  res.status(200).json({ message: "Sales recorded successfully." });
});

module.exports = router;
