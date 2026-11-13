import type { ApiSuccess, DocumentItem } from "@/@types/api";
import { api } from "./client";

export async function uploadDocument(file: File): Promise<DocumentItem> {
  const form = new FormData();
  form.append("file", file); // field name khớp multer .single("file")
  const { data } = await api.post<ApiSuccess<DocumentItem>>(
    "/documents/upload",
    form,
  );
  return data.data;
}

/** Upload nhiều PDF/DOCX — field `files` khớp multer.array. */
export async function uploadDocuments(
  files: File[],
): Promise<DocumentItem[]> {
  if (files.length === 0) return [];
  if (files.length === 1) {
    const one = await uploadDocument(files[0]);
    return [one];
  }
  const form = new FormData();
  for (const file of files) {
    form.append("files", file);
  }
  const { data } = await api.post<ApiSuccess<DocumentItem[]>>(
    "/documents/upload-many",
    form,
  );
  return data.data ?? [];
}

export async function listDocuments(): Promise<DocumentItem[]> {
  const { data } = await api.get<ApiSuccess<DocumentItem[]>>("/documents");
  return data.data ?? [];
}

export async function getDocument(id: string): Promise<DocumentItem> {
  const { data } = await api.get<ApiSuccess<DocumentItem>>(`/documents/${id}`);
  return data.data;
}

export async function deleteDocument(
  id: string,
): Promise<{ deleted: boolean; deletedQuizSets?: number }> {
  const { data } = await api.delete<
    ApiSuccess<{ deleted: boolean; deletedQuizSets?: number }>
  >(`/documents/${id}`);
  return data.data;
}
