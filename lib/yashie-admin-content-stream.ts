import type { YashieContentMutationProgress } from "./yashie-admin-content";
import type { YashieAdminContentItem } from "./yashie-admin-content-model";

type MutationResult = {
  item: YashieAdminContentItem | null;
  items: YashieAdminContentItem[];
};

type StreamEvent =
  | (YashieContentMutationProgress & { type: "progress" })
  | {
      item: YashieAdminContentItem | null;
      items: YashieAdminContentItem[];
      label: string;
      percent: 100;
      step: "done";
      type: "result";
    }
  | {
      error: string;
      label?: string;
      percent: number;
      status: number;
      step?: string;
      type: "error";
    };

const encoder = new TextEncoder();

function encodeEvent(event: StreamEvent) {
  return encoder.encode(`${JSON.stringify(event)}\n`);
}

function readErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error && error.message.trim()
    ? error.message
    : fallback;
}

export function createYashieContentMutationStream({
  fallback,
  run,
}: {
  fallback: string;
  run: (
    onProgress: (progress: YashieContentMutationProgress) => void,
  ) => Promise<MutationResult>;
}) {
  let latestProgress: YashieContentMutationProgress | null = null;

  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: StreamEvent) => controller.enqueue(encodeEvent(event));

      try {
        const result = await run((progress) => {
          latestProgress = progress;
          send({ ...progress, type: "progress" });
        });

        send({
          item: result.item,
          items: result.items,
          label: "Saved",
          percent: 100,
          step: "done",
          type: "result",
        });
      } catch (error) {
        send({
          error: readErrorMessage(error, fallback),
          label: latestProgress?.label,
          percent: latestProgress?.percent ?? 100,
          status: 500,
          step: latestProgress?.step,
          type: "error",
        });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Cache-Control": "no-store",
      "Content-Type": "application/x-ndjson; charset=utf-8",
    },
  });
}
