const sendMail = require('../utils/sendMail');
const { sendSuccess, sendError, sendValidationError } = require('../utils/apiResponse');
const { validateRequiredFields } = require('../utils/validation');
const SOS = require('../models/SOS');

exports.sendSOS = async (req, res) => {
  try {
    const { emails, message, location } = req.body;
    // Get userEmail from authenticated user or request body
    const userEmail = req.body.userEmail || req.user?.email || 'anonymous';

    // Validate required fields
    const { valid, missingFields } = validateRequiredFields(req.body, ['emails', 'message']);
    if (!valid) return sendValidationError(res, 'Missing fields', missingFields);

    if (!Array.isArray(emails) || emails.length === 0) {
      return sendValidationError(res, 'At least one email is required');
    }

    try {
      const emailList = emails.map(e => e.toLowerCase()).join(', ');
      
      // Format location info for email
      let locationInfo = 'Location: Not available';
      if (location) {
        if (location.address) {
          locationInfo = `Location: ${location.address}`;
        } else if (location.latitude && location.longitude) {
          locationInfo = `Location: Latitude ${location.latitude}, Longitude ${location.longitude}`;
        }
      }

      // Constructing the body for the email utility
      const finalMessage = `
🚨 EMERGENCY ALERT - W-SAFE 🚨

${message}

📍 ${locationInfo}

This is an automated alert. Please respond immediately.
      `;

      // Save SOS alert to database
      const sosRecord = new SOS({
        userEmail,
        location: location || {},
        message,
        recipientEmails: emails,
        alertStatus: 'pending'
      });

      // Send email
      await sendMail(emailList, finalMessage);
      
      // Mark as sent
      sosRecord.alertStatus = 'sent';
      sosRecord.sentAt = new Date();
      await sosRecord.save();

      sendSuccess(res, 200, '🚨 SOS alert sent to emergency contacts', {
        recipientCount: emails.length,
        sosId: sosRecord._id
      });

    } catch (emailErr) {
      console.error('Email send error:', emailErr);
      // Try to save failed attempt
      const sosRecord = new SOS({
        userEmail,
        location: location || {},
        message,
        recipientEmails: emails,
        alertStatus: 'failed'
      });
      await sosRecord.save().catch(err => console.error('Failed to save SOS record:', err));
      
      sendError(res, 500, 'Failed to send SOS alert.');
    }
  } catch (err) {
    console.error('Send SOS error:', err);
    sendError(res, 500, 'Server error');
  }
};