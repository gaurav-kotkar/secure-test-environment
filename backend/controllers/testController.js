const db = require('../config/database');

// Start a new test attempt
exports.startTest = async (req, res) => {
  try {
    const userId = req.user.userId;
    const attemptId = `TEST_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const [result] = await db.query(
      'INSERT INTO test_attempts (user_id, attempt_id, status) VALUES (?, ?, ?)',
      [userId, attemptId, 'in_progress']
    );

    res.json({
      success: true,
      message: 'Test started successfully',
      attemptId,
      testAttemptId: result.insertId
    });

  } catch (error) {
    console.error('Start test error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to start test'
    });
  }
};

// Get current test attempt
exports.getCurrentAttempt = async (req, res) => {
  try {
    const userId = req.user.userId;

    const [attempts] = await db.query(
      `SELECT id, attempt_id, status, violation_count, started_at 
       FROM test_attempts 
       WHERE user_id = ? AND status = 'in_progress'
       ORDER BY started_at DESC 
       LIMIT 1`,
      [userId]
    );

    if (attempts.length === 0) {
      return res.json({
        success: true,
        hasActiveAttempt: false,
        attempt: null
      });
    }

    res.json({
      success: true,
      hasActiveAttempt: true,
      attempt: attempts[0]
    });

  } catch (error) {
    console.error('Get attempt error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get test attempt'
    });
  }
};

// Batch log events
exports.logEvents = async (req, res) => {
  try {
    const { events, attemptId } = req.body;
    const userId = req.user.userId;

    if (!events || !Array.isArray(events) || events.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No events provided'
      });
    }

    // Verify attempt belongs to user
    const [attempts] = await db.query(
      'SELECT id, status FROM test_attempts WHERE attempt_id = ? AND user_id = ?',
      [attemptId, userId]
    );

    if (attempts.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Test attempt not found'
      });
    }

    if (attempts[0].status === 'submitted') {
      return res.status(400).json({
        success: false,
        message: 'Cannot log events for submitted test'
      });
    }

    // Prepare batch insert
    const values = events.map(event => [
      attemptId,
      userId,
      event.eventType,
      JSON.stringify(event.metadata || {}),
      event.isViolation || false,
      event.questionId || null,
      event.timestamp
    ]);

    // Insert all events
    await db.query(
      `INSERT INTO event_logs 
       (attempt_id, user_id, event_type, event_data, is_violation, question_id, timestamp) 
       VALUES ?`,
      [values]
    );

    // Count violations and update attempt
    const violationCount = events.filter(e => e.isViolation).length;
    
    if (violationCount > 0) {
      await db.query(
        'UPDATE test_attempts SET violation_count = violation_count + ? WHERE attempt_id = ?',
        [violationCount, attemptId]
      );
    }

    res.json({
      success: true,
      message: 'Events logged successfully',
      eventsLogged: events.length
    });

  } catch (error) {
    console.error('Log events error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to log events'
    });
  }
};

// Get event logs for an attempt
exports.getEventLogs = async (req, res) => {
  try {
    const { attemptId } = req.params;
    const userId = req.user.userId;

    // Verify attempt belongs to user
    const [attempts] = await db.query(
      'SELECT id FROM test_attempts WHERE attempt_id = ? AND user_id = ?',
      [attemptId, userId]
    );

    if (attempts.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Test attempt not found'
      });
    }

    // Get all logs for this attempt
    const [logs] = await db.query(
      `SELECT id, event_type, event_data, is_violation, question_id, timestamp, created_at
       FROM event_logs 
       WHERE attempt_id = ?
       ORDER BY timestamp ASC`,
      [attemptId]
    );

    // Parse JSON event_data
    const parsedLogs = logs.map(log => ({
      ...log,
      event_data: typeof log.event_data === 'string' ? JSON.parse(log.event_data) : log.event_data
    }));

    res.json({
      success: true,
      logs: parsedLogs,
      totalEvents: parsedLogs.length
    });

  } catch (error) {
    console.error('Get logs error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve event logs'
    });
  }
};

// Get violation count
exports.getViolationCount = async (req, res) => {
  try {
    const { attemptId } = req.params;
    const userId = req.user.userId;

    const [attempts] = await db.query(
      'SELECT violation_count FROM test_attempts WHERE attempt_id = ? AND user_id = ?',
      [attemptId, userId]
    );

    if (attempts.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Test attempt not found'
      });
    }

    res.json({
      success: true,
      violationCount: attempts[0].violation_count
    });

  } catch (error) {
    console.error('Get violation count error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get violation count'
    });
  }
};

// Submit test
exports.submitTest = async (req, res) => {
  try {
    const { attemptId } = req.body;
    const userId = req.user.userId;

    // Update test status
    const [result] = await db.query(
      `UPDATE test_attempts 
       SET status = 'submitted', submitted_at = CURRENT_TIMESTAMP 
       WHERE attempt_id = ? AND user_id = ? AND status = 'in_progress'`,
      [attemptId, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(400).json({
        success: false,
        message: 'Test already submitted or not found'
      });
    }

    res.json({
      success: true,
      message: 'Test submitted successfully'
    });

  } catch (error) {
    console.error('Submit test error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit test'
    });
  }
};
