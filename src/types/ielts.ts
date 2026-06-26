export type Skill = "reading" | "listening";

export type TestStatus = "draft" | "published" | "archived";

export type QuestionType =
  | "gap_fill"
  | "sentence_completion"
  | "summary_completion"
  | "note_completion"
  | "multiple_choice"
  | "true_false_not_given";

export type StorageProvider = "minio" | "s3" | "r2" | "local";

export type MediaAsset = {
  id: string;
  fileName: string;
  bucket: string;
  objectKey: string;
  mimeType: string;
  size: number;
  durationSeconds?: number;
  storageProvider: StorageProvider;
  publicUrl?: string;
};

export type Evidence = {
  passageIndex?: number;
  text: string;
  timestampStart?: number;
  timestampEnd?: number;
};

export type Question = {
  id: string;
  number: number;
  blankId?: string;
  prompt?: string;
  answers: string[];
  maxWords?: number;
  explanation: string;
  evidence?: Evidence;
  strict?: boolean;
};

export type QuestionGroup = {
  id: string;
  type: QuestionType;
  title: string;
  instruction: string;
  body?: string;
  questions: Question[];
};

export type TestSection = {
  id: string;
  title: string;
  passage?: string;
  transcript?: string;
  audio?: MediaAsset;
  questionGroups: QuestionGroup[];
};

export type IELTSPracticeTest = {
  id: string;
  title: string;
  description?: string;
  coverImage?: string;
  skill: Skill;
  testType: "academic" | "general" | "practice";
  level: "band_4_5" | "band_5_6" | "band_6_7" | "band_7_8";
  durationMinutes: number;
  status: TestStatus;
  tags: string[];
  sections: TestSection[];
};

export type StudentAnswers = Record<string, string>;

export type QuestionResult = {
  questionId: string;
  number: number;
  studentAnswer: string;
  correctAnswers: string[];
  isCorrect: boolean;
  isOverWordLimit: boolean;
  normalizedAnswer: string;
  explanation: string;
  evidence?: Evidence;
};

export type AttemptResult = {
  total: number;
  correct: number;
  percentage: number;
  results: QuestionResult[];
};
