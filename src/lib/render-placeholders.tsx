import type { ChangeEvent } from "react";
import type { Question } from "@/types/ielts";

type RenderPlaceholderOptions = {
  body: string;
  questions: Question[];
  answers: Record<string, string>;
  onAnswerChange: (questionId: string, value: string) => void;
  disabled?: boolean;
  focusedQuestionId?: string | null;
  onFocusQuestion?: (questionId: string | null) => void;
};

export function renderPlaceholderBody({
  body,
  questions,
  answers,
  onAnswerChange,
  disabled,
  focusedQuestionId,
  onFocusQuestion
}: RenderPlaceholderOptions) {
  const questionByBlank = new Map(
    questions
      .filter((question) => question.blankId)
      .map((question) => [question.blankId, question])
  );
  const parts = body.split(/(\{\{[^}]+\}\})/g);

  return parts.map((part, index) => {
    const match = part.match(/^\{\{([^}]+)\}\}$/);

    if (!match) {
      return <span key={`${part}-${index}`}>{part}</span>;
    }

    const question = questionByBlank.get(match[1]);

    if (!question) {
      return (
        <span key={part} className="rounded bg-coral/10 px-2 py-1 text-coral">
          {part}
        </span>
      );
    }

    const isFocused = focusedQuestionId === question.id;

    return (
      <input
        id={`input-q-${question.id}`}
        key={question.id}
        aria-label={`Câu ${question.number}`}
        className={`focus-ring mx-1 inline-block w-32 rounded border px-2 py-1 text-center text-sm font-semibold transition-all duration-200 ${
          isFocused
            ? "border-sky-blue ring-2 ring-sky-blue/20 bg-sky-50 text-sky-800 font-bold scale-[1.03]"
            : "border-line bg-white text-ink hover:border-slate-400"
        } ${disabled ? "bg-slate-50 cursor-not-allowed text-slate-400" : ""}`}
        disabled={disabled}
        value={answers[question.id] ?? ""}
        onFocus={() => onFocusQuestion?.(question.id)}
        onBlur={() => onFocusQuestion?.(null)}
        onChange={(event: ChangeEvent<HTMLInputElement>) =>
          onAnswerChange(question.id, event.target.value)
        }
        placeholder={`(${question.number})`}
      />
    );
  });
}
