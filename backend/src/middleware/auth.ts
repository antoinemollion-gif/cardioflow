import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'secret-key';

export interface AuthRequest extends Request {
    userId?: string;
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ error: 'No token provided' });
        }
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
        req.userId = decoded.userId;
        next();
    } catch (error) {
        res.status(401).json({ error: 'Invalid token' });
    }
};

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
};
