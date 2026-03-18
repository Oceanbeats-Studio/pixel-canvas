const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

let pixelExpandMode = "content"; // "content" | "grid"

let gridWidth = 16;
let gridHeight = 16;
let pixelSize = 24;

let cursor = { x: 0, y: 0 };
let pixels = [];

window.currentColor = "#000000";
window.colorMode = "temporary"; 
// "temporary" or "continuous"

/* ===============================
   INIT CANVAS
   =============================== */

function calculatePixelDensity(pixels, gridWidth, gridHeight) {
  let drawn = 0;
  let total = gridWidth * gridHeight;

  for (let y = 0; y < gridHeight; y++) {
    for (let x = 0; x < gridWidth; x++) {
      if (pixels[y][x] !== null) {
        drawn++;
      }
    }
  }

  if (total === 0) return 0;

  return drawn / total;
}

function formatDensityForName(density) {
  return Math.round(density * 1000) / 1000; // 3 decimals
}

function showGridWarning(message) {
  const warn = document.createElement("div");
  warn.textContent = message;
  warn.style.cssText = `
    position: fixed;
    bottom: 16px;
    left: 50%;
    transform: translateX(-50%);
    background: #ffefc5;
    color: #333;
    padding: 10px 14px;
    border-radius: 8px;
    font-size: 13px;
    box-shadow: 0 4px 10px rgba(0,0,0,.15);
    z-index: 9999;
  `;
  document.body.appendChild(warn);
  setTimeout(() => warn.remove(), 3500);
}

function isGridFullyFilled(pixels, gridWidth, gridHeight) {
  for (let y = 0; y < gridHeight; y++) {
    for (let x = 0; x < gridWidth; x++) {
      if (pixels[y][x] === null || pixels[y][x] === undefined) {
        return false;
      }
    }
  }
  return true;
}


function isAtMaxSize() {
  return Math.max(gridWidth, gridHeight) >= 1024;
}

function initCanvas(width, height = null) {

  // square mode if height not given
  if (height === null) {
    gridWidth = width;
    gridHeight = width;
  } else {
    gridWidth = width;
    gridHeight = height;
  }

  const container = document.querySelector(".canvas-scroll");

  const roomWidth = container.clientWidth;
  const roomHeight = container.clientHeight;

  const fitWidth = roomWidth / gridWidth;
  const fitHeight = roomHeight / gridHeight;

  // ===== Professional Scaling =====

// Small grids → scale to fit container perfectly
if (gridWidth <= 64) {
  pixelSize = Math.floor(Math.min(fitWidth, fitHeight));
}

// 128 → moderate fit
else if (gridWidth === 128) {
  pixelSize = Math.max(8, Math.floor(fitWidth));
}

// 256 and above → fixed comfortable size (scrollable)
else {
  pixelSize = 8; // 👈 THIS is the key
}

  
  canvas.width = gridWidth * pixelSize;
  canvas.height = gridHeight * pixelSize;


  // ===== Layout Behavior Based on Grid Size =====

if (gridWidth <= 64 && gridHeight <= 64) {
  // Small grids → center
  container.style.display = "flex";
  container.style.alignItems = "center";
  container.style.justifyContent = "center";
  container.style.overflow = "hidden";
} else {
  // 128 and above → top-left + scroll
  container.style.display = "block";
  container.style.overflow = "auto";
  container.style.alignItems = "";
  container.style.justifyContent = "";
}
  

  pixels = Array.from({ length: gridHeight }, () =>
    Array(gridWidth).fill(null)
  );

  cursor = { x: 0, y: 0 };
  const gridLabel = document.getElementById("gridSizeLabel");
  if(gridLabel){
    gridLabel.textContent = gridWidth + "×" + gridHeight;
  }
  draw();
}



