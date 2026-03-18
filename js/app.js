window.onload = () => {
  initCanvas(8);

  if (window.updateGalleryForSize) {
    updateGalleryForSize(8);
  }

  document.querySelectorAll(".difficulty button")
    .forEach(btn => btn.classList.remove("active"));

  document
    .querySelector('.difficulty button[data-level="simple"]')
    .classList.add("active");
};

document.getElementById("clear").onclick = clearCanvas;

/* ======================================================
   SETTINGS MODAL LOGIC (NEW — ORIGINAL JS ABOVE UNCHANGED)
   ====================================================== */

document.addEventListener("DOMContentLoaded", () => {
  const resetAllBtn = document.getElementById("resetAll");

  if (resetAllBtn) {
    resetAllBtn.addEventListener("click", () => {
      clearCanvas();
    });
  }

  const settingsBtn = document.getElementById("settingsBtn");
  const settingsModal = document.getElementById("settingsModal");
  const closeSettings = document.getElementById("closeSettings");

  if (!settingsBtn || !settingsModal || !closeSettings) return;

  settingsBtn.addEventListener("click", () => {
    settingsModal.classList.remove("hidden");
  });

  closeSettings.addEventListener("click", () => {
    settingsModal.classList.add("hidden");
  });

  settingsModal.addEventListener("click", (e) => {
    if (e.target === settingsModal) {
      settingsModal.classList.add("hidden");
    }
  });
});

let currentTool = "pen";

document.addEventListener("DOMContentLoaded", () => {

  const toolButtons = document.querySelectorAll(".tool-btn");

  toolButtons.forEach(btn => {
    btn.addEventListener("click", () => {

      toolButtons.forEach(b => b.classList.remove("active"));
      if (!["download", "animate"].includes(btn.dataset.tool)) {
  btn.classList.add("active");
}

      const tool = btn.dataset.tool;
      currentTool = tool;

      console.log("Tool Selected:", tool);

      switch (tool) {

        // ===== EXISTING TOOLS (selection only) =====
        case "mirror":
        case "rotate":
        case "select":
        case "zoom-in":
        case "zoom-out":
        case "erase":
          return;


        // ===== NEW TOOLS =====

        case "undo":
          if (typeof undo === "function") undo();
          return;

        case "redo":
          if (typeof redo === "function") redo();
          return;

        case "fill":
          if (typeof fillCanvas === "function") {
            saveState?.();
            fillCanvas(1); // fill black
          }
          return;

        case "add":
          if (typeof initCanvas === "function") {
            initCanvas(gridWidth + 8);
          }
          return;

        case "scale":
          if (typeof initCanvas === "function") {
            initCanvas(gridWidth * 2);
          }
          return;

        case "edit":
        case "cut":
        case "copy":
        case "text":
          console.log(tool + " mode activated");
          return;

        case "download":
          if (typeof downloadPNG === "function") {
            downloadPNG();
          }
          return;

        case "animate":
          if (typeof startAnimation === "function") {
            startAnimation();
          }
          return;        

      }

    });
  });

});

let baseWidth = null;
let baseHeight = null;
let resizeTimeout;

function scaleApp() {
  const app = document.getElementById("app");
  if (!app) return;

  // ✅ get ORIGINAL size (ignore transform)
  if (!baseWidth || !baseHeight) {
    const rect = app.getBoundingClientRect();
    baseWidth = rect.width;
    baseHeight = rect.height;
  }

  const screenWidth = window.innerWidth;
  const screenHeight = window.innerHeight;

  const scaleX = screenWidth / baseWidth;
  const scaleY = screenHeight / baseHeight;

  let scale = Math.min(scaleX, scaleY);

  const MIN_SCALE = 0.75;
  const MAX_SCALE = 1.25;

  scale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, scale));  

  const offsetX = Math.max(0, (screenWidth - baseWidth * scale) / 2);
  const offsetY = Math.max(0, (screenHeight - baseHeight * scale) / 2);

  app.style.transform =
    `translate(${offsetX}px, ${offsetY}px) scale(${scale})`;

  // 🔥 FORCE CANVAS TO RE-RENDER ON SCALE
  if (typeof initCanvas === "function") {
    initCanvas(gridWidth);
  }
}

if (window.innerWidth > 768) {
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      scaleApp();
    }, 100);
  });
}
if (window.innerWidth > 768) {
  window.addEventListener("load", scaleApp);
}

window.addEventListener("orientationchange", () => {
  baseWidth = null;
  baseHeight = null;
  scaleApp();
});
