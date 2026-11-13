/** Types khớp response DTO backend (`success: true, data: T`). */

export type DocumentMode = "EXTRACT" | "GENERATE";
export type SessionKind = "practice" | "exam";
export type SessionStatus = "in_progress" | "submitted" | "expired";
export type DocumentStatus = "uploaded" | "processing" | "ready" | "failed";

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface ApiSuccess<T> {
  success: true;
  data: T;
}

export interface ApiFailure {
  success: false;
  error: { message: string; details?: unknown };
}

/** Khớp document.controller upload / list / getOne */
export interface DocumentItem {
  id: string;
  originalName: string;
  mimeType: string;
  size: number;
  status: DocumentStatus;
  extractedTextPreview?: string;
  errorMessage?: string;
  createdAt?: string;
}

/** Khớp quiz.validator clinicalCaseSchema */
export interface ClinicalCaseInput {
  situation: string;
  suggestedQuestion?: string;
  expectedAnswer?: string;
}

/** Khớp QuizSet.meta + summarizeQuizSet */
export interface QuizMeta {
  soCauPhatHien?: number;
  soCauSauLocTrungStem?: number;
  soCauBoDoTrung?: number;
  viDuStemBiLoaiTrung?: string[];
  soYDocLap?: number;
  lyDoBankNganHonTarget?: string;
  nNganHangMin?: number;
  needsReview?: boolean;
}

export interface QuizDefaults {
  nOnLuyen: number;
  nPhongThi: number;
  thoiGianPhut: number;
}

/** Khớp quiz.service summarizeQuizSet */
export interface QuizSummary {
  id: string;
  documentId: string;
  documentIds?: string[];
  title: string;
  mode: DocumentMode;
  modeReason: string;
  status: string;
  meta?: QuizMeta;
  defaults?: QuizDefaults;
  bankSize: number;
  nOnLuyenHieuLuc: number;
  nPhongThiHieuLuc: number;
  thoiGianPhut: number;
  createdAt?: string;
}

/** Khớp session.service toPublicQuestion */
export interface PublicQuestion {
  id: string;
  stem: string;
  choices: string[];
  topic: string;
  type: string;
  sourceDe?: string;
  correctIndex?: number;
  explanation?: string;
}

/** Khớp Session.answers */
export interface SessionAnswer {
  questionId: string;
  selectedIndex: number;
  isCorrect?: boolean | null;
  answeredAt?: string;
}

/** Khớp session.service serializeSession */
export interface SessionDetail {
  id: string;
  quizSetId: string;
  kind: SessionKind;
  config: { nCau: number; thoiGianPhut?: number };
  status: SessionStatus;
  startedAt: string;
  submittedAt?: string;
  expiresAt?: string;
  score?: { correct: number; total: number; percent: number };
  wrongQuestionIds?: string[];
  parentSessionId?: string;
  questionIds: string[];
  questions: PublicQuestion[];
  answers: SessionAnswer[];
}

/** Khớp session.service listSessions */
export interface SessionListItem {
  id: string;
  quizSetId: string;
  kind: SessionKind;
  config: { nCau: number; thoiGianPhut?: number };
  status: SessionStatus;
  score?: { correct: number; total: number; percent: number };
  startedAt: string;
  submittedAt?: string;
  expiresAt?: string;
  createdAt?: string;
}

/** Khớp session.service answerQuestion — practice */
export interface PracticeAnswerResult {
  questionId: string;
  selectedIndex: number;
  isCorrect: boolean;
  correctIndex: number;
  explanation: string;
  topic: string;
}

/** Khớp session.service answerQuestion — exam (không lộ đúng/sai) */
export interface ExamAnswerResult {
  questionId: string;
  selectedIndex: number;
  saved: boolean;
}

export type AnswerResult = PracticeAnswerResult | ExamAnswerResult;

export function isPracticeAnswerResult(
  res: AnswerResult,
): res is PracticeAnswerResult {
  return "isCorrect" in res;
}
