/* =====================================================
   KEYBOARD COLOR CONTROL (HUE + NAME + BRIGHTNESS)
   ===================================================== */

(function (global) {

  let active = false;
  let userTypedHex = false;
  let isGrayscale = false;

  let typedQuery = "";
  let matches = [];
  let matchIndex = -1;
  let activeName = null;

  let focusMode = "hue"; // "hue" | "brightness" | "name" | "code"

  let huePos = 50;
  let hue = 180;
  let saturation = 80;
  let lightness = 50;

  let outer, panel, colorBox;
  let hueBox, hueMarker;
  let brightnessBox, brightnessMarker;
  let searchBox;

  // Slider path + slider
  let focusTrack;
  let focusIndicator;

  /* ================= COLORS ================= */

  const COLORS = {
  transparent: { hex: "transparent", a: 0 },

  aliceblue: { hex: "#f0f8ff", h: 208, s: 100, l: 97 },
  antiquewhite: { hex: "#faebd7", h: 34, s: 78, l: 91 },
  aqua: { hex: "#00ffff", h: 180, s: 100, l: 50 },
  aquamarine: { hex: "#7fffd4", h: 160, s: 100, l: 75 },
  azure: { hex: "#f0ffff", h: 180, s: 100, l: 97 },
  beige: { hex: "#f5f5dc", h: 60, s: 56, l: 91 },
  bisque: { hex: "#ffe4c4", h: 33, s: 100, l: 88 },
  black: { hex: "#000000", h: 0, s: 0, l: 0 },
  blanchedalmond: { hex: "#ffebcd", h: 36, s: 100, l: 90 },
  blue: { hex: "#0000ff", h: 240, s: 100, l: 50 },
  blueviolet: { hex: "#8a2be2", h: 271, s: 76, l: 53 },
  brown: { hex: "#a52a2a", h: 0, s: 59, l: 41 },
  burlywood: { hex: "#deb887", h: 34, s: 57, l: 70 },
  cadetblue: { hex: "#5f9ea0", h: 182, s: 25, l: 50 },
  chartreuse: { hex: "#7fff00", h: 90, s: 100, l: 50 },
  chocolate: { hex: "#d2691e", h: 25, s: 75, l: 47 },
  coral: { hex: "#ff7f50", h: 16, s: 100, l: 66 },
  cornflowerblue: { hex: "#6495ed", h: 219, s: 79, l: 66 },
  cornsilk: { hex: "#fff8dc", h: 48, s: 100, l: 93 },
  crimson: { hex: "#dc143c", h: 348, s: 83, l: 47 },
  cyan: { hex: "#00ffff", h: 180, s: 100, l: 50 },

  darkblue: { hex: "#00008b", h: 240, s: 100, l: 27 },
  darkcyan: { hex: "#008b8b", h: 180, s: 100, l: 27 },
  darkgoldenrod: { hex: "#b8860b", h: 43, s: 89, l: 38 },
  darkgray: { hex: "#a9a9a9", h: 0, s: 0, l: 66 },
  darkgreen: { hex: "#006400", h: 120, s: 100, l: 20 },
  darkgrey: { hex: "#a9a9a9", h: 0, s: 0, l: 66 },
  darkkhaki: { hex: "#bdb76b", h: 56, s: 38, l: 58 },
  darkmagenta: { hex: "#8b008b", h: 300, s: 100, l: 27 },
  darkolivegreen: { hex: "#556b2f", h: 82, s: 39, l: 30 },
  darkorange: { hex: "#ff8c00", h: 33, s: 100, l: 50 },
  darkorchid: { hex: "#9932cc", h: 280, s: 61, l: 50 },
  darkred: { hex: "#8b0000", h: 0, s: 100, l: 27 },
  darksalmon: { hex: "#e9967a", h: 15, s: 72, l: 70 },
  darkseagreen: { hex: "#8fbc8f", h: 120, s: 25, l: 65 },
  darkslateblue: { hex: "#483d8b", h: 248, s: 39, l: 39 },
  darkslategray: { hex: "#2f4f4f", h: 180, s: 25, l: 25 },
  darkslategrey: { hex: "#2f4f4f", h: 180, s: 25, l: 25 },
  darkturquoise: { hex: "#00ced1", h: 181, s: 100, l: 41 },
  darkviolet: { hex: "#9400d3", h: 282, s: 100, l: 41 },

  deeppink: { hex: "#ff1493", h: 328, s: 100, l: 54 },
  deepskyblue: { hex: "#00bfff", h: 195, s: 100, l: 50 },
  dimgray: { hex: "#696969", h: 0, s: 0, l: 41 },
  dimgrey: { hex: "#696969", h: 0, s: 0, l: 41 },
  dodgerblue: { hex: "#1e90ff", h: 210, s: 100, l: 56 },

  firebrick: { hex: "#b22222", h: 0, s: 68, l: 42 },
  floralwhite: { hex: "#fffaf0", h: 40, s: 100, l: 97 },
  forestgreen: { hex: "#228b22", h: 120, s: 61, l: 34 },
  fuchsia: { hex: "#ff00ff", h: 300, s: 100, l: 50 },

  gainsboro: { hex: "#dcdcdc", h: 0, s: 0, l: 86 },
  ghostwhite: { hex: "#f8f8ff", h: 240, s: 100, l: 99 },
  gold: { hex: "#ffd700", h: 51, s: 100, l: 50 },
  goldenrod: { hex: "#daa520", h: 43, s: 74, l: 49 },
  gray: { hex: "#808080", h: 0, s: 0, l: 50 },
  grey: { hex: "#808080", h: 0, s: 0, l: 50 },
  green: { hex: "#008000", h: 120, s: 100, l: 25 },
  greenyellow: { hex: "#adff2f", h: 84, s: 100, l: 59 },

  honeydew: { hex: "#f0fff0", h: 120, s: 100, l: 97 },
  hotpink: { hex: "#ff69b4", h: 330, s: 100, l: 71 },

  indianred: { hex: "#cd5c5c", h: 0, s: 53, l: 58 },
  indigo: { hex: "#4b0082", h: 275, s: 100, l: 25 },
  ivory: { hex: "#fffff0", h: 60, s: 100, l: 97 },

  khaki: { hex: "#f0e68c", h: 54, s: 77, l: 75 },

  lavender: { hex: "#e6e6fa", h: 240, s: 67, l: 94 },
  lavenderblush: { hex: "#fff0f5", h: 340, s: 100, l: 97 },
  lawngreen: { hex: "#7cfc00", h: 90, s: 100, l: 49 },
  lemonchiffon: { hex: "#fffacd", h: 54, s: 100, l: 90 },
  lightblue: { hex: "#add8e6", h: 195, s: 53, l: 79 },
  lightcoral: { hex: "#f08080", h: 0, s: 79, l: 72 },
  lightcyan: { hex: "#e0ffff", h: 180, s: 100, l: 94 },
  lightgoldenrodyellow: { hex: "#fafad2", h: 60, s: 80, l: 90 },
  lightgray: { hex: "#d3d3d3", h: 0, s: 0, l: 83 },
  lightgrey: { hex: "#d3d3d3", h: 0, s: 0, l: 83 },
  lightgreen: { hex: "#90ee90", h: 120, s: 73, l: 75 },
  lightpink: { hex: "#ffb6c1", h: 351, s: 100, l: 86 },
  lightsalmon: { hex: "#ffa07a", h: 17, s: 100, l: 74 },
  lightseagreen: { hex: "#20b2aa", h: 177, s: 70, l: 41 },
  lightskyblue: { hex: "#87cefa", h: 203, s: 92, l: 75 },
  lightslategray: { hex: "#778899", h: 210, s: 14, l: 66 },
  lightslategrey: { hex: "#778899", h: 210, s: 14, l: 66 },
  lightsteelblue: { hex: "#b0c4de", h: 214, s: 41, l: 78 },
  lightyellow: { hex: "#ffffe0", h: 60, s: 100, l: 94 },

  lime: { hex: "#00ff00", h: 120, s: 100, l: 50 },
  limegreen: { hex: "#32cd32", h: 120, s: 61, l: 50 },
  linen: { hex: "#faf0e6", h: 30, s: 67, l: 94 },

  magenta: { hex: "#ff00ff", h: 300, s: 100, l: 50 },
  maroon: { hex: "#800000", h: 0, s: 100, l: 25 },
  mediumaquamarine: { hex: "#66cdaa", h: 160, s: 51, l: 60 },
  mediumblue: { hex: "#0000cd", h: 240, s: 100, l: 40 },
  mediumorchid: { hex: "#ba55d3", h: 288, s: 59, l: 58 },
  mediumpurple: { hex: "#9370db", h: 260, s: 60, l: 65 },
  mediumseagreen: { hex: "#3cb371", h: 147, s: 50, l: 47 },
  mediumslateblue: { hex: "#7b68ee", h: 249, s: 80, l: 67 },
  mediumspringgreen: { hex: "#00fa9a", h: 157, s: 100, l: 49 },
  mediumturquoise: { hex: "#48d1cc", h: 178, s: 60, l: 55 },
  mediumvioletred: { hex: "#c71585", h: 322, s: 81, l: 43 },
  midnightblue: { hex: "#191970", h: 240, s: 64, l: 27 },
  mintcream: { hex: "#f5fffa", h: 150, s: 100, l: 98 },
  mistyrose: { hex: "#ffe4e1", h: 6, s: 100, l: 94 },
  moccasin: { hex: "#ffe4b5", h: 38, s: 100, l: 85 },

  navy: { hex: "#000080", h: 240, s: 100, l: 25 },

  oldlace: { hex: "#fdf5e6", h: 39, s: 85, l: 95 },
  olive: { hex: "#808000", h: 60, s: 100, l: 25 },
  olivedrab: { hex: "#6b8e23", h: 80, s: 60, l: 35 },
  orange: { hex: "#ffa500", h: 39, s: 100, l: 50 },
  orangered: { hex: "#ff4500", h: 16, s: 100, l: 50 },
  orchid: { hex: "#da70d6", h: 302, s: 59, l: 65 },

  palegoldenrod: { hex: "#eee8aa", h: 55, s: 67, l: 80 },
  palegreen: { hex: "#98fb98", h: 120, s: 93, l: 79 },
  paleturquoise: { hex: "#afeeee", h: 180, s: 65, l: 81 },
  palevioletred: { hex: "#db7093", h: 340, s: 60, l: 65 },
  papayawhip: { hex: "#ffefd5", h: 37, s: 100, l: 92 },
  peachpuff: { hex: "#ffdab9", h: 28, s: 100, l: 86 },
  peru: { hex: "#cd853f", h: 30, s: 59, l: 53 },
  pink: { hex: "#ffc0cb", h: 350, s: 100, l: 88 },
  plum: { hex: "#dda0dd", h: 300, s: 47, l: 75 },
  powderblue: { hex: "#b0e0e6", h: 187, s: 52, l: 80 },
  purple: { hex: "#800080", h: 300, s: 100, l: 25 },

  rebeccapurple: { hex: "#663399", h: 270, s: 50, l: 40 },
  red: { hex: "#ff0000", h: 0, s: 100, l: 50 },
  rosybrown: { hex: "#bc8f8f", h: 0, s: 25, l: 65 },
  royalblue: { hex: "#4169e1", h: 225, s: 73, l: 57 },

  saddlebrown: { hex: "#8b4513", h: 25, s: 76, l: 31 },
  salmon: { hex: "#fa8072", h: 6, s: 93, l: 71 },
  sandybrown: { hex: "#f4a460", h: 28, s: 87, l: 67 },
  seagreen: { hex: "#2e8b57", h: 146, s: 50, l: 36 },
  seashell: { hex: "#fff5ee", h: 25, s: 100, l: 97 },
  sienna: { hex: "#a0522d", h: 19, s: 56, l: 40 },
  silver: { hex: "#c0c0c0", h: 0, s: 0, l: 75 },
  skyblue: { hex: "#87ceeb", h: 197, s: 71, l: 73 },
  slateblue: { hex: "#6a5acd", h: 248, s: 53, l: 58 },
  slategray: { hex: "#708090", h: 210, s: 13, l: 50 },
  slategrey: { hex: "#708090", h: 210, s: 13, l: 50 },
  snow: { hex: "#fffafa", h: 0, s: 100, l: 99 },
  springgreen: { hex: "#00ff7f", h: 150, s: 100, l: 50 },
  steelblue: { hex: "#4682b4", h: 207, s: 44, l: 49 },

  tan: { hex: "#d2b48c", h: 34, s: 44, l: 69 },
  teal: { hex: "#008080", h: 180, s: 100, l: 25 },
  thistle: { hex: "#d8bfd8", h: 300, s: 24, l: 80 },
  tomato: { hex: "#ff6347", h: 9, s: 100, l: 64 },
  turquoise: { hex: "#40e0d0", h: 174, s: 72, l: 56 },

  violet: { hex: "#ee82ee", h: 300, s: 76, l: 72 },

  wheat: { hex: "#f5deb3", h: 39, s: 77, l: 83 },
  white: { hex: "#ffffff", h: 0, s: 0, l: 100 },
  whitesmoke: { hex: "#f5f5f5", h: 0, s: 0, l: 96 },

  yellow: { hex: "#ffff00", h: 60, s: 100, l: 50 },
  yellowgreen: { hex: "#9acd32", h: 80, s: 61, l: 50 }
};



  const ALL_NAMES = Object.keys(COLORS);

/* ================= COLOR CODE DETECTION ================= */

function applyColorCodeAndSyncUI(code) {
  if (!isColorCode(code)) return;

  let h, s, l;

  // --- HEX ---
  if (code.startsWith("#")) {
    let hex = code;

    if (hex.length === 4) {
      hex =
        "#" +
        hex[1] + hex[1] +
        hex[2] + hex[2] +
        hex[3] + hex[3];
    }

    if (hex.length !== 7) return;

    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    l = (max + min) / 2;

    if (max === min) {
      h = 0;
      s = 0;
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h *= 60;
    }
  }

  // --- RGB ---
  else if (code.startsWith("rgb")) {
    const nums = code.match(/\d+/g);
    if (!nums || nums.length < 3) return;

    const r = nums[0] / 255;
    const g = nums[1] / 255;
    const b = nums[2] / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    l = (max + min) / 2;

    if (max === min) {
      h = 0;
      s = 0;
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h *= 60;
    }
  }

  // --- HSL ---
  else if (code.startsWith("hsl")) {
    const nums = code.match(/\d+/g);
    if (!nums || nums.length < 3) return;

    h = parseInt(nums[0], 10);
    s = parseInt(nums[1], 10) / 100;
    l = parseInt(nums[2], 10) / 100;
  }

  // ✅ SINGLE SOURCE OF TRUTH
  hue = Math.round(h);
  saturation = Math.round(s * 100);
  lightness = Math.round(l * 100);
  huePos = Math.round((hue / 360) * 97);

  updateVisuals();
}


function isColorCode(input) {
  if (!input) return false;

  const v = input.trim().toLowerCase();

  return (
    /^#([0-9a-f]{3})$/.test(v) ||
    /^#([0-9a-f]{6})$/.test(v) ||
    /^#([0-9a-f]{8})$/.test(v) ||
    /^rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)$/.test(v) ||
    /^rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*(0|1|0?\.\d+)\s*\)$/.test(v) ||
    /^hsl\(\s*\d+\s*,\s*\d+%\s*,\s*\d+%\s*\)$/.test(v) ||
    /^hsla\(\s*\d+\s*,\s*\d+%\s*,\s*\d+%\s*,\s*(0|1|0?\.\d+)\s*\)$/.test(v)
  );
}

