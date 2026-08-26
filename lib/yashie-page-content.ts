export const YASHIE_PAGE_KEYS = [
  "home",
  "blog",
  "gallery",
  "shop",
  "contact",
  "footer",
] as const;

export type YashiePageKey = (typeof YASHIE_PAGE_KEYS)[number];

export type YashiePageSectionCopy = {
  description: string;
  label: string;
  title: string;
};

export type YashieEditablePageContent = {
  feature: YashiePageSectionCopy;
  highlightLabel: string;
  highlights: string[];
  intro: Pick<YashiePageSectionCopy, "description" | "title">;
  listing: YashiePageSectionCopy;
};

export type YashiePageContent = Record<
  YashiePageKey,
  YashieEditablePageContent
>;

export const DEFAULT_YASHIE_PAGE_CONTENT: YashiePageContent = {
  home: {
    feature: {
      description:
        "I'm Yashie: Yashoda U. Itwaru. I write essays, reflections, books, stories, poetry, blog posts, and personal writings. I'm drawn to the beauty in everyday moments and the stories we carry within. Writing helps me connect, heal, express, and leave behind pieces of truth for the future.",
      label: "Writing, reading, journaling, traveling, nature, and tea",
      title: "About Me",
    },
    highlightLabel: "Creative identity",
    highlights: ["Writer", "Author", "Storyteller"],
    intro: {
      description:
        "I write a lot: essays, reflections, books, stories, poetry, blog posts, and personal writings. Through words, I explore life, memory, identity, emotion, and everything in between.",
      title: "Namaste, I'm Yashie",
    },
    listing: {
      description:
        "Step into the themes, forms, and stories that shape my writing.",
      label: "Essays, books, poetry, posts",
      title: "Explore My Worlds",
    },
  },
  blog: {
    feature: {
      description:
        "Blog posts can hold craft notes, reading lists, cultural reflections, short poetry, publication news, and the behind-the-scenes work of building a dark fantasy world.",
      label: "Editorial direction",
      title: "The page as a place to remember",
    },
    highlightLabel: "Writing lane",
    highlights: ["Memory", "Identity", "Hindu-inspired fantasy", "AI ethics"],
    intro: {
      description:
        "Essays, poems, reading notes, cultural reflections, and personal updates from Yashie's notebook.",
      title: "Blog & Reflections",
    },
    listing: {
      description:
        "A living notebook for culture, writing, memory, books, and personal updates.",
      label: "Latest posts",
      title: "Essays, poems, and notes",
    },
  },
  gallery: {
    feature: {
      description:
        "The portfolio treats each genre and format as a doorway into Yashie's larger world.",
      label: "Recurring rooms",
      title: "Writing Modes",
    },
    highlightLabel: "",
    highlights: [],
    intro: {
      description:
        "A shelf of covers, journals, and writing-world fragments for the InkedByYashie portfolio.",
      title: "Gallery",
    },
    listing: {
      description:
        "A shelf of covers, journals, and writing-world fragments for the InkedByYashie portfolio.",
      label: "Books and keepsakes",
      title: "The Book World Shelf",
    },
  },
  shop: {
    feature: {
      description:
        "The shop leans into clothbound textures, peacock ornament, botanical print work, and practical writer desk objects.",
      label: "Behind the shelf",
      title: "Bookish, soft, and sharp",
    },
    highlightLabel: "Shop theme",
    highlights: ["Signed", "Printed", "Carried"],
    intro: {
      description:
        "Books, prints, stationery, bookmarks, and merch from the InkedByYashie shelf.",
      title: "From My Desk to Yours",
    },
    listing: {
      description:
        "Books, prints, stationery, bookmarks, and desk treasures from the InkedByYashie world.",
      label: "Available now",
      title: "Shop the shelf",
    },
  },
  contact: {
    feature: {
      description:
        "This page keeps the boundary clear while making the route feel like part of the same book-world system.",
      label: "Respect first",
      title: "Open to DMs, so long as everyone is respectful.",
    },
    highlightLabel: "Conversation",
    highlights: ["Writing", "Collaborations", "Community"],
    intro: {
      description:
        "Reach out for respectful conversation, community, writing updates, collaborations, and future reader opportunities.",
      title: "Contact",
    },
    listing: {
      description:
        "Most links use the public handle or the InkedByYashie brand.",
      label: "Social shelf",
      title: "Find Yashie",
    },
  },
  footer: {
    feature: {
      description: "Made with care by sokora from Tuturuuu.",
      label: "Signature",
      title: "Always InkedByYashie",
    },
    highlightLabel: "Newsletter",
    highlights: [],
    intro: {
      description:
        "Get essays, poems, stories, and update notes straight to your inbox.",
      title: "Stay in the Loop",
    },
    listing: {
      description: "A quiet promise for every letter.",
      label: "Inbox note",
      title: "No spam, just soulful letters.",
    },
  },
};

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function readString(value: unknown, fallback: string) {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function readSection(
  value: unknown,
  fallback: YashiePageSectionCopy,
): YashiePageSectionCopy {
  const record = asRecord(value);

  return {
    description: readString(record.description, fallback.description),
    label: readString(record.label, fallback.label),
    title: readString(record.title, fallback.title),
  };
}

export function readYashiePageContent(value: unknown): YashiePageContent {
  const record = asRecord(value);

  return Object.fromEntries(
    YASHIE_PAGE_KEYS.map((key) => {
      const fallback = DEFAULT_YASHIE_PAGE_CONTENT[key];
      const page = asRecord(record[key]);
      const intro = asRecord(page.intro);
      const highlights = Array.isArray(page.highlights)
        ? page.highlights
            .filter((item): item is string => typeof item === "string")
            .map((item) => item.trim())
            .filter(Boolean)
        : fallback.highlights;

      return [
        key,
        {
          feature: readSection(page.feature, fallback.feature),
          highlightLabel: readString(
            page.highlightLabel,
            fallback.highlightLabel,
          ),
          highlights,
          intro: {
            description: readString(
              intro.description,
              fallback.intro.description,
            ),
            title: readString(intro.title, fallback.intro.title),
          },
          listing: readSection(page.listing, fallback.listing),
        },
      ];
    }),
  ) as YashiePageContent;
}
