import mongoose, { Schema, Document } from 'mongoose';

export interface ISession extends Document {
    userId: string;
    duration: number;
    heartRateData: number[];
    coherenceScore: number;
    timestamp: Date;
}

const SessionSchema: Schema = new Schema({
    userId: { type: String, required: true },
    duration: { type: Number, required: true },
    heartRateData: { type: [Number], required: true },
    coherenceScore: { type: Number, required: true },
    timestamp: { type: Date, default: Date.now }
});

export const Session = mongoose.model<ISession>('Session', SessionSchema);