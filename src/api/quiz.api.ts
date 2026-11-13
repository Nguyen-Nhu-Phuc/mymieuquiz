import type { ApiSuccess, QuizSummary } from "@/@types/api";
import { API_TIMEOUT_MS, api } from "./client";

/** Khớp generateQuizSchema backend — 1 hoặc nhiều tài liệu. */
export async function generateQuiz(input: {
  documentId?: string;
  documentIds?: string[];
  title?: string;
  nOnLuyen?: number;
  nPhongThi?: number;
  thoiGianPhut?: number;
  /** Số câu unique muốn có trong ngân hàng. */
  nNganHang?: number;
}): Promise<QuizSummary> {
  const documentIds =
    input.documentIds?.filter(Boolean) ??
    (input.documentId ? [input.documentId] : []);

  const payload = {
    documentId: documentIds[0],
    documentIds,
    title: input.title?.trim() ? input.title.trim() : undefined,
    nOnLuyen: input.nOnLuyen,
    nPhongThi: input.nPhongThi,
    thoiGianPhut: input.thoiGianPhut,
    nNganHang: input.nNganHang,
  };

  const { data } = await api.post<ApiSuccess<QuizSummary>>(
    "/quizzes/generate",
    payload,
    { timeout: API_TIMEOUT_MS },
  );
  return data.data;
}

export async function listQuizzes(): Promise<QuizSummary[]> {
  const { data } = await api.get<ApiSuccess<QuizSummary[]>>("/quizzes");
  return data.data;
}

export async function getQuizSummary(id: string): Promise<QuizSummary> {
  const { data } = await api.get<ApiSuccess<QuizSummary>>(
    `/quizzes/${id}/summary`,
  );
  return data.data;
}

export async function deleteQuiz(
  id: string,
): Promise<{ deleted: boolean; deletedSessions?: number }> {
  const { data } = await api.delete<
    ApiSuccess<{ deleted: boolean; deletedSessions?: number }>
  >(`/quizzes/${id}`);
  return data.data;
}

/**
 * GET /quizzes/:id — bank công khai (không có correctIndex/explanation).
 * Đáp án chỉ lộ qua session practice / sau submit.
 */
export async function getQuizBank(id: string): Promise<
  QuizSummary & {
    questionBank: Array<{
      id: string;
      stem: string;
      choices: string[];
      topic: string;
      type: string;
      sourceDe?: string;
    }>;
  }
> {
  const { data } = await api.get<
    ApiSuccess<
      QuizSummary & {
        questionBank: Array<{
          id: string;
          stem: string;
          choices: string[];
          topic: string;
          type: string;
          sourceDe?: string;
        }>;
      }
    >
  >(`/quizzes/${id}`);
  return data.data;
}
