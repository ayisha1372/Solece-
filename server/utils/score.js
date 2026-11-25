import { CATEGORIES, EVALUATIONS } from '../config/solace.js';
// Negatively worded questions: "Never" (1) earns 5 points, "Always" (5) earns 1 point.
export const REVERSED = [13, 14];
export const points = (answers) => answers.map((a, i) => (REVERSED.includes(i + 1) ? 6 - a : a));
export function score(answers) {
  const p = points(answers);
  const categoryScores = {};
  let total = 0;
  for (const c of CATEGORIES) {
    categoryScores[c.key] = p.slice(c.from - 1, c.to).reduce((a, b) => a + b, 0);
    total += categoryScores[c.key];
  }
  return { categoryScores, totalScore: total, evaluation: EVALUATIONS.find((e) => total >= e.min) };
}
export const clean = (v, max = 200) => String(v ?? '').replace(/<[^>]*>/g, '').replace(/[\u0000-\u001f]/g, ' ').trim().slice(0, max);
