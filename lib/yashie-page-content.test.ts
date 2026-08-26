import { describe, expect, test } from "bun:test";
import {
  DEFAULT_YASHIE_PAGE_CONTENT,
  readYashiePageContent,
} from "./yashie-page-content";

describe("Yashie page content", () => {
  test("merges saved page copy with defaults", () => {
    const pages = readYashiePageContent({
      shop: {
        feature: {
          description: "A saved shelf story.",
          label: "Shelf notes",
          title: "Made for readers",
        },
        highlightLabel: "Collection",
        highlights: ["Signed editions", "Desk goods"],
        intro: {
          description: "A saved shop introduction.",
          title: "The shop",
        },
        listing: {
          description: "Only items available now.",
          label: "In stock",
          title: "Current shelf",
        },
      },
    });

    expect(pages.shop).toEqual({
      feature: {
        description: "A saved shelf story.",
        label: "Shelf notes",
        title: "Made for readers",
      },
      highlightLabel: "Collection",
      highlights: ["Signed editions", "Desk goods"],
      intro: {
        description: "A saved shop introduction.",
        title: "The shop",
      },
      listing: {
        description: "Only items available now.",
        label: "In stock",
        title: "Current shelf",
      },
    });
    expect(pages.blog).toEqual(DEFAULT_YASHIE_PAGE_CONTENT.blog);
  });

  test("preserves an intentionally empty small-card list", () => {
    const pages = readYashiePageContent({
      shop: { highlights: [] },
    });

    expect(pages.shop.highlights).toEqual([]);
  });
});