function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // 1️⃣ Draw pixels (NO GAP)
  for (let y = 0; y < gridHeight; y++) {
    for (let x = 0; x < gridWidth; x++) {

      if (pixels[y][x] === 1) {
     ctx.fillStyle = "#000";
   }
   else if (pixels[y][x] === 0) {
     ctx.fillStyle = "#fff";
   }
   else if (typeof pixels[y][x] === "string") {
     ctx.fillStyle = pixels[y][x];   // 🔥 colored pixels
   }
   else {
    continue;
   }

      ctx.fillRect(
        x * pixelSize,
        y * pixelSize,
        pixelSize,
        pixelSize
      );
    }
  }

  // 2️⃣ Thin single grid (NO GAP)
  if (pixelSize >= 6) {

    ctx.lineWidth = 0.5;
  ctx.strokeStyle = "#ffffff";
  ctx.globalAlpha = 1;
  ctx.imageSmoothingEnabled = false;
    ctx.beginPath();

    for (let x = 0; x <= gridWidth; x++) {
  const pos = x * pixelSize + 0.5;
  ctx.moveTo(pos, 0);
  ctx.lineTo(pos, canvas.height);
}

for (let y = 0; y <= gridHeight; y++) {
  const pos = y * pixelSize + 0.5;
  ctx.moveTo(0, pos);
  ctx.lineTo(canvas.width, pos);
}

ctx.stroke();

// ===== FIX: draw outer border =====
ctx.lineWidth = 1;
ctx.strokeStyle = "#ffffff";
ctx.strokeRect(0.5, 0.5, canvas.width - 1, canvas.height - 1);

   
  }


// 3️⃣ Clean circular cursor (double ring)

const cx = Math.round(cursor.x * pixelSize + pixelSize / 2);
const cy = Math.round(cursor.y * pixelSize + pixelSize / 2);

// radius adapts to grid size
const radius = Math.max(3, pixelSize * 0.35);

// thickness adapts to pixel size (works for 256 grid)
const outerWidth = Math.max(2, pixelSize * 0.18);
const innerWidth = Math.max(1, pixelSize * 0.10);

// outer bold black ring
ctx.beginPath();
ctx.lineWidth = outerWidth;
ctx.strokeStyle = "#000";
ctx.arc(cx, cy, radius, 0, Math.PI * 2);
ctx.stroke();

// inner bold white ring
ctx.beginPath();
ctx.lineWidth = innerWidth;
ctx.strokeStyle = "#fff";
ctx.arc(cx, cy, radius - outerWidth * 0.4, 0, Math.PI * 2);
ctx.stroke();

const posLabel = document.getElementById("cursorPos");

if(posLabel){
  posLabel.textContent = (cursor.x + 1) + "×" + (cursor.y + 1);
}

ensureCursorVisible();
}

function ensureCursorVisible() {

  const container = document.querySelector(".canvas-scroll");

  const cursorPixelX = cursor.x * pixelSize;
  const cursorPixelY = cursor.y * pixelSize;

  const viewLeft = container.scrollLeft;
  const viewRight = viewLeft + container.clientWidth;

  const viewTop = container.scrollTop;
  const viewBottom = viewTop + container.clientHeight;

  const margin = pixelSize * 2;

  // horizontal scroll
  if (cursorPixelX < viewLeft + margin) {
    container.scrollLeft = Math.max(0, cursorPixelX - margin);
  }

  if (cursorPixelX + pixelSize > viewRight - margin) {
    container.scrollLeft = cursorPixelX - container.clientWidth + pixelSize + margin;
  }

  // vertical scroll
  if (cursorPixelY < viewTop + margin) {
    container.scrollTop = Math.max(0, cursorPixelY - margin);
  }

  if (cursorPixelY + pixelSize > viewBottom - margin) {
    container.scrollTop = cursorPixelY - container.clientHeight + pixelSize + margin;
  }

}

/* ===============================
   PIXEL ACTIONS
   =============================== */
function setPixel(value) {

  if (value === 0 || value === 1) {
    pixels[cursor.y][cursor.x] = value;
  } 
  else {
    pixels[cursor.y][cursor.x] = window.currentColor;
  }

  draw();
}

function clearCanvas() {
  pixels.forEach(row => row.fill(null));
  draw();
}

/* ===============================
   EMPTY CELL CHECK
   =============================== */
function hasEmptyCells() {
  return pixels.some(row => row.some(cell => cell === null));
}

/* ===============================
   EXPORT HELPERS
   =============================== */
