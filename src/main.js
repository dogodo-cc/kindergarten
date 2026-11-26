import "./style.css";
import "./components/crayon-art.js";
import "./components/site-shell.js";
import "./components/photo-stack.js";
import { escapeHTML as e } from "./utils.js";
const page = document.body.dataset.page,
  main = document.querySelector("main");
const art = (name, cls = "") =>
  `<crayon-art name="${e(name)}" class="${cls}"></crayon-art>`;
let data;
const memories = new Map();
function stack(key, photos, variant = "") {
  memories.set(key, { photos, ui: data.ui, variant });
  return `<photo-stack data-memory="${key}"></photo-stack>`;
}
let timelineObserver;
function hydrate() {
  main
    .querySelectorAll("photo-stack")
    .forEach((el) => (el.data = memories.get(el.dataset.memory)));
  observeTimeline();
}
// Derive the river from the actual row positions, including wrapped text and responsive layouts.
function observeTimeline() {
  timelineObserver?.disconnect();
  const timeline = main.querySelector(".activity-timeline,.growth-timeline");
  if (!timeline) return;
  const svg = timeline.querySelector(".river");
  const rows = [...timeline.querySelectorAll(".activity-row,.growth-row")];
  if (!rows.length) return;
  const update = () => {
    if (!svg.isConnected) return;
    const rect = svg.getBoundingClientRect(),
      height = timeline.offsetHeight;
    if (!rect.width || !height) return;
    const points = rows.map((row) => {
      const marker = row
        .querySelector(".river-node,.stage-planet")
        .getBoundingClientRect();
      return {
        x: ((marker.left + marker.width / 2 - rect.left) / rect.width) * 200,
        y: marker.top + marker.height / 2 - rect.top,
      };
    });
    const first = points[0];
    let d = `M150 0 C-10 ${first.y * 0.2} -20 ${first.y * 0.7} ${first.x} ${first.y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const a = points[i],
        b = points[i + 1],
        delta = b.y - a.y,
        dir = i % 2 ? -1 : 1;
      d += ` C${a.x + dir * 190} ${a.y + delta * 0.33} ${b.x + dir * 105} ${b.y - delta * 0.33} ${b.x} ${b.y}`;
    }
    const last = points.at(-1),
      dir = points.length % 2 ? -1 : 1;
    d += ` C${last.x + dir * 100} ${last.y + (height - last.y) * 0.4} ${100 + dir * 80} ${height} 100 ${height}`;
    svg.setAttribute("viewBox", `0 0 200 ${height}`);
    svg
      .querySelectorAll(":scope > path,:scope > g > path")
      .forEach((path) => path.setAttribute("d", d));
  };
  timelineObserver = new ResizeObserver(() => requestAnimationFrame(update));
  timelineObserver.observe(timeline);
  rows.forEach((row) => timelineObserver.observe(row));
  document.fonts.ready.then(update);
  requestAnimationFrame(update);
}

const title = (parts) =>
  parts
    .map((p) => `<span class="ink-${e(p.color)}">${e(p.text)}</span>`)
    .join("");
function heading(text, icon, link) {
  return `<div class="section-heading"><h2>${art(icon)}<span>${e(text)}</span><i class="rays" aria-hidden="true"></i></h2>${link ? `<a class="more-link" href="${link}">${e(data.ui.more)} <span aria-hidden="true">↗</span></a>` : ""}</div>`;
}
function coast(type = "sea") {
  return `<div class="coast coast-${type}" aria-hidden="true">${type === "sea" ? art("boat", "coast-boat") + art("lighthouse", "coast-lighthouse") : '<span class="coast-flower">✿</span>' + art("sprout", "coast-sprout")}<img src="./illustrations/${type === "sea" ? "waves" : "hills"}.svg" alt=""></div>`;
}
function renderHome() {
  const h = data.home,
    acts = h.previewActivityIds.map((id) =>
      data.activities.find((a) => a.id === id),
    ),
    stages = h.previewGrowthIds.map((id) =>
      data.growth.find((g) => g.id === id),
    );
  main.innerHTML = `<section class="home-hero content-width"><div class="hero-copy"><h1 class="crayon-title">${h.titleLines.map((line) => `<span class="title-line">${title(line)}</span>`).join("")}</h1>${art("heart", "hero-heart")}<i class="rays hero-rays" aria-hidden="true"></i><p class="brush-mark tone-yellow">${e(h.intro)}</p></div><div class="hero-picture">${stack("hero", [h.heroPhoto], "hero-photo")}<i class="rays photo-rays" aria-hidden="true"></i></div>${coast()}</section><section class="quick-links content-width" aria-label="纪念册分类">${h.quickLinks.map((l) => `<a class="brush-mark tone-${l.color}" href="${e(l.href)}">${art(l.icon)}<span>${e(l.label)}</span><span class="hand-arrow" aria-hidden="true">↗</span></a>`).join("")}</section><section class="daily-section content-width" id="daily">${heading(h.dailyTitle, "rainbow", "./activities.html")}<div class="daily-grid">${h.dailyPhotos.map((p, i) => `<div style="--tilt:${[-2, 1, -1, 2][i]}deg">${stack("daily-" + i, [p], "daily-photo")}</div>`).join("")}</div>${art("heart", "daily-heart")}${art("palette", "daily-palette")}</section><div class="home-bottom content-width"><section class="home-activities">${heading(h.activityTitle, "star", "./activities.html")}<div class="home-activity-grid">${acts.map((a, i) => `<article class="home-memory tone-${a.color}" style="--tilt:${[-6, 0, 5][i]}deg">${stack("preview-" + a.id, a.photos, "preview-photo")}<a class="memory-label brush-mark" href="./activities.html#${a.id}">${e(a.title)}</a></article>`).join("")}</div></section><section class="home-growth">${heading(h.growthTitle, "sprout", "./growth.html")}<div class="growth-steps">${stages.map((g, i) => `<article class="mini-stage tone-${["coral", "yellow", "yellow"][i]}" style="--step:${i};--tilt:${[-3, 3, -4][i]}deg">${i === 2 ? art("crown", "mini-crown") : ""}${stack("mini-" + g.id, g.photos.slice(0, 1), "mini-photo")}<a class="brush-mark" href="./growth.html#${g.id}">${e(h.growthLabels[i])}</a>${i < 2 ? '<span class="step-arrow" aria-hidden="true">⤵</span>' : ""}</article>`).join("")}</div></section></div>${coast("hill")}`;
}
function pageHero(cfg, type) {
  return `<section class="page-hero content-width ${type}-hero">${type === "activities" ? art("rainbow", "hero-art-right") + '<span class="crayon-cloud" aria-hidden="true">☁</span>' : art("astronaut", "hero-art-left") + art("rocket", "hero-art-right")}<h1 class="crayon-title">${title(cfg.title)}</h1><p class="${type === "growth" ? "brush-mark tone-yellow" : ""}">${e(cfg.description)}</p>${type === "activities" ? '<span class="yellow-scribble" aria-hidden="true"></span>' : ""}</section>`;
}
function river(count, space = false) {
  const step = 270,
    height = count * step;
  let path = "M155 -20 C-15 15 -30 80 55 135";
  for (let i = 0; i < count; i++) {
    const x = i % 2 ? 145 : 55,
      y = i * step + 135;
    const next = i % 2 ? 55 : 145;
    const dir = i % 2 ? -1 : 1;
    path += ` C${x + dir * 190} ${y + 90} ${next + dir * 105} ${y + 180} ${next} ${y + 270}`;
  }
  return `<svg class="river ${space ? "star-river" : ""}" viewBox="0 0 200 ${height}" preserveAspectRatio="none" aria-hidden="true"><defs><filter id="river-rough"><feTurbulence type="fractalNoise" baseFrequency=".12" numOctaves="3" seed="4" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="3"/></filter><pattern id="river-grain" width="8" height="9" patternUnits="userSpaceOnUse"><path d="m0 4 6-3m-2 9 6-4" stroke="#fffdf5" stroke-width="1.5" opacity=".8"/></pattern><filter id="glow" x="-100%" width="300%"><feGaussianBlur stdDeviation="7"/></filter></defs>${space ? `<path d="${path}" stroke="#ffade9" stroke-width="32" fill="none" filter="url(#glow)" opacity=".8"/><path d="${path}" stroke="#fff4ad" stroke-width="15" fill="none" opacity=".75"/>` : ""}<g filter="url(#river-rough)" fill="none">${(space ? ["#ff83bf", "#ffe64e", "#fff6cc", "#ffd24b", "#ffb1e4"] : ["#ff8099", "#ffc33a", "#f7d44f", "#91d554", "#54c9f1"]).map((c, i) => `<path d="${path}" transform="translate(${(i - 2) * 4} 0)" stroke="${c}" stroke-width="${space ? 2.5 : 4}"/>`).join("")}<path d="${path}" stroke="url(#river-grain)" stroke-width="23"/></g></svg>`;
}
function renderActivities() {
  const cfg = data.activitiesPage;
  const years = [...new Set(data.activities.map((a) => a.date.slice(0, 4)))]
    .sort()
    .reverse();
  main.innerHTML = `${pageHero(cfg, "activities")}<section class="activity-collection content-width"><div class="collection-toolbar"><div class="year-filters" role="group" aria-label="${e(data.ui.yearLabel)}"><button class="selected" data-year="all" aria-pressed="true">${e(data.ui.allYears)}</button>${years.length > 1 ? years.map((y) => `<button data-year="${y}" aria-pressed="false">${y}</button>`).join("") : ""}</div><span class="collection-count" role="status"></span></div><div class="activity-timeline"></div></section><section class="timeline-ending content-width"><p>${e(cfg.endTitle)}</p><small>${e(cfg.endText)}</small></section>${coast()}`;
  renderActivityRows("all");
  main.querySelectorAll("[data-year]").forEach((b) =>
    b.addEventListener("click", () => {
      main.querySelectorAll("[data-year]").forEach((x) => {
        x.classList.toggle("selected", x === b);
        x.setAttribute("aria-pressed", String(x === b));
      });
      renderActivityRows(b.dataset.year);
      hydrate();
    }),
  );
}
function renderActivityRows(year) {
  const items = data.activities
    .filter((a) => year === "all" || a.date.startsWith(year))
    .sort((a, b) => b.date.localeCompare(a.date));
  main.querySelector(".collection-count").textContent =
    `${items.length} ${data.ui.recordUnit}`;
  main.querySelector(".activity-timeline").innerHTML =
    river(items.length) +
    items
      .map(
        (a, i) =>
          `<article class="activity-row tone-${a.color} ${i % 2 ? "reverse" : ""}" id="${a.id}" style="--tilt:${i % 2 ? 5 : -5}deg;--tape:${i % 4}"><div class="activity-photo">${stack(a.id, a.photos)}</div><div class="river-date"><span class="river-node"></span><time class="brush-mark" datetime="${a.date}">${a.date.replaceAll("-", ".")}</time><span class="connector" aria-hidden="true"></span></div><div class="activity-story"><div class="story-wash"></div>${art(a.icon, "story-icon")}<h2>${e(a.title)}</h2>${a.summary ? `<p>${e(a.summary)}</p>` : ""}<i class="rays" aria-hidden="true"></i></div></article>`,
      )
      .join("");
}
function stars() {
  return Array.from(
    { length: 70 },
    (_, i) =>
      `<span class="space-star ${i % 4 === 0 ? "outlined" : ""}" style="left:${(i * 37 + 5) % 97}%;top:${(i * 73 + 2) % 99}%;--star-size:${i % 4 === 0 ? 25 : 8 + (i % 8)}px;--delay:${i % 5}s" aria-hidden="true">${i % 4 === 0 ? "☆" : "✦"}</span>`,
  ).join("");
}
function renderGrowth() {
  const cfg = data.growthPage,
    items = [...data.growth].sort((a, b) => a.date.localeCompare(b.date));
  main.innerHTML = `<div class="universe">${pageHero(cfg, "growth")}<section class="growth-timeline content-width" aria-label="成长星球时间轴">${stars()}${river(items.length, true)}${items.map((g, i) => `<article class="growth-row tone-${g.color} ${i % 2 ? "reverse" : ""}" id="${g.id}" style="--tilt:${i % 2 ? 4 : -3}deg"><div class="growth-story"><time datetime="${g.date}">${g.date.slice(0, 7).replace("-", ".")}</time><h2><span class="brush-mark">${e(g.title)}</span></h2><ul>${g.skills.map((s) => `<li>${e(s)}</li>`).join("")}</ul><p class="growth-change">${e(g.change)}</p>${art(g.icon, "growth-doodle")}</div><div class="stage-planet">${art(g.planet)}${i === 0 ? '<span class="planet-flag" aria-hidden="true">⚑</span>' : ""}${i === items.length - 1 ? '<span class="graduation-cap" aria-hidden="true">🎓</span>' : ""}</div><div class="growth-photo">${stack(g.id, g.photos)}</div></article>`).join("")}</section><section class="timeline-ending content-width"><p>${e(cfg.endTitle)}</p><small>${e(cfg.endText)}</small></section><div class="earth-horizon" aria-hidden="true">${art("earth")}</div></div>`;
}
async function init() {
  try {
    const response = await fetch("./data/site.json");
    if (!response.ok) throw new Error(`Data HTTP ${response.status}`);
    data = await response.json();
    document.querySelector("site-header").data = { ...data, page };
    document.querySelector("site-footer").data = data;
    document.querySelector("photo-lightbox").ui = data.ui;
    document.querySelector(".skip-link").textContent = data.ui.skip;
    if (page === "activities") renderActivities();
    else if (page === "growth") renderGrowth();
    else renderHome();
    hydrate();
    main.addEventListener("gallery-open", (ev) =>
      document.querySelector("photo-lightbox").open(ev.detail),
    );
    if (location.hash)
      requestAnimationFrame(() =>
        document
          .getElementById(decodeURIComponent(location.hash.slice(1)))
          ?.scrollIntoView({ block: "center" }),
      );
  } catch (error) {
    console.error(error);
    main.innerHTML = `<div class="load-error" role="alert"><h1>${e(data?.ui.error || "纪念册暂时未能打开")}</h1><button type="button">${e(data?.ui.retry || "重新打开")}</button></div>`;
    main
      .querySelector("button")
      .addEventListener("click", () => location.reload());
  }
}
init();
