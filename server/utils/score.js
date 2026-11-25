
import { CATEGORIES, EVALUATIONS } from '../config/solace.js';

// Questions 13 and 14 use normal scoring.
// All other questions use reverse scoring.
const NORMAL_SCORING_QUESTIONS = [13, 14];

export function score(answers) {
  const categoryScores = {};
  let total = 0;

  const scoredAnswers = answers.map((answer, index) => {
    const questionNumber = index + 1;

    return NORMAL_SCORING_QUESTIONS.includes(questionNumber)
      ? answer
      : 6 - answer;
  });

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
