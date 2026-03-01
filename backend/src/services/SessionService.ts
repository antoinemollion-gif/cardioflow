import { Session } from '../models/Session';
import { calculateCoherenceScore, analyzeHeartRateVariability } from '../utils/biofeedback';

export class SessionService {
    async createSession(userId: string, sessionType: string) {
        const session = new Session({ userId, sessionType, startTime: new Date() });
        await session.save();
        return session;
    }

    async endSession(sessionId: string, biofeedbackData: any) {
        const { heartrateData, coherenceScore, respirationRate, notes } = biofeedbackData;
        const hrvAnalysis = analyzeHeartRateVariability(heartrateData);
        const calculatedCoherence = calculateCoherenceScore(heartrateData);

        const existingSession = await Session.findById(sessionId);
        const duration = Math.round((new Date().getTime() - new Date(existingSession.startTime).getTime()) / 1000);

        const session = await Session.findByIdAndUpdate(sessionId, {
            endTime: new Date(),
            duration,
            coherenceScore: coherenceScore || calculatedCoherence,
            avgHeartRate: hrvAnalysis.avgHR,
            minHeartRate: hrvAnalysis.minHR,
            maxHeartRate: hrvAnalysis.maxHR,
            respirationRate,
            notes
        }, { new: true });
        return session;
    }

    async getSessionHistory(userId: string, limit: number = 30) {
        return await Session.find({ userId }).sort({ startTime: -1 }).limit(limit);
    }

    async getSessionStats(userId: string) {
        const sessions = await Session.find({ userId });
        if (sessions.length === 0) {
            return { totalSessions: 0, avgCoherence: 0, avgHeartRate: 0, totalDuration: 0, bestCoherence: 0 };
        }
        return {
            totalSessions: sessions.length,
            avgCoherence: Math.round(sessions.reduce((sum, s) => sum + (s.coherenceScore || 0), 0) / sessions.length),
            avgHeartRate: Math.round(sessions.reduce((sum, s) => sum + (s.avgHeartRate || 0), 0) / sessions.length),
            totalDuration: sessions.reduce((sum, s) => sum + (s.duration || 0), 0),
            bestCoherence: Math.max(...sessions.map(s => s.coherenceScore || 0))
        };
    }
}