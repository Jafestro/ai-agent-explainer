import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';
import { CONCEPTS, SCENARIOS, QUIZ, QUIZ_OPTIONS, CHEATSHEET_ORDER } from './content.js';

// ---------- Renderer, scene, camera ----------
const container = document.getElementById('scene');

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
container.appendChild(renderer.domElement);

const labelRenderer = new CSS2DRenderer();
labelRenderer.setSize(window.innerWidth, window.innerHeight);
labelRenderer.domElement.className = 'label-layer';
container.appendChild(labelRenderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x05070f);
scene.fog = new THREE.FogExp2(0x05070f, 0.016);

const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 500);
const HOME_CAM = new THREE.Vector3(0, 7, 31);
const HOME_TARGET = new THREE.Vector3(0, -2.5, 1.5);
camera.position.copy(HOME_CAM);

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.copy(HOME_TARGET);
controls.enableDamping = true;
controls.minDistance = 6;
controls.maxDistance = 60;

scene.add(new THREE.AmbientLight(0xffffff, 0.4));
const keyLight = new THREE.DirectionalLight(0xffffff, 1.3);
keyLight.position.set(6, 12, 8);
scene.add(keyLight);
const coreLight = new THREE.PointLight(0xb388ff, 40, 30);
scene.add(coreLight);

// Starfield
{
  const n = 1800;
  const pos = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    const r = 70 + Math.random() * 120;
    const th = Math.random() * Math.PI * 2;
    const ph = Math.acos(2 * Math.random() - 1);
    pos[i * 3] = r * Math.sin(ph) * Math.cos(th);
    pos[i * 3 + 1] = r * Math.cos(ph);
    pos[i * 3 + 2] = r * Math.sin(ph) * Math.sin(th);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  scene.add(new THREE.Points(g, new THREE.PointsMaterial({ color: 0x8899cc, size: 0.4, fog: false })));
}

const grid = new THREE.PolarGridHelper(26, 16, 10, 96, 0x1d2a4a, 0x141c33);
grid.position.y = -9.5;
scene.add(grid);

// ---------- Helpers ----------
const hex = (c) => '#' + c.toString(16).padStart(6, '0');

function makeGlowTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const g = c.getContext('2d');
  const grad = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  grad.addColorStop(0, 'rgba(255,255,255,1)');
  grad.addColorStop(0.25, 'rgba(255,255,255,0.45)');
  grad.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = grad;
  g.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(c);
}
const glowTex = makeGlowTexture();

const glowMat = (color, opacity) =>
  new THREE.SpriteMaterial({ map: glowTex, color, transparent: true, opacity, depthWrite: false, blending: THREE.AdditiveBlending });

const stdMat = (color, intensity = 0.45) =>
  new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: intensity, roughness: 0.35, metalness: 0.15, transparent: true });

// ---------- Node shapes ----------
const NODE_DEFS = {
  user:     { pos: [-12, 0, 3],     color: 0x4fc3f7, labelY: 2.4 },
  prompt:   { pos: [-6.5, 2, 3.5],  color: 0x81d4fa, labelY: 1.3 },
  system:   { pos: [-5.5, 5.5, -4], color: 0xffb74d, labelY: 1.7 },
  agent:    { pos: [0, 0, 0],       color: 0x7c4dff, labelY: 3.6, glow: 9 },
  llm:      { pos: [0, 0, 0],       color: 0xe040fb, labelY: -1.7, glow: 4.5 },
  skills:   { pos: [7.5, 4.5, -3],  color: 0x66bb6a, labelY: 1.6 },
  rag:      { pos: [7.5, -2.5, -5], color: 0x26c6da, labelY: 1.7 },
  tools:    { pos: [8.5, 0.5, 3.5], color: 0xffee58, labelY: 1.6 },
  mcp:      { pos: [2.5, -4.5, 6],  color: 0xff7043, labelY: 1.7 },
  github:   { pos: [6.5, -6.5, 8.5], color: 0xb0bec5, labelY: 1.1, glow: 2 },
  database: { pos: [2, -7.5, 10],     color: 0x4db6ac, labelY: 1.1, glow: 2 },
  slack:    { pos: [-2.5, -6.5, 9],   color: 0xba68c8, labelY: 1.1, glow: 2 },
  memory:   { pos: [-7.5, -3.5, -3], color: 0xf06292, labelY: 1.6 },
};