function adjustColorCode(code, dir) {
  // #RGB → expand to #RRGGBB
  if (/^#([0-9a-f]{3})$/i.test(code)) {
    const r = code[1];
    const g = code[2];
    const b = code[3];
    code = "#" + r + r + g + g + b + b;
  }

  // #RRGGBB
  if (/^#([0-9a-f]{6})$/i.test(code)) {
    let num = parseInt(code.slice(1), 16);
    num += dir * 0x010101;
    num = Math.max(0, Math.min(0xFFFFFF, num));
    return "#" + num.toString(16).padStart(6, "0");
  }

  return code;
}

function applyHexColor(hex) {
  if (!isColorCode(hex)) return;

  // expand #RGB → #RRGGBB
  if (hex.length === 4) {
    hex =
      "#" +
      hex[1] + hex[1] +
      hex[2] + hex[2] +
      hex[3] + hex[3];
  }

  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h *= 60;
  }

  // 🔑 THESE LINES ARE THE POINT
  hue = Math.round(h);
  saturation = Math.round(s * 100);
  lightness = Math.round(l * 100);
  huePos = Math.round((hue / 360) * 97);

  global.currentColor = hsl(); // normalize to HSL
  updateVisuals();             // redraw hue strip + color box
}

function syncHueStripFromSearch(input) {
  if (!isColorCode(input)) return;

  let r, g, b;

  // --- HEX ---
  if (input.startsWith("#")) {
    let hex = input;

    // expand #RGB → #RRGGBB
    if (hex.length === 4) {
      hex =
        "#" +
        hex[1] + hex[1] +
        hex[2] + hex[2] +
        hex[3] + hex[3];
    }

    if (hex.length !== 7) return;

    r = parseInt(hex.slice(1, 3), 16) / 255;
    g = parseInt(hex.slice(3, 5), 16) / 255;
    b = parseInt(hex.slice(5, 7), 16) / 255;
  }

  // --- RGB ---
  else if (input.startsWith("rgb")) {
    const nums = input.match(/\d+/g);
    if (!nums || nums.length < 3) return;

    r = nums[0] / 255;
    g = nums[1] / 255;
    b = nums[2] / 255;
  }

  // --- HSL ---
  else if (input.startsWith("hsl")) {
    const nums = input.match(/\d+/g);
    if (!nums || nums.length < 3) return;

    hue = Math.min(360, parseInt(nums[0], 10));
    saturation = Math.min(100, parseInt(nums[1], 10));
    lightness = Math.min(100, parseInt(nums[2], 10));
    huePos = Math.round((hue / 360) * 97);

    updateVisuals();
    return;
  }

  // --- RGB → HSL conversion ---
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h *= 60;
  }

  hue = Math.round(h);
  saturation = Math.round(s * 100);
  lightness = Math.round(l * 100);
  huePos = Math.round((hue / 360) * 97);

  updateVisuals();
}


