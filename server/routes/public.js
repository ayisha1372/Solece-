import { Router } from 'express';
import crypto from 'crypto';
import Submission from '../models/Submission.js';
import { score, clean } from '../utils/score.js';
import { NOTE, CATEGORIES } from '../config/solace.js';
const r = Router();
const view = (s, ev) => ({
  submissionId: s.submissionId, totalScore: s.totalScore,
  breakdown: CATEGORIES.map((c) => ({ label: c.label, score: s.categoryScores[c.key], max: c.max })),
  evaluation: s.evaluationCategory, description: ev.description, opinion: ev.opinion, note: NOTE,
});
r.post('/', async (req, res) => {
  const { participant = {}, answers, reflections = [] } = req.body || {};
  if (!Array.isArray(answers) || answers.length !== 15 || !answers.every((a) => Number.isInteger(a) && a >= 1 && a <= 5))
    return res.status(400).json({ error: 'All 15 answers (1–5) are required.' });
  const age = parseInt(participant.age, 10);
  const { categoryScores, totalScore, evaluation } = score(answers);
  const doc = await Submission.create({
    submissionId: crypto.randomBytes(5).toString('hex').toUpperCase(),
    participantName: clean(participant.name, 100), email: clean(participant.email, 120),
    institution: clean(participant.institution, 150), age: age > 0 && age < 120 ? age : undefined,
    answers, categoryScores, totalScore, evaluationCategory: evaluation.name,
    reflectionAnswers: [0, 1, 2].map((i) => clean(reflections[i], 2000)),
  });
  res.status(201).json(view(doc, evaluation));
});
// Public: score only. Never returns personal details or reflection text.
r.get('/:id', async (req, res) => {
  const s = await Submission.findOne({ submissionId: clean(req.params.id, 20) });
  if (!s) return res.status(404).json({ error: 'Not found' });
  res.json(view(s, score(s.answers).evaluation));
});
export default r;
