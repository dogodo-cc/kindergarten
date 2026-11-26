import { escapeHTML as e, icon } from "../utils.js";
class SiteHeader extends HTMLElement {
  set data({ site, ui, page }) {
    this.innerHTML = `<header class="site-header"><div class="header-inner"><a class="brand" href="./index.html"><crayon-art name="sun"></crayon-art><span>${e(site.name)}</span></a><button class="menu-toggle icon-button" aria-label="${e(ui.menu)}" aria-controls="main-nav" aria-expanded="false">${icon("menu")}</button><nav id="main-nav" aria-label="主导航">${site.navigation.map((n) => `<a class="nav-link ${n.page === page ? "active" : ""}" href="${e(n.href)}" ${n.page === page ? 'aria-current="page"' : ""}>${e(n.label)}</a>`).join("")}</nav></div></header>`;
    const button = this.querySelector("button"),
      nav = this.querySelector("nav");
    const toggle = (open) => {
      button.setAttribute("aria-expanded", String(open));
      button.setAttribute("aria-label", open ? ui.menuClose : ui.menu);
      nav.classList.toggle("is-open", open);
    };
    button.addEventListener("click", () =>
      toggle(button.getAttribute("aria-expanded") !== "true"),
    );
    this.addEventListener("keydown", (ev) => {
      if (ev.key === "Escape") {
        toggle(false);
        button.focus();
      }
    });
    nav.addEventListener("click", () => toggle(false));
  }
}
class SiteFooter extends HTMLElement {
  set data({ site, credits }) {
    this.innerHTML = `<footer class="site-footer"><p>${e(site.footer)}</p><small>${e(site.copyright)}</small><p class="credits">${e(credits.notice)}</p></footer>`;
  }
}
customElements.define("site-header", SiteHeader);
customElements.define("site-footer", SiteFooter);
