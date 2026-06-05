import { describe, expect, test } from "bun:test";
import { YASHIE_ADMIN_COPY } from "./yashie-admin-copy";

const bannedWords = [
  "asset",
  "collection",
  "cms",
  "entry",
  "manifest",
  "payload",
  "sync",
  "tuturuuu",
  "workspace",
];

function flattenCopy(value: unknown): string[] {
  if (typeof value === "string") return [value];
  if (Array.isArray(value)) return value.flatMap(flattenCopy);
  if (value && typeof value === "object") {
    return Object.values(value).flatMap(flattenCopy);
  }
  return [];
}

describe("Yashie admin copy", () => {
  test("keeps visible dashboard labels friendly and non-technical", () => {
    const renderedCopy = flattenCopy(YASHIE_ADMIN_COPY).join("\n").toLowerCase();

    for (const word of bannedWords) {
      expect(renderedCopy).not.toContain(word);
    }
  });
});
