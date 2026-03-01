import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';

const router = express.Router();

router.post('/register', async (req, res) => {
    try {
        const { email, password, firstName, lastName, age, gender } = req.body;
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ email, password: hashedPassword, firstName, lastName, age, gender });
        await user.save();
        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign({ userId: user._id, email: user.email }, process.env.JWT_SECRET || 'your-secret-key', { expiresIn: '24h' });
        res.json({ token, user: { id: user._id, email: user.email, firstName: user.firstName } });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/profile/:userId', async (req, res) => {
    try {
        const user = await User.findById(req.params.userId).select('-password');
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.put('/profile/:userId', async (req, res) => {
    try {
        const { firstName, lastName, age, gender } = req.body;
        const user = await User.findByIdAndUpdate(
            req.params.userId,
            { firstName, lastName, age, gender, updatedAt: new Date() },
            { new: true }
        ).select('-password');
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;