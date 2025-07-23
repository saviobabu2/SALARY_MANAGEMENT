// models/staffModel.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const staffSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    phone: {
        type: String,
        trim: true
    },
    position: {
        type: String,
        trim: true
    },
    dateOfJoining: {
        type: Date,
        default: Date.now
    },
    baseSalary: { // This is the base salary, not a payslip transaction
        type: Number,
        min: 0,
        default: 0
    },
    // Embedded document for current month's accumulated hours
    monthlyHours: {
        monthYear: { // Format: YYYY-MM, e.g., "2025-07"
            type: String,
            default: () => new Date().toISOString().slice(0, 7) // Default to current YYYY-MM
        },
        totalHoursWorked: {
            type: Number,
            min: 0,
            default: 0
        },
        lastDailyUpdate: { // To track when the hours were last updated
            type: Date,
            default: Date.now
        }
    },
    // Reference to the business this staff member belongs to (optional, but good for consistency)
    businessId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Business'
    }
}, {
    timestamps: true // Adds createdAt and updatedAt
});

// Pre-save middleware to handle monthly reset of hours
staffSchema.pre('save', function(next) {
    const today = new Date();
    const currentMonthYear = today.toISOString().slice(0, 7); // YYYY-MM

    // If the current month/year is different from the stored month/year, reset totalHoursWorked
    if (this.monthlyHours.monthYear !== currentMonthYear) {
        this.monthlyHours.monthYear = currentMonthYear;
        this.monthlyHours.totalHoursWorked = 0; // Reset for the new month
        this.monthlyHours.lastDailyUpdate = today; // Update last update date to current date
    }
    next();
});

const Staff = mongoose.model('Staff', staffSchema);

module.exports = Staff;
