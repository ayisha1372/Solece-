import mongoose from 'mongoose';
export default mongoose.model('Submission', new mongoose.Schema({
  submissionId: { type: String, unique: true, index: true },
  participantName: String, email: String, institution: String, age: Number,
  answers: [Number],
  categoryScores: { allah: Number, character: Number, digital: Number },
  totalScore: Number, evaluationCategory: String,
  reflectionAnswers: [String],
  submittedAt: { type: Date, default: Date.now },
}));
