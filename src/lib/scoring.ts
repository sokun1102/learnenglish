import type {
  AttemptResult,
  IELTSPracticeTest,
  Question,
  QuestionResult,
  StudentAnswers
} from "@/types/ielts";

const trailingPunctuation = /[.,!?;:]+$/g;

export function normalizeAnswer(answer: string, strict = false) {
  const trimmed = answer.trim().replace(/\s+/g, " ");

  if (strict) {
    return trimmed;
  }

  return trimmed.toLowerCase().replace(trailingPunctuation, "");
}

export function countWords(answer: string) {
  const normalized = answer.trim().replace(/\s+/g, " ");
  if (!normalized) {
    return 0;
  }

  return normalized.split(" ").length;
}

export function scoreQuestion(
  question: Question,
  studentAnswer: string
): QuestionResult {
  const normalizedAnswer = normalizeAnswer(studentAnswer, question.strict);
  const normalizedCorrectAnswers = question.answers.map((answer) =>
    normalizeAnswer(answer, question.strict)
  );
  const isOverWordLimit =
    typeof question.maxWords === "number" &&
    countWords(studentAnswer) > question.maxWords;
  const isCorrect =
    !isOverWordLimit && normalizedCorrectAnswers.includes(normalizedAnswer);

  return {
    questionId: question.id,
    number: question.number,
    studentAnswer,
    correctAnswers: question.answers,
    isCorrect,
    isOverWordLimit,
    normalizedAnswer,
    explanation: question.explanation,
    evidence: question.evidence
  };
}

export function scoreAttempt(
  test: IELTSPracticeTest,
  answers: StudentAnswers
): AttemptResult {
  const questions = test.sections.flatMap((section) =>
    section.questionGroups.flatMap((group) => group.questions)
  );
  const results = questions.map((question) =>
    scoreQuestion(question, answers[question.id] ?? "")
  );
  const correct = results.filter((result) => result.isCorrect).length;

  return {
    total: questions.length,
    correct,
    percentage: questions.length ? Math.round((correct / questions.length) * 100) : 0,
    results
  };
}