function downloadCanvas(c, filename) {
  const a = document.createElement("a");
  a.href = c.toDataURL("image/png");
  a.download = filename;
  
  document.body.appendChild(a);   // <-- IMPORTANT
  a.click();
  document.body.removeChild(a);   // <-- IMPORTANT
}

/* ===============================
   EXPORT: PIXEL ORIGINAL (FIXED GRID)
   =============================== */
function exportPNG_Original(bgColor = null, withGrid = false) {
  const out = document.createElement("canvas");
  out.width = gridWidth;
  out.height = gridHeight;
  const octx = out.getContext("2d");
  octx.imageSmoothingEnabled = false;
  octx.mozImageSmoothingEnabled = false;
  octx.webkitImageSmoothingEnabled = false;
  octx.msImageSmoothingEnabled = false;

  if (bgColor) {
    octx.fillStyle = bgColor;
    octx.fillRect(0, 0, out.width, out.height);
  }

  // 🔥 DRAW PIXELS (FIX)
  for (let y = 0; y < gridHeight; y++) {
    for (let x = 0; x < gridWidth; x++) {

      const value = pixels[y][x];
      if (value === null) continue;

      if (value === 1) octx.fillStyle = "#000";
      else if (value === 0) octx.fillStyle = "#fff";
      else octx.fillStyle = value;

      octx.fillRect(x, y, 1, 1);
    }
  }

  if (withGrid) {
    octx.strokeStyle = "#8a8a8a";
    octx.lineWidth = 1;

    for (let x = 0; x <= gridWidth; x++) {
      octx.beginPath();
      octx.moveTo(x, 0);
      octx.lineTo(x, gridHeight);
      octx.stroke();
    }

    for (let y = 0; y <= gridHeight; y++) {
      octx.beginPath();
      octx.moveTo(0, y);
      octx.lineTo(gridWidth, y);
      octx.stroke();
    }
  }

  const name = withGrid
    ? `pixel-original-grid-${gridWidth}x${gridHeight}.png`
    : `pixel-original-${gridWidth}x${gridHeight}.png`;

  downloadCanvas(out, name);
}

/* ===============================
   EXPORT: SOCIAL MEDIA (FIXED GRID)
   =============================== */
function exportPNG_Social(bgColor = null, withGrid = false, pixelStyle = "pixelated") {
  const baseScale = Math.max(16, pixelSize * 2);
  const scale = baseScale;
  const gap = pixelStyle === "pixelated" ? 4 : 0;

  const out = document.createElement("canvas");
  out.width = gridWidth * scale;
  out.height = gridHeight * scale;

  const octx = out.getContext("2d");
  octx.imageSmoothingEnabled = false;
  octx.mozImageSmoothingEnabled = false;
  octx.webkitImageSmoothingEnabled = false;
  octx.msImageSmoothingEnabled = false;

  if (bgColor !== null) {
  octx.fillStyle = bgColor;
  octx.fillRect(0, 0, out.width, out.height);
  }

  for (let y = 0; y < gridHeight; y++) {
  for (let x = 0; x < gridWidth; x++) {

    const value = pixels[y][x];
    if (value === null) continue;

    if (value === 1) {
      octx.fillStyle = "#000";
    }
    else if (value === 0) {
      octx.fillStyle = "#fff";
    }
    else if (typeof value === "string") {
      octx.fillStyle = value;   // 🔥 palette color
    }
    else {
      continue;
    }

    octx.fillRect(
      x * scale + gap / 2,
      y * scale + gap / 2,
      scale - gap,
      scale - gap
    );
  }
}



  // draw grid ONLY when background exists
  if (withGrid && bgColor !== null) {
    octx.strokeStyle = "#8a8a8a";
    octx.lineWidth = 4;

    for (let x = 0; x <= gridWidth; x++) {
      octx.beginPath();
      octx.moveTo(x * scale, 0);
      octx.lineTo(x * scale, out.height);
      octx.stroke();
    }

    for (let y = 0; y <= gridHeight; y++) {
      octx.beginPath();
      octx.moveTo(0, y * scale);
      octx.lineTo(out.width, y * scale);
      octx.stroke();
    }
  }




  let styleName = pixelStyle === "uniform" ? "uniform" : "pixelated";
  let bgName = bgColor ? "bg" : "transparent";

  const name =
    withGrid
      ? `pixel-social-${styleName}-grid-${gridWidth}x${gridHeight}.png`
      : `pixel-social-${styleName}-${bgName}-${gridWidth}x${gridHeight}.png`;

  downloadCanvas(out, name);
}

