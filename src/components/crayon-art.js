const sprites = {
  sun: [0, 0],
  rainbow: [1, 0],
  boat: [2, 0],
  lighthouse: [3, 0],
  astronaut: [0, 1],
  rocket: [1, 1],
  saturn: [2, 1],
  moon: [3, 1],
  "blue-planet": [0, 2],
  earth: [1, 2],
  star: [2, 2],
  galaxy: [3, 2],
  palette: [0, 3],
  trophy: [1, 3],
  magnify: [2, 3],
  sprout: [3, 3],
  "orange-planet": [2, 1],
};
const drawings = {
  heart:
    '<path d="M50 82C-6 49 18 10 47 34C70-4 112 34 50 82Z" fill="none" stroke="#ff7d94" stroke-width="6"/><path d="M48 75C6 46 24 22 45 41" fill="none" stroke="#ffa3b7" stroke-width="3"/>',
  leaf: '<path d="m49 15 4 23 22-19-4 23 20-3-17 22 11 9-28 1-7 22-9-25-27 5 16-21-15-9 24-3Z" fill="#ff9a31" stroke="#ff782c" stroke-width="3"/><path d="M52 34 40 91m7-34 24-13m-26 22-15-14" fill="none" stroke="#ffda70" stroke-width="3"/>',
  crown:
    '<path d="m14 27 15 22 20-35 18 34 23-26-8 55-63 3Z" fill="none" stroke="#ffcb00" stroke-width="5"/><path d="m26 68 48-4" stroke="#ffce16" stroke-width="5"/>',
  plane:
    '<path d="m9 28 79-17-24 72-20-29Z" fill="#e3f7ff" stroke="#239bef" stroke-width="4"/><path d="m9 28 42 12 37-29-44 43-8 25 15-19" fill="none" stroke="#239bef" stroke-width="3"/>',
  flower:
    '<g fill="#ff9fc3" stroke="#ff6da7" stroke-width="3"><circle cx="35" cy="26" r="15"/><circle cx="59" cy="27" r="15"/><circle cx="67" cy="49" r="15"/><circle cx="47" cy="61" r="15"/><circle cx="26" cy="48" r="15"/></g><circle cx="46" cy="42" r="12" fill="#ffce24"/><path d="m47 72 7 22m-4-11q-20-22-25-9t27 15m1-3q23-23 28-14T55 93" fill="#8bd746" stroke="#65bc32" stroke-width="3"/>',
  mooncake:
    '<path d="M17 30q32-25 65 0v37Q49 91 17 68Z" fill="#ffe393" stroke="#ff8c20" stroke-width="4"/><ellipse cx="49" cy="31" rx="33" ry="17" fill="#ffcb57" stroke="#ff8c20" stroke-width="3"/><path d="m25 42 1 26m14-22v28m15-27v27m14-30v24M34 28q15-15 29 3l-14 9Z" fill="none" stroke="#ff9125" stroke-width="3"/>',
  balloons:
    '<ellipse cx="30" cy="31" rx="19" ry="25" fill="#ff8fb9" stroke="#f86c9d" stroke-width="3"/><ellipse cx="72" cy="44" rx="17" ry="23" fill="#ffdc28" stroke="#f5bc00" stroke-width="3"/><path d="M30 57q23 19 4 36m38-25q-5 24-21 28" fill="none" stroke="#39b8e5" stroke-width="3"/>',
  shell:
    '<path d="M47 82Q-8 49 18 24q14-8 22 8Q47 3 62 16q9 5 5 17Q91 7 94 35q5 27-38 50Z" fill="#ffd88c" stroke="#ff9428" stroke-width="4"/><path d="m49 77-28-42m33 44L49 26m9 52 23-38" fill="none" stroke="#ff9c29" stroke-width="3"/>',
  bear: '<g fill="#dca261" stroke="#ad713c" stroke-width="3"><circle cx="24" cy="27" r="14"/><circle cx="77" cy="27" r="14"/><circle cx="50" cy="53" r="36"/></g><ellipse cx="50" cy="64" rx="20" ry="16" fill="#ffe2af"/><path d="M34 48v3m32-3v3m-21 7h10l-5 6Z" stroke="#6c4b38" stroke-width="4"/><path d="M40 70q10 9 20-1" fill="none" stroke="#6c4b38" stroke-width="3"/>',
  party:
    '<path d="m14 85 18-63 45 44Z" fill="#ffcf2c" stroke="#ff8a27" stroke-width="4"/><path d="m24 55 31 25m-24-45 38 31M57 22l7-13m14 36 15-4m-22-9 13-13" stroke="#ff8f27" stroke-width="6"/><circle cx="83" cy="64" r="5" fill="#60c6ed"/><circle cx="43" cy="9" r="5" fill="#ff81aa"/>',
};
class CrayonArt extends HTMLElement {
  connectedCallback() {
    this.setAttribute("aria-hidden", "true");
    const name = this.getAttribute("name");
    if (sprites[name]) {
      const [x, y] = sprites[name];
      this.classList.add("sprite");
      this.style.setProperty("--sprite-x", `${(x * 100) / 3}%`);
      this.style.setProperty("--sprite-y", `${(y * 100) / 3}%`);
    } else
      this.innerHTML = `<svg viewBox="0 0 100 100" fill="none">${drawings[name] || drawings.heart}</svg>`;
  }
}
customElements.define("crayon-art", CrayonArt);
