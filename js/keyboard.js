let paintKey = null;

// ===== CURSOR SPEED CONTROL =====
let cursorSpeed = 30;   // default cursor speed

const speedLabel = document.getElementById("cursorSpeedLabel");
if (speedLabel) speedLabel.textContent = cursorSpeed;

let speedAdjusting = false;    // while holding S
let speedLoopValue = 10;        // 1 → 60 loop

let arrowHoldStart = 0;
let fastMode = false;
const FAST_THRESHOLD = 200; // ms hold time

// ===== SMOOTH MOVEMENT SYSTEM =====
const keyState = {
  ArrowUp: false,
  ArrowDown: false,
  ArrowLeft: false,
  ArrowRight: false
};

let paintLocked = false;
let holdTimer = null;

/* =========================================
   SINGLE / DOUBLE C LOGIC (FIXED)
   ========================================= */
let cTimer = null;
let waitingSecondC = false;

function closeColorPickerIfOpen() {
  const picker = document.querySelector(".custom-color-picker");
  if (picker) picker.remove();
}

document.addEventListener("keydown", (e) => {

/* ===============================
   SPEED ADJUST MODE (S)
   =============================== */
if ((e.key === "s" || e.key === "S") && !e.repeat) {

  speedAdjusting = true;

  const label = document.getElementById("cursorSpeedLabel");

  // 🔥 instant change on first press
  speedLoopValue++;

  if (speedLoopValue > 70) speedLoopValue = 10;

  if (label) label.textContent = speedLoopValue;

  const speedLoop = setInterval(() => {

    if (!speedAdjusting) {
      clearInterval(speedLoop);
      return;
    }

    speedLoopValue++;

    if (speedLoopValue > 70) speedLoopValue = 10;

    if (label) label.textContent = speedLoopValue;

  }, 150);

  return;
}

  /* ===============================
     🔒 KEYBOARD COLOR CONTROL FIRST
     =============================== */
  if (window.KeyboardColorControl) {
    const used = KeyboardColorControl.handleKey(e);
    if (used) {
      e.preventDefault();
      return;
    }
  }

  /* ===============================
     C / CC HANDLING
     =============================== */
  if ((e.key === "c" || e.key === "C") && !e.repeat) {

    // 🔁 SECOND C → KEYBOARD COLOR CONTROL
    if (waitingSecondC) {
      clearTimeout(cTimer);
      waitingSecondC = false;

      // 🔥 CLOSE COLOR PICKER BEFORE OPENING KEYBOARD UI
      closeColorPickerIfOpen();

      if (window.KeyboardColorControl) {
        KeyboardColorControl.open();
      }
      return;
    }

    // 🟢 FIRST C → OPEN COLOR PICKER
    waitingSecondC = true;

    closeColorPickerIfOpen(); // safety (only one picker allowed)

    createColorPicker({
      initialColor: window.currentColor || "rgb(0,0,0)",
      onApply: (color) => {

        window.currentColor = color;

        window.colorMode = "continuous";

        showModeMessage("Color Continuous");
      }
    });

    // ⏱ wait for possible second C
    cTimer = setTimeout(() => {
      waitingSecondC = false;
    }, 300);

    return;
  }

  /* ===============================
     START PAINT MODE
     =============================== */
  if (e.key === "1" && !e.repeat) {
    paintKey = 1;
    setPixel(1);
    draw();
    return;
  }

  if (e.key === "0" && !e.repeat) {

    paintKey = "color";

    holdTimer = setTimeout(() => {
      showModeMessage("Temporary Color Selected");
    }, 200);

  }

  /* ===============================
     CURSOR MOVEMENT
     =============================== */
  if (e.key in keyState) {

    if (!keyState[e.key]) {
      arrowHoldStart = performance.now();
      fastMode = false;
    }

    keyState[e.key] = true;
    e.preventDefault();
    return;
  }

  /* ===============================
     OTHER ACTIONS
     =============================== */
  if ((e.key === "b" || e.key === "B") && !e.repeat) {
    fillCanvas(1);
    draw();
  }

  if ((e.key === "w" || e.key === "W") && !e.repeat) {
    fillCanvas(0);
    draw();
  }
});

