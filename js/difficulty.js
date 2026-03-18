/* ======================================================
   DIFFICULTY / GRID LOGIC (SINGLE SOURCE OF TRUTH)
   ====================================================== */

function applyDifficulty(level) {
  level = level.toLowerCase();

  if (level === "simple") initCanvas(8);
  else if (level === "medium") initCanvas(16);
  else if (level === "hard") initCanvas(32);
  else if (level === "junior") initCanvas(64, 32);
  else if (level === "master") initCanvas(128, 32);

  if (window.updateGalleryForSize) {
    updateGalleryForSize(gridSize);
  }
}

/* ===== expose globally for carousel ===== */
window.applyDifficulty = applyDifficulty;

/* ======================================================
   OPTIONAL: OLD BUTTON SUPPORT (SAFE)
   ====================================================== */
const buttons = document.querySelectorAll(".difficulty button");

buttons.forEach(btn => {
  btn.addEventListener("click", () => {
    buttons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    applyDifficulty(btn.dataset.level);
  });
});
