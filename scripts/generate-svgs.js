/**
 * Generates 100 paint-by-numbers SVG coloring pages + public/data/pages.json
 * Run with: node scripts/generate-svgs.js
 */
const fs = require("fs");
const nodePath = require("path");

const OUT_SVG = nodePath.join(__dirname, "..", "public", "coloring-pages");
const OUT_DATA = nodePath.join(__dirname, "..", "public", "data");
fs.mkdirSync(OUT_SVG, { recursive: true });
fs.mkdirSync(OUT_DATA, { recursive: true });

// ── Math helpers ──────────────────────────────────────────────────────────────
const PI = Math.PI;
const cos = (deg) => Math.cos((deg * PI) / 180);
const sin = (deg) => Math.sin((deg * PI) / 180);
const cx = 400, cy = 400;

const STROKE = `stroke="#222" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"`;
const WHITE = `fill="#ffffff"`;
const BG_COLOR = "#FDF6E3"; // cream — contrasts with white fill so outlines are visible

function svgWrap(body) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800" width="800" height="800">\n<rect width="800" height="800" fill="${BG_COLOR}"/>\n${body}\n</svg>`;
}

function polyPoints(x, y, r, n, offset = -90) {
  return Array.from({ length: n }, (_, i) => {
    const a = offset + (360 / n) * i;
    return `${x + r * cos(a)},${y + r * sin(a)}`;
  }).join(" ");
}

function polygon(x, y, r, n, id, offset = -90) {
  return `<polygon points="${polyPoints(x, y, r, n, offset)}" ${WHITE} ${STROKE} data-region-id="${id}" />`;
}

function circle(x, y, r, id) {
  return `<circle cx="${x}" cy="${y}" r="${r}" ${WHITE} ${STROKE} data-region-id="${id}" />`;
}

function rect(x, y, w, h, id, rx = 0) {
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" ${WHITE} ${STROKE} data-region-id="${id}" />`;
}

function ellipse(x, y, rx, ry, id) {
  return `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" ${WHITE} ${STROKE} data-region-id="${id}" />`;
}

function path(d, id) {
  return `<path d="${d}" ${WHITE} ${STROKE} data-region-id="${id}" />`;
}

function label(x, y, n) {
  return `<text x="${x}" y="${y+4}" text-anchor="middle" font-size="10" font-weight="600" fill="#666" pointer-events="none" user-select="none">${n}</text>`;
}

// ── Palette library ───────────────────────────────────────────────────────────
const PALETTES = {
  rainbow: [
    {number:1,hex:"#FF6B6B",name:"Red"},{number:2,hex:"#FF8E53",name:"Orange"},
    {number:3,hex:"#FFD93D",name:"Yellow"},{number:4,hex:"#6BCB77",name:"Green"},
    {number:5,hex:"#4D96FF",name:"Blue"},{number:6,hex:"#9B5DE5",name:"Violet"},
    {number:7,hex:"#F15BB5",name:"Pink"},{number:8,hex:"#FFFFFF",name:"White"},
    {number:9,hex:"#A8855A",name:"Brown"},{number:10,hex:"#84D2C5",name:"Teal"},
  ],
  pastel: [
    {number:1,hex:"#FFB3BA",name:"Blush"},{number:2,hex:"#FFDFBA",name:"Peach"},
    {number:3,hex:"#FFFFBA",name:"Lemon"},{number:4,hex:"#BAFFC9",name:"Mint"},
    {number:5,hex:"#BAE1FF",name:"Sky"},{number:6,hex:"#E8BAFF",name:"Lavender"},
    {number:7,hex:"#FFD1DC",name:"Rose"},{number:8,hex:"#FFFFFF",name:"White"},
    {number:9,hex:"#C8B8A2",name:"Sand"},{number:10,hex:"#B5EAD7",name:"Sage"},
  ],
  earth: [
    {number:1,hex:"#8B4513",name:"Sienna"},{number:2,hex:"#D2691E",name:"Chocolate"},
    {number:3,hex:"#DEB887",name:"Burlywood"},{number:4,hex:"#228B22",name:"Forest"},
    {number:5,hex:"#90EE90",name:"Light Green"},{number:6,hex:"#87CEEB",name:"Sky Blue"},
    {number:7,hex:"#F5DEB3",name:"Wheat"},{number:8,hex:"#FFFFFF",name:"White"},
    {number:9,hex:"#696969",name:"Dim Gray"},{number:10,hex:"#FFD700",name:"Gold"},
  ],
  ocean: [
    {number:1,hex:"#006994",name:"Deep Blue"},{number:2,hex:"#40B4E5",name:"Turquoise"},
    {number:3,hex:"#7FDBDA",name:"Aqua"},{number:4,hex:"#FF6347",name:"Coral"},
    {number:5,hex:"#FFD700",name:"Gold"},{number:6,hex:"#98FB98",name:"Pale Green"},
    {number:7,hex:"#FF85A1",name:"Salmon"},{number:8,hex:"#FFFFFF",name:"White"},
    {number:9,hex:"#F4A460",name:"Sandy"},{number:10,hex:"#20B2AA",name:"Sea Green"},
  ],
  jewel: [
    {number:1,hex:"#C471ED",name:"Amethyst"},{number:2,hex:"#F64F59",name:"Ruby"},
    {number:3,hex:"#F7971E",name:"Topaz"},{number:4,hex:"#56CCF2",name:"Sapphire"},
    {number:5,hex:"#6FCF97",name:"Emerald"},{number:6,hex:"#F2994A",name:"Amber"},
    {number:7,hex:"#2F80ED",name:"Lapis"},{number:8,hex:"#FFFFFF",name:"Pearl"},
    {number:9,hex:"#FFD200",name:"Gold"},{number:10,hex:"#EB5757",name:"Garnet"},
  ],
};

const pages = [];
let regionCounter = 0;
function uid() { return `r${++regionCounter}`; }

