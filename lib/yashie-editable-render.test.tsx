import { describe, expect, mock, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { DEFAULT_YASHIE_CONTENT } from "./yashie-content";
import { readYashiePageContent, YASHIE_PAGE_KEYS } from "./yashie-page-content";

const content = structuredClone(DEFAULT_YASHIE_CONTENT);
content.navigationTabs.forEach((tab) => { tab.visible = true; });
content.author.title = "Edited public title";
content.author.tagline = "Edited introduction line";
content.author.location = "Edited location";
content.profileFacts = ["Complete multi word interest", "Second full interest", "Third", "Fourth", "Fifth", "Sixth interest"];
content.pageContent = readYashiePageContent(Object.fromEntries(YASHIE_PAGE_KEYS.map((key) => [key, {
  intro: { title: `${key} introduction title`, description: `${key} introduction description` },
  listing: { label: `${key} listing label`, title: `${key} listing title`, description: `${key} listing description` },
  feature: { label: `${key} feature label`, title: `${key} feature title`, description: `${key} feature description` },
  highlightLabel: `${key} card caption`, highlights: [`${key} first card`, `${key} second card`],
}])));
mock.module("./yashie-delivery", () => ({ getYashieContent: async () => content }));
mock.module("./yashie-navigation-access", () => ({
  canAccessYashieNavTab: async () => true,
  getVisibleYashieNavTabs: () => new Set(["home", "blog", "gallery", "shop", "contact", "about"]),
}));
const Home = (await import("../app/page")).default;
const Blog = (await import("../app/blog/page")).default;
const Gallery = (await import("../app/gallery/page")).default;
const Shop = (await import("../app/shop/page")).default;
const Contact = (await import("../app/contact/page")).default;
const { SiteFooter } = await import("../app/components/SiteFooter");
const { SmartImage } = await import("../app/components/SmartImage");

describe("editable public output", () => {
  for (const [key, page] of [["home", Home], ["blog", Blog], ["gallery", Gallery], ["shop", Shop], ["contact", Contact]] as const) {
    test(`${key}: every editable page field reaches rendered output`, async () => {
      const html = renderToStaticMarkup(await page());
      const copy = content.pageContent[key];
      const fields = [...Object.values(copy.intro), ...Object.values(copy.listing), ...Object.values(copy.feature)];
      if (key !== "gallery") fields.push(copy.highlightLabel, ...copy.highlights);
      for (const field of fields) expect(html.includes(field)).toBe(true);
    });
  }
  test("footer labels and location reach rendered output", () => {
    const html = renderToStaticMarkup(<SiteFooter {...content} page={content.pageContent.footer} />);
    const copy = content.pageContent.footer;
    for (const field of [...Object.values(copy.intro), ...Object.values(copy.listing), ...Object.values(copy.feature), content.author.location]) expect(html.includes(field)).toBe(true);
  });
  test("profile title, introduction and complete interest list are visible", async () => {
    const html = renderToStaticMarkup(await Home());
    for (const field of [content.author.title, content.author.tagline, ...content.profileFacts]) expect(html.includes(field)).toBe(true);
  });
  for (const [key, items] of [["blog", content.blogPosts], ["worlds", content.worlds], ["gallery", content.galleryItems], ["shop", content.products]] as const) {
    test(`${key}: edited detail fields, slug links, alt text and crop reach rendered output`, async () => {
      const item = items[0];
      Object.assign(item, { title: `${key} edited item`, slug: `${key}-edited-slug`, image: "https://example.com/edited-cover.png",
        imageAlt: `${key} edited cover alt`, imagePosition: "80% 70%", description: `${key} edited description`,
        excerpt: `${key} edited excerpt`, body: `${key} edited body`, detail: `${key} edited detail`,
        date: `${key} edited date`, readTime: `${key} edited read time`, category: `${key} edited category`,
        type: `${key} edited type`, kicker: `${key} edited kicker`, price: "$99" });
      const Page = (await import(`../app/${key}/[slug]/page`)).default;
      const html = renderToStaticMarkup(await Page({ params: Promise.resolve({ slug: item.slug }) }));
      for (const field of [item.title, item.imageAlt, "object-position:80% 70%", "https://example.com/edited-cover.png"]) expect(html.includes(field)).toBe(true);
      const fields = key === "blog" ? ["edited excerpt", "edited body", "edited date", "edited read time", "edited category"]
        : key === "worlds" ? ["edited description", "edited detail", "edited kicker"] : key === "gallery" ? ["edited description", "edited type"] : ["edited description", "$99"];
      for (const field of fields) expect(html.includes(field)).toBe(true);
    });
  }
  test("removed images produce no image or inherited cover", () => {
    expect(renderToStaticMarkup(<SmartImage src="" alt="Removed cover" width={400} height={300} />)).toBe("");
  });
});
