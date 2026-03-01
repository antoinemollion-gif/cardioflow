import express from 'express';
import { Session } from '../models/Session';

const router = express.Router();

router.get('/summary/:userId', async (req, res) => {
  try {
    const sessions = await Session.find({ userId: req.params.userId });
    
    if (sessions.length === 0) {
      return res.json({
        totalSessions: 0,
        avgCoherence: 0,
        avgHeartRate: 0,
        totalDuration: 0
      });
    }

    const avgCoherence = Math.round(
      sessions.reduce((sum, s) => sum + (s.coherenceScore || 0), 0) / sessions.length
    );
    const avgHeartRate = Math.round(
      sessions.reduce((sum, s) => sum + (s.avgHeartRate || 0), 0) / sessions.length
    );
    const totalDuration = sessions.reduce((sum, s) => sum + (s.duration || 0), 0);

    res.json({
      totalSessions: sessions.length,
      avgCoherence,
      avgHeartRate,
      totalDuration
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/range/:userId', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const query: any = { userId: req.params.userId };

    if (startDate && endDate) {
      query.startTime = {
        $gte: new Date(startDate as string),
        $lte: new Date(endDate as string)
      };
    }

    const sessions = await Session.find(query).sort({ startTime: -1 });
    res.json(sessions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/trends/:userId', async (req, res) => {
  try {
    const sessions = await Session.find({ userId: req.params.userId }).sort({ startTime: -1 }).limit(30);
    
    const trends = {
      coherenceOverTime: sessions.map(s => ({
        date: s.startTime,
        score: s.coherenceScore || 0
      })),
      heartRateOverTime: sessions.map(s => ({
        date: s.startTime,
        avg: s.avgHeartRate || 0,
        min: s.minHeartRate || 0,
        max: s.maxHeartRate || 0
      }))
    };

    res.json(trends);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;