// ── MANDALAS (25) ─────────────────────────────────────────────────────────────
function generateMandala(index) {
  const petals = [6,8,8,10,10,12,12,8,6,10,12,8,10,6,12,8,10,6,12,8,10,12,6,8,10][index];
  const palette = Object.values(PALETTES)[index % 5];
  const rings = [
    { r: 340, label: 1 }, { r: 290, label: 2 }, { r: 240, label: 3 },
    { r: 190, label: 4 }, { r: 140, label: 5 }, { r: 90, label: 6 },
  ];
  let body = "";

  // Outer border circle
  body += circle(cx, cy, 370, uid());

  // Petal rings
  for (let ring = 0; ring < 4; ring++) {
    const r = rings[ring].r;
    const innerR = rings[ring + 1]?.r ?? 60;
    for (let i = 0; i < petals; i++) {
      const a = (360 / petals) * i;
      const midR = (r + innerR) / 2;
      const tipX = cx + r * cos(a - 90);
      const tipY = cy + r * sin(a - 90);
      const baseL = { x: cx + innerR * cos(a - 90 - 180 / petals), y: cy + innerR * sin(a - 90 - 180 / petals) };
      const baseR = { x: cx + innerR * cos(a - 90 + 180 / petals), y: cy + innerR * sin(a - 90 + 180 / petals) };
      const ctrlL = { x: cx + midR * cos(a - 90 - 90 / petals), y: cy + midR * sin(a - 90 - 90 / petals) };
      const ctrlR = { x: cx + midR * cos(a - 90 + 90 / petals), y: cy + midR * sin(a - 90 + 90 / petals) };
      const d = `M ${baseL.x.toFixed(1)} ${baseL.y.toFixed(1)} Q ${ctrlL.x.toFixed(1)} ${ctrlL.y.toFixed(1)} ${tipX.toFixed(1)} ${tipY.toFixed(1)} Q ${ctrlR.x.toFixed(1)} ${ctrlR.y.toFixed(1)} ${baseR.x.toFixed(1)} ${baseR.y.toFixed(1)} Z`;
      const id = uid();
      body += path(d, id);
      body += label(tipX.toFixed(1), tipY.toFixed(1), (ring % 6) + 1);
    }
  }

  // Inner rings
  for (let ring = 4; ring < rings.length; ring++) {
    body += circle(cx, cy, rings[ring].r, uid());
    body += label(cx, cy - rings[ring].r + 12, rings[ring].label);
  }

  // Center
  body += circle(cx, cy, 50, uid());
  // Center star
  body += polygon(cx, cy, 35, petals > 8 ? 8 : 6, uid());
  body += circle(cx, cy, 18, uid());

  return { body, palette };
}

// ── GEOMETRIC (25) ────────────────────────────────────────────────────────────
function generateGeometric(index) {
  const palette = Object.values(PALETTES)[index % 5];
  const variant = index % 5;
  let body = "";

  if (variant === 0) {
    // Hexagonal grid
    const size = 65;
    const cols = 6, rows = 5;
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const x = 70 + col * size * 1.73 + (row % 2 === 0 ? 0 : size * 0.866);
        const y = 80 + row * size * 1.5;
        if (x > 750 || y > 750) continue;
        body += polygon(x, y, size, 6, uid());
        body += label(x, y, ((row + col) % 6) + 1);
      }
    }
  } else if (variant === 1) {
    // Concentric squares with diagonals
    const layers = [350, 290, 230, 170, 110, 60, 25];
    for (let i = 0; i < layers.length - 1; i++) {
      const r = layers[i];
      const corners = [-90, 0, 90, 180].map((a) => ({ x: cx + r * cos(a), y: cy + r * sin(a) }));
      body += polygon(cx, cy, r, 4, uid(), -45);
      body += label(cx, cy - r + 15, (i % 4) + 1);
      // Diagonal lines as separate regions
      for (let j = 0; j < 4; j++) {
        const a = -45 + 90 * j + 45;
        const x1 = cx + layers[i] * cos(a - 45);
        const y1 = cy + layers[i] * sin(a - 45);
        const x2 = cx + layers[i] * cos(a + 45);
        const y2 = cy + layers[i] * sin(a + 45);
        const x3 = cx + layers[i+1] * cos(a + 45);
        const y3 = cy + layers[i+1] * sin(a + 45);
        const x4 = cx + layers[i+1] * cos(a - 45);
        const y4 = cy + layers[i+1] * sin(a - 45);
        const id = uid();
        body += `<polygon points="${x1.toFixed(1)},${y1.toFixed(1)} ${x2.toFixed(1)},${y2.toFixed(1)} ${x3.toFixed(1)},${y3.toFixed(1)} ${x4.toFixed(1)},${y4.toFixed(1)}" ${WHITE} ${STROKE} data-region-id="${id}" />`;
        body += label((x1+x3)/2, (y1+y3)/2, (j % 4) + 1);
      }
    }
    body += circle(cx, cy, 25, uid());
  } else if (variant === 2) {
    // Star polygons (8-pointed star with subdivisions)
    const n = 8;
    const outer = [360, 280, 200, 130, 75];
    const inner = [300, 220, 150, 95, 42];
    for (let ring = 0; ring < 4; ring++) {
      const pts = [];
      for (let i = 0; i < n * 2; i++) {
        const r = i % 2 === 0 ? outer[ring] : inner[ring];
        const a = -90 + (180 / n) * i;
        pts.push(`${(cx + r * cos(a)).toFixed(1)},${(cy + r * sin(a)).toFixed(1)}`);
      }
      const id = uid();
      body += `<polygon points="${pts.join(' ')}" ${WHITE} ${STROKE} data-region-id="${id}" />`;
      body += label(cx, cy - outer[ring] + 18, (ring % 6) + 1);
    }
    body += circle(cx, cy, 42, uid());
    body += polygon(cx, cy, 30, 8, uid());
    body += circle(cx, cy, 16, uid());
  } else if (variant === 3) {
    // Triangle tessellation
    const size = 90;
    for (let row = 0; row < 7; row++) {
      for (let col = 0; col < 8; col++) {
        const x = 50 + col * size * 0.5;
        const y = 50 + row * size * 0.866;
        const flip = (row + col) % 2 === 0;
        const pts = flip
          ? `${x},${y+size*0.866} ${x+size},${y+size*0.866} ${x+size/2},${y}`
          : `${x},${y} ${x+size},${y} ${x+size/2},${y+size*0.866}`;
        if (x > 760 || y > 760) continue;
        const id = uid();
        body += `<polygon points="${pts}" ${WHITE} ${STROKE} data-region-id="${id}" />`;
        body += label(x + size/2, y + (flip ? size*0.6 : size*0.3), ((row*8+col) % 6) + 1);
      }
    }
  } else {
    // Circular wedges (pie chart style with rings)
    const segments = 8 + (index % 3) * 2;
    const radii = [360, 280, 200, 130, 70, 30];
    for (let ring = 0; ring < radii.length - 1; ring++) {
      for (let seg = 0; seg < segments; seg++) {
        const a1 = -90 + (360 / segments) * seg;
        const a2 = -90 + (360 / segments) * (seg + 1);
        const r1 = radii[ring];
        const r2 = radii[ring + 1];
        const x1 = cx + r1 * cos(a1), y1 = cy + r1 * sin(a1);
        const x2 = cx + r1 * cos(a2), y2 = cy + r1 * sin(a2);
        const x3 = cx + r2 * cos(a2), y3 = cy + r2 * sin(a2);
        const x4 = cx + r2 * cos(a1), y4 = cy + r2 * sin(a1);
        const large = (a2 - a1) > 180 ? 1 : 0;
        const d = `M ${x1.toFixed(1)} ${y1.toFixed(1)} A ${r1} ${r1} 0 ${large} 1 ${x2.toFixed(1)} ${y2.toFixed(1)} L ${x3.toFixed(1)} ${y3.toFixed(1)} A ${r2} ${r2} 0 ${large} 0 ${x4.toFixed(1)} ${y4.toFixed(1)} Z`;
        const id = uid();
        body += path(d, id);
        const midA = (a1 + a2) / 2, midR = (r1 + r2) / 2;
        body += label(cx + midR * cos(midA), cy + midR * sin(midA), (seg % 8) + 1);
      }
    }
    body += circle(cx, cy, 30, uid());
  }

  return { body, palette };
}

