// models/salarySlipModel.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const salarySlipSchema = new Schema({
    staffId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Staff', // Reference to the Staff model
        required: true
    },
    staffName: { // Storing name directly for easier display/reporting
        type: String,
        required: true,
        trim: true
    },
    monthYear: { // The month and year for which this payslip is generated (e.g., "2025-07")
        type: String,
        required: true
    },
    generationDate: { // When this payslip was generated
        type: Date,
        default: Date.now
    },
    totalHours: {
        type: Number,
        min: 0,
        default: 0
    },
    declaredHours: {
        type: Number,
        min: 0,
        default: 0
    },
    balanceHours: {
        type: Number,
        min: 0,
        default: 0
    },
    salaryPerHour: {
        type: Number,
        min: 0,
        default: 0
    },
    nightHours: {
        type: Number,
        min: 0,
        default: 0
    },
    nightTotalPayment: {
        type: Number,
        min: 0,
        default: 0
    },
    morningHours: {
        type: Number,
        min: 0,
        default: 0
    },
    morningTotalPayment: {
        type: Number,
        min: 0,
        default: 0
    },
    totalPayment: { // Total calculated payment before deductions/additions
        type: Number,
        min: 0,
        default: 0
    },
    advance: {
        type: Number,
        min: 0,
        default: 0
    },
    rentDeduction: {
        type: Number,
        min: 0,
        default: 0
    },
    otherDeductions: { // Flexible field for other personalized deductions
        type: [{
            type: { type: String, trim: true }, // e.g., "Loan Repayment", "Uniform Fee"
            amount: { type: Number, min: 0, default: 0 },
            description: { type: String, trim: true } // Added description
        }],
        default: []
    },
    totalBalance: { // Net balance after deductions (before rounded figure/additional payments)
        type: Number,
        default: 0
    },
    roundedFigure: {
        type: Number,
        default: 0
    },
    additionalPayments: { // Flexible field for additional personalized payments
        type: [{
            type: { type: String, trim: true }, // e.g., "Bonus", "Overtime Pay"
            amount: { type: Number, min: 0, default: 0 },
            description: { type: String, trim: true } // Added description
        }],
        default: []
    },
    totalGiven: { // Final amount paid
        type: Number,
        min: 0,
        default: 0
    }
}, {
    timestamps: true // Adds createdAt and updatedAt to the payslip document
});

// Ensure unique payslip per staff per month/year
salarySlipSchema.index({ staffId: 1, monthYear: 1 }, { unique: true });

const SalarySlip = mongoose.model('SalarySlip', salarySlipSchema);

module.exports = SalarySlip;
