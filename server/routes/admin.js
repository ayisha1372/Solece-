import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Admin from '../models/Admin.js';
import Submission from '../models/Submission.js';
import auth from '../middleware/auth.js';
import { score, clean } from '../utils/score.js';
import { EVALUATIONS, CATEGORIES } from '../config/solace.js';
const r = Router();
r.post('/login', async (req, res) => {
  const id = clean(req.body?.identifier, 120);
  const a = await Admin.findOne({ $or: [{ username: id }, { email: id.toLowerCase() }] });
  if (!a || !(await bcrypt.compare(String(req.body?.password || ''), a.passwordHash)))
    return res.status(401).json({ error: 'Invalid credentials' });
  res.json({ token: jwt.sign({ id: a._id }, process.env.JWT_SECRET, { expiresIn: '8h' }), username: a.username });
});
r.use(auth);
r.get('/dashboard', async (_q, res) => {
  const [g] = await Submission.aggregate([{ $group: { _id: null, n: { $sum: 1 }, avg: { $avg: '$totalScore' }, max: { $max: '$totalScore' }, min: { $min: '$totalScore' } } }]);
  const named = await Submission.countDocuments({ $or: [{ participantName: { $ne: '' } }, { email: { $ne: '' } }] });
  res.json({ participants: named, submissions: g?.n || 0, average: +(g?.avg || 0).toFixed(1), highest: g?.max ?? 0, lowest: g?.min ?? 0 });
});
r.get('/submissions', async (req, res) => {
  const { q = '', category = '', sort = 'date', order = 'desc', page = 1, limit = 20 } = req.query;
  const f = {};
  if (q) f.participantName = new RegExp(clean(q, 50).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
  if (category) f.evaluationCategory = clean(category, 40);
  const p = Math.max(1, +page), l = Math.min(100, Math.max(1, +limit));
  const [items, total] = await Promise.all([
    Submission.find(f, '-answers -reflectionAnswers').sort({ [sort === 'score' ? 'totalScore' : 'submittedAt']: order === 'asc' ? 1 : -1 }).skip((p - 1) * l).limit(l),
    Submission.countDocuments(f)]);
  res.json({ items, total, page: p, pages: Math.ceil(total / l) });
});
r.get('/submissions/:id', async (req, res) => {
  const s = await Submission.findOne({ submissionId: clean(req.params.id, 20) });
  if (!s) return res.status(404).json({ error: 'Not found' });
  res.json({ ...s.toObject(), evaluation: score(s.answers).evaluation });
});
r.get('/analytics', async (_q, res) => {
  const all = await Submission.find({}, 'totalScore categoryScores evaluationCategory submittedAt');
  const trend = {};
  all.forEach((s) => { const d = s.submittedAt.toISOString().slice(0, 10); trend[d] = (trend[d] || 0) + 1; });
  const lo = [15, 30, 45, 60], hi = [29, 44, 59, 75];
  res.json({
    byCategory: EVALUATIONS.map((e) => ({ name: e.name, count: all.filter((s) => s.evaluationCategory === e.name).length })),
    avgByCategory: CATEGORIES.map((c) => ({ name: c.label, average: all.length ? +(all.reduce((a, s) => a + s.categoryScores[c.key], 0) / all.length / c.max * 100).toFixed(1) : 0 })),
    trend: Object.entries(trend).sort().map(([date, count]) => ({ date, count })),
    distribution: ['15-29', '30-44', '45-59', '60-75'].map((name, i) => ({ name, count: all.filter((s) => s.totalScore >= lo[i] && s.totalScore <= hi[i]).length })),
  });
});
const cell = (v) => { let t = String(v ?? ''); if (/^[=+\-@]/.test(t)) t = "'" + t; return `"${t.replace(/"/g, '""')}"`; };
r.get('/export', async (req, res) => {
  const all = await Submission.find().sort({ submittedAt: -1 });
  const summary = req.query.type === 'summary';
  const head = ['ID', 'Name', 'Email', 'Institution', 'Age', 'Total', 'Allah', 'Character', 'Digital', 'Category', 'Date'];
  if (!summary) head.push(...Array.from({ length: 15 }, (_, i) => `Q${i + 1}`), 'Q16', 'Q17', 'Q18');
  const rows = all.map((s) => {
    const row = [s.submissionId, s.participantName, s.email, s.institution, s.age, s.totalScore, s.categoryScores.allah, s.categoryScores.character, s.categoryScores.digital, s.evaluationCategory, s.submittedAt.toISOString()];
    return summary ? row : [...row, ...s.answers, ...s.reflectionAnswers];
  });
  res.type('text/csv').attachment(`solace-${summary ? 'summary' : 'full'}.csv`).send('\ufeff' + [head, ...rows].map((x) => x.map(cell).join(',')).join('\n'));
});
r.put('/password', async (req, res) => {
  const { current, next } = req.body || {};
  const a = await Admin.findById(req.admin.id);
  if (!next || String(next).length < 10 || !(await bcrypt.compare(String(current || ''), a.passwordHash)))
    return res.status(400).json({ error: 'Check current password; new password needs 10+ characters.' });
  a.passwordHash = await bcrypt.hash(next, 12); await a.save(); res.json({ ok: true });
});
r.get('/settings', (_q, res) => res.json({ categories: CATEGORIES, evaluations: EVALUATIONS, questions: 15, version: '1.0.0' }));
export default r;
