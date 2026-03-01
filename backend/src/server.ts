import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

// Import routes & middleware
import userRoutes from './routes/users';
import sessionRoutes from './routes/sessions';
import analyticsRoutes from './routes/analytics';
import { errorHandler, asyncHandler } from './middleware/errorHandler';
import { authMiddleware, RequiredUserRequest } from './middleware/auth';

dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/cardioflow';

// ============ MIDDLEWARES ============
app.use(cors({
  origin: [process.env.FRONTEND_URL || 'http://localhost:3000', 'http://localhost:19006'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// ============ MONGODB CONNECTION ============
mongoose.connect(MONGODB_URI, {
  retryWrites: true,
  writeConcern: { w: 'majority' }
})
  .then(() => console.log('✅ MongoDB connecté'))
  .catch(err => console.error('❌ Erreur MongoDB:', err));

// ============ ROUTES PUBLIQUES ============
app.post('/api/auth/register', asyncHandler(async (req: Request, res: Response) => {
  const { email, password, firstName, lastName } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email et mot de passe requis' });
  }

  const User = mongoose.model('User');
  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    return res.status(409).json({ error: 'Email déjà utilisé' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = new User({
    email: email.toLowerCase(),
    passwordHash: hashedPassword,
    firstName: firstName || '',
    lastName: lastName || '',
    preferences: {
      soundEnabled: true,
      vibrationEnabled: true,
      theme: 'light',
      respirationRhythm: 6
    },
    subscription: {
      plan: 'free',
      startDate: new Date()
    }
  });

  await newUser.save();

  const token = jwt.sign(
    { id: newUser._id, email: newUser.email },
    process.env.JWT_SECRET || 'secret_dev',
    { expiresIn: '30d' }
  );

  res.status(201).json({
    success: true,
    message: 'Utilisateur créé avec succès',
    token,
    user: { id: newUser._id, email: newUser.email, firstName, lastName }
  });
}));

app.post('/api/auth/login', asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email et mot de passe requis' });
  }

  const User = mongoose.model('User');
  const user = await User.findOne({ email: email.toLowerCase() });

  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return res.status(401).json({ error: 'Email ou mot de passe invalide' });
  }

  const token = jwt.sign(
    { id: user._id, email: user.email },
    process.env.JWT_SECRET || 'secret_dev',
    { expiresIn: '30d' }
  );

  res.json({
    success: true,
    token,
    user: {
      id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      subscription: user.subscription
    }
  });
}));

// ============ ROUTES PROTÉGÉES ============
app.use('/api/users', authMiddleware, userRoutes);
app.use('/api/sessions', authMiddleware, sessionRoutes);
app.use('/api/analytics', authMiddleware, analyticsRoutes);

// ============ HEALTH CHECK ============
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'CardioFlow API running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// ============ 404 HANDLER ============
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Route non trouvée' });
});

// ============ ERROR HANDLER ============
app.use(errorHandler);

// ============ SERVER START ============
app.listen(PORT, () => {
  console.log(`\n🫀 CardioFlow API running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 MongoDB: ${MONGODB_URI}\n`);
});

export default app;