/**
 * Runnable self-check for the pure helpers shared by the lists and the TOC.
 * No test framework: `npm test`.
 */
import test from "node:test";
import assert from "node:assert/strict";
import { headingId, metaDescription, portableTextToPlainString, slugify } from "./portable-text.ts";
import { groupByCategory, toHashtag, uniqueCategories } from "./category-groups.ts";
import { smtpConfig } from "./smtp.ts";

const block = (text: string) => ({ _type: "block", children: [{ text }] });

test("smtpConfig: TLS mode follows the port, partial config is refused", () => {
  const base = {
    SMTP_HOST: "mail.example.com",
    SMTP_USER: "yo@naas.work",
    SMTP_PASSWORD: "secret",
  };

  assert.deepEqual(smtpConfig({ ...base, SMTP_PORT: "465" }), {
    host: "mail.example.com",
    port: 465,
    secure: true,
    auth: { user: "yo@naas.work", pass: "secret" },
  });

  // 587 upgrades with STARTTLS, so it must not be treated as implicit TLS.
  assert.equal(smtpConfig({ ...base, SMTP_PORT: "587" })?.secure, false);
  assert.equal(smtpConfig({ ...base, SMTP_PORT: undefined })?.port, 465);
  assert.equal(smtpConfig({ ...base, SMTP_PASSWORD: undefined }), null);
  assert.equal(smtpConfig({}), null);
});

test("headingId: the TOC link and the rendered heading agree", () => {
  assert.equal(slugify("Open Source"), "open-source");
  assert.equal(headingId("Hello, World!"), "hello-world");
  // A heading that slugifies to nothing must still get a stable, non-empty id
  // from the same text, or the Contents link points nowhere.
  assert.ok(headingId("中文标题").length > 0);
  assert.equal(headingId("中文标题"), headingId("中文标题"));
});

test("portableTextToPlainString: joins block text, skips non-text blocks", () => {
  assert.equal(portableTextToPlainString([block("one"), block("two")]), "one two");
  assert.equal(portableTextToPlainString([block("one"), { _type: "image" }]), "one");
  assert.equal(portableTextToPlainString(null), "");
  assert.equal(portableTextToPlainString([]), "");
});

test("metaDescription: trimmed to length, undefined when there is nothing", () => {
  assert.equal(metaDescription([block("short")]), "short");
  assert.equal(metaDescription(null), undefined);
  assert.equal(metaDescription([block("   ")]), undefined);
  const long = metaDescription([block("x".repeat(400))], 20);
  assert.equal(long?.length, 21);
  assert.ok(long?.endsWith("…"));
});

test("toHashtag", () => {
  assert.equal(toHashtag("Open Source"), "#opensource");
  assert.equal(toHashtag("C++ / Rust"), "#crust");
});

const items = [
  { _id: "1", name: "a", category: { _id: "c2", title: "Zeta" } },
  { _id: "2", name: "b", category: { _id: "c1", title: "Alpha" } },
  { _id: "3", name: "c", category: { _id: "c2", title: "Zeta" } },
  { _id: "4", name: "d" },
];

test("uniqueCategories: dedupes by id, sorted by title", () => {
  assert.deepEqual(
    uniqueCategories(items).map((c) => c._id),
    ["c1", "c2"]
  );
});

test("groupByCategory: sorted by title, uncategorised last, order kept inside", () => {
  const groups = groupByCategory(items);
  assert.deepEqual(
    groups.map((g) => g.category?._id ?? null),
    ["c1", "c2", null]
  );
  assert.deepEqual(
    groups[1].items.map((i) => i._id),
    ["1", "3"]
  );
});
