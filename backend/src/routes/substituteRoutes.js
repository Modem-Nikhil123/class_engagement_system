const express = require('express');
const router = express.Router();
const {
  createSubstituteRequest,
  getSubstituteRequests,
  acceptSubstituteRequest,
  declineSubstituteRequest,
  getMySubstituteRequests
} = require('../controllers/substituteController');
const { protectRoute } = require('../controllers/auth');

// Create substitute request (when teacher can't take class)
router.post('/create', protectRoute, createSubstituteRequest);

// Get substitute requests available for teacher
router.get('/available', protectRoute, getSubstituteRequests);

// Accept substitute request
router.put('/:requestId/accept', protectRoute, acceptSubstituteRequest);

// Decline substitute request
router.put('/:requestId/decline', protectRoute, declineSubstituteRequest);

// Get substitute requests created by teacher
router.get('/my-requests', protectRoute, getMySubstituteRequests);

module.exports = router;