document.addEventListener("keyup", e => {

/* ===============================
   APPLY SPEED WHEN S RELEASED
   =============================== */
if (e.key === "s" || e.key === "S") {

  speedAdjusting = false;

  cursorSpeed = speedLoopValue;

  const label = document.getElementById("cursorSpeedLabel");

  if (label) label.textContent = cursorSpeed;
}

  if (e.key === "0") {

    clearTimeout(holdTimer);

    if (!paintLocked) {
      paintLocked = true;
      showModeMessage("Color locked to cursor");
    } else {
      paintLocked = false;
      showModeMessage("Color unlocked");
    }

    paintKey = null;
  }

  if (e.key === "1") {
    paintKey = null;
  }

  if (e.key in keyState) {
    keyState[e.key] = false;
    fastMode = false;
  }

});

// ===== 60 FPS CURSOR MOVEMENT =====
let lastMoveTime = 0;
let holdStartTime = 0;

function cursorLoop() {

  const now = performance.now();

  const arrowHeld =
    keyState.ArrowRight ||
    keyState.ArrowLeft ||
    keyState.ArrowUp ||
    keyState.ArrowDown;

  if (arrowHeld) {
    const holdTime = performance.now() - arrowHoldStart;
 
    if (holdTime > FAST_THRESHOLD && cursorSpeed > 25) {
      fastMode = true;
    }
  }

  if (!arrowHeld) {
    holdStartTime = 0;
    requestAnimationFrame(cursorLoop);
    return;
  }

  if (!holdStartTime) holdStartTime = now;

  const holdDuration = now - holdStartTime;


  // speed based on S-key selection
  let moveDelay = 260 - cursorSpeed * 3.5;

  if (moveDelay < 6) moveDelay = 6;

  const activeSpeed = fastMode
    ? Math.max(8, 120 - cursorSpeed * 2)
    : 120;;

  if (now - lastMoveTime < activeSpeed) {
    requestAnimationFrame(cursorLoop);
    return;
  }

  lastMoveTime = now;

  let moved = false;

  // how many cells to move each frame
  let step = 1;

  if (keyState.ArrowRight) {

    for (let i = 0; i < step; i++) {

      cursor.x++;

      if (cursor.x >= gridWidth) {
        cursor.x = 0;
        cursor.y++;
        if (cursor.y >= gridHeight) cursor.y = 0;
      }

      if (paintKey === "color") setPixel("color");
      if (paintLocked && paintKey === null) setPixel("color");
    }

    moved = true;
  }

  if (keyState.ArrowLeft) {

    for (let i = 0; i < step; i++) {

      cursor.x--;

      if (cursor.x < 0) {
        cursor.y--;
        if (cursor.y < 0) cursor.y = gridHeight - 1;
        cursor.x = gridWidth - 1;
      }

      if (paintKey === "color") setPixel("color");
      if (paintLocked && paintKey === null) setPixel("color");
    }

    moved = true;
  }

  if (keyState.ArrowDown) {

    for (let i = 0; i < step; i++) {

      cursor.y++;

      if (cursor.y >= gridHeight) {
        cursor.y = 0;
        cursor.x++;
        if (cursor.x >= gridWidth) cursor.x = 0;
      }

      if (paintKey === "color") setPixel("color");
      if (paintLocked && paintKey === null) setPixel("color");
    }

    moved = true;
  }

  if (keyState.ArrowUp) {

    for (let i = 0; i < step; i++) {

      cursor.y--;

      if (cursor.y < 0) {
        cursor.y = gridHeight - 1;
        cursor.x--;
        if (cursor.x < 0) cursor.x = gridWidth - 1;
      }

      if (paintKey === "color") setPixel("color");
      if (paintLocked && paintKey === null) setPixel("color");
    }

    moved = true;
  }

  if (moved) {

    if (paintKey === "color") {
      setPixel("color");
    }

    if (paintLocked && paintKey === null) {
      setPixel("color");
    }

    draw();
  }

  requestAnimationFrame(cursorLoop);
}

cursorLoop();