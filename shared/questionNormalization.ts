import { z } from "zod";
import { questionSchema, type Question } from "./schema";

// Media-like types we want to coerce and validate consistently
const MEDIA_TYPES = new Set<Question["type"]>([
  "image_choice",
  "file_upload",
  "signature",
  "video",
  "audio_capture",
]);

function coerceArray(value: unknown): string[] | undefined {
  if (typeof value === "string") {
    return value
      .split(/[,;]+/)
      .map((v) => v.trim())
      .filter(Boolean);
  }
  if (Array.isArray(value)) {
    return value
      .map((v) => (typeof v === "string" ? v.trim() : ""))
      .filter(Boolean);
  }
  return undefined;
}

function prepareQuestion(raw: unknown): unknown {
  if (!raw || typeof raw !== "object") return raw;
  const q = { ...(raw as Record<string, unknown>) };

  // Align builder field naming to schema
  if (!q.question && typeof q.text === "string") {
    q.question = q.text;
  }

  if (q.type === "file_upload") {
    const allowedTypes = coerceArray((q as any).allowedTypes ?? (q as any).allowedFileTypes ?? (q as any).fileTypes);
    if (allowedTypes?.length) {
      (q as any).allowedTypes = allowedTypes;
    } else {
      (q as any).allowedTypes = ["pdf", "doc", "docx", "jpg", "png"];
    }

    const maxFileSize = (q as any).maxFileSize ?? (q as any).maxSizeMB ?? (q as any).maxSize;
    (q as any).maxFileSize = typeof maxFileSize === "string" ? Number(maxFileSize) : maxFileSize ?? 10;

    const maxFiles = (q as any).maxFiles ?? (q as any).maxUploads ?? (q as any).maxAttachments;
    (q as any).maxFiles = typeof maxFiles === "string" ? Number(maxFiles) : maxFiles ?? 1;
  }

  if (q.type === "image_choice") {
    (q as any).selectionType = (q as any).selectionType || "single";
    (q as any).imageSize = (q as any).imageSize || "medium";
    (q as any).columns = (q as any).columns ?? 2;
    (q as any).showLabels = (q as any).showLabels ?? true;

    const imageOptions = (q as any).imageOptions;
    if (!imageOptions && Array.isArray((q as any).optionImages) && Array.isArray((q as any).options)) {
      (q as any).imageOptions = (q as any).optionImages
        .map((img: unknown, idx: number) => ({
          imageUrl: typeof img === "string" ? img : "",
          label: (q as any).options?.[idx],
          value: (q as any).options?.[idx],
        }))
        .filter((opt: any) => !!opt.imageUrl);
    }
  }

  if (q.type === "video") {
    (q as any).videoUrl = (q as any).videoUrl || (q as any).url || (q as any).mediaUrl;
  }

  if (q.type === "audio_capture") {
    const duration = (q as any).maxDuration ?? (q as any).duration ?? (q as any).durationSeconds;
    (q as any).maxDuration = typeof duration === "string" ? Number(duration) : duration ?? 60;
  }

  if (q.required === undefined) {
    q.required = false;
  }

  return q;
}

export function normalizeQuestion(raw: unknown): Question {
  const prepared = prepareQuestion(raw);
  const parsed = questionSchema.safeParse(prepared);
  if (!parsed.success) {
    const label = typeof (prepared as any)?.id === "string" ? (prepared as any).id : "<unknown id>";
    const details = parsed.error.issues
      .map((issue) => `${issue.path.join(".") || "<root>"}: ${issue.message}`)
      .join("; ");
    throw new Error(`Invalid question ${label}: ${details}`);
  }

  return parsed.data;
}

export function normalizeQuestions(rawQuestions: unknown[]): Question[] {
  return (rawQuestions || []).map(normalizeQuestion);
}

export function validateQuestion(raw: unknown): {
  success: boolean;
  data?: Question;
  issues?: z.ZodIssue[];
  prepared: unknown;
  isMediaType: boolean;
} {
  const prepared = prepareQuestion(raw);
  const parsed = questionSchema.safeParse(prepared);
  return {
    success: parsed.success,
    data: parsed.success ? parsed.data : undefined,
    issues: parsed.success ? undefined : parsed.error.issues,
    prepared,
    isMediaType: MEDIA_TYPES.has((parsed.success ? parsed.data.type : (prepared as any)?.type) as Question["type"]),
  };
}
