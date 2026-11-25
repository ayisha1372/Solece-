
import { CATEGORIES, EVALUATIONS } from '../config/solace.js';

const REVERSED_QUESTIONS = [13, 14];

export function score(answers) {
  const scoredAnswers = answers.map((answer, index) => {
    const questionNumber = index + 1;

    if (REVERSED_QUESTIONS.includes(questionNumber)) {
      return 6 - answer;
    }

    return answer;
  });

  const categoryScores = {};
  let total = 0;

  for (const c of CATEGORIES) {
    categoryScores[c.key] = scoredAnswers
      .slice(c.from - 1, c.to)
      .reduce((a, b) => a + b, 0);

    total += categoryScores[c.key];
  }

  return {
    categoryScores,
    totalScore: total,
    evaluation: EVALUATIONS.find((e) => total >= e.min),
  };
}

export const clean = (v, max = 200) =>
  String(v ?? '')
    .replace(/<[^>]*>/g, '')
    .replace(/[\u0000-\u001f]/g, ' ')
    .trim()
    .slice(0, max);