// ── NATURE (25) ───────────────────────────────────────────────────────────────
function generateNature(index) {
  const palette = Object.values(PALETTES)[index % 5];
  const variant = index % 5;
  let body = "";

  if (variant === 0) {
    // Sunflower
    const n = 12 + (index % 4) * 2;
    // Background
    body += rect(0, 0, 800, 800, uid());
    // Sky
    body += rect(0, 0, 800, 450, uid());
    // Ground
    body += `<path d="M0 450 Q200 420 400 440 Q600 460 800 450 L800 800 L0 800 Z" ${WHITE} ${STROKE} data-region-id="${uid()}" />`;
    // Stem
    body += `<rect x="385" y="400" width="30" height="280" rx="10" ${WHITE} ${STROKE} data-region-id="${uid()}" />`;
    // Petals
    for (let i = 0; i < n; i++) {
      const a = (360 / n) * i - 90;
      const px = cx + 200 * cos(a), py = 300 + 200 * sin(a);
      body += ellipse(cx + 160 * cos(a), 300 + 160 * sin(a), 55, 28, uid());
      body += label(cx + 200 * cos(a), 300 + 200 * sin(a), (i % 4) + 1);
    }
    // Center
    body += circle(cx, 300, 90, uid());
    body += circle(cx, 300, 55, uid());
    // Leaves
    body += `<ellipse cx="350" cy="520" rx="70" ry="28" ${WHITE} ${STROKE} transform="rotate(-40 350 520)" data-region-id="${uid()}" />`;
    body += `<ellipse cx="450" cy="580" rx="70" ry="28" ${WHITE} ${STROKE} transform="rotate(40 450 580)" data-region-id="${uid()}" />`;
    body += label(cx, 300, 6);
  } else if (variant === 1) {
    // Rose
    body += rect(0, 0, 800, 800, uid());
    body += rect(0, 0, 800, 430, uid()); // sky
    body += `<path d="M0 430 Q400 400 800 430 L800 800 L0 800 Z" ${WHITE} ${STROKE} data-region-id="${uid()}" />`; // ground
    body += `<rect x="388" y="400" width="24" height="300" rx="8" ${WHITE} ${STROKE} data-region-id="${uid()}" />`; // stem
    // Rose petals - concentric
    for (let layer = 0; layer < 3; layer++) {
      const n = 5 + layer * 2;
      const r = 140 - layer * 35;
      for (let i = 0; i < n; i++) {
        const a = (360 / n) * i - 90 + layer * 20;
        const px = cx + r * cos(a), py = 280 + r * sin(a);
        const ex = cx + (r + 60) * cos(a), ey = 280 + (r + 60) * sin(a);
        const d = `M ${cx} ${280} Q ${(cx + ex)/2 + r*0.3*cos(a+90)} ${(280 + ey)/2 + r*0.3*sin(a+90)} ${ex.toFixed(1)} ${ey.toFixed(1)} Q ${(cx + ex)/2 + r*0.3*cos(a-90)} ${(280 + ey)/2 + r*0.3*sin(a-90)} ${cx} 280 Z`;
        body += path(d, uid());
        body += label(ex, ey, (layer * 3 + i) % 6 + 1);
      }
    }
    body += circle(cx, 280, 45, uid());
    // Leaves
    body += `<ellipse cx="350" cy="500" rx="60" ry="25" ${WHITE} ${STROKE} transform="rotate(-35 350 500)" data-region-id="${uid()}" />`;
    body += `<ellipse cx="450" cy="560" rx="60" ry="25" ${WHITE} ${STROKE} transform="rotate(35 450 560)" data-region-id="${uid()}" />`;
  } else if (variant === 2) {
    // Tree
    body += rect(0, 0, 800, 800, uid()); // bg
    body += rect(0, 0, 800, 500, uid()); // sky
    body += `<path d="M0 500 Q400 470 800 500 L800 800 L0 800 Z" ${WHITE} ${STROKE} data-region-id="${uid()}" />`; // ground
    body += rect(350, 380, 100, 300, uid(), 15); // trunk
    // Canopy layers
    const layers = [[cx, 330, 220], [cx, 250, 180], [cx, 180, 140], [cx, 120, 100]];
    layers.forEach(([x, y, r], i) => {
      body += circle(x, y, r, uid());
      body += label(x, y, i + 1);
    });
    // Cloud
    for (let i = 0; i < 3; i++) {
      body += ellipse(150 + i * 55, 130 - (i === 1 ? 20 : 0), 55, 35, uid());
      body += label(150 + i * 55, 130 - (i === 1 ? 20 : 0), 8);
    }
    // Sun
    body += circle(640, 100, 55, uid());
    // Rays
    for (let i = 0; i < 8; i++) {
      const a = (360 / 8) * i;
      const x1 = 640 + 60 * cos(a), y1 = 100 + 60 * sin(a);
      const x2 = 640 + 82 * cos(a), y2 = 100 + 82 * sin(a);
      body += `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" ${STROKE} />`;
    }
  } else if (variant === 3) {
    // Butterfly
    body += rect(0, 0, 800, 800, uid());
    body += rect(0, 0, 800, 430, uid());
    body += `<path d="M0 430 Q400 400 800 430 L800 800 L0 800 Z" ${WHITE} ${STROKE} data-region-id="${uid()}" />`;
    // Flowers in background
    for (let i = 0; i < 5; i++) {
      const fx = 100 + i * 140, fy = 600 + (i % 2) * 40;
      body += circle(fx, fy, 20, uid());
      for (let p = 0; p < 6; p++) {
        const a = (360 / 6) * p - 90;
        body += ellipse(fx + 28 * cos(a), fy + 28 * sin(a), 14, 9, uid());
      }
    }
    // Butterfly wings
    const wings = [
      [cx - 140, cy - 60, 130, 100, uid()],
      [cx + 140, cy - 60, 130, 100, uid()],
      [cx - 100, cy + 60, 90, 70, uid()],
      [cx + 100, cy + 60, 90, 70, uid()],
    ];
    wings.forEach(([x, y, rx, ry, id]) => {
      body += ellipse(x, y, rx, ry, id);
      // Wing patterns
      body += ellipse(x, y, rx * 0.6, ry * 0.6, uid());
      body += circle(x, y, rx * 0.25, uid());
    });
    // Body
    body += ellipse(cx, cy, 15, 80, uid());
    // Antennae
    body += `<path d="M ${cx-10} ${cy-78} Q ${cx-40} ${cy-130} ${cx-35} ${cy-155}" fill="none" ${STROKE} />`;
    body += `<path d="M ${cx+10} ${cy-78} Q ${cx+40} ${cy-130} ${cx+35} ${cy-155}" fill="none" ${STROKE} />`;
    body += circle(cx - 35, cy - 155, 8, uid());
    body += circle(cx + 35, cy - 155, 8, uid());
  } else {
    // Fish underwater scene
    body += rect(0, 0, 800, 800, uid()); // deep water
    body += rect(0, 0, 800, 150, uid()); // surface
    // Waves
    body += `<path d="M0 150 Q100 130 200 150 Q300 170 400 150 Q500 130 600 150 Q700 170 800 150" fill="none" ${STROKE} />`;
    // Seabed
    body += `<path d="M0 680 Q200 660 400 680 Q600 700 800 680 L800 800 L0 800 Z" ${WHITE} ${STROKE} data-region-id="${uid()}" />`;
    // Coral
    for (let i = 0; i < 4; i++) {
      const cx2 = 100 + i * 200;
      body += `<path d="M${cx2} 680 Q${cx2-20} 600 ${cx2} 560 Q${cx2+20} 600 ${cx2} 680 Z" ${WHITE} ${STROKE} data-region-id="${uid()}" />`;
      body += `<path d="M${cx2-25} 660 Q${cx2-40} 590 ${cx2-25} 550 Q${cx2-10} 590 ${cx2-25} 660 Z" ${WHITE} ${STROKE} data-region-id="${uid()}" />`;
    }
    // Fish 1
    body += ellipse(300, 380, 80, 45, uid());
    body += `<polygon points="380,380 420,350 420,410" ${WHITE} ${STROKE} data-region-id="${uid()}" />`;
    body += circle(265, 370, 10, uid());
    body += ellipse(300, 380, 20, 45, uid()); // stripe
    // Fish 2
    body += ellipse(550, 280, 60, 35, uid());
    body += `<polygon points="610,280 640,258 640,302" ${WHITE} ${STROKE} data-region-id="${uid()}" />`;
    body += circle(522, 272, 8, uid());
    // Bubbles
    for (let i = 0; i < 6; i++) {
      body += circle(200 + i * 80, 200 + (i % 3) * 60, 10 + i * 4, uid());
    }
    // Seaweed
    body += `<path d="M480 680 Q500 630 480 590 Q460 550 480 510" fill="none" ${STROKE} />`;
    body += `<path d="M500 680 Q520 640 500 600" fill="none" ${STROKE} />`;
  }

  return { body, palette };
}

