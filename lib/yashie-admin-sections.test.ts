import { describe, expect, test } from "bun:test";
import {
  getYashieAdminSectionHref,
  isYashieAdminSection,
  isYashieAdminStudioSection,
} from "./yashie-admin-sections";

describe("Yashie admin sections", () => {
  test("accepts only registered section slugs", () => {
    expect(isYashieAdminSection("blog")).toBe(true);
    expect(isYashieAdminSection("storage")).toBe(true);
    expect(isYashieAdminSection("unknown")).toBe(false);
    expect(isYashieAdminSection(null)).toBe(false);
  });

  test("identifies routes that need the CMS studio snapshot", () => {
    expect(isYashieAdminStudioSection("worlds")).toBe(true);
    expect(isYashieAdminStudioSection("profile")).toBe(true);
    expect(isYashieAdminStudioSection("storage")).toBe(false);
    expect(isYashieAdminStudioSection("account")).toBe(false);
  });

  test("builds canonical section URLs", () => {
    expect(getYashieAdminSectionHref("members")).toBe("/admin/members");
  });
});