function hslToHex(h, s, l) {
  s /= 100;
  l /= 100;

  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;

  let r = 0, g = 0, b = 0;

  if (h < 60)      [r, g, b] = [c, x, 0];
  else if (h < 120)[r, g, b] = [x, c, 0];
  else if (h < 180)[r, g, b] = [0, c, x];
  else if (h < 240)[r, g, b] = [0, x, c];
  else if (h < 300)[r, g, b] = [x, 0, c];
  else             [r, g, b] = [c, 0, x];

  const toHex = v =>
    Math.round((v + m) * 255).toString(16).padStart(2, "0");

  return "#" + toHex(r) + toHex(g) + toHex(b);
}



  function hsl() {
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  }

  /* ================= FOCUS SLIDER ================= */

 function updateFocusIndicator() {
  if (!focusIndicator || !focusTrack || !panel) return;

  // Get bounding boxes
  const panelRect = panel.getBoundingClientRect();
  const hueRect = hueBox.getBoundingClientRect();
  const searchRect = searchBox.getBoundingClientRect();

  // Calculate usable track range
  const trackTop =
    hueRect.top - panelRect.top;

  const trackBottom =
    searchRect.bottom - panelRect.top;

  const trackHeight = trackBottom - trackTop;
  const sliderH = focusIndicator.offsetHeight;

  // Update track position + size
  focusTrack.style.top = Math.round(trackTop) + "px";
  focusTrack.style.height = Math.round(trackHeight) + "px";

  // Position slider within that range
  const positions = {
  hue: 0,
  brightness: 0.5,
  name: 1,
  code: 1   // ✅ ADD THIS
};

  const t = positions[focusMode];
  const maxTop = trackHeight - sliderH;

  focusIndicator.style.top =
    Math.round(maxTop * t) + "px";
}



  /* ================= COLOR BOX ================= */

 function updateColorBox() {
  const color = hsl();
  colorBox.style.background = color;

  // Always keep visible neutral border
  colorBox.style.transition = "box-shadow 0.2s ease";

  colorBox.style.boxShadow =
    "0 0 0 1px rgba(0,0,0,0.4)";
}

  /* ================= HUE ================= */