/* ===============================
   BACKGROUND + DOWNLOAD DIALOG
   =============================== */
function showBackgroundDialog() {
  let bgColor = "rgb(188,220,255)"; // background color ONLY for Standard tab

  const overlay = document.createElement("div");
  overlay.style.cssText = `
    position:fixed; inset:0;
    background:rgba(0,0,0,.5);
    display:flex; align-items:center; justify-content:center;
    z-index:9999;
  `;

  const box = document.createElement("div");
  box.style.cssText = `
  background:#fff;
  padding:20px;
  border-radius:10px;
  width:380px;
  max-width:90vw;
  max-height:90vh;
  overflow:auto;
  text-align:center;
  font-family:sans-serif;
`;


  box.innerHTML = `
    <h2 style="margin-bottom:12px;">Choose Export Style</h2>

    <div class="export-tabs">
      <button class="export-tab active" id="tab-standard">Standard</button>
      <button class="export-tab" id="tab-professional">Professional</button>
    </div>

    <div class="export-tab-content" id="content-standard">

    <div style="margin-bottom:14px;">
      <label style="font-size:14px;font-weight:600;">
        Background:
      </label>

      <button id="bgColorBtn" style="
        width:44px;
        height:22px;
        padding:0;
        background: rgb(188,220,255);
        border:1px solid #6b7280;
        border-radius:4px;
        box-shadow:
          inset 0 0 0 2px #ffffff,
          inset 0 0 0 3px #cbd5e1;
        cursor:pointer;
        vertical-align:middle;
      "></button>

      <span style="font-size:12px;color:#666;">
        (used for background styles)
      </span>
    </div> 

      <div class="export-grid">
        <!-- STANDARD cards -->

      <button class="export-card" data-mode="grid-bg">
        <img src="js/download/social-grid-pixelated-bg.png">
        <span>Grid + Background</span>
      </button>

      <button class="export-card" data-mode="pixel-bg">
        <img src="js/download/social-pixelated-bg.png">
        <span>Pixelated + Background</span>
      </button>

      <button class="export-card" data-mode="pixel-transparent">
        <img src="js/download/social-pixelated-transparent.png">
        <span>Pixelated + Transparent</span>
      </button>

      <button class="export-card" data-mode="uniform-bg">
        <img src="js/download/social-uniform-bg.png">
        <span>Uniform + Background</span>
      </button>

      <button class="export-card" data-mode="uniform-transparent">
        <img src="js/download/social-uniform-transparent.png">
        <span>Uniform + Transparent</span>
     </button>

      <button class="export-card original-pixel" data-mode="original-pixel">
        <img src="js/download/social-uniform-transparent.png">
        <span>Original Pixel</span>
     </button>

     </div>
    </div>

    <!-- ===== Professional Section ===== -->
    <div class="export-tab-content" id="content-professional" style="display:none;">
      <div class="export-grid">
        <!-- PROFESSIONAL cards -->

     <button class="export-card pixel-expanded" data-mode="pixel-expanded">

       <div class="expand-title">
         Pixel Expanded
       </div>

       <div class="expand-preview">
         <img src="js/download/social-uniform-transparent.png">
       </div>

       <div class="expand-mode" id="expandModeLabel">
         Mode: Content Focused
       </div>

       <div class="expand-arrows">
         <span class="arrow left">◀</span>
         <span class="arrow right">▶</span>
       </div>

     </button>

     <div id="expandSizes" style="display:none;margin-top:10px;">
       <!-- size buttons injected here -->
     </div>

      </div>
    </div>

    <button id="cancelExport" style="margin-top:12px;">Cancel</button>  
`;

const bgBtn = box.querySelector("#bgColorBtn");

bgBtn.addEventListener("click", (e) => {
  e.preventDefault();
  e.stopImmediatePropagation(); // 🔑 THIS IS THE KEY FIX

  createColorPicker({
  initialColor: bgColor,
  anchorElement: box,   // 🔥 PASS THE MODAL BOX DIRECTLY
  onApply: (color) => {
    bgColor = color;
    bgBtn.style.background = color;
  },
  onCancel: () => {}
});

});
const tabStandard = box.querySelector("#tab-standard");
const tabProfessional = box.querySelector("#tab-professional");

const contentStandard = box.querySelector("#content-standard");
const contentProfessional = box.querySelector("#content-professional");

tabStandard.onclick = () => {
  tabStandard.classList.add("active");
  tabProfessional.classList.remove("active");

  contentStandard.style.display = "block";
  contentProfessional.style.display = "none";
};

tabProfessional.onclick = () => {
  tabProfessional.classList.add("active");
  tabStandard.classList.remove("active");

  contentProfessional.style.display = "block";
  contentStandard.style.display = "none";
};


// ===== STEP 3: Pixel Expanded arrow logic =====
const modeLabel = box.querySelector("#expandModeLabel");

box.querySelector(".arrow.left").onclick = e => {
  e.stopPropagation();
  pixelExpandMode = pixelExpandMode === "content" ? "grid" : "content";
  updateExpandLabel();
};

box.querySelector(".arrow.right").onclick = e => {
  e.stopPropagation();
  pixelExpandMode = pixelExpandMode === "content" ? "grid" : "content";
  updateExpandLabel();
};

function updateExpandLabel() {
  modeLabel.textContent =
    pixelExpandMode === "content"
      ? "Mode: Content Focused"
      : "Mode: Grid Focused";
}


 // ===== STEP 4: Generate expand sizes (greater than current grid) =====
function getExpandSizes() {
  const currentSize = Math.max(gridWidth, gridHeight);

  return [16, 32, 64, 128, 256, 512, 1024].filter(
    size => size > currentSize && size <= 1024
  );
}

if (isAtMaxSize()) {
  const expandCard = box.querySelector('[data-mode="pixel-expanded"]');
  if (expandCard) {
    expandCard.classList.add("disabled");
  }
}

box.querySelectorAll(".export-card").forEach(card => {
  card.onclick = () => {
    const mode = card.dataset.mode;

    // ===== STEP 5: Pixel Expanded card click =====
    if (mode === "pixel-expanded") {
      const sizeBox = box.querySelector("#expandSizes");
      sizeBox.innerHTML = "";

      const sizes = getExpandSizes();

      if (sizes.length === 0) {
        sizeBox.textContent = "Already at maximum size (1024×1024)";
      } else {
        sizes.forEach(size => {
          const btn = document.createElement("button");
          btn.textContent = `${size} × ${size}`;
          btn.className = "size-btn";

          btn.onclick = e => {
            e.stopPropagation(); // prevent card click
            exportPixelExpandedWithMode(size, null);
            document.body.removeChild(overlay);
          };

          sizeBox.appendChild(btn);
        });
      }

      sizeBox.style.display = "block";
      return; // IMPORTANT: stop further processing
    }


    const bg = bgColor;

    switch (mode) {
      case "grid-bg":
        exportPNG_Social(bg, true, "pixelated");
        break;

      case "pixel-bg":
        exportPNG_Social(bg, false, "pixelated");
        break;

      case "pixel-transparent":
        exportPNG_Social(null, false, "pixelated");
        break;

      case "uniform-bg":
        exportPNG_Social(bg, false, "uniform");
        break;

      case "uniform-transparent":
        exportPNG_Social(null, false, "uniform");
        break;

      case "original-pixel":
        exportPNG_Original(null, false);
        break;
      

    }

    document.body.removeChild(overlay);
  };
});

box.querySelector("#cancelExport").onclick = () => {
  document.body.removeChild(overlay);
};

  overlay.appendChild(box);
  document.body.appendChild(overlay);
}

