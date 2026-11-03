# Newsletter design (draft)

**Status:** design only. Nothing here is built, stored or sent. The footer signup on the live site (`app/components/MockForms.tsx`) is still a mock and this change leaves it as it is.

**Files**

| File | What it is |
|---|---|
| `DESIGN.md` | This document: signup flow, data, template, cadence, sending domain, privacy notes, open questions. |
| `template.html` | Email template prototype in the site's style. Placeholder content, merge tags, no subscriber data. Open it in a browser to preview. |
| `template.txt` | Plain-text version of the same email (sent alongside the HTML). |
| `signup-states.html` | Static prototype of the footer signup states and the confirm/unsubscribe pages. No scripts, no form actions. |

**How to read the open questions.** Anything the client decides is marked with a question ID such as **(Q20)**. The IDs refer to the project's first question list (3 Nov 2026), which is kept outside this repo. Where a question is open, this document shows the proposed default as a *default*, not as a decision. Legal points are marked **[verify]**: they are working notes, not legal advice, and a lawyer must confirm them.

---

## 1. Where things stand

- **Site:** the footer signup and the contact form are mocks. Nothing is stored or sent. The site is English only, runs Vercel Analytics on every page, and has no privacy, cookie or terms page.
- **Her domain:** DNS is on Cloudflare. The apex domain has **no MX, SPF or DMARC record**, so it neither sends nor receives mail today.
- **Sending:** newsletters would go out through Tuturuuu's managed email infrastructure (Amazon SES), from a subdomain of her own domain. The platform pieces this design needs (subscriber lists, double opt-in, list-scoped unsubscribe, per-workspace sending domains, bounce and complaint handling) are planned but not built.
- **Scope** of the first version, and whether the contact form and reader login change too, is still open **(Q1, Q9)**.

## 2. Signup flow

### 2.1 Steps (double opt-in)

```
Footer form ──submit──▶ "Check your email to confirm"          (state C)
                           │  same message whether or not the address is already listed
                           ▼
                    Confirmation email ──link (48 h, single use)──▶ "You're subscribed"   (state D)
                           │                                               │
                           │ not clicked within 7 days                     ▼
                           ▼                                        Welcome email? (Q18)
                    Pending signup deleted
```

1. **Form (state A).** Email field, Subscribe button, and a consent line with an unticked checkbox and a link to the privacy notice. No name or other fields.
2. **Validation (state B).** Errors appear next to the field only after submit: an incomplete address, or the consent box not ticked.
3. **Submitted (state C).** The form is replaced with "Check your email to confirm", the masked address and a "Use a different address" link. The response is identical for new, pending and already-confirmed addresses, so the form cannot be used to find out who is subscribed.
4. **Confirmation email.** Plain and short (copy in 2.3). The link works once, for 48 hours. Nothing else is sent until the address is confirmed.
5. **Confirmed (state D).** A page on her site says "You're subscribed". An expired or reused link shows state D2 with a way to subscribe again.
6. **Welcome email:** proposed default yes, on confirmation. Client decides **(Q18)**.

`signup-states.html` shows states A to E2.

Proposed abuse controls (platform side, invisible to readers): a bot check on submit, per-IP and per-address rate limits, a hidden honeypot field, and a public site key that can only subscribe and unsubscribe, accepted only from her site's origin. A bot check such as Cloudflare Turnstile adds a third-party script, which the privacy notice would need to mention **(Q6)**.

### 2.2 Consent line (DRAFT, not approved)

> ☐ Send me InkedByYashie letters, [cadence]. I'm 16 or over and can unsubscribe at any time. [Privacy notice]

Waiting on:
- the wording and where signup appears, footer only or also elsewhere **(Q16)**;
- the cadence, which fills `[cadence]` **(Q20)**;
- whether to ask for an age confirmation, and from what age **(Q13)**;
- a published privacy notice to link to, since none exists yet **(Q6)**;
- the brand or personal name **(Q26)**.

The site keeps the exact consent text as a numbered version, and each signup records which version the person saw (see section 3).

### 2.3 Confirmation email copy (DRAFT)

```
Subject: Confirm your subscription to InkedByYashie letters

Someone, hopefully you, asked to receive InkedByYashie letters at this address.

Confirm your subscription:
{{confirm_url}}

The link works once and expires in 48 hours.

If this wasn't you, ignore this email. You won't hear from us again, and this
address is deleted within 7 days.

{{sender_name}} · {{postal_address}}
```

### 2.4 Unsubscribe

