<template>
  <div ref="container" class="hero3d" aria-hidden="true">
    <canvas ref="canvasEl"></canvas>
  </div>
</template>

<script setup>
// ----------------------------------------------------------------------------
// Hero3D — a full-viewport Three.js background for the landing page.
// Floating theme: a rotating QR-code cube wrapped in orbit rings, glassy
// geometric shapes, food-emoji sprites and a soft green particle field.
// Fully cleaned up on unmount and paused when the tab is hidden.
// ----------------------------------------------------------------------------
import { ref, onMounted, onBeforeUnmount } from "vue";
import * as THREE from "three";

const container = ref(null);
const canvasEl = ref(null);

let renderer = null;
let scene = null;
let camera = null;
let core = null; // rotating QR group (cube + rings + emojis)
let orbit = null; // slowly rotating floating shapes
let particles = null;
let clock = null;
let rafId = null;
let isPaused = false;
let reducedMotion = false;

const disposables = [];
const mouse = { x: 0, y: 0 };

const PALETTE = [0x22c55e, 0x16a34a, 0x34d399, 0x059669, 0x10b981, 0xf59e0b];
const FOOD_EMOJIS = ["🍜", "🍛", "🍗", "🐟", "🥘", "🦐", "🍲", "🥗"];

// ------------------------- texture helpers -------------------------------

function makeQrTexture() {
  const size = 512;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, size, size);

  const n = 25;
  const cell = size / n;
  const inFinder = (r, c) =>
    (r < 8 && c < 8) || (r < 8 && c >= n - 8) || (r >= n - 8 && c < 8);

  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      if (inFinder(r, c)) continue;
      ctx.fillStyle = Math.random() < 0.47 ? "#0c3d2c" : "#ffffff";
      ctx.fillRect(c * cell, r * cell, cell + 0.5, cell + 0.5);
    }
  }
  const drawFinder = (row, col) => {
    ctx.fillStyle = "#0c3d2c";
    ctx.fillRect(col * cell, row * cell, 8 * cell, 8 * cell);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect((col + 1) * cell, (row + 1) * cell, 6 * cell, 6 * cell);
    ctx.fillStyle = "#0c3d2c";
    ctx.fillRect((col + 2) * cell, (row + 2) * cell, 4 * cell, 4 * cell);
    // green center dot (matches brand)
    ctx.fillStyle = "#22c55e";
    ctx.beginPath();
    ctx.arc((col + 4) * cell, (row + 4) * cell, cell * 1.15, 0, Math.PI * 2);
    ctx.fill();
  };
  drawFinder(0, 0);
  drawFinder(0, n - 8);
  drawFinder(n - 8, 0);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

