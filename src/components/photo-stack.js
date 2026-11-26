import { escapeHTML as e, icon } from "../utils.js";
class PhotoStack extends HTMLElement {
  constructor() {
    super();
    this.index = 0;
    this.addEventListener("click", (ev) => {
      const b = ev.target.closest("[data-photo-action]");
      if (!b) return;
      const action = b.dataset.photoAction;
      if (action === "previous") this.move(-1);
      else if (action === "next") this.move(1);
      else if (action === "select") {
        this.index = Number(b.dataset.index);
        this.update();
      } else if (action === "open")
        this.dispatchEvent(
          new CustomEvent("gallery-open", {
            bubbles: true,
            detail: {
              photos: this.photos,
              index: this.index,
              trigger: b,
              onChange: (index) => {
                this.index = index;
                this.update();
              },
            },
          }),
        );
    });
    this.addEventListener("keydown", (ev) => {
      if (ev.key === "ArrowLeft" || ev.key === "ArrowRight") {
        ev.preventDefault();
        this.move(ev.key === "ArrowLeft" ? -1 : 1);
      }
    });
    this.addEventListener(
      "touchstart",
      (ev) => {
        this.touchX = ev.changedTouches[0].clientX;
        this.touchY = ev.changedTouches[0].clientY;
      },
      { passive: true },
    );
    this.addEventListener(
      "touchend",
      (ev) => {
        const dx = ev.changedTouches[0].clientX - this.touchX,
          dy = ev.changedTouches[0].clientY - this.touchY;
        if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy))
          this.move(dx < 0 ? 1 : -1);
      },
      { passive: true },
    );
  }
  set data({ photos, ui, variant = "" }) {
    this.photos = photos;
    this.ui = ui;
    this.index = 0;
    this.className = `photo-stack ${variant} ${photos.length > 1 ? "has-multiple" : ""}`;
    const p = photos[0];
    this.innerHTML = `<figure class="polaroid"><span class="tape" aria-hidden="true"></span><div class="photo-window"><button class="photo-open" type="button" data-photo-action="open"><img class="memory-photo" src="${e(p.src)}" alt="${e(p.alt)}" width="1200" height="900" loading="${variant === "hero-photo" ? "eager" : "lazy"}" ${variant === "hero-photo" ? 'fetchpriority="high"' : ""}><span class="expand-icon">${icon("expand")}</span></button>${photos.length > 1 ? `<button class="photo-prev" type="button" data-photo-action="previous" aria-label="${e(ui.previous)}">${icon("left")}</button><button class="photo-next" type="button" data-photo-action="next" aria-label="${e(ui.next)}">${icon("right")}</button>` : ""}</div>${photos.length > 1 ? `<div class="photo-dots" role="group" aria-label="照片翻页">${photos.map((_, i) => `<button type="button" data-photo-action="select" data-index="${i}" aria-label="第 ${i + 1} 张照片" aria-pressed="${i === 0}"></button>`).join("")}</div>` : ""}<figcaption class="sr-only" aria-live="polite">${e(p.caption)}</figcaption></figure>`;
    this.update();
  }
  move(delta) {
    if (this.photos.length < 2) return;
    this.index = (this.index + delta + this.photos.length) % this.photos.length;
    this.update();
  }
  update() {
    const p = this.photos[this.index];
    const img = this.querySelector("img");
    img.src = p.src;
    img.alt = p.alt;
    this.querySelector(".photo-open").setAttribute(
      "aria-label",
      `${this.ui.view}：${p.alt}`,
    );
    this.querySelector("figcaption").textContent = p.caption;
    this.querySelectorAll(".photo-dots button").forEach((b, i) =>
      b.setAttribute("aria-pressed", String(i === this.index)),
    );
  }
}
class PhotoLightbox extends HTMLElement {
  constructor() {
    super();
    this.addEventListener("click", (ev) => {
      const a = ev.target.closest("[data-gallery-action]")?.dataset
        .galleryAction;
      if (a === "close") this.dialog.close();
      if (a === "previous") this.move(-1);
      if (a === "next") this.move(1);
      if (ev.target === this.dialog) {
        const r = this.dialog.getBoundingClientRect();
        if (
          ev.clientX < r.left ||
          ev.clientX > r.right ||
          ev.clientY < r.top ||
          ev.clientY > r.bottom
        )
          this.dialog.close();
      }
    });
    this.addEventListener("keydown", (ev) => {
      if (ev.key === "ArrowLeft" || ev.key === "ArrowRight") {
        ev.preventDefault();
        this.move(ev.key === "ArrowLeft" ? -1 : 1);
      }
    });
    this.addEventListener(
      "touchstart",
      (ev) => (this.touchX = ev.changedTouches[0].clientX),
      { passive: true },
    );
    this.addEventListener(
      "touchend",
      (ev) => {
        const dx = ev.changedTouches[0].clientX - this.touchX;
        if (Math.abs(dx) > 55) this.move(dx < 0 ? 1 : -1);
      },
      { passive: true },
    );
  }
  set ui(ui) {
    this.labels = ui;
    this.innerHTML = `<dialog class="lightbox" aria-labelledby="lightbox-title"><div class="lightbox-top"><h2 id="lightbox-title">${e(ui.lightboxTitle)}</h2><button class="icon-button" data-gallery-action="close" aria-label="${e(ui.close)}">${icon("close")}</button></div><div class="lightbox-stage"><button class="lightbox-prev" data-gallery-action="previous" aria-label="${e(ui.previous)}">${icon("left")}</button><img class="lightbox-image" alt=""><button class="lightbox-next" data-gallery-action="next" aria-label="${e(ui.next)}">${icon("right")}</button></div><div class="lightbox-caption" aria-live="polite"><p></p><span></span></div><p class="lightbox-hint">${e(ui.galleryHint)}</p></dialog>`;
    this.dialog = this.querySelector("dialog");
    this.dialog.addEventListener("close", () => {
      document.body.style.overflow = this.previousOverflow;
      this.trigger?.focus();
    });
  }
  open({ photos, index, trigger, onChange }) {
    this.photos = photos;
    this.index = index;
    this.trigger = trigger;
    this.onChange = onChange;
    this.previousOverflow = document.body.style.overflow;
    this.update();
    this.dialog.showModal();
    document.body.style.overflow = "hidden";
  }
  move(delta) {
    this.index = (this.index + delta + this.photos.length) % this.photos.length;
    this.update();
    this.onChange?.(this.index);
  }
  update() {
    const p = this.photos[this.index];
    const img = this.querySelector(".lightbox-image");
    img.src = p.src;
    img.alt = p.alt;
    this.querySelector(".lightbox-caption p").textContent = p.caption;
    this.querySelector(".lightbox-caption span").textContent =
      `${this.index + 1} / ${this.photos.length}`;
    this.querySelectorAll(".lightbox-prev,.lightbox-next").forEach(
      (b) => (b.hidden = this.photos.length < 2),
    );
  }
}
customElements.define("photo-stack", PhotoStack);
customElements.define("photo-lightbox", PhotoLightbox);
