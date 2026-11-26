import { writeFileSync, mkdirSync } from "node:fs";
const dir = new URL("../public/illustrations/", import.meta.url);
mkdirSync(dir, { recursive: true });
const defs = `<defs><filter id="rough" x="-8%" y="-15%" width="116%" height="130%"><feTurbulence type="fractalNoise" baseFrequency=".045" numOctaves="3" seed="12" result="noise"/><feDisplacementMap in="SourceGraphic" in2="noise" scale="5"/></filter><filter id="grain"><feTurbulence type="fractalNoise" baseFrequency=".65" numOctaves="3" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/><feComponentTransfer><feFuncA type="linear" slope=".2"/></feComponentTransfer></filter><pattern id="wax" width="12" height="9" patternUnits="userSpaceOnUse"><path d="m0 5 7-3m2 8 9-5m-1-4 4-3" stroke="white" stroke-width="1.3" opacity=".65"/></pattern></defs>`;
function save(name, body, box) {
  writeFileSync(
    new URL(name + ".svg", dir),
    `<svg preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg" viewBox="${box}">${defs}<g filter="url(#rough)" stroke-linecap="round" stroke-linejoin="round">${body}</g></svg>`,
  );
}
save(
  "waves",
  `<path d="M-30 62Q70 8 170 56T370 50T570 58T770 48T970 58T1170 50T1370 55" fill="none" stroke="#30b4eb" stroke-width="37"/><path d="M-30 63Q70 9 170 57T370 51T570 59T770 49T970 59T1170 51T1370 56" fill="none" stroke="#e8faff" stroke-width="15"/><path d="M-30 75Q70 21 170 69T370 63T570 71T770 61T970 71T1170 63T1370 68" fill="none" stroke="#67cbf5" stroke-width="7"/><path d="M-30 62Q70 8 170 56T370 50T570 58T770 48T970 58T1170 50T1370 55" fill="none" stroke="url(#wax)" stroke-width="39"/>`,
  "0 0 1200 110",
);
save(
  "hills",
  `<path d="M-20 84Q70 120 150 70T330 72T510 92T690 78T870 56T1050 68T1230 72" fill="none" stroke="#81cf55" stroke-width="23"/><path d="M-20 85Q70 120 150 71T330 73T510 93T690 79T870 57T1050 69T1230 73" fill="none" stroke="#fffde9" stroke-width="5"/><path d="M-20 84Q70 120 150 70T330 72T510 92T690 78T870 56T1050 68T1230 72" fill="none" stroke="url(#wax)" stroke-width="26"/><path d="M34 81V38m0 26Q0 36 13 31q23-9 21 33m0-9q31-36 35-19T34 63M1040 60V15m0 31q-34-36-34-12t34 21m0-10q37-40 39-20t-39 29M1130 71V39m0 13q-25-27-26-10t26 17" fill="none" stroke="#47b94b" stroke-width="9"/><g fill="#ff79a4"><circle cx="33" cy="30" r="9"/><circle cx="21" cy="23" r="9"/><circle cx="40" cy="17" r="9"/><circle cx="48" cy="30" r="9"/><circle cx="1130" cy="32" r="11"/></g><g fill="#ffce27"><circle cx="34" cy="27" r="5"/><circle cx="1130" cy="32" r="5"/></g>`,
  "0 0 1200 135",
);
save(
  "brush",
  `<path d="M25 52 292 22M16 73 301 42M28 91 285 63M49 108 272 86" stroke="currentColor" stroke-width="25"/><path d="M25 52 292 22M16 73 301 42M28 91 285 63M49 108 272 86" stroke="url(#wax)" stroke-width="28"/>`,
  "0 0 320 130",
);
save(
  "paper",
  `<rect width="180" height="180" fill="#fffaf3"/><rect width="180" height="180" filter="url(#grain)" opacity=".28"/>`,
  "0 0 180 180",
);
console.log(
  "Created independent crayon waves, hills, brush and paper texture.",
);