// ── ANIMALS (15) ──────────────────────────────────────────────────────────────
const ANIMALS = [
  "Owl","Fox","Cat","Dog","Deer","Elephant","Bear","Penguin","Lion","Rabbit",
  "Horse","Tiger","Peacock","Dolphin","Eagle"
];

function generateAnimal(index) {
  const palette = Object.values(PALETTES)[index % 5];
  const variant = index % 5;
  let body = "";

  body += rect(0, 0, 800, 800, uid()); // bg

  if (variant === 0) {
    // Owl (geometric)
    body += rect(0, 400, 800, 400, uid()); // ground
    body += rect(0, 0, 800, 400, uid()); // sky
    // Body
    body += ellipse(cx, 430, 160, 200, uid());
    // Head
    body += circle(cx, 230, 140, uid());
    // Ear tufts
    body += `<polygon points="295,130 265,60 330,110" ${WHITE} ${STROKE} data-region-id="${uid()}" />`;
    body += `<polygon points="505,130 535,60 470,110" ${WHITE} ${STROKE} data-region-id="${uid()}" />`;
    // Facial disc
    body += ellipse(cx, 240, 110, 100, uid());
    // Eyes
    body += circle(355, 220, 42, uid());
    body += circle(445, 220, 42, uid());
    body += circle(355, 220, 22, uid());
    body += circle(445, 220, 22, uid());
    // Beak
    body += `<polygon points="${cx},265 ${cx-20},295 ${cx+20},295" ${WHITE} ${STROKE} data-region-id="${uid()}" />`;
    // Wings
    body += ellipse(250, 460, 90, 150, uid());
    body += ellipse(550, 460, 90, 150, uid());
    // Belly pattern
    body += ellipse(cx, 460, 100, 130, uid());
    // Feet/perch
    body += rect(200, 620, 400, 20, uid(), 5);
    for (let i = 0; i < 3; i++) {
      body += rect(320 + i * 60, 640, 12, 40, uid(), 4);
    }
    // Stars / moon
    body += circle(150, 100, 28, uid());
    for (let i = 0; i < 5; i++) {
      body += polygon(100 + i * 140, 60 + (i%3)*50, 12, 5, uid(), -90);
    }
  } else if (variant === 1) {
    // Fox
    body += rect(0, 500, 800, 300, uid()); // ground
    body += rect(0, 0, 800, 500, uid()); // sky
    // Tail
    body += `<path d="M520 600 Q680 500 660 380 Q640 280 560 320 Q500 360 520 450 Q540 520 520 600 Z" ${WHITE} ${STROKE} data-region-id="${uid()}" />`;
    body += `<path d="M620 340 Q650 300 640 360 Z" ${WHITE} ${STROKE} data-region-id="${uid()}" />`;
    // Body
    body += ellipse(350, 520, 180, 120, uid());
    // Head
    body += circle(260, 340, 110, uid());
    // Snout
    body += ellipse(200, 380, 65, 45, uid());
    // Ears
    body += `<polygon points="185,260 155,160 240,230" ${WHITE} ${STROKE} data-region-id="${uid()}" />`;
    body += `<polygon points="330,245 345,140 395,230" ${WHITE} ${STROKE} data-region-id="${uid()}" />`;
    body += `<polygon points="192,258 167,175 240,230" ${WHITE} ${STROKE} data-region-id="${uid()}" />`;
    // Eyes
    body += circle(230, 320, 22, uid());
    body += circle(300, 315, 22, uid());
    body += circle(230, 320, 10, uid());
    body += circle(300, 315, 10, uid());
    // Nose
    body += ellipse(200, 390, 16, 12, uid());
    // Legs
    for (let i = 0; i < 2; i++) {
      body += rect(250 + i * 100, 600, 40, 100, uid(), 15);
    }
    // Chest
    body += ellipse(300, 480, 80, 60, uid());
  } else if (variant === 2) {
    // Cat
    body += rect(0, 550, 800, 250, uid());
    body += rect(0, 0, 800, 550, uid());
    // Body
    body += ellipse(cx, 500, 170, 140, uid());
    // Head
    body += circle(cx, 290, 130, uid());
    // Ears
    body += `<polygon points="295,200 260,110 360,190" ${WHITE} ${STROKE} data-region-id="${uid()}" />`;
    body += `<polygon points="505,200 540,110 440,190" ${WHITE} ${STROKE} data-region-id="${uid()}" />`;
    body += `<polygon points="302,200 275,125 355,192" ${WHITE} ${STROKE} data-region-id="${uid()}" />`;
    body += `<polygon points="498,200 525,125 445,192" ${WHITE} ${STROKE} data-region-id="${uid()}" />`;
    // Face
    body += ellipse(cx, 295, 90, 80, uid());
    // Eyes
    body += ellipse(355, 265, 28, 22, uid());
    body += ellipse(445, 265, 28, 22, uid());
    body += ellipse(355, 265, 10, 18, uid());
    body += ellipse(445, 265, 10, 18, uid());
    // Nose & mouth
    body += `<polygon points="${cx},308 ${cx-12},320 ${cx+12},320" ${WHITE} ${STROKE} data-region-id="${uid()}" />`;
    body += `<path d="M${cx-12},320 Q${cx-35},340 ${cx-30},350" fill="none" ${STROKE} />`;
    body += `<path d="M${cx+12},320 Q${cx+35},340 ${cx+30},350" fill="none" ${STROKE} />`;
    // Whiskers
    for (let i = -1; i <= 1; i += 2) {
      body += `<line x1="${cx}" y1="${315 + i*5}" x2="${cx + i*100}" y2="${310 + i*8}" ${STROKE} />`;
    }
    // Tail
    body += `<path d="M560 580 Q680 500 660 400 Q640 330 590 360 Q560 390 580 450 Q600 510 570 580 Z" ${WHITE} ${STROKE} data-region-id="${uid()}" />`;
    // Legs
    for (let i = 0; i < 4; i++) {
      body += rect(240 + (i % 2) * 200 + (i < 2 ? -30 : 30), 590 + (i < 2 ? -20 : 0), 45, 80, uid(), 18);
    }
    // Belly
    body += ellipse(cx, 510, 100, 90, uid());
  } else if (variant === 3) {
    // Elephant
    body += rect(0, 550, 800, 250, uid());
    body += rect(0, 0, 800, 550, uid());
    // Body
    body += ellipse(420, 460, 220, 170, uid());
    // Head
    body += circle(220, 320, 150, uid());
    // Trunk
    body += `<path d="M120 400 Q60 450 70 530 Q80 590 130 590 Q170 590 175 540 Q180 480 140 440" ${WHITE} ${STROKE} data-region-id="${uid()}" />`;
    body += ellipse(140, 596, 30, 18, uid());
    // Ears
    body += ellipse(310, 290, 35, 70, uid());
    body += ellipse(100, 310, 80, 100, uid());
    body += ellipse(100, 310, 50, 65, uid());
    // Eye
    body += circle(175, 280, 22, uid());
    body += circle(175, 280, 10, uid());
    // Tusk
    body += `<path d="M145 380 Q105 430 120 470" fill="none" stroke="#222" stroke-width="10" stroke-linecap="round" />`;
    // Legs
    for (let i = 0; i < 4; i++) {
      body += rect(270 + (i % 2) * 160 + (i < 2 ? 0 : -20), 570, 70, 130, uid(), 20);
    }
    // Tail
    body += `<path d="M620 430 Q670 400 680 450 Q690 490 660 510" fill="none" ${STROKE} />`;
    body += circle(660, 515, 12, uid());
  } else {
    // Peacock
    body += rect(0, 550, 800, 250, uid());
    body += rect(0, 0, 800, 550, uid());
    // Tail feathers (fan)
    for (let i = 0; i < 9; i++) {
      const a = -60 + i * 15;
      const fx = cx + 270 * cos(a), fy = 400 + 270 * sin(a);
      body += `<path d="M ${cx} 400 Q ${cx + 150*cos(a-5)} ${400 + 150*sin(a-5)} ${fx.toFixed(1)} ${fy.toFixed(1)} Q ${cx + 150*cos(a+5)} ${400 + 150*sin(a+5)} ${cx} 400 Z" ${WHITE} ${STROKE} data-region-id="${uid()}" />`;
      body += ellipse(fx, fy, 28, 22, uid());
      body += circle(fx, fy, 12, uid());
      body += label(fx, fy, (i % 5) + 1);
    }
    // Body
    body += ellipse(cx, 470, 110, 90, uid());
    // Neck
    body += `<path d="M350 400 Q310 320 290 260" fill="none" stroke="#222" stroke-width="35" stroke-linecap="round" />`;
    body += `<path d="M350 400 Q310 320 290 260" fill="none" stroke="#fff" stroke-width="25" />`;
    const ncId = uid();
    body += `<path d="M350 400 Q310 320 290 260" fill="none" ${WHITE} stroke="#222" stroke-width="25" data-region-id="${ncId}" />`;
    // Head
    body += circle(285, 240, 60, uid());
    // Crest
    for (let i = 0; i < 5; i++) {
      const a = -120 + i * 15 - 90;
      body += `<path d="M285 200 Q${285 + 30*cos(a)} ${200 + 30*sin(a)} ${285 + 50*cos(a)} ${200 + 50*sin(a)}" fill="none" ${STROKE} />`;
      body += circle(285 + 50*cos(a), 200 + 50*sin(a), 8, uid());
    }
    // Eye
    body += circle(270, 232, 18, uid());
    body += circle(270, 232, 8, uid());
    // Beak
    body += `<polygon points="300,248 330,255 300,265" ${WHITE} ${STROKE} data-region-id="${uid()}" />`;
    // Legs
    body += rect(380, 550, 25, 120, uid(), 8);
    body += rect(430, 550, 25, 120, uid(), 8);
  }

  return { body, palette };
}