function makeBody(id, color) {
  const g = new THREE.Group();
  const add = (geo, mat = stdMat(color), pos, rot) => {
    const m = new THREE.Mesh(geo, mat);
    if (pos) m.position.set(...pos);
    if (rot) m.rotation.set(...rot);
    g.add(m);
    return m;
  };
  switch (id) {
    case 'user':
      add(new THREE.CapsuleGeometry(0.55, 0.8, 8, 16), undefined, [0, -0.5, 0]);
      add(new THREE.SphereGeometry(0.45, 24, 24), undefined, [0, 0.85, 0]);
      break;
    case 'prompt': {
      add(new THREE.BoxGeometry(1.7, 1.15, 0.08), stdMat(0xe1f5fe, 0.25));
      const lineMat = stdMat(color, 0.8);
      [0.3, 0.05, -0.2].forEach((y, i) => add(new THREE.BoxGeometry(i === 2 ? 0.8 : 1.3, 0.08, 0.1), lineMat, [i === 2 ? -0.25 : 0, y, 0.02]));
      break;
    }
    case 'system':
      add(new THREE.OctahedronGeometry(1.05));
      break;
    case 'agent': {
      const shell = new THREE.MeshBasicMaterial({ color, wireframe: true, transparent: true, opacity: 0.55 });
      add(new THREE.IcosahedronGeometry(2.7, 1), shell);
      const ringMat = new THREE.MeshBasicMaterial({ color: 0xb388ff, transparent: true, opacity: 0.7 });
      add(new THREE.TorusGeometry(3.3, 0.035, 8, 128), ringMat, null, [Math.PI / 2, 0, 0]);
      add(new THREE.TorusGeometry(3.3, 0.035, 8, 128), ringMat, null, [Math.PI / 3, Math.PI / 4, 0]);
      break;
    }
    case 'llm':
      add(new THREE.SphereGeometry(1.1, 48, 48), stdMat(color, 1.1));
      break;
    case 'skills':
      [0x66bb6a, 0x43a047, 0x81c784].forEach((c, i) =>
        add(new THREE.BoxGeometry(0.35, 1.5 - i * 0.12, 1.1), stdMat(c), [(i - 1) * 0.42, -i * 0.06, 0], [0, 0, i === 2 ? -0.25 : 0]));
      break;
    case 'rag':
      [0.55, 0, -0.55].forEach((y) => add(new THREE.CylinderGeometry(0.9, 0.9, 0.42, 32), undefined, [0, y, 0]));
      break;
    case 'tools': {
      const m = stdMat(color);
      add(new THREE.CylinderGeometry(0.7, 0.7, 0.3, 24), m, null, [Math.PI / 2, 0, 0]);
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2;
        add(new THREE.BoxGeometry(0.28, 0.32, 0.3), m, [Math.cos(a) * 0.82, Math.sin(a) * 0.82, 0], [0, 0, a]);
      }
      add(new THREE.CylinderGeometry(0.25, 0.25, 0.34, 16), stdMat(0x333300, 0.1), null, [Math.PI / 2, 0, 0]);
      break;
    }
    case 'mcp': {
      add(new THREE.TorusGeometry(0.95, 0.2, 16, 48));
      const plug = stdMat(0xffccbc, 0.4);
      add(new THREE.BoxGeometry(0.9, 0.5, 0.3), plug);
      add(new THREE.BoxGeometry(0.12, 0.35, 0.12), plug, [-0.2, 0.42, 0]);
      add(new THREE.BoxGeometry(0.12, 0.35, 0.12), plug, [0.2, 0.42, 0]);
      break;
    }
    case 'github':
      add(new THREE.BoxGeometry(0.8, 0.8, 0.8));
      break;
    case 'database':
      add(new THREE.CylinderGeometry(0.45, 0.45, 0.8, 24));
      break;
    case 'slack':
      add(new THREE.TorusKnotGeometry(0.32, 0.11, 64, 8));
      break;
    case 'memory':
      add(new THREE.DodecahedronGeometry(0.95));
      break;
  }
  return g;
}

// ---------- Build nodes ----------
const nodes = {};
const pickables = [];

