import { CATEGORIES, EVALUATIONS } from '../config/solace.js';
export function score(answers) {
  const categoryScores = {};
  let total = 0;
  for (const c of CATEGORIES) {
    categoryScores[c.key] = answers.slice(c.from - 1, c.to).reduce((a, b) => a + b, 0);
    total += categoryScores[c.key];
  }
  return { categoryScores, totalScore: total, evaluation: EVALUATIONS.find((e) => total >= e.min) };
}
export const clean = (v, max = 200) => String(v ?? '').replace(/<[^>]*>/g, '').replace(/[\u0000-\u001f]/g, ' ').trim().slice(0, max);
