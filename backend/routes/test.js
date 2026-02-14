const express = require('express');
const router = express.Router();
const testController = require('../controllers/testController');
const authMiddleware = require('../middleware/auth');

// All routes require authentication
router.use(authMiddleware);

// Test attempt routes
router.post('/start', testController.startTest);
router.get('/current', testController.getCurrentAttempt);
router.post('/submit', testController.submitTest);

// Event logging routes
router.post('/logs', testController.logEvents);
router.get('/logs/:attemptId', testController.getEventLogs);
router.get('/violations/:attemptId', testController.getViolationCount);

module.exports = router;