function grayHexFromLightness(l) {
  const v = Math.round((l / 100) * 255)
    .toString(16)
    .padStart(2, "0");
  return "#" + v + v + v;
}


function applyHuePos() {
  // Right-end grayscale zone
  if (huePos >= 97) {
    isGrayscale = true;
    saturation = 0;
    hue = 0; // irrelevant when saturation = 0
    // keep existing lightness (do NOT reset)
    return;
  }

  // Normal color zone
  isGrayscale = false;
  hue = Math.round((huePos / 97) * 360);
  saturation = 80;
}



  /* ================= VISUAL UPDATE ================= */

  function updateVisuals() {
    updateColorBox();
    updateFocusIndicator();

    hueMarker.style.left = (huePos / 97) * 100 + "%";


    brightnessBox.style.background = `
      linear-gradient(
        to right,
        black,
        hsl(${hue}, ${saturation}%, 50%),
        white
      )
    `;
    brightnessBox.style.border = "1px solid #aaa";

    brightnessMarker.style.left = lightness + "%";
    brightnessMarker.style.background =
      lightness < 20 ? "#fff" : "#000";
    brightnessMarker.style.boxShadow =
      "0 0 0 1px rgba(0,0,0,0.6)";
  }

  /* ================= SEARCH ================= */

let cursorVisible = true;