for (const [id, def] of Object.entries(NODE_DEFS)) {
  const group = new THREE.Group();
  group.position.set(...def.pos);
  scene.add(group);

  const body = makeBody(id, def.color);
  group.add(body);

  const mats = [];
  body.traverse((o) => {
    if (o.isMesh) {
      o.userData.nodeId = id;
      pickables.push(o);
      mats.push(o.material);
    }
  });

  const glow = new THREE.Sprite(glowMat(def.color, 0.35));
  glow.scale.setScalar(def.glow || 3.4);
  group.add(glow);
  mats.push(glow.material);
  mats.forEach((m) => (m.userData.baseOpacity = m.opacity));

  const el = document.createElement('div');
  el.className = 'label';
  el.style.setProperty('--c', hex(def.color));
  el.innerHTML = `<span class="dot"></span>${CONCEPTS[id].label}`;
  el.addEventListener('click', () => selectNode(id));
  const label = new CSS2DObject(el);
  label.position.set(0, def.labelY, 0);
  group.add(label);

  nodes[id] = { id, def, group, body, mats, el, pulse: 0, hover: 0, opacity: 1, targetOpacity: 1 };
}

// ---------- Connections ----------
const EDGES = [
  ['user', 'prompt'], ['prompt', 'agent'], ['system', 'agent'], ['agent', 'skills'], ['agent', 'rag'],
  ['agent', 'tools'], ['agent', 'mcp'], ['mcp', 'github'], ['mcp', 'database'], ['mcp', 'slack'], ['agent', 'memory'],
];

function curveBetween(a, b) {
  const p1 = nodes[a].group.position.clone();
  const p2 = nodes[b].group.position.clone();
  const mid = p1.clone().lerp(p2, 0.5);
  mid.y += p1.distanceTo(p2) * 0.18;
  return new THREE.QuadraticBezierCurve3(p1, mid, p2);
}

const edges = EDGES.map(([a, b]) => {
  const curve = curveBetween(a, b);
  const color = nodes[b === 'agent' ? a : b].def.color;
  const line = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints(curve.getPoints(64)),
    new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.3 })
  );
  scene.add(line);
  const spark = new THREE.Sprite(glowMat(color, 0.6));
  spark.scale.setScalar(0.55);
  scene.add(spark);
  return { a, b, curve, line, spark, offset: Math.random(), opacity: 0.3, target: 0.3 };
});

function neighbors(id) {
  const set = new Set([id]);
  edges.forEach((e) => {
    if (e.a === id) set.add(e.b);
    if (e.b === id) set.add(e.a);
  });
  if (id === 'llm') set.add('agent');
  if (id === 'agent') set.add('llm');
  return [...set];
}

// ---------- Focus / dimming ----------
function setFocus(ids) {
  const set = ids ? new Set(ids) : null;
  for (const n of Object.values(nodes)) {
    const on = !set || set.has(n.id);
    n.targetOpacity = on ? 1 : 0.12;
    n.el.classList.toggle('dim', !on);
  }
  for (const e of edges) {
    const on = set && set.has(e.a) && set.has(e.b);
    e.target = !set ? 0.3 : on ? 0.85 : 0.04;
  }
}

// ---------- Camera tween ----------
let camTween = null;
function tweenCamera(toCam, toTarget) {
  camTween = { fromCam: camera.position.clone(), toCam, fromT: controls.target.clone(), toT: toTarget, t: 0 };
}
function focusCameraOn(id) {
  const p = nodes[id].group.position.clone();
  const dir = camera.position.clone().sub(controls.target).normalize();
  const dist = id === 'agent' || id === 'llm' ? 20 : 16;
  tweenCamera(p.clone().add(dir.multiplyScalar(dist)), p);
}
function resetView() {
  tweenCamera(HOME_CAM.clone(), HOME_TARGET.clone());
}
controls.addEventListener('start', () => (camTween = null));

// ---------- Packet flights and speech bubbles ----------
const flights = [];
const bubbles = [];
const packetGeo = new THREE.SphereGeometry(0.17, 16, 16);

