import { z } from "zod";
import { createWorker } from "tesseract.js";
import path from "path";

export const runtime = "nodejs";
const tesseractWorkerPath = path.resolve(
  process.cwd(),
  "node_modules",
  "tesseract.js",
  "src",
  "worker-script",
  "node",
  "index.js"
);

type OcrWorker = Awaited<ReturnType<typeof createWorker>>;

const globalForOcr = globalThis as typeof globalThis & {
  ocrWorkerPromise?: Promise<OcrWorker>;
  ocrWorkerLanguage?: string;
  ocrQueue?: Promise<void>;
};

async function getOcrWorker(language: string) {
  if (
    !globalForOcr.ocrWorkerPromise ||
    globalForOcr.ocrWorkerLanguage !== language
  ) {
    globalForOcr.ocrWorkerPromise = createWorker(language, undefined, {
      workerPath: tesseractWorkerPath,
    });
    globalForOcr.ocrWorkerLanguage = language;
    globalForOcr.ocrQueue = Promise.resolve();
  }

  return globalForOcr.ocrWorkerPromise;
}

export async function POST(req: Request) {
  const form = await req.formData().catch(() => null);
  if (!form) return Response.json({ error: "Invalid form data" }, { status: 400 });

  const file = form.get("file");
  if (!(file instanceof File)) {
    return Response.json({ error: "Missing file" }, { status: 400 });
  }

  const lang = z.string().min(2).max(10).optional().safeParse(form.get("lang"));
  const language = lang.success ? (lang.data ?? "eng") : "eng";

  const ab = await file.arrayBuffer();
  const buf = Buffer.from(ab);

  const worker = await getOcrWorker(language);
  const previousRun = globalForOcr.ocrQueue ?? Promise.resolve();

  let releaseQueue: (() => void) | undefined;
  globalForOcr.ocrQueue = new Promise<void>((resolve) => {
    releaseQueue = resolve;
  });

  await previousRun;

  try {
    const result = await worker.recognize(buf);
    const text = result.data.text ?? "";
    return Response.json({ ok: true, text });
  } finally {
    releaseQueue?.();
  }
}

