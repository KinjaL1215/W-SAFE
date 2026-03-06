/**
 * SOS Alert Routes
 * 
 * This module contains emergency SOS alert endpoints
 * - Send SOS alerts to emergency contacts
 */

const express = require('express');
const router = express.Router();
const sosController = require('../controllers/sosController');

/**
 * @route   POST /api/sos
 * @desc    Send emergency SOS alert to emergency contacts
 * @access  Private (authenticated)
 * @body    {
 *            emails: array<string> (emergency contact emails),
 *            message: string (SOS message),
 *            location?: string (optional location details)
 *          }
 * @returns { success: boolean, message: string, data: object }
 */
router.post('/sos', sosController.sendSOS);

module.exports = router;