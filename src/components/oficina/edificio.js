/* Bloque de oficinas: varias oficinas de IA (una por negocio) conectadas a un panel único en el centro.
   Se gira arrastrando y se entra en cada oficina tocándola. Escena ilustrativa. */
import * as THREE from 'three';

THREE.ColorManagement.enabled = false;

function tex(w, h, draw) {
  const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d'); draw(g, w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return { c, g, t };
}
function etiqueta(texto, sub, color) {
  const { t } = tex(1024, 220, (g, w, h) => {
    g.font = '800 64px Inter,Arial'; const tw = Math.max(g.measureText(texto).width, 300); const bw = Math.min(w - 20, tw + 120), x = (w - bw) / 2;
    g.fillStyle = 'rgba(22,24,29,.94)'; g.beginPath(); g.roundRect ? g.roundRect(x, 20, bw, 170, 40) : g.rect(x, 20, bw, 170); g.fill();
    g.strokeStyle = color; g.lineWidth = 6; g.stroke();
    g.fillStyle = '#fff'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(texto, w / 2, 82);
    g.fillStyle = color; g.font = '600 40px Inter,Arial'; g.fillText(sub, w / 2, 146);
  });
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, transparent: true, depthWrite: false, depthTest: false }));
  s.scale.set(7.2, 1.55, 1); s.renderOrder = 10; return s;
}

