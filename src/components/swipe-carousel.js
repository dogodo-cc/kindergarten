/** A looping, pointer-driven track shared by the scrapbook and the lightbox. */
export function carouselSlides(photos, renderPhoto) {
  const entries =
    photos.length > 1 ? [photos.at(-1), ...photos, photos[0]] : photos;
  return entries
    .map((photo, position) => {
      const index =
        photos.length > 1 ? (position - 1 + photos.length) % photos.length : 0;
      return `<div class="swipe-slide" data-photo-index="${index}" aria-hidden="true">${renderPhoto(photo, index)}</div>`;
    })
    .join("");
}

export class SwipeCarousel {
  constructor(viewport, { count, onChange }) {
    this.viewport = viewport;
    this.track = viewport.querySelector(".swipe-track");
    this.slides = [...this.track.children];
    this.count = count;
    this.onChange = onChange;
    this.view = viewport.ownerDocument.defaultView;
    this.index = 0;
    this.position = count > 1 ? 1 : 0;
    this.gesture = null;
    this.suppressClickUntil = 0;
    this.listeners = [];
    this.listen(viewport, "pointerdown", (event) => this.start(event));
    this.listen(viewport, "pointermove", (event) => this.drag(event));
    this.listen(viewport, "pointerup", (event) => this.end(event));
    this.listen(viewport, "pointercancel", (event) => {
      if (event.pointerId === this.gesture?.id) this.cancel();
    });
    this.listen(viewport, "lostpointercapture", (event) => {
      // Touch input implicitly captures to the image/button. Moving capture
      // to this viewport emits a bubbling loss from that child, not a cancel.
      if (event.target === viewport && event.pointerId === this.gesture?.id)
        this.cancel();
    });
    this.listen(viewport, "dragstart", (event) => event.preventDefault());
    this.listen(
      viewport,
      "click",
      (event) => {
        if (this.view.performance.now() < this.suppressClickUntil) {
          event.preventDefault();
          event.stopImmediatePropagation();
        }
      },
      true,
    );
    this.listen(this.track, "transitionend", (event) => {
      if (event.target === this.track && event.propertyName === "transform")
        this.settle();
    });
    this.paint(false);
  }

  listen(target, name, handler, options) {
    target.addEventListener(name, handler, options);
    this.listeners.push(() =>
      target.removeEventListener(name, handler, options),
    );
  }

  start(event) {
    if (
      this.count < 2 ||
      this.gesture ||
      event.isPrimary === false ||
      event.button > 0
    )
      return;
    // Buttons and captions do not start a drag; the photograph itself does.
    if (event.target.closest("button:not(.photo-open),a")) return;
    this.settle();
    this.gesture = {
      id: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      lastX: event.clientX,
      time: event.timeStamp,
      velocity: 0,
      width:
        this.viewport.clientWidth ||
        this.viewport.getBoundingClientRect().width ||
        1,
      axis: null,
      dx: 0,
    };
    // A mouse can leave before horizontal pointer capture starts. Keep these
    // window listeners only for the active gesture, including loss of focus.
    const end = (event) => this.end(event);
    const cancel = (event) => {
      if (event.type === "blur" || event.pointerId === this.gesture?.id)
        this.cancel();
    };
    this.view.addEventListener("pointerup", end, true);
    this.view.addEventListener("pointercancel", cancel, true);
    this.view.addEventListener("blur", cancel);
    this.gesture.cleanup = () => {
      this.view.removeEventListener("pointerup", end, true);
      this.view.removeEventListener("pointercancel", cancel, true);
      this.view.removeEventListener("blur", cancel);
    };
  }

