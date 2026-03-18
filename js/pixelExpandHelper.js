/* =====================================================
   PIXEL EXPANSION HELPER
   - ML friendly
   - Pixel-perfect
   - No scaling APIs
   ===================================================== */

function renderExpandedTrimmedPixels({
  pixels,
  gridWidth,
  gridHeight,
  referenceSize = 1024, // fixed reference
  background = null     // null = transparent
}) {
  // 1️⃣ Find logical bounding box (drawn pixels only)
  let minX = gridWidth, minY = gridHeight;
  let maxX = -1, maxY = -1;

  for (let y = 0; y < gridHeight; y++) {
    for (let x = 0; x < gridWidth; x++) {
      if (pixels[y][x] !== null) {
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
      }
    }
  }
  
// ===== DENSITY MEASUREMENT (CONTENT + GRID) =====

let drawnPixels = 0;

if (maxX < minX || maxY < minY) {
  return null;
}

for (let y = minY; y <= maxY; y++) {
  for (let x = minX; x <= maxX; x++) {
    if (pixels[y][x] !== null) drawnPixels++;
  }
}

const gridArea = gridWidth * gridHeight;
const gridDensity =
  gridArea > 0 ? drawnPixels / gridArea : 0;

const logicalWidth = maxX - minX + 1;
const logicalHeight = maxY - minY + 1;

const contentArea = logicalWidth * logicalHeight;
const contentDensity =
  contentArea > 0 ? drawnPixels / contentArea : 0;


 const scale = Math.max(
  1,
  Math.floor(referenceSize / Math.max(logicalWidth, logicalHeight))
);

 const out = document.createElement("canvas");
 out.width = referenceSize;   // ALWAYS user-selected
 out.height = referenceSize;

 const offsetX = Math.floor(
  (referenceSize - logicalWidth * scale) / 2
 );
 const offsetY = Math.floor(
  (referenceSize - logicalHeight * scale) / 2
 );

  const ctx = out.getContext("2d");
  ctx.imageSmoothingEnabled = false;

  // Optional background
  if (background !== null) {
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, referenceSize, referenceSize);
  }

  // 5️⃣ Render pixels (data → geometry)
  for (let y = minY; y <= maxY; y++) {
    for (let x = minX; x <= maxX; x++) {
      const value = pixels[y][x];
      if (value === null) continue;

      // Color handling (future-proof)
      if (value === 1) ctx.fillStyle = "#000";
      else if (value === 0) ctx.fillStyle = "#fff";
      else ctx.fillStyle = value; // hex color in future

      ctx.fillRect(
        offsetX + (x - minX) * scale,
        offsetY + (y - minY) * scale,
        scale,
        scale
      );
    }
  }

  // attach density metadata
  out.__gridDensity = gridDensity;
  out.__contentDensity = contentDensity;

  return out;
}

function renderExpandedGridPixels({
  pixels,
  gridWidth,
  gridHeight,
  targetSize,
  background = null
}) {
  const out = document.createElement("canvas");
  out.width = targetSize;
  out.height = targetSize;

  const ctx = out.getContext("2d");
  ctx.imageSmoothingEnabled = false;

  // Background (optional)
  if (background !== null) {
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, targetSize, targetSize);
  }

  const cellSize = Math.floor(
    targetSize / Math.max(gridWidth, gridHeight)
  );

  let hasAnyPixel = false;
  let drawnPixels = 0;

  for (let y = 0; y < gridHeight; y++) {
    for (let x = 0; x < gridWidth; x++) {
      const value = pixels[y][x];
      if (value === null) continue;
      drawnPixels++;

      hasAnyPixel = true;

      
      if (value === null) continue;

      if (typeof value === "string") {
        ctx.fillStyle = value;   // palette color
      }
      else if (value === 1) {
        ctx.fillStyle = "#000000";
      }
      else if (value === 0) {
       ctx.fillStyle = "#ffffff";
      }
      else {
        continue;
      }

      ctx.fillRect(
        x * cellSize,
        y * cellSize,
        cellSize,
        cellSize
      );
    }
  }

  // ⚠️ Empty grid warning (but still export)
  if (!hasAnyPixel) {
    console.warn("Grid-focused export: empty canvas (transparent output)");
  }

  const gridArea = gridWidth * gridHeight;
  const gridDensity =
    gridArea > 0 ? drawnPixels / gridArea : 0;

  out.__gridDensity = gridDensity;
  out.__contentDensity = null; // by definition


  return out; // ✅ ALWAYS return canvas
}


// Optional export
window.renderExpandedTrimmedPixels = renderExpandedTrimmedPixels;