function makeEmojiTexture(emoji) {
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d");
  ctx.font = '150px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif';
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(emoji, size / 2, size / 2 + 10);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/* ------------------------------ scene ------------------------------------ */

function buildScene() {
  const isMobile = window.innerWidth < 768;

  scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0xdcfce7, 8, 26);

  camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 60);
  camera.position.set(0, 0.45, 12.5);

  // Lights
  scene.add(new THREE.AmbientLight(0xffffff, 1.15));
  const dir = new THREE.DirectionalLight(0xffffff, 2.4);
  dir.position.set(6, 9, 5);
  scene.add(dir);
  const amber = new THREE.PointLight(0xf59e0b, 60, 40);
  amber.position.set(-7, -2, -3);
  scene.add(amber);

  // ---- rotating core (QR cube + wireframe shell + rings + emojis) ----
  core = new THREE.Group();
  core.position.set(isMobile ? 0.1 : 2.5, isMobile ? 0 : 0.8, 0);
  scene.add(core);

  const cubeSize = isMobile ? 2.0 : 2.3;
  const qrTex = makeQrTexture();
  const qrMat = new THREE.MeshStandardMaterial({
    map: qrTex,
    roughness: 0.3,
    metalness: 0.18,
    emissive: 0x22c55e,
    emissiveIntensity: 0.07,
  });
  const qrCube = new THREE.Mesh(new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize), qrMat);
  core.add(qrCube);
  disposables.push(qrTex, qrMat, qrCube.geometry);

  const shellGeo = new THREE.IcosahedronGeometry(cubeSize * 0.88, 1);
  const shellMat = new THREE.MeshBasicMaterial({
    color: 0x34d399,
    wireframe: true,
    transparent: true,
    opacity: 0.4,
  });
  const shell = new THREE.Mesh(shellGeo, shellMat);
  core.add(shell);
  disposables.push(shellGeo, shellMat);

  const ringMaterial = new THREE.MeshStandardMaterial({
    color: 0x22c55e,
    transparent: true,
    opacity: 0.5,
    emissive: 0x166534,
    emissiveIntensity: 0.6,
    roughness: 0.3,
    metalness: 0.45,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  for (let i = 0; i < 3; i++) {
    const geo = new THREE.TorusGeometry(cubeSize * 1.35 + i * 0.95, 0.07, 12, 96);
    const mat = ringMaterial.clone();
    const ring = new THREE.Mesh(geo, mat);
    ring.rotation.x = -0.95 + i * 0.62;
    ring.rotation.y = i * 0.85;
    ring.renderOrder = 2;
    core.add(ring);
    disposables.push(geo, mat);
  }

  // food emoji sprites orbiting the QR cube
  const emojiCount = isMobile ? 6 : 8;
  for (let i = 0; i < emojiCount; i++) {
    const tex = makeEmojiTexture(FOOD_EMOJIS[i % FOOD_EMOJIS.length]);
    const mat = new THREE.SpriteMaterial({
      map: tex,
      transparent: true,
      depthWrite: false,
      opacity: 0.9,
    });
    const sprite = new THREE.Sprite(mat);
    const theta = (i / emojiCount) * Math.PI * 2 + Math.random() * 0.7;
    const rad = cubeSize * 1.9 + (i % 3) * 1.1;
    const y = -2.1 + (i % 4) * 1.45;
    sprite.position.set(Math.cos(theta) * rad, y, Math.sin(theta) * rad);
    sprite.scale.setScalar(isMobile ? 1.0 : 1.15 + (i % 3) * 0.18);
    sprite.renderOrder = 3;
    core.add(sprite);
    disposables.push(tex, mat);
  }

  // ---- floating glassy shapes (slow outer orbit) ----
  orbit = new THREE.Group();
  scene.add(orbit);

  const geoFactories = [
    () => new THREE.IcosahedronGeometry(0.55, 0),
    () => new THREE.OctahedronGeometry(0.45, 0),
    () => new THREE.DodecahedronGeometry(0.5, 0),
    () => new THREE.TorusKnotGeometry(0.34, 0.14, 64, 8),
    () => new THREE.OctahedronGeometry(0.62, 0),
    () => new THREE.TorusGeometry(0.4, 0.15, 12, 42),
  ];

  const shapeCount = isMobile ? 7 : 13;
  for (let i = 0; i < shapeCount; i++) {
    const geo = geoFactories[i % geoFactories.length]();
    const color = PALETTE[i % PALETTE.length];
    const mat = new THREE.MeshStandardMaterial({
      color,
      roughness: 0.32,
      metalness: 0.25,
      transparent: true,
      opacity: 0.4 + (i % 3) * 0.16,
      emissive: color,
      emissiveIntensity: 0.22,
      depthWrite: false,
    });
    const mesh = new THREE.Mesh(geo, mat);
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const rad = 4.2 + Math.random() * 3.6 - (isMobile ? 1.4 : 0);
    mesh.position.set(
      Math.sin(phi) * Math.cos(theta) * rad,
      Math.cos(phi) * rad * 0.7 + 0.4,
      Math.sin(phi) * Math.sin(theta) * rad - 1
    );
    mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
    mesh.userData.spin = (i % 2 === 0 ? 1 : -1) * (0.25 + Math.random() * 0.45);
    orbit.add(mesh);
    disposables.push(geo, mat);
  }

  // ---- particle field ----
  const pCount = isMobile ? 350 : 750;
  const positions = new Float32Array(pCount * 3);
  for (let i = 0; i < positions.length; i += 3) {
    positions[i] = (Math.random() - 0.5) * 32;
    positions[i + 1] = (Math.random() - 0.5) * 18 + 0.5;
    positions[i + 2] = (Math.random() - 0.5) * 26 - 4;
  }
  const pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  const pMat = new THREE.PointsMaterial({
    color: 0x22c55e,
    size: 0.09,
    transparent: true,
    opacity: 0.65,
    depthWrite: false,
    sizeAttenuation: true,
  });
  particles = new THREE.Points(pGeo, pMat);
  scene.add(particles);
  disposables.push(pGeo, pMat);
}

/* ------------------------------ render loop ------------------------------ */

function startLoop() {
  clock = new THREE.Clock();

  // Paint one frame immediately so the canvas is never blank.
  renderer.render(scene, camera);

  if (reducedMotion) return; // static frame only — respect reduced motion

  const animate = () => {
    rafId = requestAnimationFrame(animate);
    if (isPaused) return;

    const dt = Math.min(clock.getDelta(), 0.05);
    const t = clock.elapsedTime;

    core.rotation.y += dt * 0.32;
    core.rotation.x = Math.sin(t * 0.22) * 0.06;

    orbit.rotation.y += dt * 0.08;
    orbit.rotation.x = Math.sin(t * 0.14) * 0.04;

    particles.rotation.y += dt * 0.02;

    orbit.children.forEach((child) => {
      if (child.isMesh && child.userData.spin) {
        child.rotation.x += dt * child.userData.spin;
        child.rotation.y += dt * child.userData.spin * 1.4;
      }
    });

    // Cursor parallax (eased)
    camera.position.x += (mouse.x * 3.4 - camera.position.x) * 0.032;
    camera.position.y += (0.45 + mouse.y * 1.3 - camera.position.y) * 0.032;
    camera.lookAt(0, 0.3, 0);

    renderer.render(scene, camera);
  };
  animate();
}

/* ------------------------------ lifecycle -------------------------------- */

function onPointerMove(e) {
  mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
}

function onResize() {
  if (!renderer || !camera) return;
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function onVisibility() {
  isPaused = document.hidden;
}

onMounted(() => {
  try {
    if (!window.WebGLRenderingContext) return;
    reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const isMobile = window.innerWidth < 768;
    const dpr = Math.min(window.devicePixelRatio || 1, isMobile ? 1.5 : 2);

    renderer = new THREE.WebGLRenderer({
      canvas: canvasEl.value,
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(dpr);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);

    buildScene();
    startLoop();

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("resize", onResize, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);
  } catch (err) {
    console.warn("[Hero3D] WebGL scene disabled:", err);
    renderer = null;
  }
});

onBeforeUnmount(() => {
  cancelAnimationFrame(rafId);
  window.removeEventListener("pointermove", onPointerMove);
  window.removeEventListener("resize", onResize);
  document.removeEventListener("visibilitychange", onVisibility);

  disposables.forEach((d) => d.dispose());
  disposables.length = 0;

  scene?.traverse((obj) => {
    if (obj.geometry) obj.geometry.dispose();
  });

  renderer?.dispose();
  renderer?.forceContextLoss?.();
  renderer = null;
  scene = null;
  camera = null;
  core = null;
  orbit = null;
  particles = null;
});
</script>

<style scoped>
.hero3d {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
}
.hero3d canvas {
  display: block;
  width: 100%;
  height: 100%;
}
</style>