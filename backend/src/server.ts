import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import { authMiddleware, errorHandler } from './middleware/auth';
import usersRouter from './routes/users';
import sessionsRouter from './routes/sessions';
import analyticsRouter from './routes/analytics';
dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/cardioflow';
app.use(cors());
app.use(express.json());
mongoose.connect(MONGODB_URI).then(() => console.log('Connected to MongoDB')).catch(err => console.log('MongoDB connection error:', err));
app.use('/api/users', usersRouter);
app.use('/api/sessions', authMiddleware, sessionsRouter);
app.use('/api/analytics', authMiddleware, analyticsRouter);
app.get('/health', (req, res) => {
  res.json({ status: 'Server is running' });
});
app.use(errorHandler);
app.listen(PORT, () => {
  console.log(`CardioFlow server running on port ${PORT}`);
});