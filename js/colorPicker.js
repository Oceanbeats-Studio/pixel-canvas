function createColorPicker({ initialColor, onApply, onCancel, anchorElement }) {

// 🔒 Prevent multiple pickers (singleton)
const existing = document.querySelector(".custom-color-picker");
if (existing) {
  existing.remove();
  return; // toggle behavior (close if already open)
}



  // ---------- HSV STATE ----------
  let hue = 0;
  let sat = 1;
  let val = 1;
  let tempColor = initialColor || "rgb(255,0,0)";

  // ---------- STANDARD COLORS (ADDED) ----------
  const STANDARD_COLORS = [
    "#ff0000", "#ff7f00",
    "#ffff00", "#00ff00",
    "#00ffff", "#0000ff",
    "#8b00ff", "#ff00ff",
    "#ffffff", "#808080",
    "#000000", "#8b4513"
  ];

  // ---------- PANEL ----------
  const panel = document.createElement("div");
  panel.className = "custom-color-picker";

  panel.style.zIndex = 10000;

  panel.innerHTML = `
    <div class="cp-header">
      <span>Color Picker</span>
      <div class="cp-header-preview"></div>
    </div>

    <div class="cp-body">
      <div class="cp-main">
        <canvas class="cp-square" width="160" height="160"></canvas>

        <div style="position:relative">
          <canvas class="cp-hue" width="18" height="160"></canvas>
          <div class="cp-hue-handle"></div>
        </div>
      </div>

      <div class="cp-side">
        <div class="cp-presets"></div>
      </div>
    </div>

    <div class="cp-footer" style="display:flex;align-items:center;gap:10px;">
      <div style="margin-right:auto;display:flex;align-items:center;gap:8px;">
        <button class="cp-eyedropper" title="Pick color from screen">
          <img src="assets/eyedropper.png" alt="Eyedropper"/>
        </button>
        <input class="cp-hex" value="#ff0000" />
      </div>

      <button class="cp-cancel">Cancel</button>
      <button class="cp-ok">OK</button>
    </div>
  `;

  document.body.appendChild(panel);

// ===== SIMPLE OLD-STYLE POSITION =====
panel.style.position = "fixed";
panel.style.transform = "none";

document.body.appendChild(panel);

// 🔥 Wait for layout to finish
requestAnimationFrame(() => {

  if (anchorElement) {
    const rect = anchorElement.getBoundingClientRect();
    const gap = 10;

    // 👉 RIGHT side
    panel.style.left = (rect.right + gap) + "px";

    // 👉 Stable vertical center
    const topValue =
      rect.top + (rect.height - panel.offsetHeight) / 2 - 24;

    panel.style.top = Math.round(topValue) + "px";
  }
  else {
    panel.style.left = "100px";
    panel.style.top  = "100px";
  }

});







// ===== FREEZE POSITION (ABSOLUTELY REQUIRED) =====

// ===============================
// DRAG PANEL FROM EMPTY AREAS (NO SLIP)
// ===============================
let isDragging = false;
let grabX = 0;
let grabY = 0;

panel.addEventListener("mousedown", (e) => {
  // ❌ Don't drag when interacting with controls
  if (e.target.closest("button, input, canvas, img, .no-drag")) return;

  isDragging = true;

  const rect = panel.getBoundingClientRect();
  grabX = e.clientX - rect.left;
  grabY = e.clientY - rect.top;

  document.body.style.userSelect = "none";
});

document.addEventListener("mousemove", (e) => {
  if (!isDragging) return;

  const panelRect = panel.getBoundingClientRect();

  const panelWidth  = panelRect.width;
  const panelHeight = panelRect.height;

  const viewportWidth  = window.innerWidth;
  const viewportHeight = window.innerHeight;

  // 🔒 Clamp position so panel stays on screen
  let newLeft = e.clientX - grabX;
  let newTop  = e.clientY - grabY;

  const minLeft = 0;
  const minTop  = 0;

  const maxLeft = viewportWidth  - panelWidth;
  const maxTop  = viewportHeight - panelHeight;

  newLeft = Math.max(minLeft, Math.min(newLeft, maxLeft));
  newTop  = Math.max(minTop,  Math.min(newTop,  maxTop));

  panel.style.left = newLeft + "px";
  panel.style.top  = newTop  + "px";
});

document.addEventListener("mouseup", () => {
  isDragging = false;
  document.body.style.userSelect = "";
});


  // ---------- ELEMENTS ----------
  const square = panel.querySelector(".cp-square");

  // ---------- SQUARE CONTROLLER DOT (ADDED) ----------
  const squareWrap = square.parentElement;
  squareWrap.style.position = "relative";

  const squareDot = document.createElement("div");
  squareDot.className = "cp-square-dot";
  squareWrap.appendChild(squareDot);

  const hueBar = panel.querySelector(".cp-hue");
  const hueHandle = panel.querySelector(".cp-hue-handle");
  const preview = panel.querySelector(".cp-header-preview");
  const presets = panel.querySelector(".cp-presets");
  const okBtn = panel.querySelector(".cp-ok");
  const cancelBtn = panel.querySelector(".cp-cancel");
  const hexInput = panel.querySelector(".cp-hex");
  const eyeBtn = panel.querySelector(".cp-eyedropper");
  const eyeImg = eyeBtn.querySelector("img");

  // ---------- PRESET LAYOUT (ADDED) ----------
  presets.style.cssText = `
    width: 48px;
    height: 160px;
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    grid-template-rows: repeat(6, 1fr);
    gap: 6px;
    padding: 4px;
    box-sizing: border-box;
    align-items: center;
    justify-items: center;
  `;

  // ---------- STYLES ----------
  hueHandle.style.cssText = `
    position:absolute;
    left:-4px;
    width:26px;
    height:4px;
    background:#000;
    border:1px solid #fff;
    box-sizing:border-box;
    pointer-events:none;
  `;

  eyeBtn.style.cssText = `
    width:28px;
    height:28px;
    border-radius:50%;
    border:1px solid #999;
    background:#f5f5f5;
    display:flex;
    align-items:center;
    justify-content:center;
    cursor:pointer;
    padding:0;
  `;

  eyeImg.style.cssText = `
    width:16px;
    height:16px;
    transform: rotate(45deg);
    pointer-events:none;
  `;

  hexInput.style.cssText = `
    width:90px;
    padding:4px;
  `;

squareDot.style.cssText = `
  position:absolute;
  width:12px;
  height:12px;
  border-radius:50%;
  border:2px solid #fff;
  box-shadow: 0 0 0 1px #000;
  pointer-events:none;
  transform: translate(-6px, -6px);
`;

  // ---------- COLOR MATH ----------
  function hsvToRgb(h,s,v){
    let c=v*s,x=c*(1-Math.abs((h/60)%2-1)),m=v-c;
    let r=0,g=0,b=0;
    if(h<60)[r,g,b]=[c,x,0];
    else if(h<120)[r,g,b]=[x,c,0];
    else if(h<180)[r,g,b]=[0,c,x];
    else if(h<240)[r,g,b]=[0,x,c];
    else if(h<300)[r,g,b]=[x,0,c];
    else[r,g,b]=[c,0,x];
    return {
      r:Math.round((r+m)*255),
      g:Math.round((g+m)*255),
      b:Math.round((b+m)*255)
    };
  }

  function rgbToHsv(r,g,b){
    r/=255; g/=255; b/=255;
    let max=Math.max(r,g,b), min=Math.min(r,g,b);
    let d=max-min, h=0;
    if(d){
      if(max===r) h=((g-b)/d)%6;
      else if(max===g) h=(b-r)/d+2;
      else h=(r-g)/d+4;
      h*=60;
    }
    if(h<0) h+=360;
    return { h, s:max===0?0:d/max, v:max };
  }

  function updateCurrentColor(){
    const {r,g,b}=hsvToRgb(hue,sat,val);
    tempColor=`rgb(${r},${g},${b})`;
    preview.style.background=tempColor;
    hexInput.value=`#${((1<<24)+(r<<16)+(g<<8)+b).toString(16).slice(1)}`;
    hueHandle.style.top=`${(hue/360)*160 - 2}px`;
  }

  // ---------- DRAW ----------
  function drawHue(){
    const ctx=hueBar.getContext("2d");
    const g=ctx.createLinearGradient(0,0,0,160);
    ["red","yellow","lime","cyan","blue","magenta","red"]
      .forEach((c,i)=>g.addColorStop(i/6,c));
    ctx.fillStyle=g;
    ctx.fillRect(0,0,18,160);
  }

  function drawSquare(){
    const ctx=square.getContext("2d");
    ctx.fillStyle=`hsl(${hue},100%,50%)`;
    ctx.fillRect(0,0,160,160);
    let w=ctx.createLinearGradient(0,0,160,0);
    w.addColorStop(0,"#fff");
    w.addColorStop(1,"transparent");
    ctx.fillStyle=w;
    ctx.fillRect(0,0,160,160);
    let b=ctx.createLinearGradient(0,0,0,160);
    b.addColorStop(0,"transparent");
    b.addColorStop(1,"#000");
    ctx.fillStyle=b;
    ctx.fillRect(0,0,160,160);
  }

  // ---------- INTERACTION ----------
square.onmousedown=e=>{
  const r=square.getBoundingClientRect();

  const x = Math.max(0, Math.min(r.width,  e.clientX - r.left));
  const y = Math.max(0, Math.min(r.height, e.clientY - r.top));

  sat = x / r.width;
  val = 1 - (y / r.height);

  // 🔴 MOVE CONTROLLER DOT
  squareDot.style.left = x + "px";
  squareDot.style.top  = y + "px";

  updateCurrentColor();

  document.onmousemove = square.onmousedown;
  document.onmouseup   = ()=>document.onmousemove=null;
};

  hueBar.onmousedown=e=>{
    const r=hueBar.getBoundingClientRect();
    hue=Math.max(0,Math.min(360,360*(e.clientY-r.top)/r.height));
    drawSquare();
    updateCurrentColor();
    document.onmousemove=hueBar.onmousedown;
    document.onmouseup=()=>document.onmousemove=null;
  };

  // ---------- STANDARD PALETTE (ADDED) ----------
  STANDARD_COLORS.forEach(hex=>{
    const c=document.createElement("div");
    c.style.cssText=`
      width:18px;
      height:18px;
      border-radius:50%;
      background:${hex};
      border:1px solid #555;
      cursor:pointer;
    `;
    c.onclick=()=>{
      const rgb={
        r:parseInt(hex.substr(1,2),16),
        g:parseInt(hex.substr(3,2),16),
        b:parseInt(hex.substr(5,2),16)
      };
      const hsv=rgbToHsv(rgb.r,rgb.g,rgb.b);
      hue=hsv.h; sat=hsv.s; val=hsv.v;
      drawSquare();
      updateCurrentColor();
    };
    presets.appendChild(c);
  });

  // ---------- EYEDROPPER ----------
  eyeBtn.onclick = async ()=>{
    if(!window.EyeDropper){
      alert("Screen color picking is not supported in this browser.");
      return;
    }
    try{
      const eye = new EyeDropper();
      const res = await eye.open();
      const hex = res.sRGBHex.replace("#","");
      const rgb={
        r:parseInt(hex.substr(0,2),16),
        g:parseInt(hex.substr(2,2),16),
        b:parseInt(hex.substr(4,2),16)
      };
      const hsv=rgbToHsv(rgb.r,rgb.g,rgb.b);
      hue=hsv.h; sat=hsv.s; val=hsv.v;
      squareDot.style.left = (sat * 160) + "px";
      squareDot.style.top  = ((1 - val) * 160) + "px";
      drawSquare();
      updateCurrentColor();
    }catch{}
  };

  // ---------- HEX INPUT ----------
  hexInput.oninput = ()=>{
    if(/^#?[0-9a-fA-F]{6}$/.test(hexInput.value)){
      const h=hexInput.value.replace("#","");
      const rgb={
        r:parseInt(h.substr(0,2),16),
        g:parseInt(h.substr(2,2),16),
        b:parseInt(h.substr(4,2),16)
      };
      const hsv=rgbToHsv(rgb.r,rgb.g,rgb.b);
      hue=hsv.h; sat=hsv.s; val=hsv.v;
      drawSquare();
      updateCurrentColor();
    }
  };

  // ---------- BUTTONS ----------
  okBtn.onclick=()=>{ onApply(tempColor); panel.remove(); };
  cancelBtn.onclick=()=>{ onCancel&&onCancel(); panel.remove(); };

  // ---------- INIT ----------
  if(initialColor){
    const m=initialColor.match(/\d+/g).map(Number);
    const hsv=rgbToHsv(m[0],m[1],m[2]);
    hue=hsv.h; sat=hsv.s; val=hsv.v;
  }

  drawHue();
  drawSquare();
  updateCurrentColor();
}

squareDot.style.left = (sat * 160) + "px";
squareDot.style.top  = ((1 - val) * 160) + "px";


window.createColorPicker = createColorPicker;
