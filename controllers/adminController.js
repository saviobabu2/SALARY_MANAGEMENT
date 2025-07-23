// controllers/adminController.js

// Import only the models relevant to this new application
const Staff = require('../models/staffModel');
const SalarySlip = require('../models/salarySlipModel');
// If your staff members are associated with a 'Business' and you need to manage businesses,
// uncomment the line below. Otherwise, keep it commented or remove it.
// const Business = require('../models/businessModel');


// --- Core Admin Panel Routes ---

// Renders the main dashboard page
const dashboard = (req, res) => {
    res.render('admin/dashboard', {
        title: 'Admin Dashboard',
        layout: 'layouts/admin-layout'
    });
};

// --- Staff Management ---

// Renders the staff management page, displaying a list of all staff members
const staffManager = async (req, res) => {
    try {
        const staffList = await Staff.find({});
        res.render('admin/staffManagement', { // Assumes staffManagement.ejs is in views/admin/
            title: 'Staff Management',
            layout: 'layouts/admin-layout',
            staffList: staffList
        });
    } catch (e) {
        console.error("Error in staffManager:", e);
        res.status(500).render('error', { message: 'Failed to load staff data.' });
    }
};

// Handles adding a new staff member via API
const addStaff = async (req, res) => {
    try {
        const { name, email, phone, position, dateOfJoining, baseSalary } = req.body;

        // Basic validation
        if (!name || !email || !dateOfJoining || baseSalary === undefined || baseSalary === null) {
            return res.status(400).json({ success: false, message: 'Missing required staff fields: Name, Email, Date of Joining, Base Salary.' });
        }

        const newStaff = new Staff({
            name,
            email,
            phone,
            position,
            dateOfJoining: new Date(dateOfJoining),
            baseSalary: parseFloat(baseSalary)
        });

        await newStaff.save();
        res.status(201).json({ success: true, message: 'Staff member added successfully!', staff: newStaff });
    } catch (error) {
        console.error('Error adding staff:', error);
        if (error.code === 11000) { // Duplicate key error (e.g., email already exists)
            return res.status(409).json({ success: false, message: 'Staff member with this email already exists.' });
        }
        res.status(500).json({ success: false, message: 'Server error while adding staff.', error: error.message });
    }
};

// Handles deleting a staff member via API
const deleteStaff = async (req, res) => {
    try {
        const { staffId } = req.params;
        const result = await Staff.findByIdAndDelete(staffId);

        if (!result) {
            return res.status(404).json({ success: false, message: 'Staff member not found.' });
        }
        res.status(200).json({ success: true, message: 'Staff member deleted successfully!' });
    } catch (error) {
        console.error('Error deleting staff:', error);
        res.status(500).json({ success: false, message: 'Server error while deleting staff.', error: error.message });
    }
};


// --- Staff Hours Management ---

// Renders the page to view and update staff daily working hours
const renderStaffHoursPage = async (req, res) => {
    try {
        const staffList = await Staff.find({}); // Fetch all staff members
        const currentMonthYear = new Date().toISOString().slice(0, 7); // YYYY-MM format

        res.render('admin/staff-hours', {
            title: 'Staff Hours Management',
            layout: 'layouts/admin-layout',
            staffList: staffList,
            currentMonthYear: currentMonthYear
        });
    } catch (error) {
        console.error('Error rendering staff hours page:', error);
        res.status(500).render('error', { message: 'Failed to load staff hours data.' });
    }
};




// Handles updating staff daily working hours via API (POST /admin/api/staff/:staffId/update-hours)
const updateStaffDailyHours = async (req, res) => {
    try {
        const { staffId } = req.params; // Get staff ID from URL parameters
        const { hoursToAdd } = req.body; // Get hours to add from request body

        // Validate input: hoursToAdd must be a positive number
        if (isNaN(hoursToAdd) || hoursToAdd <= 0) {
            return res.status(400).json({ success: false, message: 'Invalid hours provided. Must be a positive number.' });
        }

        const staff = await Staff.findById(staffId); // Find the staff member

        if (!staff) {
            return res.status(404).json({ success: false, message: 'Staff member not found.' });
        }

        const today = new Date();
        const currentMonthYear = today.toISOString().slice(0, 7); // Get current YYYY-MM

        // Check if the month has changed since the last update for this staff member.
        // If it's a new month, reset totalHoursWorked for the new month.
        if (staff.monthlyHours.monthYear !== currentMonthYear) {
            staff.monthlyHours.monthYear = currentMonthYear;
            staff.monthlyHours.totalHoursWorked = 0; // Reset to 0 for the new month
        }

        staff.monthlyHours.totalHoursWorked += hoursToAdd; // Accumulate hours
        staff.monthlyHours.lastDailyUpdate = today; // Update the timestamp of the last update

        await staff.save(); // Save the updated staff document

        res.status(200).json({
            success: true,
            message: `Hours updated successfully for ${staff.name}.`,
            newTotalHours: staff.monthlyHours.totalHoursWorked // Return the new total hours
        });

    } catch (error) {
        console.error('Error updating staff daily hours:', error);
        res.status(500).json({ success: false, message: 'Server error while updating staff hours.', error: error.message });
    }
};








