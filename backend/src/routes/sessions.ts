import express from 'express';
import { Session } from '../models/Session';
import { SessionService } from '../services/SessionService';

const router = express.Router();
const sessionService = new SessionService();

// Create new session
router.post('/', async (req, res) => {
  try {
    const { userId, sessionType } = req.body;
    const session = new Session({
      userId,
      sessionType,
      startTime: new Date()
    });
    await session.save();
    res.status(201).json(session);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get sessions for user
router.get('/user/:userId', async (req, res) => {
  try {
    const sessions = await Session.find({ userId: req.params.userId }).sort({ startTime: -1 });
    res.json(sessions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update session with biofeedback data
router.put('/:sessionId', async (req, res) => {
  try {
    const { coherenceScore, avgHeartRate, minHeartRate, maxHeartRate, respirationRate, notes } = req.body;
    const session = await Session.findByIdAndUpdate(
      req.params.sessionId,
      {
        coherenceScore,
        avgHeartRate,
        minHeartRate,
        maxHeartRate,
        respirationRate,
        notes,
        endTime: new Date()
      },
      { new: true }
    );
    res.json(session);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// End session
router.post('/:sessionId/end', async (req, res) => {
  try {
    const session = await Session.findByIdAndUpdate(
      req.params.sessionId,
      { endTime: new Date() },
      { new: true }
    );
    res.json(session);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;