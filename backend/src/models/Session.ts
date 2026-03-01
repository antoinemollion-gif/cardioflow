import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  sessionType: { type: String, enum: ['breathing', 'meditation', 'hrv_training'], required: true },
  startTime: { type: Date, default: Date.now },
  endTime: Date,
  duration: Number, // in seconds
  coherenceScore: Number,
  avgHeartRate: Number,
  minHeartRate: Number,
  maxHeartRate: Number,
  respirationRate: Number,
  notes: String,
  createdAt: { type: Date, default: Date.now }
});

export const Session = mongoose.model('Session', sessionSchema);