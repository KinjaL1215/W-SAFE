const mongoose = require('mongoose');

const sosSchema = new mongoose.Schema({
    userEmail: {
        type: String,
        required: true,
        index: true
    },
    location: {
        latitude: {
            type: Number,
            required: false
        },
        longitude: {
            type: Number,
            required: false
        },
        address: {
            type: String,
            required: false
        }
    },
    message: {
        type: String,
        required: true
    },
    recipientEmails: [{
        type: String
    }],
    alertStatus: {
        type: String,
        enum: ['sent', 'failed', 'pending'],
        default: 'pending'
    },
    sentAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

module.exports = mongoose.model("SOS", sosSchema);
