import { readFileSync, existsSync } from "node:fs";
import assert from "node:assert/strict";
const root = new URL("../", import.meta.url),
  data = JSON.parse(
    readFileSync(new URL("public/data/site.json", root), "utf8"),
  );
const colors = ["coral", "yellow", "green", "blue", "purple", "orange"];
const planets = [
  "orange-planet",
  "saturn",
  "blue-planet",
  "moon",
  "earth",
  "galaxy",
];
const ids = new Set();
let photoCount = 0;
function photo(p) {
  assert.ok(
    p.src && p.alt && p.caption,
    "Each photo needs src, alt and caption",
  );
  assert.match(p.src, /^\.\/images\/[\w.-]+\.(jpg|jpeg|png|webp)$/i);
  assert.ok(
    existsSync(new URL("public/" + p.src.slice(2), root)),
    `Missing photo: ${p.src}`,
  );
  photoCount++;
}
for (const key of ["activities", "growth"]) {
  assert.ok(Array.isArray(data[key]), `${key} must be an array`);
  for (const item of data[key]) {
    assert.match(item.id, /^[a-zA-Z][\w-]*$/);
    assert.ok(!ids.has(item.id), `Duplicate ID: ${item.id}`);
    ids.add(item.id);
    assert.match(item.date, /^\d{4}-\d{2}-\d{2}$/);
    assert.equal(new Date(item.date).toISOString().slice(0, 10), item.date);
    assert.ok(item.title && colors.includes(item.color));
    assert.ok(Array.isArray(item.photos) && item.photos.length > 0);
    item.photos.forEach(photo);
    if (key === "growth") {
      assert.ok(planets.includes(item.planet));
      assert.ok(
        item.skills.length &&
          item.skills.every((s) => typeof s === "string" && s),
      );
      assert.ok(item.change);
    } else
      assert.ok(
        item.summary === undefined || typeof item.summary === "string",
        "Activity summary is optional",
      );
  }
}
photo(data.home.heroPhoto);
data.home.dailyPhotos.forEach(photo);
for (const [preview, collection] of [
  ["previewActivityIds", "activities"],
  ["previewGrowthIds", "growth"],
])
  for (const id of data.home[preview])
    assert.ok(
      data[collection].some((i) => i.id === id),
      `Unknown preview: ${id}`,
    );
assert.equal(data.home.growthLabels.length, data.home.previewGrowthIds.length);
for (const n of data.site.navigation)
  assert.ok(existsSync(new URL(n.href, root)), `Missing page: ${n.href}`);
for (const file of [
  "illustrations/stickers.png",
  "illustrations/brush-mask.svg",
  "illustrations/waves.svg",
  "illustrations/hills.svg",
  "illustrations/paper.svg",
  "fonts/ZCOOLKuaiLe-Regular.ttf",
])
  assert.ok(
    existsSync(new URL("public/" + file, root)),
    `Missing asset: ${file}`,
  );
console.log(
  `Validated ${data.activities.length} activities, ${data.growth.length} growth stages, ${photoCount} photo references and all three MPA entries.`,
);