// ── FANTASY / SPIRITUAL (10) ──────────────────────────────────────────────────
function generateFantasy(index) {
  const palette = Object.values(PALETTES)[index % 5];
  const variant = index % 5;
  let body = "";

  body += rect(0, 0, 800, 800, uid());

  if (variant === 0) {
    // Lotus flower
    const n = 8;
    // Water
    body += `<ellipse cx="${cx}" cy="600" rx="350" ry="120" ${WHITE} ${STROKE} data-region-id="${uid()}" />`;
    // Water ripples
    for (let i = 1; i <= 3; i++) body += `<ellipse cx="${cx}" cy="600" rx="${350 - i*70}" ry="${120 - i*25}" fill="none" ${STROKE} />`;
    // Outer petals
    for (let i = 0; i < n; i++) {
      const a = (360 / n) * i - 90;
      body += ellipse(cx + 180 * cos(a), 400 + 180 * sin(a), 60, 35, uid());
      body += label(cx + 200 * cos(a), 400 + 200 * sin(a), (i % 4) + 1);
    }
    // Inner petals (upright)
    for (let i = 0; i < n; i++) {
      const a = (360 / n) * i - 90 + 22.5;
      const px = cx + 100 * cos(a), py = 400 + 100 * sin(a);
      body += `<path d="M${cx} 400 Q${cx + 140*cos(a-30)} ${400 + 140*sin(a-30)} ${px.toFixed(1)} ${(py-60).toFixed(1)} Q${cx + 140*cos(a+30)} ${400 + 140*sin(a+30)} ${cx} 400 Z" ${WHITE} ${STROKE} data-region-id="${uid()}" />`;
    }
    // Center
    body += circle(cx, 400, 70, uid());
    body += circle(cx, 400, 42, uid());
    // Stem
    body += `<path d="M${cx} 460 Q${cx+30} 530 ${cx-10} 580" fill="none" stroke="#222" stroke-width="10" />`;
    // Lily pad
    body += `<path d="M${cx-150} 600 A150 60 0 0 1 ${cx+150} 600 L${cx} 600 Z" ${WHITE} ${STROKE} data-region-id="${uid()}" />`;
  } else if (variant === 1) {
    // Celtic knot-inspired
    const rings = [340, 270, 200, 130, 70];
    const n = 4;
    for (let r = 0; r < rings.length - 1; r++) {
      for (let i = 0; i < n * 2; i++) {
        const a1 = (180 / n) * i - 90, a2 = (180 / n) * (i + 1) - 90;
        const r1 = rings[r], r2 = rings[r + 1];
        const pts = [
          [cx + r1 * cos(a1), cy + r1 * sin(a1)],
          [cx + r1 * cos(a2), cy + r1 * sin(a2)],
          [cx + r2 * cos(a2), cy + r2 * sin(a2)],
          [cx + r2 * cos(a1), cy + r2 * sin(a1)],
        ];
        const d = `M ${pts.map(p => p.map(v=>v.toFixed(1)).join(' ')).join(' L ')} Z`;
        body += path(d, uid());
        body += label((pts[0][0]+pts[2][0])/2, (pts[0][1]+pts[2][1])/2, (r * 2 + i) % 6 + 1);
      }
    }
    // Corner decorations
    for (let i = 0; i < 4; i++) {
      const a = i * 90 - 45;
      body += circle(cx + 340 * cos(a), cy + 340 * sin(a), 30, uid());
      body += polygon(cx + 340 * cos(a), cy + 340 * sin(a), 20, 4, uid(), a);
    }
    body += circle(cx, cy, 70, uid());
    body += polygon(cx, cy, 45, 6, uid());
    body += circle(cx, cy, 22, uid());
  } else if (variant === 2) {
    // Star of David / snowflake
    const r = [360, 280, 200, 140, 80];
    // 6-fold symmetry, layered
    for (let ring = 0; ring < r.length - 1; ring++) {
      for (let seg = 0; seg < 6; seg++) {
        const a1 = -90 + 60 * seg, a2 = -90 + 60 * (seg + 1);
        const r1 = r[ring], r2 = r[ring + 1];
        // Alternating triangular wedges and rectangles
        if (seg % 2 === 0) {
          const pts = [
            [cx + r1 * cos(a1), cy + r1 * sin(a1)],
            [cx + r1 * cos(a2), cy + r1 * sin(a2)],
            [cx + r2 * cos((a1+a2)/2), cy + r2 * sin((a1+a2)/2)],
          ];
          const d = `M ${pts.map(p => p.map(v=>v.toFixed(1)).join(' ')).join(' L ')} Z`;
          body += path(d, uid());
        } else {
          const a1b = a1, a2b = a2;
          const pts = [[cx+r1*cos(a1b),cy+r1*sin(a1b)],[cx+r1*cos(a2b),cy+r1*sin(a2b)],[cx+r2*cos(a2b),cy+r2*sin(a2b)],[cx+r2*cos(a1b),cy+r2*sin(a1b)]];
          const d = `M ${pts.map(p=>p.map(v=>v.toFixed(1)).join(' ')).join(' L ')} Z`;
          body += path(d, uid());
        }
        const midA = (a1 + a2) / 2, midR = (r[ring] + r[ring+1]) / 2;
        body += label(cx + midR*cos(midA), cy + midR*sin(midA), (seg%6)+1);
      }
    }
    body += circle(cx, cy, 80, uid());
    body += polygon(cx, cy, 55, 6, uid());
    body += circle(cx, cy, 28, uid());
  } else if (variant === 3) {
    // Dream catcher
    // Outer ring
    body += circle(cx, 280, 200, uid());
    body += circle(cx, 280, 185, uid());
    // Web (spoke pattern)
    const spokes = 12;
    const radii2 = [170, 140, 110, 80, 55, 30];
    for (let r2i = 0; r2i < radii2.length - 1; r2i++) {
      for (let s = 0; s < spokes; s++) {
        const a1 = -90 + (360/spokes)*s, a2 = -90 + (360/spokes)*(s+1);
        const r1 = radii2[r2i], r2 = radii2[r2i+1];
        const large = (a2-a1) > 180 ? 1 : 0;
        const x1=cx+r1*cos(a1),y1=280+r1*sin(a1),x2=cx+r1*cos(a2),y2=280+r1*sin(a2);
        const x3=cx+r2*cos(a2),y3=280+r2*sin(a2),x4=cx+r2*cos(a1),y4=280+r2*sin(a1);
        const d=`M${x1.toFixed(1)} ${y1.toFixed(1)} A${r1} ${r1} 0 ${large} 1 ${x2.toFixed(1)} ${y2.toFixed(1)} L${x3.toFixed(1)} ${y3.toFixed(1)} A${r2} ${r2} 0 ${large} 0 ${x4.toFixed(1)} ${y4.toFixed(1)} Z`;
        body += path(d, uid());
        const midA=(a1+a2)/2, midR=(r1+r2)/2;
        body += label(cx+midR*cos(midA), 280+midR*sin(midA), (s%6)+1);
      }
    }
    body += circle(cx, 280, 30, uid());
    // Feathers hanging
    for (let f = 0; f < 3; f++) {
      const fx = cx - 80 + f * 80, fy = 480;
      body += `<path d="M${fx} ${fy} L${fx} ${fy + 120}" fill="none" stroke="#222" stroke-width="3" />`;
      for (let i = 0; i < 5; i++) {
        body += ellipse(fx, fy + 20 + i * 20, 18, 8, uid());
      }
      // Beads
      body += circle(fx, fy, 12, uid());
      body += circle(fx, fy + 14, 8, uid());
    }
    // Decorative gems on ring
    for (let i = 0; i < 8; i++) {
      const a = -90 + (360/8)*i;
      body += circle(cx + 192*cos(a), 280 + 192*sin(a), 10, uid());
    }
  } else {
    // Yin-yang with decorative border
    // Background circle
    body += circle(cx, cy, 360, uid());
    // Outer decorative ring
    for (let i = 0; i < 16; i++) {
      const a = (360/16)*i - 90;
      body += polygon(cx + 330*cos(a), cy + 330*sin(a), 22, 4, uid(), a);
    }
    // Yin-yang
    body += circle(cx, cy, 250, uid());
    body += `<path d="M${cx} ${cy-250} A250 250 0 0 1 ${cx} ${cy+250} A125 125 0 0 1 ${cx} ${cy} A125 125 0 0 0 ${cx} ${cy-250} Z" ${WHITE} ${STROKE} data-region-id="${uid()}" />`;
    body += `<path d="M${cx} ${cy-250} A125 125 0 0 0 ${cx} ${cy} A125 125 0 0 1 ${cx} ${cy+250} A250 250 0 0 0 ${cx} ${cy-250} Z" ${WHITE} ${STROKE} data-region-id="${uid()}" />`;
    body += circle(cx, cy - 125, 50, uid());
    body += circle(cx, cy + 125, 50, uid());
    // Inner dots
    body += circle(cx, cy - 125, 22, uid());
    body += circle(cx, cy + 125, 22, uid());
    // Corner decorations
    for (let i = 0; i < 4; i++) {
      const a = i * 90 - 45;
      body += circle(cx + 320*cos(a), cy + 320*sin(a), 28, uid());
      body += circle(cx + 320*cos(a), cy + 320*sin(a), 16, uid());
    }
  }

  return { body, palette };
}