export function montarEdificio(host, { oficinas, centro, onEntrar, quieto = false }) {
  let renderer;
  try { renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true }); } catch { return null; }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75)); renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.toneMapping = THREE.ACESFilmicToneMapping;
  host.prepend(renderer.domElement); const cv = renderer.domElement; cv.style.touchAction = 'pan-y'; cv.style.cursor = 'grab';
  const scene = new THREE.Scene(); const cam = new THREE.OrthographicCamera(-10, 10, 10, -10, 0.1, 300);
  scene.add(new THREE.HemisphereLight(0xdfe8ff, 0x0a1235, 0.9 * Math.PI));
  const sun = new THREE.DirectionalLight(0xffffff, 1.1 * Math.PI); sun.position.set(14, 26, 12); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, { left: -22, right: 22, top: 22, bottom: -22, near: 1, far: 90 }); sun.shadow.bias = -0.0006; scene.add(sun);
  const M = (c, o = {}) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.7, metalness: 0.05, ...o });
  const box = (w, h, d, m, x, y, z, p = scene, sh = true) => { const k = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); k.position.set(x, y, z); k.castShadow = sh; k.receiveShadow = true; p.add(k); return k; };
  const mDark = M(0x1a2244, { metalness: 0.3, roughness: 0.6 }), mWhite = M(0xf6f8fc, { roughness: 0.4 }), mBlack = M(0x0a0d18), mWall = M(0x16181d, { roughness: 0.9 });
  const mGlass = new THREE.MeshStandardMaterial({ color: 0xb9d0ff, roughness: 0.05, transparent: true, opacity: 0.2, depthWrite: false });

  // base del bloque
  box(42, 0.6, 42, M(0x16181d), 0, -0.31, 0); const suelo = box(41, 0.06, 41, M(0xf4f5f7, { roughness: 0.35 }), 0, 0, 0); suelo.castShadow = false;
  // caminos hacia el centro
  const mCam = M(0xe2e4e9, { roughness: 0.8 });
  box(41, 0.02, 2.2, mCam, 0, 0.04, 0, scene, false); box(2.2, 0.02, 41, mCam, 0, 0.04, 0, scene, false);

  // torre central: panel único
  const torre = new THREE.Group(); scene.add(torre);
  const cyl = new THREE.Mesh(new THREE.CylinderGeometry(3.2, 3.6, 0.5, 48), M(0x16181d, { roughness: 0.45 })); cyl.position.y = 0.25; cyl.receiveShadow = true; torre.add(cyl);
  box(0.4, 3.4, 0.4, mDark, 0, 1.9, 0, torre);
  const pant = tex(1024, 640, () => {}); const drawPant = (tt) => {
    const { g } = pant, w = 1024, h = 640; const gr = g.createLinearGradient(0, 0, w, h); gr.addColorStop(0, '#16181d'); gr.addColorStop(1, '#2a2d35'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    g.fillStyle = '#e5fc63'; g.beginPath(); g.arc(56, 62, 12, 0, 7); g.fill(); g.fillStyle = '#cfd8ff'; g.font = '600 34px Inter,Arial'; g.textBaseline = 'middle'; g.fillText(centro.titulo, 84, 64);
    g.fillStyle = '#fff'; g.font = '800 74px Inter,Arial'; g.fillText(centro.dominio, 50, 160);
    oficinas.forEach((o, i) => { const y = 260 + i * 86; g.fillStyle = '#23262e'; g.fillRect(50, y, w - 100, 70); g.fillStyle = o.color; g.fillRect(50, y, 10, 70);
      g.fillStyle = '#fff'; g.font = '600 32px Inter,Arial'; g.fillText(o.nombre, 84, y + 36);
      const on = Math.sin(tt * 1.3 + i * 1.7) > -0.2; g.fillStyle = on ? '#e5fc63' : '#7aa0ff'; g.font = '600 26px Inter,Arial'; g.textAlign = 'right'; g.fillText(on ? 'Agentes trabajando' : 'En la oficina', w - 76, y + 36); g.textAlign = 'left'; });
    pant.t.needsUpdate = true; };
  drawPant(0);
  box(5.6, 3.6, 0.2, mBlack, 0, 5.2, 0, torre);
  const scr1 = new THREE.Mesh(new THREE.PlaneGeometry(5.3, 3.3), new THREE.MeshBasicMaterial({ map: pant.t })); scr1.position.set(0, 5.2, 0.11); torre.add(scr1);
  const scr2 = scr1.clone(); scr2.position.z = -0.11; scr2.rotation.y = Math.PI; torre.add(scr2);
  const halo = new THREE.Mesh(new THREE.TorusGeometry(3.5, 0.08, 8, 64), new THREE.MeshBasicMaterial({ color: 0xffffff })); halo.rotation.x = Math.PI / 2; halo.position.y = 0.55; torre.add(halo);

  // oficinas
  const pos = [[-10.5, -10.5], [10.5, -10.5], [-10.5, 10.5], [10.5, 10.5]];
  const salas = oficinas.map((o, i) => {
    const [x, z] = pos[i % 4]; const g = new THREE.Group(); g.position.set(x, 0, z); scene.add(g);
    const col = new THREE.Color(o.color);
    const piso = box(14, 0.2, 14, M(col.getHex(), { roughness: 0.9 }), 0, 0.1, 0, g); piso.material.transparent = true; piso.material.opacity = 0.25;
    const borde = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(14, 0.2, 14)), new THREE.LineBasicMaterial({ color: col })); borde.position.y = 0.1; g.add(borde);
    // paredes traseras (según el lado) y cristal delante
    const sx = x < 0 ? -1 : 1, sz = z < 0 ? -1 : 1;
    box(14, 3.2, 0.25, mWall, 0, 1.7, sz * 7, g); box(0.25, 3.2, 14, mWall, sx * 7, 1.7, 0, g);
    box(14, 0.12, 0.05, M(col.getHex()), 0, 0.5, sz * 6.86, g, false);
    const vf = new THREE.Mesh(new THREE.BoxGeometry(14, 2.6, 0.05), mGlass); vf.position.set(0, 1.4, -sz * 7); g.add(vf);
    const vl = new THREE.Mesh(new THREE.BoxGeometry(0.05, 2.6, 14), mGlass); vl.position.set(-sx * 7, 1.4, 0); g.add(vl);
    // rótulo en la pared con el nombre
    const rot = tex(1024, 160, (c, w, h) => { c.fillStyle = '#ffffff'; c.font = '800 70px Inter,Arial'; c.textBaseline = 'middle'; c.fillText(o.corto.toUpperCase(), 10, h / 2); });
    const rp = new THREE.Mesh(new THREE.PlaneGeometry(9, 1.4), new THREE.MeshBasicMaterial({ map: rot.t, transparent: true })); rp.position.set(0, 2.4, sz * 6.86); if (sz > 0) rp.rotation.y = Math.PI; g.add(rp);
    // mesas y agentes
    const gente = [];
    const pieles = [0xf2c9a5, 0xe0ac7e, 0xc68a5a, 0xf6d5bd];
    for (let k = 0; k < 6; k++) {
      const dx = -3.6 + (k % 3) * 3.6, dz = -2 + Math.floor(k / 3) * 4.2;
      const d = new THREE.Group(); d.position.set(dx, 0.2, dz); g.add(d);
      box(2.2, 0.08, 1.1, mWhite, 0, 0.76, 0, d); [[-1, -0.45], [1, -0.45], [-1, 0.45], [1, 0.45]].forEach(([a, b]) => box(0.06, 0.74, 0.06, mDark, a, 0.37, b, d));
      box(0.95, 0.6, 0.05, mBlack, 0, 1.3, -0.35, d);
      const scr = new THREE.Mesh(new THREE.PlaneGeometry(0.88, 0.52), new THREE.MeshBasicMaterial({ color: col.clone().lerp(new THREE.Color(0xffffff), 0.2) })); scr.position.set(0, 1.3, -0.32); d.add(scr);
      const p = new THREE.Group(); p.position.set(0, 0, 0.85); d.add(p);
      const cuerpo = new THREE.Mesh(new THREE.CapsuleGeometry(0.26, 0.5, 6, 12), M(new THREE.Color(o.color).getHex(), { roughness: 0.6 })); cuerpo.position.y = 0.95; cuerpo.castShadow = true; p.add(cuerpo);
      const cab = new THREE.Mesh(new THREE.SphereGeometry(0.22, 16, 12), M(pieles[(k + i) % 4])); cab.position.y = 1.55; cab.castShadow = true; p.add(cab);
      const silla = box(0.6, 0.08, 0.55, mWall, 0, 0.47, 0.05, p); silla.castShadow = true;
      gente.push({ p, cab, cuerpo, fase: Math.random() * 10, scr });
    }
    const plant = new THREE.Mesh(new THREE.IcosahedronGeometry(0.6, 0), M(0x2bbf86)); plant.position.set(-sx * 5.6, 1.0, -sz * 5.6); plant.castShadow = true; g.add(plant);
    box(0.6, 0.6, 0.6, mWhite, -sx * 5.6, 0.5, -sz * 5.6, g);
    const lab = etiqueta(o.nombre, o.tipo, o.color); lab.position.set(0, 5.4, 0); g.add(lab);
    const anillo = new THREE.Mesh(new THREE.RingGeometry(7.4, 7.9, 64), new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0 })); anillo.rotation.x = -Math.PI / 2; anillo.position.y = 0.08; g.add(anillo);
    const hit = new THREE.Mesh(new THREE.BoxGeometry(14, 6, 14), new THREE.MeshBasicMaterial({ visible: false })); hit.position.y = 3; g.add(hit); hit.userData.i = i;
    // camino de luz hasta el centro
    const curva = new THREE.QuadraticBezierCurve3(new THREE.Vector3(x * 0.55, 0.3, z * 0.55), new THREE.Vector3(x * 0.3, 2.6, z * 0.3), new THREE.Vector3(0, 1.2, 0));
    const linea = new THREE.Mesh(new THREE.TubeGeometry(curva, 40, 0.05, 6), new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.55 })); scene.add(linea);
    const bolas = [0, 1, 2].map(() => { const b = new THREE.Mesh(new THREE.SphereGeometry(0.17, 12, 8), new THREE.MeshBasicMaterial({ color: col })); scene.add(b); return b; });
    return { g, gente, anillo, hit, curva, bolas, lab, hover: 0 };
  });

  // interacción
  const ray = new THREE.Raycaster(), ptr = new THREE.Vector2();
  let az = Math.PI / 4, el = 0.72, uaz = 0, drag = null, hov = -1, pausa = 0, zoom = 1;
  const pick = (e) => { const r = cv.getBoundingClientRect(); ptr.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1); ray.setFromCamera(ptr, cam); const h = ray.intersectObjects(salas.map((s) => s.hit), false); return h.length ? h[0].object.userData.i : -1; };
  cv.addEventListener('pointerdown', (e) => { drag = { x: e.clientX, y: e.clientY, uaz, el, moved: false }; cv.setPointerCapture(e.pointerId); });
  cv.addEventListener('pointermove', (e) => {
    if (drag) { const dx = e.clientX - drag.x, dy = e.clientY - drag.y; if (Math.abs(dx) + Math.abs(dy) > 5) { drag.moved = true; cv.style.cursor = 'grabbing'; } uaz = drag.uaz - dx * 0.008; el = Math.max(0.4, Math.min(1.2, drag.el + dy * 0.004)); pausa = 10; return; }
    hov = pick(e); cv.style.cursor = hov >= 0 ? 'pointer' : 'grab';
  });
  cv.addEventListener('pointerup', (e) => { if (drag && !drag.moved) { const i = pick(e); if (i >= 0) onEntrar?.(i); } drag = null; cv.style.cursor = 'grab'; });
  cv.addEventListener('pointerleave', () => { hov = -1; });

  let aspect = 1.6;
  const size = () => { const w = host.clientWidth, h = host.clientHeight; renderer.setSize(w, h, false); aspect = w / Math.max(1, h); };
  const ro = new ResizeObserver(size); ro.observe(host); size();
  let visible = true; const io = new IntersectionObserver(([en]) => { visible = en.isIntersecting; }); io.observe(host);
  const clock = new THREE.Clock(); let raf = 0, t2 = 0, lastPant = -1;
  const loop = () => {
    raf = requestAnimationFrame(loop);
    if (!visible || document.hidden) { clock.getDelta(); return; }
    const dt = Math.min(0.05, clock.getDelta()), t = clock.elapsedTime;
    if (pausa > 0) pausa -= dt; else if (!quieto) t2 += dt;
    salas.forEach((s, i) => {
      s.gente.forEach((p) => { const ph = t + p.fase; p.cab.rotation.x = 0.15 + Math.sin(ph * 2) * 0.05; p.cuerpo.rotation.z = Math.sin(ph * 1.3) * 0.04; p.cab.position.y = 1.55 + Math.abs(Math.sin(ph * 6)) * 0.02; });
      const target = hov === i ? 1 : 0; s.hover += (target - s.hover) * Math.min(1, dt * 8);
      s.g.position.y = s.hover * 0.5; s.anillo.material.opacity = s.hover * 0.9; s.lab.scale.set(7.2 * (1 + s.hover * 0.12), 1.55 * (1 + s.hover * 0.12), 1);
      s.bolas.forEach((b, k) => { const u = ((t * 0.35 + k / 3 + i * 0.13) % 1); b.position.copy(s.curva.getPoint(u)); });
    });
    halo.rotation.z = t * 0.4; halo.scale.setScalar(1 + Math.sin(t * 2) * 0.03);
    if (Math.floor(t) !== lastPant) { lastPant = Math.floor(t); drawPant(t); }
    const zb = (aspect < 1 ? 24 : aspect < 1.4 ? 18.5 : Math.max(14.5, 26 / aspect)) * zoom;
    cam.left = -zb * aspect; cam.right = zb * aspect; cam.top = zb; cam.bottom = -zb; cam.updateProjectionMatrix();
    const a = az + Math.sin(t2 * 0.12) * 0.5 + uaz, R = 80;
    cam.position.set(R * Math.cos(el) * Math.sin(a), R * Math.sin(el), R * Math.cos(el) * Math.cos(a)); cam.lookAt(0, 1.5, 0);
    renderer.render(scene, cam);
  };
  loop();
  const off = () => { cancelAnimationFrame(raf); ro.disconnect(); io.disconnect();
    scene.traverse((o) => { o.geometry?.dispose(); const m = o.material; if (m) (Array.isArray(m) ? m : [m]).forEach((x) => { x.map?.dispose(); x.dispose(); }); });
    renderer.dispose(); cv.remove(); };
  off.zoom = (k) => { zoom = Math.max(0.55, Math.min(1.5, zoom * (k < 0 ? 0.85 : 1.18))); pausa = 10; };
  return off;
}