setInterval(() => {
  cursorVisible = !cursorVisible;
  if (active) updateSearchText();
}, 500);


function updateSearchText() {
  const placeholder = " color name or color code";
  const hasText = activeName || typedQuery;

  const baseText = activeName || typedQuery || placeholder;

  const showCursor =
    (focusMode === "name" || focusMode === "code") && cursorVisible;

  // Always reserve cursor space using zero-width visibility trick
  const cursor = showCursor ? "|" : "\u200A"; // hair space

  if (!hasText) {
    // cursor at START when empty
    searchBox.textContent = cursor + baseText;
  } else {
    // cursor at END when typing
    searchBox.textContent = baseText + cursor;
  }
}

function compressHex(hex) {
  if (
    hex[1] === hex[2] &&
    hex[3] === hex[4] &&
    hex[5] === hex[6]
  ) {
    return "#" + hex[1] + hex[3] + hex[5];
  }
  return hex;
}



function updateMatches() {
  const query = typedQuery.trim().toLowerCase();

  // Code mode → no name matching
  if (isColorCode(query) || query.startsWith("#")) {
    matches = [];
    matchIndex = -1;
    activeName = null;
    return;
  }

  matches = query
    ? ALL_NAMES.filter(n => n.startsWith(query))
    : ALL_NAMES;

  // ❗ DO NOT clear activeName if cycling
  if (typedQuery && (!activeName || !matches.includes(activeName))) {
    matchIndex = -1;
    activeName = null;
  }
}



  function applyNameColor(name) {
  const val = COLORS[name];

  if (typeof val === "object") {
    hue = val.h ?? hue;
    saturation = val.s ?? saturation;
    lightness = val.l ?? lightness;
    huePos = Math.round((hue / 360) * 97);
    return;
  }

  hue = val;
  huePos = Math.round((hue / 360) * 97);
  saturation = 80;
  lightness = 50;
}

  function cycleName(dir) {
    if (!matches.length) return;

    matchIndex =
      matchIndex === -1
        ? 0
        : (matchIndex + dir + matches.length) % matches.length;

    activeName = matches[matchIndex];
    applyNameColor(activeName);

    updateVisuals();
    updateSearchText();
  }

  /* ================= UI ================= */

  function openUI() {
    closeUI();

    outer = document.createElement("div");
    outer.style.cssText = `
      position: fixed;
      top: 90px;
      left: 50%;
      transform: translateX(-50%);
      padding: 4px;
      background: rgba(220,220,220,0.95);
      border-radius: 12px;
      border: 1px solid #999;
      z-index: 10001;
      font-family: system-ui, sans-serif;
    `;

    panel = document.createElement("div");
    panel.style.cssText = `
      position: relative;
      display: grid;
      grid-template-columns: 28px 1fr;
      gap: 3px 6px;
      padding: 3px 28px 3px 10px;   /* ⬅ reduces popup length */
      background: #fff;
      border-radius: 8px;
      max-width: 235px;
    `;

    colorBox = document.createElement("div");
    colorBox.style.cssText = `
      grid-row: span 3;
      align-self: center;
      width: 38px;
      height: 38px;
      border-radius: 6px;
      margin-left: -7px;   /* horizontal adjustment */
      margin-top: -2px;   /* moves color box up */
    `;

    hueBox = document.createElement("div");
    hueBox.style.cssText = `
      position: relative;
      height: 14px;
      width: 180px;
      border: 1px solid #aaa;
      background: linear-gradient(
        to right,
        red,
        yellow,
        lime,
        cyan,
        blue,
        magenta,
        red 97%,
        white 100%
      );
    `;

    hueMarker = document.createElement("div");
    hueMarker.style.cssText = `
      position: absolute;
      top: -2px;
      bottom: -2px;
      width: 2px;
      background: #000;
      transform: translateX(-1px);
      border-radius: 1px;
    `;
    hueBox.appendChild(hueMarker);

    brightnessBox = document.createElement("div");
    brightnessBox.style.cssText = `
    position: relative;
    height: 6px;
    width: 100%;
    border-radius: 4px;
  `;


    brightnessMarker = document.createElement("div");
    brightnessMarker.style.cssText = `
      position: absolute;
      top: -1px; bottom: -1px;
      width: 2px;
    `;
    brightnessBox.appendChild(brightnessMarker);

    searchBox = document.createElement("div");
    searchBox.style.cssText = `
      height: 14px;
      font: 12px monospace;
      border-bottom: 1px solid #aaa;
      display: flex;
      align-items: center;
      minWidth = "140px";
    `;

    /* ===== Slider PATH ===== */
    focusTrack = document.createElement("div");
    focusTrack.style.cssText = `
      position: absolute;
      left: 226px;
      width: 6px;
      border-radius: 4px;
      background: rgba(0,0,0,0.04);
      border: 1px solid #bbb;
    `;

    /* ===== Slider ===== */
    focusIndicator = document.createElement("div");
    focusIndicator.style.cssText = `
      position: absolute;
      left: 50%;
      transform: translateX(-50%);
      width: 4px;
      height: 14px;
      background: #000;
      border: 1px solid #888;
      border-radius: 7px;
      box-shadow: 0 1px 1px rgba(0,0,0,0.2);
      transition: top 0.15s ease;
    `;


    panel.append(colorBox, hueBox, brightnessBox, searchBox);
    panel.appendChild(focusTrack);
    focusTrack.appendChild(focusIndicator);

    outer.appendChild(panel);
    document.body.appendChild(outer);

    updateMatches();
    updateSearchText();
    updateVisuals();
  }

  function closeUI() {
    outer?.remove();
    outer = panel = colorBox =
    hueBox = hueMarker =
    brightnessBox = brightnessMarker =
    searchBox = focusTrack = focusIndicator = null;
  }

  /* ================= CONTROLLER ================= */

  const KeyboardColorControl = {

    open() {
      if (active) return;
      active = true;
      typedQuery = "";
      focusMode = "hue";
      huePos = 0; 
      applyHuePos();
      openUI();
    },

    close(commit) {
      if (commit) global.currentColor = hsl();
      active = false;
      closeUI();
    },



  handleKey(e) {
    if (!active) return false;
     
    // user typing = intentional focus change
    if (e.key.length === 1 || e.key === "Backspace") {
    suppressCodeFocus = false;
    }

    /* =====================================
       CODE MODE — highest priority
       ===================================== */
    if (focusMode === "code" && userTypedHex) {
  if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
    const dir = e.key === "ArrowRight" ? 1 : -1;

    let hex = typedQuery.toLowerCase();

    // expand #RGB → #RRGGBB
    if (/^#([0-9a-f]{3})$/.test(hex)) {
      hex =
        "#" +
        hex[1] + hex[1] +
        hex[2] + hex[2] +
        hex[3] + hex[3];
    }

    if (!/^#([0-9a-f]{6})$/.test(hex)) return true;

    let num = parseInt(hex.slice(1), 16);
    num = (num + dir + 0x1000000) % 0x1000000;

    const fullHex = "#" + num.toString(16).padStart(6, "0");
    typedQuery = compressHex(fullHex);


    // 🔥 FULL SYNC (this updates hue + brightness + grayscale)
    applyColorCodeAndSyncUI(typedQuery);

    updateSearchText();
    return true;
  }
}



    /* =====================================
       NAME MODE — cycle color names
       ===================================== */
    if (focusMode === "name" && matches.length) {
      if (e.key === "ArrowRight") {
        cycleName(1);
        return true;
      }
      if (e.key === "ArrowLeft") {
        cycleName(-1);
        return true;
      }
    }

    /* =====================================
       FOCUS CHANGE (UP / DOWN)
       ===================================== */
    if (e.key === "ArrowUp" || e.key === "ArrowDown") {
      const order = ["hue", "brightness", "name", "code"];
      const dir = e.key === "ArrowDown" ? 1 : -1;
      const idx = order.indexOf(focusMode);
      focusMode = order[(idx + dir + order.length) % order.length];
      updateSearchText();
      updateFocusIndicator();
      return true;
    }

    /* =====================================
       HUE MODE
       ===================================== */
    /* =====================================
   HUE MODE (also unlocks HEX)
   ===================================== */
if (
  focusMode === "hue" &&
  (e.key === "ArrowRight" || e.key === "ArrowLeft")
) {
  suppressCodeFocus = true; // 🔒 lock focus

  huePos += e.key === "ArrowRight" ? 1 : -1;
  huePos = Math.max(0, Math.min(97, huePos));

  applyHuePos();
  userTypedHex = false;

  // update HEX silently
  if (isGrayscale) {
  typedQuery = grayHexFromLightness(lightness);
} else {
  typedQuery = hslToHex(hue, saturation, lightness);
}

  updateVisuals();
  updateSearchText();
  return true;
}


    /* =====================================
       BRIGHTNESS MODE
       ===================================== */
    if (focusMode === "brightness") {
  if (e.key === "ArrowRight") {
    lightness = Math.min(100, lightness + 2);
  }
  if (e.key === "ArrowLeft") {
    lightness = Math.max(0, lightness - 2);
  }

  if (isGrayscale) {
    typedQuery = grayHexFromLightness(lightness);
  } else {
    typedQuery = hslToHex(hue, saturation, lightness);
  }

  updateVisuals();
  updateSearchText();
  userTypedHex = false;
  return true;
}

    /* =====================================
       TEXT INPUT (NAME / CODE)
       ===================================== */
    if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
  typedQuery += e.key;

  if (typedQuery.startsWith("#") || isColorCode(typedQuery)) {
  if (!suppressCodeFocus) {
    focusMode = "code";
  }
  activeName = null;
  userTypedHex = true;          // 🔥 mark intent
  applyColorCodeAndSyncUI(typedQuery);
}else {
    focusMode = "name";
    matchIndex = -1;
  }

  updateMatches();
  updateSearchText();
  return true;
}


    /* =====================================
       BACKSPACE
       ===================================== */
    if (e.key === "Backspace") {

  // ✅ If a name was selected, convert it back to editable text
  if (activeName) {
    typedQuery = activeName;
    activeName = null;
    matchIndex = -1;
  } else {
    // Normal backspace behavior (1 char per press, fast on hold)
    typedQuery = typedQuery.slice(0, -1);
  }

  updateMatches();
  updateSearchText();
  updateVisuals();
  return true;
}


    /* =====================================
       ENTER — APPLY & CLOSE
       ===================================== */
    if (e.key === "Enter") {
      if (focusMode === "code" && isColorCode(typedQuery)) {
        colorBox.style.background = typedQuery;
        global.currentColor = typedQuery;
      }
      this.close(true);
      return true;
    }

    /* =====================================
       ESCAPE — CLOSE
       ===================================== */
    if (e.key === "Escape") {
      this.close(false);
      return true;
    }

    return false;
  }
};

global.KeyboardColorControl = KeyboardColorControl;

})(window);