function fly(from, to, text) {
  return new Promise((resolve) => {
    const curve = curveBetween(from, to);
    const color = nodes[from].def.color;
    const g = new THREE.Group();
    const glow = new THREE.Sprite(glowMat(color, 1));
    glow.scale.setScalar(1.6);
    g.add(glow, new THREE.Mesh(packetGeo, new THREE.MeshBasicMaterial({ color: 0xffffff })));
    let el = null;
    if (text) {
      el = document.createElement('div');
      el.className = 'packet';
      el.style.setProperty('--c', hex(color));
      el.textContent = text;
      const lbl = new CSS2DObject(el);
      lbl.position.y = 0.6;
      g.add(lbl);
    }
    g.position.copy(curve.getPoint(0));
    scene.add(g);
    const duration = Math.max(1200, curve.getLength() * 120);
    flights.push({ g, el, curve, to, start: performance.now(), duration, resolve });
  });
}

function endFlight(f) {
  scene.remove(f.g);
  f.el?.remove();
  f.g.traverse((o) => o.material?.dispose());
  f.resolve();
}

function say(id, text, ms) {
  return new Promise((resolve) => {
    const el = document.createElement('div');
    el.className = 'bubble';
    el.textContent = text;
    const obj = new CSS2DObject(el);
    obj.position.set(0, id === 'llm' ? 5.6 : 2.2, 0);
    nodes[id].group.add(obj);
    const b = { obj, el, id, resolve, timer: 0 };
    b.timer = setTimeout(() => removeBubble(b), ms);
    bubbles.push(b);
  });
}

function removeBubble(b) {
  clearTimeout(b.timer);
  nodes[b.id].group.remove(b.obj);
  b.el.remove();
  const i = bubbles.indexOf(b);
  if (i >= 0) bubbles.splice(i, 1);
  b.resolve();
}

function clearAnimations() {
  while (flights.length) endFlight(flights.pop());
  [...bubbles].forEach(removeBubble);
}

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

// ---------- Scenario runner ----------
const captionEl = document.getElementById('caption');
let scenario = null;
let stepIndex = 0;
let runToken = 0;

function startScenario(key) {
  closePanel();
  closeModal();
  scenario = SCENARIOS[key];
  stepIndex = 0;
  captionEl.classList.remove('hidden');
  resetView();
  runStep();
}

function stopScenario() {
  runToken++;
  clearAnimations();
  scenario = null;
  captionEl.classList.add('hidden');
  setFocus(null);
}

async function runStep() {
  const token = ++runToken;
  clearAnimations();
  const step = scenario.steps[stepIndex];
  renderCaption(step);
  setFocus(step.focus);
  for (const [type, ...args] of step.actions || []) {
    if (token !== runToken) return;
    if (type === 'fly') await fly(args[0], args[1], args[2]);
    else if (type === 'think') {
      nodes[args[0]].pulse = 1;
      await say(args[0], args[1], args[2]);
    } else if (type === 'pulse') {
      args.forEach((id) => (nodes[id].pulse = 1));
      await wait(700);
    } else if (type === 'wait') await wait(args[0]);
  }
}

function renderCaption(step) {
  const last = stepIndex === scenario.steps.length - 1;
  const chips = (step.focus || []).map(
    (id) => `<button class="chip" data-goto="${id}" style="--c:${hex(nodes[id].def.color)}">${CONCEPTS[id].label}</button>`
  ).join('');
  captionEl.innerHTML = `
    <div class="cap-head"><span>${scenario.title}</span><span>Step ${stepIndex + 1} / ${scenario.steps.length}</span></div>
    <div class="progress"><div style="width:${((stepIndex + 1) / scenario.steps.length) * 100}%"></div></div>
    <h3>${step.title}</h3>
    <p>${step.text}</p>
    ${chips ? `<div class="chips">${chips}</div>` : ''}
    <div class="cap-ctrl">
      <button data-cap="exit">Exit</button>
      <span class="spacer"></span>
      <button data-cap="prev" ${stepIndex === 0 ? 'disabled' : ''}>Back</button>
      <button data-cap="replay">Replay</button>
      <button data-cap="next" class="primary">${last ? 'Finish' : 'Next'}</button>
    </div>`;
}

function stepBy(delta) {
  if (!scenario) return;
  const next = stepIndex + delta;
  if (next >= scenario.steps.length) return stopScenario();
  if (next < 0) return;
  stepIndex = next;
  runStep();
}

// ---------- Side panel ----------
const panel = document.getElementById('panel');
const panelContent = document.getElementById('panel-content');

