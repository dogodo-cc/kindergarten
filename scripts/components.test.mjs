import { test, after } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { Window } from "happy-dom";
const window = new Window({ url: "http://localhost/" });
for (const key of [
  "document",
  "HTMLElement",
  "CustomEvent",
  "KeyboardEvent",
  "MouseEvent",
])
  globalThis[key] = window[key];
globalThis.customElements = window.customElements;
await import("../src/components/crayon-art.js");
await import("../src/components/photo-stack.js");
await import("../src/components/site-shell.js");
const data = JSON.parse(
  readFileSync(new URL("../public/data/site.json", import.meta.url), "utf8"),
);
const photos = data.activities[0].photos;
function makeStack(items = photos) {
  const el = document.createElement("photo-stack");
  document.body.append(el);
  el.data = { photos: items, ui: data.ui };
  return el;
}
test("photo buttons and dots switch photos, including wrapping at both ends", () => {
  const el = makeStack();
  el.querySelector(".photo-next").click();
  assert.equal(
    el.querySelector(".is-current img").getAttribute("src"),
    photos[1].src,
  );
  el.querySelector(".photo-prev").click();
  assert.equal(
    el.querySelector(".is-current img").getAttribute("src"),
    photos[0].src,
  );
  el.querySelector(".photo-prev").click();
  assert.equal(
    el.querySelector(".is-current img").getAttribute("src"),
    photos.at(-1).src,
  );
  el.querySelector('[data-index="1"]').click();
  assert.equal(el.querySelector(".is-current img").alt, photos[1].alt);
  assert.equal(
    el.querySelector('[data-index="1"]').getAttribute("aria-pressed"),
    "true",
  );
  el.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight" }));
  assert.equal(el.querySelector(".is-current img").alt, photos[2].alt);
  el.remove();
});
test("single-photo memories open without redundant paging controls", () => {
  const el = makeStack([photos[0]]);
  assert.equal(el.querySelector(".photo-next"), null);
  assert.equal(el.querySelector(".photo-dots"), null);
  let detail;
  el.addEventListener("gallery-open", (ev) => (detail = ev.detail));
  el.querySelector(".photo-open").click();
  assert.equal(detail.photos.length, 1);
  assert.equal(detail.index, 0);
  assert.equal(detail.trigger, el.querySelector(".photo-open"));
  el.remove();
});
test("lightbox opens selected image, synchronizes paging, and restores focus and scrolling", () => {
  const stack = makeStack(),
    box = document.createElement("photo-lightbox");
  document.body.append(box);
  box.ui = data.ui;
  document.body.style.overflow = "auto";
  const trigger = stack.querySelector(".is-current .photo-open");
  trigger.focus();
  stack.addEventListener("gallery-open", (ev) => box.open(ev.detail));
  trigger.click();
  assert.equal(box.querySelector("dialog").open, true);
  assert.equal(document.body.style.overflow, "hidden");
  box.querySelector('[data-gallery-action="next"]').click();
  assert.equal(
    box.querySelector(".is-current .lightbox-image").alt,
    photos[1].alt,
  );
  assert.equal(stack.querySelector(".is-current img").alt, photos[1].alt);
  box.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowLeft" }));
  assert.equal(
    box.querySelector(".is-current .lightbox-image").alt,
    photos[0].alt,
  );
  box.querySelector('[data-gallery-action="close"]').click();
  assert.equal(box.querySelector("dialog").open, false);
  assert.equal(document.body.style.overflow, "auto");
  assert.equal(document.activeElement, trigger);
  stack.remove();
  box.remove();
});
test("mobile navigation expands, collapses on Escape and marks the active page", () => {
  const el = document.createElement("site-header");
  document.body.append(el);
  el.data = { ...data, page: "growth" };
  const button = el.querySelector("button");
  assert.equal(button.getAttribute("aria-expanded"), "false");
  button.click();
  assert.equal(button.getAttribute("aria-expanded"), "true");
  assert.ok(el.querySelector("nav").classList.contains("is-open"));
  el.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
  assert.equal(button.getAttribute("aria-expanded"), "false");
  assert.equal(
    el.querySelector('[aria-current="page"]').textContent,
    "成长蜕变",
  );
  el.remove();
});
function touch(target, type, x, y, time = 0) {
  const ev = new window.PointerEvent(type, {
    bubbles: true,
    cancelable: true,
    pointerId: 1,
    pointerType: "touch",
    isPrimary: true,
    button: 0,
    clientX: x,
    clientY: y,
  });
  Object.defineProperty(ev, "timeStamp", { value: time });
  target.dispatchEvent(ev);
  return ev;
}
function gestureSurface(el, selector = ".photo-window") {
  const surface = el.querySelector(selector);
  Object.defineProperty(surface, "clientWidth", {
    value: 300,
    configurable: true,
  });
  return surface;
}
test("the photograph follows the finger before release and a short slow drag springs back", () => {
  const el = makeStack(),
    surface = gestureSurface(el),
    target = el.querySelector(".is-current img"),
    track = el.querySelector(".swipe-track");
  let opened = 0;
  el.addEventListener("gallery-open", () => opened++);
  touch(target, "pointerdown", 200, 100, 0);
  const movement = touch(surface, "pointermove", 150, 103, 200);
  assert.equal(track.style.getPropertyValue("--drag-offset"), "-50px");
  assert.ok(surface.classList.contains("is-dragging"));
  assert.equal(movement.defaultPrevented, true);
  assert.equal(el.querySelector(".is-current img").alt, photos[0].alt);
  touch(surface, "pointerup", 150, 103, 400);
  assert.equal(track.style.getPropertyValue("--drag-offset"), "0px");
  assert.equal(surface.classList.contains("is-dragging"), false);
  assert.equal(el.querySelector(".is-current img").alt, photos[0].alt);
  el.querySelector(".is-current .photo-open").click();
  assert.equal(opened, 0, "A drag must not open the lightbox");
  el.remove();
});
test("distance and quick flick gestures turn pages and wrap to the previous photo", () => {
  const el = makeStack(),
    surface = gestureSurface(el);
  touch(el.querySelector(".is-current img"), "pointerdown", 200, 100, 0);
  touch(surface, "pointermove", 90, 100, 300);
  touch(surface, "pointerup", 90, 100, 500);
  assert.equal(el.querySelector(".is-current img").alt, photos[1].alt);
  touch(el.querySelector(".is-current img"), "pointerdown", 200, 100, 600);
  touch(surface, "pointermove", 176, 101, 620);
  touch(surface, "pointerup", 176, 101, 625);
  assert.equal(
    el.querySelector(".is-current img").alt,
    photos[2].alt,
    "A quick flick needs less distance",
  );
  el.querySelector('[data-index="0"]').click();
  touch(el.querySelector(".is-current img"), "pointerdown", 100, 100, 700);
  touch(surface, "pointermove", 210, 101, 900);
  touch(surface, "pointerup", 210, 101, 1100);
  assert.equal(el.querySelector(".is-current img").alt, photos.at(-1).alt);
  const settled = new window.Event("transitionend");
  Object.defineProperty(settled, "propertyName", { value: "transform" });
  el.querySelector(".swipe-track").dispatchEvent(settled);
  assert.equal(
    el.querySelector(".is-current img").alt,
    photos.at(-1).alt,
    "Loop reset keeps the same visible photograph",
  );
  el.remove();
});
test("vertical gestures keep page scrolling native and cancelled drags restore the current photo", () => {
  const el = makeStack(),
    surface = gestureSurface(el),
    track = el.querySelector(".swipe-track");
  touch(el.querySelector(".is-current img"), "pointerdown", 200, 100, 0);
  const vertical = touch(surface, "pointermove", 190, 190, 200);
  touch(surface, "pointerup", 190, 190, 400);
  assert.equal(vertical.defaultPrevented, false);
  assert.equal(el.querySelector(".is-current img").alt, photos[0].alt);
  assert.equal(surface.classList.contains("is-dragging"), false);
  touch(el.querySelector(".is-current img"), "pointerdown", 200, 100, 500);
  touch(surface, "pointermove", 100, 102, 700);
  touch(surface, "pointercancel", 100, 102, 800);
  assert.equal(track.style.getPropertyValue("--drag-offset"), "0px");
  assert.equal(el.querySelector(".is-current img").alt, photos[0].alt);
  el.remove();
});
test("lightbox photographs also follow touch movement and update the originating album", () => {
  const stack = makeStack(),
    box = document.createElement("photo-lightbox");
  document.body.append(box);
  box.ui = data.ui;
  stack.addEventListener("gallery-open", (ev) => box.open(ev.detail));
  stack.querySelector(".is-current .photo-open").click();
  const surface = gestureSurface(box, ".lightbox-stage"),
    track = box.querySelector(".swipe-track");
  touch(box.querySelector(".is-current img"), "pointerdown", 200, 100, 0);
  touch(surface, "pointermove", 100, 100, 200);
  assert.equal(track.style.getPropertyValue("--drag-offset"), "-100px");
  assert.equal(
    box.querySelector(".lightbox-caption span").textContent,
    "1 / 3",
  );
  touch(surface, "pointerup", 100, 100, 400);
  assert.equal(
    box.querySelector(".lightbox-caption span").textContent,
    "2 / 3",
  );
  assert.equal(stack.querySelector(".is-current img").alt, photos[1].alt);
  box.querySelector('[data-gallery-action="close"]').click();
  assert.equal(
    document.activeElement,
    stack.querySelector(".is-current .photo-open"),
  );
  stack.remove();
  box.remove();
});
test("mobile implicit capture transfer does not cancel a drag when the image loses capture", () => {
  const el = makeStack();
  const surface = gestureSurface(el);
  const image = el.querySelector(".is-current img");
  const track = el.querySelector(".swipe-track");
  touch(image, "pointerdown", 200, 100, 0);
  touch(image, "pointermove", 170, 101, 100);
  // Touch browsers initially capture to the image. Transferring capture to
  // the viewport emits a bubbling lostpointercapture from that image.
  touch(image, "lostpointercapture", 170, 101, 101);
  touch(surface, "pointermove", 90, 102, 200);
  assert.equal(track.style.getPropertyValue("--drag-offset"), "-110px");
  assert.equal(surface.classList.contains("is-dragging"), true);
  touch(surface, "pointerup", 90, 102, 400);
  assert.equal(el.querySelector(".is-current img").alt, photos[1].alt);
  el.remove();
});
test("losing capture on the viewport itself still cancels the gesture", () => {
  const el = makeStack();
  const surface = gestureSurface(el);
  touch(el.querySelector(".is-current img"), "pointerdown", 200, 100, 0);
  touch(surface, "pointermove", 100, 102, 200);
  touch(surface, "lostpointercapture", 100, 102, 201);
  assert.equal(
    el.querySelector(".swipe-track").style.getPropertyValue("--drag-offset"),
    "0px",
  );
  assert.equal(surface.classList.contains("is-dragging"), false);
  assert.equal(el.querySelector(".is-current img").alt, photos[0].alt);
  el.remove();
});
test("releasing the mouse outside a photo or losing focus does not block the next drag", () => {
  for (const ending of ["pointerup", "pointercancel", "blur"]) {
    const el = makeStack();
    const surface = gestureSurface(el);
    const mouse = (target, type, x, y) =>
      target.dispatchEvent(new window.PointerEvent(type, {
        bubbles: true, pointerId: 2, pointerType: "mouse",
        isPrimary: true, button: 0, clientX: x, clientY: y,
      }));
    mouse(el.querySelector(".is-current img"), "pointerdown", 100, 100);
    mouse(surface, "pointermove", 101, 120);
    if (ending === "blur") window.dispatchEvent(new window.Event("blur"));
    else mouse(document.body, ending, 101, 400);
    mouse(el.querySelector(".is-current img"), "pointerdown", 200, 100);
    mouse(surface, "pointermove", 90, 100);
    assert.equal(
      el.querySelector(".swipe-track").style.getPropertyValue("--drag-offset"),
      "-110px", `${ending} must allow a fresh horizontal drag`,
    );
    mouse(surface, "pointerup", 90, 100);
    assert.equal(el.querySelector(".is-current img").alt, photos[1].alt);
    el.carousel.destroy();
    el.remove();
  }
});
after(() => window.happyDOM.abort());