  drag(event) {
    const g = this.gesture;
    if (!g || g.id !== event.pointerId) return;
    const dx = event.clientX - g.x,
      dy = event.clientY - g.y;
    if (!g.axis) {
      if (Math.max(Math.abs(dx), Math.abs(dy)) < 7) return;
      g.axis = Math.abs(dx) > Math.abs(dy) * 1.15 ? "x" : "y";
      if (g.axis === "x") {
        this.viewport.setPointerCapture?.(g.id);
        this.viewport.classList.add("is-dragging");
      }
    }
    if (g.axis !== "x") return;
    if (event.cancelable) event.preventDefault();
    const elapsed = event.timeStamp - g.time;
    if (elapsed > 0) g.velocity = (event.clientX - g.lastX) / elapsed;
    g.lastX = event.clientX;
    g.time = event.timeStamp;
    // Keep one neighboring image in view even for a very long drag.
    g.dx = Math.max(-g.width, Math.min(g.width, dx));
    this.track.style.setProperty("--drag-offset", `${g.dx}px`);
  }

  end(event) {
    const g = this.gesture;
    if (!g || g.id !== event.pointerId) return;
    const horizontal = g.axis === "x";
    const distance = Math.abs(g.dx);
    const flick =
      event.timeStamp - g.time < 100 &&
      Math.abs(g.velocity) > 0.5 &&
      distance > 12;
    const turn =
      horizontal && (distance > Math.min(90, g.width * 0.22) || flick);
    this.release();
    if (!horizontal) return;
    this.suppressClickUntil = this.view.performance.now() + 350;
    if (turn) this.move(g.dx < 0 ? 1 : -1);
    else this.paint(true);
  }

  release() {
    const g = this.gesture;
    this.gesture = null;
    g?.cleanup();
    this.viewport.classList.remove("is-dragging");
    if (g && this.viewport.hasPointerCapture?.(g.id))
      this.viewport.releasePointerCapture(g.id);
  }

  cancel() {
    if (!this.gesture) return;
    const horizontal = this.gesture.axis === "x";
    this.release();
    if (horizontal) {
      this.suppressClickUntil = this.view.performance.now() + 350;
      this.paint(true);
    }
  }

  move(delta) {
    if (this.count < 2) return;
    this.settle();
    this.position = this.index + 1 + delta;
    this.index = (this.index + delta + this.count) % this.count;
    this.paint(true);
    this.onChange(this.index);
  }

  select(index, { animate = true, notify = true } = {}) {
    this.release();
    this.index = (index + this.count) % this.count;
    this.position = this.count > 1 ? this.index + 1 : 0;
    this.paint(animate);
    if (notify) this.onChange(this.index);
  }

  paint(animate) {
    this.view.clearTimeout(this.timer);
    this.track.classList.toggle("is-animating", animate);
    this.track.style.setProperty("--drag-offset", "0px");
    this.track.style.setProperty("--slide-position", String(this.position));
    this.updateAccessibility();
    if (animate) {
      // Also finish if reduced motion or an interrupted transition skips transitionend.
      this.timer = this.view.setTimeout(() => this.settle(), 340);
    }
  }

  updateAccessibility() {
    const focusedPhoto =
      this.viewport.ownerDocument.activeElement?.closest(".photo-open");
    const restoreFocus = focusedPhoto && this.viewport.contains(focusedPhoto);
    this.slides.forEach((slide, position) => {
      const active = position === this.position;
      slide.setAttribute("aria-hidden", String(!active));
      slide.classList.toggle("is-current", active);
      const button = slide.querySelector("button");
      if (button) button.tabIndex = active ? 0 : -1;
    });
    if (restoreFocus)
      this.slides[this.position]
        ?.querySelector("button")
        ?.focus({ preventScroll: true });
  }

  settle() {
    this.view.clearTimeout(this.timer);
    const canonical = this.count > 1 ? this.index + 1 : 0;
    this.track.classList.remove("is-animating");
    if (this.position !== canonical) {
      this.position = canonical;
      this.track.style.setProperty("--slide-position", String(canonical));
      this.updateAccessibility();
      // Commit the invisible clone reset before a subsequent gesture/button animation.
      void this.track.offsetWidth;
    }
  }

  destroy() {
    this.release();
    this.view.clearTimeout(this.timer);
    this.listeners.forEach((remove) => remove());
  }
}
