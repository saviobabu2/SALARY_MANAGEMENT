// routes/adminRoutes.js
const express = require('express');
const router = express.Router(); // IMPORTANT: This creates an Express Router instance
const adminController = require('../controllers/adminController'); // Import your controller functions


// --- Admin Panel Core Routes ---
router.get('/dashboard', adminController.dashboard);

// --- Staff Management Routes ---
router.get('/staff-management', adminController.staffManager); // Page to list/manage staff
router.post('/api/staff', adminController.addStaff); // API to add new staff
router.delete('/api/staff/:staffId', adminController.deleteStaff); // API to delete staff

router.get('/staff-hours', adminController.renderStaffHoursPage);
// Maps POST /admin/api/staff/:staffId/update-hours to the updateStaffDailyHours function
router.post('/staff/:staffId/update-hours', adminController.updateStaffDailyHours);



// --- Payslip Management Routes ---
router.get('/payslips', adminController.renderGeneratePayslipPage); // Page to generate and view payslips
router.post('/api/generate-payslip', adminController.generatePayslip); // API to generate a new payslip
router.delete('/api/payslip/:payslipId', adminController.deletePayslip); // API to delete a payslip

// --- Export the router ---
// IMPORTANT: This makes the router instance available when required by app.js
module.exports = router;