// --- Payslip Management ---

// Renders the page to generate and view payslips
const renderGeneratePayslipPage = async (req, res) => {
    try {
        const staffList = await Staff.find({}); // Get all staff for the dropdown
        // Fetch all generated payslips, sorted by month/year (latest first) and then generation date
        const payslips = await SalarySlip.find({}).sort({ monthYear: -1, generationDate: -1 });

        res.render('admin/generate-payslip', {
            title: 'Generate Payslip',
            layout: 'layouts/admin-layout',
            staffList: staffList,
            payslips: payslips
        });
    } catch (error) {
        console.error('Error rendering generate payslip page:', error);
        res.status(500).render('error', { message: 'Failed to load payslip generation page.' });
    }
};

// Handles the generation and saving of a new payslip via API
const generatePayslip = async (req, res) => {
    try {
        const { staffId, staffName, monthYear } = req.body;

        if (!staffId || !staffName || !monthYear) {
            return res.status(400).json({ success: false, message: 'Missing staff ID, name, or month/year.' });
        }

        const staff = await Staff.findById(staffId);
        if (!staff) {
            return res.status(404).json({ success: false, message: 'Staff member not found.' });
        }

        // Check if a payslip for this staff and month/year already exists to prevent duplicates
        const existingPayslip = await SalarySlip.findOne({ staffId: staffId, monthYear: monthYear });
        if (existingPayslip) {
            return res.status(409).json({ success: false, message: 'Payslip for this staff and month already exists. Please delete the existing one if you need to regenerate.' });
        }

        // --- Payslip Calculation Logic ---
        let totalHoursForPayslip = 0;
        if (staff.monthlyHours.monthYear === monthYear) {
            totalHoursForPayslip = staff.monthlyHours.totalHoursWorked;
        } else {
            console.warn(`Generating payslip for a past month (${monthYear}) for ${staff.name}. Monthly hours might not be accurate as only current month's hours are stored.`);
        }

        const salaryPerHour = staff.baseSalary / 160; // Example: assuming 160 standard hours in a month for base salary calculation
        const totalPayment = totalHoursForPayslip * salaryPerHour;

        // --- Placeholder for other complex calculations/data fetching ---
        const declaredHours = totalHoursForPayslip;
        const balanceHours = 0;
        const nightHours = 0;
        const nightTotalPayment = 0;
        const morningHours = 0;
        const morningTotalPayment = 0;
        const advance = 0;
        const rentDeduction = 0;
        const otherDeductions = [];
        const additionalPayments = [];

        let totalBalance = totalPayment - advance - rentDeduction;
        otherDeductions.forEach(d => totalBalance -= d.amount);

        const roundedFigure = Math.round(totalBalance);
        let totalGiven = roundedFigure;
        additionalPayments.forEach(p => totalGiven += p.amount);

        const newPayslip = new SalarySlip({
            staffId: staff._id,
            staffName: staff.name,
            monthYear: monthYear,
            totalHours: totalHoursForPayslip,
            declaredHours: declaredHours,
            balanceHours: balanceHours,
            salaryPerHour: salaryPerHour,
            nightHours: nightHours,
            nightTotalPayment: nightTotalPayment,
            morningHours: morningHours,
            morningTotalPayment: morningTotalPayment,
            totalPayment: totalPayment,
            advance: advance,
            rentDeduction: rentDeduction,
            otherDeductions: otherDeductions,
            totalBalance: totalBalance,
            roundedFigure: roundedFigure,
            additionalPayments: additionalPayments,
            totalGiven: totalGiven,
        });

        await newPayslip.save();

        res.status(201).json({ success: true, message: `Payslip generated successfully for ${staff.name} for ${monthYear}!`, payslip: newPayslip });

    } catch (error) {
        console.error('Error generating payslip:', error);
        if (error.code === 11000) {
            return res.status(409).json({ success: false, message: 'A payslip for this staff member and month already exists.' });
        }
        res.status(500).json({ success: false, message: 'Server error while generating payslip.', error: error.message });
    }
};

// Handles deleting a payslip via API
const deletePayslip = async (req, res) => {
    try {
        const { payslipId } = req.params;
        const result = await SalarySlip.findByIdAndDelete(payslipId);

        if (!result) {
            return res.status(404).json({ success: false, message: 'Payslip not found.' });
        }
        res.status(200).json({ success: true, message: 'Payslip deleted successfully!' });
    } catch (error) {
        console.error('Error deleting payslip:', error);
        res.status(500).json({ success: false, message: 'Server error while deleting payslip.', error: error.message });
    }
};

// --- Export all controller functions ---
module.exports = {
    dashboard,
    staffManager,
    addStaff,
    deleteStaff,
    renderStaffHoursPage,
    updateStaffDailyHours,
    renderGeneratePayslipPage,
    generatePayslip,
    deletePayslip
};
