const mongoose = require('mongoose');

const emergencyContactSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    ownerEmail: {
        type: String,
        required: true,
        index: true
    }
}, { timestamps: true });

module.exports = mongoose.model("EmergencyContact", emergencyContactSchema);