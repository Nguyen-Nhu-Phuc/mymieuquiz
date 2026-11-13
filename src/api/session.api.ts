import type {
  AnswerResult,
  ApiSuccess,
  SessionDetail,
  SessionKind,
  SessionListItem,
} from "@/@types/api";
import { api } from "./client";

/** Khớp createSessionSchema */
export async function createSession(input: {
  quizSetId: string;
  kind: SessionKind;
  nCau?: number;
  thoiGianPhut?: number;
}): Promise<SessionDetail> {
  const { data } = await api.post<ApiSuccess<SessionDetail>>("/sessions", input);
  return data.data;
}

export async function getSession(id: string): Promise<SessionDetail> {
  const { data } = await api.get<ApiSuccess<SessionDetail>>(`/sessions/${id}`);
  return data.data;
}

export async function listSessions(): Promise<SessionListItem[]> {
  const { data } = await api.get<ApiSuccess<SessionListItem[]>>("/sessions");
  return data.data;
}

/** Khớp answerSchema: { questionId, selectedIndex 0..3 } */
export async function answerQuestion(
  sessionId: string,
  input: { questionId: string; selectedIndex: number },
): Promise<AnswerResult> {
  const { data } = await api.post<ApiSuccess<AnswerResult>>(
    `/sessions/${sessionId}/answer`,
    {
      questionId: input.questionId,
      selectedIndex: input.selectedIndex,
    },
  );
  return data.data;
}

export async function submitSession(sessionId: string): Promise<SessionDetail> {
  const { data } = await api.post<ApiSuccess<SessionDetail>>(
    `/sessions/${sessionId}/submit`,
  );
  return data.data;
}

export async function retryWrong(sessionId: string): Promise<SessionDetail> {
  const { data } = await api.post<ApiSuccess<SessionDetail>>(
    `/sessions/${sessionId}/retry-wrong`,
  );
  return data.data;
}

export async function redoSession(sessionId: string): Promise<SessionDetail> {
  const { data } = await api.post<ApiSuccess<SessionDetail>>(
    `/sessions/${sessionId}/redo`,
  );
  return data.data;
}
