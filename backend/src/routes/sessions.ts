import express, { Request, Response } from 'express';
import { Session } from '../models/Session';
import { calculateCoherence } from '../utils/biofeedback';

const router = express.Router();

router.post('/create', async (req: Request, res: Response) => {
    try {
        const { userId, duration, heartRateData } = req.body;
        const coherenceScore = calculateCoherence(heartRateData);
        const session = new Session({
            userId,
            duration,
            heartRateData,
            coherenceScore,
            timestamp: new Date()
        });
        await session.save();
        res.status(201).json({ message: 'Session created', session });
    } catch (error) {
        res.status(400).json({ error: 'Failed to create session' });
    }
});

router.get('/user/:userId', async (req: Request, res: Response) => {
    try {
        const sessions = await Session.find({ userId: req.params.userId }).sort({ timestamp: -1 });
        res.json(sessions);
    } catch (error) {
        res.status(400).json({ error: 'Failed to fetch sessions' });
    }
});

router.get('/:sessionId', async (req: Request, res: Response) => {
    try {
        const session = await Session.findById(req.params.sessionId);
        if (!session) return res.status(404).json({ error: 'Session not found' });
        res.json(session);
    } catch (error) {
        res.status(400).json({ error: 'Failed to fetch session' });
    }
});

router.delete('/:sessionId', async (req: Request, res: Response) => {
    try {
        await Session.findByIdAndDelete(req.params.sessionId);
        res.json({ message: 'Session deleted' });
    } catch (error) {
        res.status(400).json({ error: 'Failed to delete session' });
    }
});

export default router;