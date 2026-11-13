"use client";

import { InboxOutlined } from "@ant-design/icons";
import { Upload } from "antd";
import { appMessage as message } from "@/lib/appMessage";
import type { UploadFile, UploadProps } from "antd";

const { Dragger } = Upload;

const MAX_FILES = 10;

function isAllowed(file: File) {
  const name = file.name.toLowerCase();
  return name.endsWith(".pdf") || name.endsWith(".docx");
}

export function UploadDropzone({
  files,
  onFiles,
  disabled,
}: {
  files: File[];
  onFiles: (files: File[]) => void;
  disabled?: boolean;
}) {
  const fileList: UploadFile[] = files.map((f, i) => ({
    uid: `${f.name}-${f.size}-${f.lastModified}-${i}`,
    name: f.name,
    status: "done",
    size: f.size,
    originFileObj: f as UploadFile["originFileObj"],
  }));

  const props: UploadProps = {
    multiple: true,
    maxCount: MAX_FILES,
    accept:
      ".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    beforeUpload: (file) => {
      if (!isAllowed(file)) {
        message.error(`Chỉ chấp nhận PDF hoặc DOCX: ${file.name}`);
        return Upload.LIST_IGNORE;
      }
      return false;
    },
    onChange: (info) => {
      const next: File[] = [];
      const seen = new Set<string>();
      for (const item of info.fileList) {
        const f = item.originFileObj as File | undefined;
        if (!f || !isAllowed(f)) continue;
        const key = `${f.name}-${f.size}-${f.lastModified}`;
        if (seen.has(key)) continue;
        seen.add(key);
        next.push(f);
      }
      onFiles(next.slice(0, MAX_FILES));
    },
    fileList,
    disabled,
    className: "upload-dropzone",
  };

  return (
    <Dragger {...props}>
      <p className="ant-upload-drag-icon">
        <InboxOutlined />
      </p>
      <p className="ant-upload-text">Kéo thả hoặc chọn file PDF / DOCX</p>
      <p className="ant-upload-hint">
        Tối đa {MAX_FILES} file · gộp thành một ngân hàng câu hỏi
      </p>
    </Dragger>
  );
}