- **Every issue** has an Unsubscribe link in the footer and these headers:
  - `List-Unsubscribe: <https://…/unsubscribe?t=…>, <mailto:…>`
  - `List-Unsubscribe-Post: List-Unsubscribe=One-Click` (RFC 8058), so mail apps can show their own one-click Unsubscribe button.
- **Opening the link** (state E) shows one Unsubscribe button. There's no login and no "are you sure" survey. A button rather than an instant unsubscribe stops link-scanning security tools from unsubscribing people by accident.
- **Header one-click** (a POST) unsubscribes immediately. It is safe to repeat.
- **Scope:** it covers this list only, not every email the platform sends.
- **After unsubscribing** (state E2), a "Subscribe again" link goes back through the full double opt-in.
- **Timing:** unsubscribing takes effect at once, well inside the shortest legal and mailbox-provider deadlines noted in section 6.

## 3. Data kept

| Data | Why | Kept for (proposed default, Q32) |
|---|---|---|
| Email address and status (pending, confirmed, unsubscribed, suppressed) | To send, and to stop sending | While subscribed |
| Consent record: time, which form, consent-text version, salted IP hash | To prove consent if asked | While subscribed, then as long as proof is needed **[verify]** |
| Confirmation token (stored hashed) | Double opt-in | 48 hours, single use |
| Pending (never confirmed) signups | | Deleted after 7 days |
| Unsubscribed or bounced addresses | So they are never mailed again | Kept only as a hash on a suppression list |
| Send log: which issue went to which subscriber ID, and delivered/bounced/complained | Deliverability, and answering "why did I get this?" | Period to be agreed **(Q32)** |

**Not collected:** names, locations, open tracking pixels, click tracking or rewritten links, device fingerprints. Reports show only counts of sends, bounces and unsubscribes. Whether she wants open or click statistics is her call **(Q17, Q38)**.

**Who sees it:**
- the people she allows in her Tuturuuu workspace, which is proposed to be the same workspace as her CMS **(Q14, Q29)**;
- Tuturuuu as the processor;
- Amazon SES as a sub-processor.

**Readers' rights:** anyone can ask for an export or deletion of their data. Logs store hashes rather than addresses where they can.

## 4. Email template

### 4.1 Structure (`template.html`)

1. **Preheader:** hidden text that inbox lists show next to the subject.
2. **Masthead:** navy band with the gold ✻ mark, her name in Georgia, and the brand in tracked capitals, as in the site header. Copper rule underneath.
3. **Issue line:** "Letter No. {{issue_number}} · {{issue_date}}".
4. **Opening:** the title (serif, navy) and a short personal note.
5. **Artwork slot (optional):** delete the row if the issue has no image. The prototype uses a coloured placeholder, so it needs no image. Which site images may be reused in email is open **(Q22)**.
6. **Ornament divider** (✦ ✻ ✦).
7. **New on the site:** up to three items, each with a title, one line and a text link.
8. **Main button:** a navy button with a gold border, built from table cells so it shows without images and in Outlook.
9. **Note block (optional):** for a book, event or shop note. If it promotes something for sale, it keeps the visible "Promotion" label **(Q20)**.
10. **Sign-off:** "Always InkedByYashie" in the site's script style, falling back to Georgia.
11. **Footer:** why the reader is getting the email, Unsubscribe, Privacy notice, sender name and postal address **(Q23)**.

Whether she wants more templates (a short announcement, plain text only) is open **(Q25)**. So are who writes the copy **(Q21)** and the language, English by default to match the site **(Q24)**.

### 4.2 Palette and type (from `app/globals.css`)

| Role | Token | Hex | Contrast |
|---|---|---|---|
| Page background | `--background` | `#eed1c2` | |
| Card | `--parchment` | `#f6ddcd` | |
| Masthead and footer | `--navy` | `#0e263d` | |
| Body text | `--ink` | `#162c44` | 10.9:1 on parchment |
| Secondary text | `--ink-soft` | `#59495a` | 6.4:1 |
| Labels and links | `--copper-dark` | `#7f332f` | 6.7:1 |
| Gold on navy | `--gold` | `#d9a75b` | 7.1:1 |
| Script sign-off | `--clay` | `#a44e43` | 4.3:1, used at 24px only |
| Rules and borders | `--copper` | `#b87051` | |