/* ===============================
   DOWNLOAD ENTRY
   =============================== */

// ===== STEP 6: Export Pixel Expanded with selected mode & size =====

function exportPixelExpandedWithMode(targetSize) {

  let outCanvas = null;

  if (pixelExpandMode === "content") {
    outCanvas = renderExpandedTrimmedPixels({
      pixels,
      gridWidth,
      gridHeight,
      referenceSize: targetSize,
      background: null // FORCE TRANSPARENT
    });

    if (!outCanvas) {
      alert("Nothing drawn. Content-focused export requires at least one pixel.");
      return;
    }

 } else {
    // ===== Grid Focused =====
    const gridFilled = isGridFullyFilled(pixels, gridWidth, gridHeight);

    outCanvas = renderExpandedGridPixels({
      pixels,
      gridWidth,
      gridHeight,
      targetSize,
      background: null
    });

    if (!gridFilled) {
      showGridWarning(
        "Some grid cells are empty. Exported with transparent background."
      );
    }
  }


  // ===== filename with density metadata =====
  const meta = outCanvas.__meta || {};

  const gd =
    outCanvas.__gridDensity == null
      ? "na"
      : outCanvas.__gridDensity.toFixed(4);
      
  const cd =
    outCanvas.__contentDensity == null
      ? "na"
      : outCanvas.__contentDensity.toFixed(4);

  const gridLabel = `${gridWidth}x${gridHeight}`;
  
  const exportLabel = `${targetSize}`;

  const fileName =
    `pixel-expanded-grid${gridLabel}-export${exportLabel}` +
   `-gridDensity-${gd}_contentDensity-${cd}.png`;

  downloadCanvas(outCanvas, fileName);
}


