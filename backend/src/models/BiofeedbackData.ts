import mongoose, { Schema, Document } from 'mongoose';

export interface IBiofeedbackData extends Document {
    sessionId: string;
    heartRate: number;
    respiratoryRate: number;
    skinConductance: number;
    timestamp: Date;
}

const BiofeedbackDataSchema: Schema = new Schema({
    sessionId: { type: String, required: true },
    heartRate: { type: Number, required: true },
    respiratoryRate: { type: Number, required: true },
    skinConductance: { type: Number, required: true },
    timestamp: { type: Date, default: Date.now }
});

export const BiofeedbackData = mongoose.model<IBiofeedbackData>('BiofeedbackData', BiofeedbackDataSchema);