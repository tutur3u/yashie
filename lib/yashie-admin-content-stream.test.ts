import { beforeEach, expect, mock, test } from "bun:test";

let callbacks: Array<() => unknown> = [];
mock.module("next/server", () => ({ after: (callback: () => unknown) => { callbacks.push(callback); } }));
const { createYashieContentMutationStream } = await import("./yashie-admin-content-stream");
beforeEach(() => { callbacks = []; });

test("registers revalidation before returning, streams progress, and invalidates only after successful completion", async () => {
  let finish!: () => void;
  const gate = new Promise<void>((resolve) => { finish = resolve; });
  const invalidate = mock(() => undefined);
  const response = createYashieContentMutationStream({
    fallback: "Failed", onSuccess: invalidate,
    run: async (progress) => {
      progress({ label: "Saving details", percent: 24, step: "save-details" });
      await gate;
      return { item: null, items: [] };
    },
  });
  expect(callbacks).toHaveLength(1);
  const reader = response.body!.getReader();
  const initial = await reader.read();
  expect(new TextDecoder().decode(initial.value)).toContain('"type":"progress"');
  expect(invalidate).not.toHaveBeenCalled();
  finish();
  const result = await reader.read();
  expect(new TextDecoder().decode(result.value)).toContain('"type":"result"');
  expect((await reader.read()).done).toBe(true);
  expect(invalidate).not.toHaveBeenCalled();
  await callbacks[0]();
  expect(invalidate).toHaveBeenCalledTimes(1);
  expect(response.headers.get("cache-control")).toBe("no-store");
});

test("failed streamed mutations report the error without claiming successful invalidation", async () => {
  const invalidate = mock(() => undefined);
  const response = createYashieContentMutationStream({
    fallback: "Failed", onSuccess: invalidate,
    run: async () => { throw new Error("Upload failed"); },
  });
  const events = await response.text();
  expect(events).toContain('"type":"error"');
  expect(events).toContain("Upload failed");
  expect(events).not.toContain('"type":"result"');
  await callbacks[0]();
  expect(invalidate).not.toHaveBeenCalled();
});