function downloadPNG() {
  showBackgroundDialog();
}

// ===== Background Color button (main UI) =====
const pageBgBtn = document.querySelector(
  'button:contains("Background Color")'
) || document.getElementById("backgroundColorBtn");

if (pageBgBtn) {
  pageBgBtn.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    showBackgroundDialog();
  });
}


function fillCanvas(value) {
  pixels.forEach(row => row.fill(value));
  draw();
}
function exportPNG_Trimmed() {
  let minX = gridWidth, minY = gridHeight;
  let maxX = -1, maxY = -1;

  // 1️⃣ Find bounding box of ANY drawn pixel (black OR white)
  for (let y = 0; y < gridHeight; y++) {
    for (let x = 0; x < gridWidth; x++) {
      if (pixels[y][x] === 1 || pixels[y][x] === 0) {
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
      }
    }
  }

  // 2️⃣ Nothing drawn → stop
  if (maxX < minX || maxY < minY) {
    alert("Nothing to export");
    return;
  }

  // 3️⃣ Create trimmed canvas
  const scale = 1;
  const out = document.createElement("canvas");
  out.width = (maxX - minX + 1) * scale;
  out.height = (maxY - minY + 1) * scale;

  const ctx = out.getContext("2d");
  ctx.imageSmoothingEnabled = false;

  // 4️⃣ Draw pixels
  for (let y = minY; y <= maxY; y++) {
    for (let x = minX; x <= maxX; x++) {
      if (pixels[y][x] === 1) {
     ctx.fillStyle = "#000";
   } 
   else if (pixels[y][x] === 0) {
     ctx.fillStyle = "#fff";
   }
   else if (typeof pixels[y][x] === "string") {
     ctx.fillStyle = pixels[y][x]; // color pixels
   }
   else {
     continue;
   }

      ctx.fillRect(
        (x - minX) * scale,
        (y - minY) * scale,
        scale,
        scale
      );
    }
  }

  // 5️⃣ Download
  downloadCanvas(
   out,
   `pixel-trimmed-${gridWidth}x${gridHeight}.png`
 );
}

function showModeMessage(text) {

  const msg = document.createElement("div");

  msg.textContent = text;

  msg.style.cssText = `
    position: fixed;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: #111;
    color: white;
    padding: 8px 14px;
    border-radius: 6px;
    font-size: 13px;
    z-index: 9999;
  `;

  document.body.appendChild(msg);

  setTimeout(() => msg.remove(), 2000);
}


