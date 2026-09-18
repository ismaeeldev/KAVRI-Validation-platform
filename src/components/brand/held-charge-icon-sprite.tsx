// A single hidden <svg> holding every icon used across the "Held Charge"
// landing redesign as a reusable <g>/<symbol> definition. Any component in
// this design can then render an icon with:
//   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6}>
//     <use href="#i-refresh" />
//   </svg>
//
// The defs markup is static, hand-authored SVG path data (~40 icons plus
// the two brand marks), ported unchanged from the client-provided design.
// It's injected via dangerouslySetInnerHTML rather than transcribed
// attribute-by-attribute into JSX (stroke-width -> strokeWidth, etc.) —
// that would be ~40 opportunities for a typo with no visual benefit, since
// none of this content is ever dynamic.
const ICON_DEFS = `
  <g id="i-play"><path d="M5 3l14 9-14 9V3z"/></g>
  <g id="i-target"><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4"/><circle cx="12" cy="12" r="0.6" fill="currentColor"/></g>
  <g id="i-wave"><path d="M3 12c2-4 4-4 6 0s4 4 6 0 4-4 6 0"/></g>
  <g id="i-shield"><path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z"/></g>
  <g id="i-drop"><path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z"/></g>
  <g id="i-refresh"><path d="M4 12a8 8 0 0 1 14-5.3M20 12a8 8 0 0 1-14 5.3"/><path d="M18 3v4h-4M6 21v-4h4"/></g>
  <g id="i-users"><circle cx="9" cy="8" r="3"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6"/><circle cx="17.5" cy="9.5" r="2.3"/><path d="M15 20c.2-2.6 2-4.7 4.4-5.4"/></g>
  <g id="i-flask"><path d="M9 3h6M10 3v6l-5.5 9.5A2 2 0 0 0 6.2 21h11.6a2 2 0 0 0 1.7-2.5L14 9V3"/><path d="M7.5 15h9"/></g>
  <g id="i-calipers"><path d="M4 5l7 15M20 5l-7 15M6 8h3M15 8h3M7.5 11.5h2M14.5 11.5h2"/></g>
  <g id="i-court"><rect x="4" y="6" width="16" height="12" rx="1"/><path d="M12 6v12M4 12h16"/><circle cx="9" cy="9" r="0.8" fill="currentColor"/></g>
  <g id="i-compare"><path d="M4 20V10M10 20V4M16 20v-7M4 20h16"/></g>
  <g id="i-log"><path d="M6 3h9l4 4v14H6z"/><path d="M15 3v4h4"/><path d="M9 12h7M9 16h7M9 8h3"/></g>
  <g id="i-branch"><circle cx="6" cy="6" r="2.2"/><circle cx="6" cy="18" r="2.2"/><circle cx="18" cy="12" r="2.2"/><path d="M6 8.2V18M6 8.2C6 12 10 12 15.8 12"/></g>
  <g id="i-arrow-l"><path d="M15 5 8 12l7 7"/></g>
  <g id="i-arrow-r"><path d="M9 5l7 7-7 7"/></g>
  <g id="i-mail"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m4 6.5 8 6 8-6"/></g>
  <g id="i-material"><path d="M12 3 3 8l9 5 9-5-9-5z"/><path d="M3 16l9 5 9-5M3 12l9 5 9-5"/></g>
  <g id="i-carbon"><path d="M12 4 4 8.5 12 13 20 8.5Z M4 8.5v2M20 8.5v2M12 13v2M4 10.5 12 15 20 10.5"/></g>
  <g id="i-foam"><path d="M12 3 3 8l9 5 9-5-9-5z"/><path d="M3 16l9 5 9-5M3 12l9 5 9-5"/></g>
  <g id="i-grip"><rect x="9" y="3.5" width="6" height="17" rx="1.4"/></g>
  <g id="i-frame"><path d="M5 9V6a1 1 0 0 1 1-1h3M19 9V6a1 1 0 0 0-1-1h-3M5 15v3a1 1 0 0 0 1 1h3M19 15v3a1 1 0 0 1-1 1h-3"/></g>
  <g id="i-broadcast"><circle cx="12" cy="12" r="1.6" fill="currentColor" stroke="none"/><path d="M8 9a4.2 4.2 0 0 0 0 6M16 9a4.2 4.2 0 0 1 0 6"/></g>
  <g id="i-pipeline"><path d="M4 12h16"/><circle cx="4" cy="12" r="2.1" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="2.1"/><circle cx="20" cy="12" r="2.1"/></g>
  <g id="i-axis"><path d="M12 4v16M4 12h16"/><circle cx="12" cy="12" r="2.4"/></g>
  <g id="i-gate"><path d="M6 21V5M18 21V5M6 5h12"/></g>
  <g id="i-wrench"><path d="M14.7 6.3a4 4 0 1 1-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 1 5.4-5.4l-3 3-2-2z"/></g>
  <g id="i-badge"><path d="M12 3 19 6.5v6c0 4.5-3 7-7 8.5-4-1.5-7-4-7-8.5v-6z"/><path d="M9 12.5l2 2 4-4.5"/></g>
  <g id="i-craft"><path d="M14 4 20 10 10 20H4v-6L14 4z"/><path d="M12.5 5.5 18.5 11.5"/></g>
  <g id="i-lock"><rect x="5" y="10.5" width="14" height="10" rx="2"/><path d="M8 10.5V7a4 4 0 1 1 8 0v3.5"/></g>
  <g id="i-play-outline"><circle cx="12" cy="12" r="9"/><path d="M10 8.5v7l6-3.5-6-3.5z"/></g>
  <g id="i-ig"><rect x="3.5" y="3.5" width="17" height="17" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17" cy="7" r="1" fill="currentColor"/></g>
  <symbol id="wm-B2" viewBox="0 0 1637 179"><path d="M 782,169 L 659,34 L 622,13 L 583,3 L 528,3 L 471,19 L 441,40 L 344,135 L 314,148 L 275,139 L 187,95 L 185,89 L 281,43 L 339,8 L 338,3 L 267,7 L 81,91 L 249,170 L 340,173 L 388,157 L 508,47 L 536,36 L 564,35 L 582,39 L 611,57 L 713,163 L 738,171 Z M 4,3 L 1,6 L 0,168 L 4,174 L 59,174 L 62,171 L 62,6 L 59,3 Z M 1580,1 L 1574,6 L 1574,173 L 1578,177 L 1629,177 L 1635,171 L 1635,5 L 1631,1 Z M 689,13 L 809,143 L 835,161 L 881,174 L 932,172 L 975,156 L 1087,53 L 1123,32 L 1413,31 L 1432,38 L 1442,57 L 1438,74 L 1419,86 L 1151,90 L 1219,115 L 1312,126 L 1412,178 L 1509,176 L 1409,127 L 1469,111 L 1499,78 L 1502,54 L 1492,28 L 1479,14 L 1448,2 L 1082,5 L 1044,26 L 940,126 L 905,141 L 861,126 L 755,17 Z "/></symbol>
  <symbol id="mk-02C" viewBox="0 0 370 282"><path d="M 145,7 L 117,26 L 34,103 L 0,137 L 116,281 L 194,281 L 239,233 L 301,162 L 273,162 L 207,222 L 197,227 L 187,227 L 180,224 L 172,216 L 105,133 L 43,133 L 41,129 L 147,9 Z M 176,0 L 72,115 L 71,119 L 97,120 L 101,118 L 171,55 L 177,52 L 191,52 L 202,61 L 269,145 L 329,147 L 331,150 L 232,263 L 234,265 L 251,256 L 369,145 L 369,141 L 254,0 Z "/></symbol>
`;

export function HeldChargeIconSprite() {
  return (
    <svg
      width="0"
      height="0"
      style={{ position: "absolute" }}
      aria-hidden="true"
      focusable="false"
    >
      <defs dangerouslySetInnerHTML={{ __html: ICON_DEFS }} />
    </svg>
  );
}
