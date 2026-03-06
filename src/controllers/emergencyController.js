const EmergencyContact = require('../models/EmergencyContact');
const { sendSuccess, sendError, sendValidationError } = require('../utils/apiResponse');
const { isValidEmail, validateRequiredFields, sanitizeInput } = require('../utils/validation');

/**
 * Save emergency contact email
 * @route POST /api/save-email
 * @param {string} email - Emergency contact email
 * @param {string} ownerEmail - Owner email
 */
exports.saveEmail = async (req, res) => {
  try {
    const { email, ownerEmail } = req.body;

    // Validate required fields
    const { valid, missingFields } = validateRequiredFields(req.body, ['email', 'ownerEmail']);
    if (!valid) {
      return sendValidationError(res, 'Missing required fields', missingFields);
    }

    // Validate emails
    if (!isValidEmail(email)) {
      return sendValidationError(res, 'Invalid emergency contact email format');
    }

    if (!isValidEmail(ownerEmail)) {
      return sendValidationError(res, 'Invalid owner email format');
    }

    // Check for duplicates
    const exists = await EmergencyContact.findOne({
      email: email.toLowerCase(),
      ownerEmail: ownerEmail.toLowerCase()
    });

    if (exists) {
      return sendError(res, 409, 'This email is already saved as emergency contact');
    }

    // Create emergency contact
    const newContact = new EmergencyContact({
      email: email.toLowerCase(),
      ownerEmail: ownerEmail.toLowerCase()
    });

    await newContact.save();

    sendSuccess(res, 201, 'Emergency contact saved successfully', {
      id: newContact._id,
      email: newContact.email
    });

  } catch (err) {
    console.error('Save email error:', err);
    sendError(res, 500, 'Failed to save emergency contact');
  }
};

/**
 * Get all emergency emails for a specific owner
 * @route GET /api/get-emails
 * @query {string} owner - Owner email
 */
exports.getEmails = async (req, res) => {
  try {
    const { owner } = req.query;

    if (!owner) {
      return sendValidationError(res, 'Owner email is required as query parameter');
    }

    if (!isValidEmail(owner)) {
      return sendValidationError(res, 'Invalid owner email format');
    }

    const emails = await EmergencyContact.find({
      ownerEmail: owner.toLowerCase()
    }).select('_id email');

    // normalize to include id field for frontend convenience
    const contacts = emails.map(e => ({
      _id: e._id,
      email: e.email
    }));

    sendSuccess(res, 200, 'Emergency contacts retrieved successfully', {
      count: contacts.length,
      contacts
    });

  } catch (err) {
    console.error('Get emails error:', err);
    sendError(res, 500, 'Failed to retrieve emergency contacts');
  }
};

/**
 * Delete emergency contact email
 * @route DELETE /api/delete-email/:id
 * @param {string} id - Contact ID
 */
exports.deleteEmail = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return sendValidationError(res, 'Contact ID is required');
    }

    const contact = await EmergencyContact.findByIdAndDelete(id);

    if (!contact) {
      return sendError(res, 404, 'Emergency contact not found');
    }

    sendSuccess(res, 200, 'Emergency contact deleted successfully');

  } catch (err) {
    console.error('Delete email error:', err);
    sendError(res, 500, 'Failed to delete emergency contact');
  }
};