function selectNode(id) {
  const c = CONCEPTS[id];
  const color = hex(nodes[id].def.color);
  panelContent.innerHTML = `
    <div class="kind" style="--c:${color}">${c.kind}</div>
    <h2 style="--c:${color}">${c.name}</h2>
    <p class="tagline">${c.tagline}</p>
    <div class="analogy"><span>Think of it as</span>${c.analogy}</div>
    ${c.question ? `<div class="question"><span>Answers the question</span>"${c.question}"</div>` : ''}
    <h3>What it really is</h3>
    <p>${c.what}</p>
    <h3>Example</h3>
    <div class="example">${c.example}</div>
    ${c.notTo ? `<h3>Don't confuse it with</h3>
      <ul class="confuse">${c.notTo.map(([o, txt]) =>
        `<li><button class="chip" data-goto="${o}" style="--c:${hex(nodes[o].def.color)}">${CONCEPTS[o].label}</button> ${txt}</li>`).join('')}</ul>` : ''}
    <h3>Connected to</h3>
    <div class="chips">${neighbors(id).filter((n) => n !== id).map((n) =>
      `<button class="chip" data-goto="${n}" style="--c:${hex(nodes[n].def.color)}">${CONCEPTS[n].label}</button>`).join('')}</div>`;
  panel.classList.remove('hidden');
  panel.scrollTop = 0;
  nodes[id].pulse = 1;
  if (!scenario) {
    setFocus(neighbors(id));
    focusCameraOn(id);
  }
}

function closePanel() {
  panel.classList.add('hidden');
  if (!scenario) setFocus(null);
}

// ---------- Modal: cheat sheet and quiz ----------
const modal = document.getElementById('modal');
const modalContent = document.getElementById('modal-content');

function openModal(html) {
  modalContent.innerHTML = html;
  modal.classList.remove('hidden');
}
function closeModal() {
  modal.classList.add('hidden');
}

function showIntro() {
  openModal(`
    <h2>How do AI agents actually work?</h2>
    <p class="lead">People mix up <b>prompts, LLMs, agents, skills, RAG, tools and MCP</b>. Here is the whole picture in one analogy:
    imagine hiring a <b>new assistant</b>.</p>
    <div class="intro-grid">
      ${['prompt', 'system', 'llm', 'agent', 'tools', 'mcp', 'skills', 'rag', 'memory'].map((id) => `
        <button class="intro-item" data-goto="${id}" style="--c:${hex(nodes[id].def.color)}">
          <b>${CONCEPTS[id].label}</b><span>${CONCEPTS[id].analogy}</span>
        </button>`).join('')}
    </div>
    <p class="muted">Every object in the 3D scene is one of these. Click any of them, or watch a full run step by step.</p>
    <div class="modal-actions">
      <button data-action="close-modal">Explore on my own</button>
      <button data-action="scenario-chat">Watch a plain chatbot</button>
      <button data-action="scenario-agent" class="primary">Watch an agent work</button>
    </div>`);
}

function showCheatsheet() {
  openModal(`
    <h2>Cheat sheet</h2>
    <p class="muted">The fastest way to tell them apart: look at which question each one answers.</p>
    <div class="table-wrap"><table>
      <thead><tr><th>Concept</th><th>Answers the question</th><th>In one line</th><th>Think of it as</th></tr></thead>
      <tbody>${CHEATSHEET_ORDER.map((id) => {
        const c = CONCEPTS[id];
        return `<tr><td><button class="chip" data-goto="${id}" style="--c:${hex(nodes[id].def.color)}">${c.label}</button></td>
          <td class="q">"${c.question}"</td><td>${c.tagline}</td><td>${c.analogy}</td></tr>`;
      }).join('')}</tbody>
    </table></div>`);
}

let quizIndex = 0;
let quizScore = 0;
let quizAnswered = false;

function startQuiz() {
  quizIndex = 0;
  quizScore = 0;
  renderQuiz();
}