// ── Build pages.json ──────────────────────────────────────────────────────────
const categories = [
  { name: "Mandalas", count: 25, gen: generateMandala },
  { name: "Geometric", count: 25, gen: generateGeometric },
  { name: "Nature", count: 25, gen: generateNature },
  { name: "Animals", count: 15, gen: generateAnimal },
  { name: "Fantasy", count: 10, gen: generateFantasy },
];

const titles = {
  Mandalas: ["Lotus Mandala","Sunburst Mandala","Celestial Mandala","Ocean Mandala","Forest Mandala","Rose Mandala","Crystal Mandala","Moon Mandala","Star Mandala","Harmony Mandala","Zen Mandala","Dream Mandala","Spiral Mandala","Garden Mandala","Infinity Mandala","Aurora Mandala","Sacred Mandala","Flower Mandala","Peace Mandala","Cosmos Mandala","Butterfly Mandala","Morning Mandala","Dusk Mandala","Earth Mandala","Fire Mandala"],
  Geometric: ["Hexagon Grid","Diamond Pattern","Star Polygon","Triangle Mosaic","Radial Wedges","Kaleidoscope A","Crystal Grid","Pinwheel Pattern","Starburst Web","Prism Array","Honeycomb Art","Angular Flow","Sacred Geometry","Tessellation A","Tessellation B","Geometric Bloom","Radiant Squares","Diamond Web","Chevron Lattice","Fractal Grid","Concentric Stars","Pentagon Array","Arrow Grid","Spiral Squares","Maze Pattern"],
  Nature: ["Sunflower Field","Rose Garden","Forest Path","Butterfly Meadow","Underwater World","Daisy Chain","Lotus Lake","Cherry Blossom","Mountain Sunrise","Autumn Leaves","Spring Tulips","Bamboo Grove","Cactus Desert","Lavender Field","Coral Reef","Oak Tree","Maple Sunset","Water Lily","Pine Forest","Wildflower Patch","Fern Glade","Ivy Wall","Morning Glory","Bird of Paradise","Tropical Jungle"],
  Animals: ["Wise Owl","Clever Fox","Resting Cat","Gentle Elephant","Dancing Peacock","Forest Deer","Playful Bear","Proud Lion","Happy Rabbit","Majestic Horse","Striped Tiger","Arctic Penguin","Soaring Eagle","Ocean Dolphin","Curious Dog"],
  Fantasy: ["Lotus Spirit","Celtic Weave","Star of David","Dream Catcher","Yin and Yang","Sacred Lotus","Moon Mandala","Celestial Ring","Infinity Knot","Mandala of Light"],
};

