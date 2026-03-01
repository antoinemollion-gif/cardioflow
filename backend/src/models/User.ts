import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
    email: string;
    passwordHash: string;
    firstName: string;
    lastName: string;
    age?: number;
    objectives: string[];
    preferences: {
        soundEnabled: boolean;
        vibrationEnabled: boolean;
        theme: 'light' | 'dark';
        preferredSessionTime: string[];
        respirationRhythm: number;
    };
    subscription: {
        plan: 'free' | 'pro' | 'premium' | 'family';
        startDate: Date;
        endDate?: Date;
    };
    linkedDevices: string[];
    createdAt: Date;
    updatedAt: Date;
}

const userSchema = new Schema<IUser>({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        match: /.+\@.+\..+/,
    },
    passwordHash: { type: String, required: true },
    firstName: { type: String, default: '' },
    lastName: { type: String, default: '' },
    age: { type: Number, min: 10, max: 120 },
    objectives: { type: [String], enum: ['stress', 'sleep', 'anxiety', 'performance', 'focus'], default: ['stress'] },
    preferences: {
        soundEnabled: { type: Boolean, default: true },
        vibrationEnabled: { type: Boolean, default: true },
        theme: { type: String, enum: ['light', 'dark'], default: 'light' },
        preferredSessionTime: { type: [String], default: ['08:00', '12:00', '20:00'] },
        respirationRhythm: { type: Number, default: 6, min: 4, max: 8 },
    },
    subscription: {
        plan: { type: String, enum: ['free', 'pro', 'premium', 'family'], default: 'free' },
        startDate: { type: Date, default: Date.now },
        endDate: Date,
    },
    linkedDevices: { type: [String], default: [] },
}, { timestamps: true });

userSchema.index({ email: 1 });
userSchema.index({ createdAt: -1 });

export default mongoose.model<IUser>('User', userSchema);