function renderQuiz() {
  quizAnswered = false;
  if (quizIndex >= QUIZ.length) {
    const perfect = quizScore === QUIZ.length;
    openModal(`
      <h2>${perfect ? 'Perfect score!' : 'Quiz complete'}</h2>
      <p class="score">${quizScore} / ${QUIZ.length}</p>
      <p class="muted">${perfect ? 'You can now tell them all apart.' : 'Open the cheat sheet or click the objects in the scene to review, then try again.'}</p>
      <div class="modal-actions"><button data-action="cheatsheet">Cheat sheet</button><button data-quiz="restart" class="primary">Try again</button></div>`);
    return;
  }
  const q = QUIZ[quizIndex];
  openModal(`
    <div class="quiz-progress">Question ${quizIndex + 1} of ${QUIZ.length} &middot; Score ${quizScore}</div>
    <h2>Which one is this?</h2>
    <p class="quiz-q">${q.q}</p>
    <div class="quiz-options">${QUIZ_OPTIONS.map((id) =>
      `<button data-answer="${id}" style="--c:${hex(nodes[id].def.color)}">${CONCEPTS[id].label}</button>`).join('')}</div>
    <div class="quiz-feedback"></div>`);
}

function answerQuiz(id) {
  if (quizAnswered) return;
  quizAnswered = true;
  const q = QUIZ[quizIndex];
  const correct = id === q.a;
  if (correct) quizScore++;
  modalContent.querySelectorAll('[data-answer]').forEach((b) => {
    if (b.dataset.answer === q.a) b.classList.add('correct');
    else if (b.dataset.answer === id) b.classList.add('wrong');
    b.disabled = true;
  });
  nodes[q.a].pulse = 1;
  modalContent.querySelector('.quiz-feedback').innerHTML = `
    <p class="${correct ? 'ok' : 'bad'}">${correct ? 'Correct!' : `Not quite. It's <b>${CONCEPTS[q.a].label}</b>.`}</p>
    <p>${q.why}</p>
    <button data-quiz="next" class="primary">${quizIndex === QUIZ.length - 1 ? 'See result' : 'Next question'}</button>`;
}

// ---------- UI event wiring ----------
document.addEventListener('click', (e) => {
  const t = e.target.closest('button');
  if (!t) return;
  if (t.dataset.goto) {
    closeModal();
    selectNode(t.dataset.goto);
    return;
  }
  if (t.dataset.answer) return answerQuiz(t.dataset.answer);
  if (t.dataset.quiz === 'next') {
    quizIndex++;
    return renderQuiz();
  }
  if (t.dataset.quiz === 'restart') return startQuiz();
  if (t.dataset.cap) {
    ({ exit: stopScenario, prev: () => stepBy(-1), next: () => stepBy(1), replay: runStep })[t.dataset.cap]();
    return;
  }
  switch (t.dataset.action) {
    case 'scenario-chat': return startScenario('chat');
    case 'scenario-agent': return startScenario('agent');
    case 'cheatsheet': return showCheatsheet();
    case 'quiz': return startQuiz();
    case 'intro': return showIntro();
    case 'close-panel': return closePanel();
    case 'close-modal': return closeModal();
    case 'reset':
      stopScenario();
      closePanel();
      return resetView();
  }
});

modal.addEventListener('click', (e) => {
  if (e.target === modal) closeModal();
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    if (!modal.classList.contains('hidden')) closeModal();
    else if (!panel.classList.contains('hidden')) closePanel();
    else if (scenario) stopScenario();
  } else if (scenario && modal.classList.contains('hidden')) {
    if (e.key === 'ArrowRight') stepBy(1);
    if (e.key === 'ArrowLeft') stepBy(-1);
  }
});

// ---------- 3D picking ----------
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
let hovered = null;
let downPos = null;

function pick(e) {
  pointer.set((e.clientX / window.innerWidth) * 2 - 1, -(e.clientY / window.innerHeight) * 2 + 1);
  raycaster.setFromCamera(pointer, camera);
  const hits = raycaster.intersectObjects(pickables, false);
  if (!hits.length) return null;
  const first = hits[0].object.userData.nodeId;
  // The LLM sits inside the agent shell, so prefer it when the ray passes through both.
  if (first === 'agent' && hits.some((h) => h.object.userData.nodeId === 'llm')) return 'llm';
  return first;
}

renderer.domElement.addEventListener('pointerdown', (e) => (downPos = [e.clientX, e.clientY]));
renderer.domElement.addEventListener('pointerup', (e) => {
  if (!downPos) return;
  const moved = Math.hypot(e.clientX - downPos[0], e.clientY - downPos[1]);
  downPos = null;
  if (moved > 5) return;
  const id = pick(e);
  if (id) selectNode(id);
  else if (!panel.classList.contains('hidden')) closePanel();
});
renderer.domElement.addEventListener('pointermove', (e) => {
  hovered = pick(e);
  renderer.domElement.style.cursor = hovered ? 'pointer' : '';
  Object.values(nodes).forEach((n) => n.el.classList.toggle('hover', n.id === hovered));
});

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  labelRenderer.setSize(window.innerWidth, window.innerHeight);
});

// ---------- Animation loop ----------
const clock = new THREE.Clock();
let viewShift = 0;
let viewShiftX = 0;
const ease = (p) => (p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2);

function animate() {
  requestAnimationFrame(animate);
  const dt = Math.min(clock.getDelta(), 0.05);
  const t = clock.elapsedTime;
  const now = performance.now();

  nodes.agent.body.rotation.y += dt * 0.15;
  nodes.agent.body.rotation.x = Math.sin(t * 0.2) * 0.2;
  nodes.tools.body.rotation.z += dt * 0.6;
  nodes.mcp.body.rotation.y += dt * 0.5;
  nodes.system.body.rotation.y += dt * 0.4;
  nodes.memory.body.rotation.y += dt * 0.3;
  nodes.rag.body.rotation.y += dt * 0.3;
  nodes.skills.body.rotation.y = Math.sin(t * 0.5) * 0.5;
  nodes.prompt.body.rotation.y = Math.sin(t * 0.7) * 0.4;
  nodes.slack.body.rotation.y += dt * 0.8;
  nodes.github.body.rotation.y += dt * 0.5;
  nodes.user.body.rotation.y = Math.sin(t * 0.4) * 0.3;

  for (const n of Object.values(nodes)) {
    n.pulse = Math.max(0, n.pulse - dt * 1.2);
    n.hover += ((hovered === n.id ? 1 : 0) - n.hover) * 0.15;
    const breathe = n.id === 'llm' ? Math.sin(t * 2) * 0.05 : 0;
    n.body.scale.setScalar(1 + Math.sin(n.pulse * Math.PI) * 0.35 + n.hover * 0.12 + breathe);
    n.opacity += (n.targetOpacity - n.opacity) * 0.08;
    for (const m of n.mats) m.opacity = m.userData.baseOpacity * n.opacity;
  }
  coreLight.intensity = 30 + nodes.llm.pulse * 80 + Math.sin(t * 2) * 6;

  for (const e of edges) {
    e.opacity += (e.target - e.opacity) * 0.08;
    e.line.material.opacity = e.opacity;
    e.spark.position.copy(e.curve.getPoint((t * 0.2 + e.offset) % 1));
    e.spark.material.opacity = Math.min(1, e.opacity * 1.6);
  }

  for (let i = flights.length - 1; i >= 0; i--) {
    const f = flights[i];
    const p = Math.min(1, (now - f.start) / f.duration);
    f.g.position.copy(f.curve.getPoint(ease(p)));
    if (p >= 1) {
      flights.splice(i, 1);
      nodes[f.to].pulse = 1;
      endFlight(f);
    }
  }

  if (camTween) {
    camTween.t = Math.min(1, camTween.t + dt / 1.1);
    const k = ease(camTween.t);
    camera.position.lerpVectors(camTween.fromCam, camTween.toCam, k);
    controls.target.lerpVectors(camTween.fromT, camTween.toT, k);
    if (camTween.t >= 1) camTween = null;
  }

  // Push the scene away from the bottom caption and the right-side panel.
  const targetShift = scenario ? captionEl.offsetHeight * 0.3 : 0;
  viewShift += (targetShift - viewShift) * 0.1;
  const panelOpen = !panel.classList.contains('hidden') && window.innerWidth > 700;
  viewShiftX += ((panelOpen ? panel.offsetWidth / 2 : 0) - viewShiftX) * 0.1;
  camera.setViewOffset(window.innerWidth, window.innerHeight, viewShiftX, viewShift, window.innerWidth, window.innerHeight);

  controls.update();
  renderer.render(scene, camera);
  labelRenderer.render(scene, camera);
}

animate();
showIntro();