**Type:** Georgia for display and body (the site's `.font-display`), and Arial for small labels. Geist isn't loaded, because web fonts are unreliable in email.

### 4.3 Email-client rules the prototype follows

- **Layout:**
  - tables only, at most 600px wide, collapsing to full width under 620px;
  - an Outlook (MSO) wrapper keeps the width fixed in Word-based Outlook.
- **CSS:**
  - inline on every element;
  - the `<style>` block holds only resets and the narrow-screen rules, so a client that strips it still shows a readable email.
- **Not used:** scripts, forms, background images, web fonts, tracking pixels.
- **Readable with images off:** the masthead and ornaments are text characters.
- **Colour scheme:** `color-scheme: light` is declared. Gmail and Outlook may still invert colours in dark mode, so check both.
- **Size:** keep each issue's HTML under about 100 KB, or Gmail clips the email. The prototype is about 13 KB.

### 4.4 Merge tags

| Tag | Content |
|---|---|
| `{{preheader}}`, `{{issue_title}}`, `{{issue_number}}`, `{{issue_date}}` | The issue's preheader, title, number and date |
| `{{item_1_url}}`, `{{item_2_url}}`, `{{cta_url}}`, `{{note_url}}` | Links to pages on her site, with no tracking parameters by default (Q17) |
| `{{site_url}}`, `{{privacy_url}}` | Her site and its privacy notice. The notice doesn't exist yet **(Q6)** |
| `{{unsubscribe_url}}` | A per-subscriber signed link, list-scoped |
| `{{sender_name}}`, `{{postal_address}}` | **(Q23, Q26)** |

### 4.5 Checks before any real send

- Render in Gmail (web, Android, iOS), Apple Mail (macOS, iOS), Outlook (Windows desktop and Outlook.com) and Yahoo, with images on and off, in light and dark mode.
- Send to internal test inboxes only.
- Read the plain-text version.
- Confirm that both unsubscribe paths work.
- Get a second person's approval for the first issue **(Q15)**.

## 5. Issue cadence options (client decides, Q20)

| Option | Fits | Watch out for |
|---|---|---|
| **Monthly** (proposed default) | A steady writing practice; predictable for readers | Needs enough material each month |
| **Seasonal or quarterly** | Slower, larger pieces of work | Readers forget they subscribed; expect more spam complaints |
| **On release only** (book, collection, event) | Few, important announcements | Long gaps; the first send after a gap needs care |
| **Every two weeks** | Very active periods | Fatigue and unsubscribes; more to write |

Any option works with a welcome email on confirmation **(Q18)**. Scheduling, automatic sends for new blog posts, and a web archive of past issues are proposed for later **(Q9, Q18)**. Whether collecting signups or sending the first issue comes first is open **(Q8)**.

For a new sending domain, the first issues go out in small batches that grow day by day. Sending stops automatically if complaints exceed 0.1% or bounces exceed 2% **(Q37)**.

## 6. Sending domain

### 6.1 Why a subdomain

Mail goes out from a **subdomain of her own domain**, for example `news.<her domain>`. It never goes out from the apex, so a sending problem can't affect her main domain. The exact name and the sender address are her choice **(Q4, Q23, Q27)**.

### 6.2 Records the subdomain needs

All records go on the subdomain. Real values come from the platform when the domain is added; the ones below are illustrative.

| Purpose | Type | Name | Value (illustrative) |
|---|---|---|---|
| DKIM (3 records) | CNAME | `<token>._domainkey.news` | `<token>.dkim.amazonses.com` |
| Return path (custom MAIL FROM) | MX | `bounce.news` | `10 feedback-smtp.<region>.amazonses.com` |
| SPF for the return path | TXT | `bounce.news` | `v=spf1 include:amazonses.com ~all` |
| DMARC | TXT | `_dmarc.news` | `v=DMARC1; p=none; rua=mailto:<reports address>` |
| Workspace ownership proof | TXT | `_tuturuuu-verify.news` | one-time token from the platform |

Notes:

- **DMARC is absent today.** There's no `_dmarc` record on the apex either, so nothing is inherited. Without the record above, the subdomain has no DMARC policy, and Gmail and Yahoo expect bulk senders to have one.
- **DMARC rollout:** start at `p=none` with reports for about two weeks, then move to `quarantine` and later `reject` once the reports are clean.
- **Alignment:** the visible From address uses the subdomain, and the DKIM signature uses the same subdomain, so DMARC passes from the first send.
- **Cloudflare:** set the DKIM CNAMEs to **DNS only** (grey cloud), not proxied.
- **Who adds the records:** she adds them in Cloudflare herself, or grants temporary access **(Q4, Q7)**.
- **Replies:** her domain has no MX record, so an address on the sending subdomain can't receive replies. Reply-To must be an inbox she already reads **(Q23)**.
- **Apex protection (optional, her call, Q27):** her apex sends no mail, so `v=spf1 -all` and a DMARC `p=reject` record on the apex would stop other people sending mail as her domain. This is outside the newsletter itself, and adding it is her decision.

### 6.3 Gates before the first real send

1. DKIM and MAIL FROM are verified.
2. The ownership token is verified.
3. The domain and the exact sender address are approved by a platform admin.
4. Bounce and complaint handling is live.
5. A security review is complete.

If DNS later changes so that a check fails, sending pauses automatically.

## 7. Privacy notes (not legal advice; every [verify] needs a lawyer)

The proposed roles are:
- **Controller:** her, for subscriber data.
- **Processor:** Tuturuuu, under short written processor terms **(Q6, Q30)**.
- **Sub-processor:** Amazon SES.

**Vietnam: Personal Data Protection Law (Law No. 91/2025/QH15) [verify]**
- **Timeline:** the law is understood to apply from 1 January 2026, with an implementing decree. Decree 13/2023/ND-CP covered the period before **[verify]**.
- **Consent:** it must be voluntary, specific and clear, and the controller must be able to prove it. Silence or a pre-ticked box doesn't count. People can withdraw it as easily as they gave it **[verify]**. The design responds with an unticked box, a stored consent version and one-click unsubscribe.
- **Marketing:** using personal data for advertising or marketing needs the person's consent, and they must be able to refuse **[verify]**.
- **Readers' rights:** to be informed, access, correct, delete, restrict and object **[verify]**. The design responds with export and deletion on request (section 3).
- **Processor contract:** controllers and processors need a written contract **[verify]** **(Q30)**.
- **Cross-border transfers:** if data is stored or processed outside Vietnam, or sent abroad (for example to an AWS region abroad), a transfer impact assessment may be needed and filed with the authority **[verify]** **(Q31)**.
- **Breach:** the authority may have to be notified within 72 hours **[verify]**. How and when she's told is open **(Q33)**.
- **Anti-spam:** Decree 91/2020/ND-CP on spam messages and emails covers prior consent for advertising email, the opt-out, how fast an opt-out must be honoured, and labelling **[verify]**.

**Other markets** apply if subscribers live there; where her readers live is open **(Q3)**:
- **EU and UK:** GDPR, ePrivacy and PECR. Consent must be provable **[verify]**.
- **US:** CAN-SPAM requires a postal address in every email and opt-outs honoured within 10 business days **[verify]**.
- **Canada:** CASL requires express consent, sender identification and an unsubscribe **[verify]**.

**Mailbox providers:** Gmail's and Yahoo's bulk-sender rules ask for SPF and DKIM, DMARC, one-click unsubscribe honoured within 2 days, and a spam rate under 0.3%.

**On the site, before a real form goes live:**
- **Privacy notice:** it needs to cover the newsletter, the processors, retention, readers' rights and contact details, and also Vercel Analytics, which already runs today **(Q6, Q34)**.
- **Placement:** footer and site pages; the consent line links to it **(Q16)**.

## 8. Open questions this design depends on

| ID | Question (short) | Blocks |
|---|---|---|
| Q1, Q9 | Scope: newsletter only? Which first-version features? | Everything |
| Q2, Q15 | Who approves sends; second approval for the first issue | Send flow |
| Q3, Q13 | Where she and her readers are based; minimum age | Section 7, consent line |
| Q4, Q7, Q27 | Who controls DNS and accounts; subdomain name; apex mail | Section 6 |
| Q5 | Starting list size; any existing list to import | Warm-up, consent proof |
| Q6, Q30, Q34 | Privacy notice, processor terms, Vercel Analytics | Real signup form |
| Q8 | Signups first, or first issue first | Order of work |
| Q10 | One list or several | Data model, unsubscribe scope |
| Q14, Q29 | Who uses the tool; which workspace | Access |
| Q16 | Consent wording and signup placement | Section 2.2 |
| Q17, Q38 | Statistics wanted | Tracking (off by default) |
| Q18 | Welcome email; archive; automatic sends | Section 2.1, section 5 |
| Q20 | Kind and cadence of letters | Section 5, consent line |
| Q21, Q22, Q24, Q25 | Copy, image reuse, language, templates | Section 4 |
| Q23, Q26 | Sender name, reply-to, postal address; brand or personal name | Template footer, headers |
| Q31, Q32, Q33 | Cross-border region, retention, breach notice | Sections 3 and 7 |
| Q37 | What success looks like | Thresholds, reports |
