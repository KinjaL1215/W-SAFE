/**
 * Emergency Contact Routes
 * 
 * This module contains all emergency contact management endpoints
 * - Save emergency contacts
 * - Retrieve emergency contacts
 * - Delete emergency contacts
 */

const express = require('express');
const router = express.Router();
const emergencyController = require('../controllers/emergencyController');

/**
 * @route   POST /api/save-email
 * @desc    Save a new emergency contact email
 * @access  Private (authenticated)
 * @body    {
 *            email: string (emergency contact),
 *            ownerEmail: string (user's email)
 *          }
 * @returns { success: boolean, message: string, data: object }
 */
router.post('/save-email', emergencyController.saveEmail);

/**
 * @route   GET /api/get-emails
 * @desc    Retrieve all emergency contacts for a user
 * @access  Private (authenticated)
 * @query   { owner: string (user's email) }
 * @returns { success: boolean, message: string, data: object }
 */
router.get('/get-emails', emergencyController.getEmails);

/**
 * @route   DELETE /api/delete-email/:id
 * @desc    Delete an emergency contact
 * @access  Private (authenticated)
 * @params  { id: string (contact ID) }
 * @returns { success: boolean, message: string }
 */
router.delete('/delete-email/:id', emergencyController.deleteEmail);

module.exports = router;