const difficulties = {
  Mandalas: (i) => i < 8 ? "easy" : i < 18 ? "medium" : "hard",
  Geometric: (i) => i < 8 ? "easy" : i < 18 ? "medium" : "hard",
  Nature: (i) => i < 10 ? "easy" : i < 18 ? "medium" : "hard",
  Animals: (i) => i < 5 ? "easy" : i < 10 ? "medium" : "hard",
  Fantasy: (i) => i < 3 ? "easy" : i < 7 ? "medium" : "hard",
};

const allPages = [];
let pageIdx = 0;

for (const cat of categories) {
  for (let i = 0; i < cat.count; i++) {
    const id = `page-${String(pageIdx + 1).padStart(3, "0")}`;
    const { body, palette } = cat.gen(i);
    const svgFile = `${id}.svg`;
    const svgPath = nodePath.join(OUT_SVG, svgFile);
    fs.writeFileSync(svgPath, svgWrap(body));

    allPages.push({
      id,
      title: titles[cat.name][i],
      category: cat.name,
      difficulty: difficulties[cat.name](i),
      svgUrl: `/coloring-pages/${svgFile}`,
      palette,
    });

    pageIdx++;
    if (pageIdx % 10 === 0) process.stdout.write(`  ${pageIdx}/100 generated...\n`);
  }
}

fs.writeFileSync(nodePath.join(OUT_DATA, "pages.json"), JSON.stringify(allPages, null, 2));
console.log(`\n✓ ${allPages.length} coloring pages generated`);
console.log(`✓ pages.json written to public/data/pages.json`);
