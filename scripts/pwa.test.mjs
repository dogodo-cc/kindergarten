import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { Window } from "happy-dom";

const root = new URL("../", import.meta.url);
const manifest = JSON.parse(
  readFileSync(new URL("public/manifest.webmanifest", root), "utf8"),
);
const pages = ["index.html", "activities.html", "growth.html"];

test("all three MPA pages advertise the same installable app and iPhone icon", () => {
  for (const page of pages) {
    const window = new Window({ url: `https://example.test/album/${page}` });
    const document = window.document;
    document.write(readFileSync(new URL(page, root), "utf8"));
    const link = document.querySelector('link[rel="manifest"]');
    assert.ok(link, `${page} must advertise the manifest`);
    assert.equal(
      new URL(link.getAttribute("href"), document.URL).pathname,
      "/album/manifest.webmanifest",
    );
    assert.equal(
      document.querySelector('meta[name="apple-mobile-web-app-capable"]')
        .content,
      "yes",
    );
    assert.equal(
      document.querySelector('meta[name="apple-mobile-web-app-title"]').content,
      manifest.short_name,
    );
    const icon = document.querySelector('link[rel="apple-touch-icon"]');
    assert.equal(icon.getAttribute("sizes"), "180x180");
    assert.ok(existsSync(new URL(`public/${icon.getAttribute("href")}`, root)));
    window.happyDOM.abort();
  }
});

test("app launch, identity and navigation scope work from the root or a nested static directory", () => {
  assert.ok(manifest.name && manifest.short_name);
  assert.equal(manifest.display, "standalone");
  assert.equal(manifest.prefer_related_applications, false);
  for (const base of [
    "https://example.test/",
    "https://example.test/albums/bin-hai/",
  ]) {
    const manifestURL = new URL("manifest.webmanifest", base);
    const scope = new URL(manifest.scope, manifestURL);
    const start = new URL(manifest.start_url, manifestURL);
    assert.equal(scope.href, base);
    assert.equal(start.href, new URL("index.html", base).href);
    assert.equal(new URL(manifest.id, start).href, base);
    for (const page of pages)
      assert.ok(new URL(page, base).href.startsWith(scope.href));
    for (const icon of manifest.icons)
      assert.ok(new URL(icon.src, manifestURL).href.startsWith(scope.href));
  }
});

test("Android and Apple install icons are real PNGs in the declared dimensions", () => {
  assert.ok(
    manifest.icons.some(
      (icon) => icon.sizes === "192x192" && icon.purpose === "any",
    ),
  );
  assert.ok(
    manifest.icons.some(
      (icon) => icon.sizes === "512x512" && icon.purpose === "any",
    ),
  );
  assert.ok(
    manifest.icons.some(
      (icon) => icon.sizes === "512x512" && icon.purpose === "maskable",
    ),
  );
  for (const icon of [
    ...manifest.icons,
    { src: "./icons/apple-touch-icon.png", sizes: "180x180" },
  ]) {
    const png = readFileSync(new URL(`public/${icon.src}`, root));
    assert.equal(png.subarray(0, 8).toString("hex"), "89504e470d0a1a0a");
    const [width, height] = icon.sizes.split("x").map(Number);
    assert.equal(png.readUInt32BE(16), width, icon.src);
    assert.equal(png.readUInt32BE(20), height, icon.src);
  }
});
