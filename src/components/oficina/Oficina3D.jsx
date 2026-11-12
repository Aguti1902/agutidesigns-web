// La «Oficina de IA» en 3D: seis agentes en sus mesas alrededor de la pantalla del panel. Se gira arrastrando, se
// acerca con la rueda o pellizcando, y al tocar a un agente se ve qué hace. Los avisos viajan de mesa en mesa hasta el
// panel. Es una ilustración: no muestra datos reales de ningún cliente.
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import './Oficina3D.css';
import { AGENTES } from './agentes';



function etiqueta(texto, color) {
  const c = document.createElement('canvas'); c.width = 512; c.height = 128;
  const g = c.getContext('2d');
  g.font = '600 46px Inter, system-ui, sans-serif';
  const w = Math.min(500, g.measureText(texto).width + 70);
  const x = (512 - w) / 2;
  g.fillStyle = '#ffffff'; g.beginPath(); g.roundRect(x, 24, w, 80, 40); g.fill();
  g.fillStyle = color; g.beginPath(); g.arc(x + 36, 64, 11, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#1d1d1f'; g.textBaseline = 'middle'; g.fillText(texto, x + 58, 66);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, depthTest: false, transparent: true }));
  s.scale.set(3.2, 0.8, 1); s.renderOrder = 10;
  return s;
}

function pantallaPanel() {
  const c = document.createElement('canvas'); c.width = 1024; c.height = 640;
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
  const pintar = (estado) => {
    const g = c.getContext('2d');
    g.fillStyle = '#0b1230'; g.fillRect(0, 0, 1024, 640);
    g.fillStyle = '#ffffff'; g.font = '700 46px Inter, system-ui, sans-serif'; g.fillText('Panel de agentes', 48, 78);
    g.fillStyle = '#3ccf8e'; g.beginPath(); g.arc(905, 64, 10, 0, Math.PI * 2); g.fill();
    g.font = '600 26px Inter, system-ui, sans-serif'; g.fillText('En marcha', 760, 74);
    AGENTES.forEach((a, i) => {
      const y = 130 + i * 82;
      g.fillStyle = 'rgba(255,255,255,0.06)'; g.beginPath(); g.roundRect(40, y, 944, 66, 16); g.fill();
      g.fillStyle = a.color; g.beginPath(); g.arc(78, y + 33, 12, 0, Math.PI * 2); g.fill();
      g.fillStyle = '#ffffff'; g.font = '600 28px Inter, system-ui, sans-serif'; g.fillText(a.nombre, 104, y + 43);
      g.fillStyle = 'rgba(255,255,255,0.65)'; g.font = '400 24px Inter, system-ui, sans-serif'; g.fillText(a.tareas[estado[i]], 340, y + 42);
    });
    t.needsUpdate = true;
  };
  return { textura: t, pintar };
}

export default function Oficina3D({ onSelect, seleccionado }) {
  const ref = useRef(null);
  const selRef = useRef(seleccionado);
  const [fallo, setFallo] = useState(false);
  const [pista, setPista] = useState(true);
  useEffect(() => { selRef.current = seleccionado; }, [seleccionado]);

  useEffect(() => {
    const el = ref.current; if (!el) return;
    let renderer;
    try { renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true }); } catch { setFallo(true); return; }
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    el.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const cam = new THREE.PerspectiveCamera(36, 1, 0.1, 200);
    const DIR = new THREE.Vector3(11, 9.5, 13).normalize(); let tocado = false;
    cam.position.copy(DIR).multiplyScalar(21);
    const controls = new OrbitControls(cam, renderer.domElement);
    controls.target.set(0, 1.2, 0); controls.enableDamping = true; controls.enablePan = false;
    controls.minDistance = 10; controls.maxDistance = 34; controls.minPolarAngle = 0.35; controls.maxPolarAngle = 1.25;
    controls.autoRotate = !reduce; controls.autoRotateSpeed = 0.6;
    controls.addEventListener('start', () => { tocado = true; controls.autoRotate = false; setPista(false); });

    // luz
    scene.add(new THREE.HemisphereLight(0xffffff, 0xdfe3ee, 1.6));
    const sol = new THREE.DirectionalLight(0xffffff, 1.8); sol.position.set(8, 14, 6); sol.castShadow = true;
    sol.shadow.mapSize.set(1024, 1024); Object.assign(sol.shadow.camera, { left: -12, right: 12, top: 12, bottom: -12 }); scene.add(sol);

    const mat = (c, extra = {}) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.75, metalness: 0.02, ...extra });
    const caja = (w, h, d, c, x, y, z, padre = scene) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat(c)); m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; padre.add(m); return m; };

    // suelo y paredes bajas
    const suelo = new THREE.Mesh(new THREE.CylinderGeometry(9, 9, 0.4, 64), mat('#ffffff')); suelo.position.y = -0.2; suelo.receiveShadow = true; scene.add(suelo);
    const anillo = new THREE.Mesh(new THREE.TorusGeometry(9, 0.06, 8, 96), mat('#0047ff', { emissive: '#0047ff', emissiveIntensity: 0.25 })); anillo.rotation.x = Math.PI / 2; anillo.position.y = 0.01; scene.add(anillo);
    const alfombra = new THREE.Mesh(new THREE.CircleGeometry(3.2, 64), mat('#e8eeff')); alfombra.rotation.x = -Math.PI / 2; alfombra.position.y = 0.012; alfombra.receiveShadow = true; scene.add(alfombra);

    // la pantalla del panel, en el centro
    const panel = pantallaPanel();
    const estado = AGENTES.map(() => 0); panel.pintar(estado);
    const tot = new THREE.Group(); scene.add(tot);
    caja(0.3, 2.2, 0.3, '#c9ced9', 0, 1.1, -0.3, tot);
    const marco = caja(4.4, 2.8, 0.18, '#1d1d1f', 0, 3.2, -0.3, tot);
    const pant = new THREE.Mesh(new THREE.PlaneGeometry(4.1, 2.56), new THREE.MeshBasicMaterial({ map: panel.textura, toneMapped: false }));
    pant.position.set(0, 3.2, -0.2); tot.add(pant);
    const pant2 = pant.clone(); pant2.rotation.y = Math.PI; pant2.position.z = -0.4; tot.add(pant2);
    caja(1.6, 0.12, 1.2, '#c9ced9', 0, 0.06, -0.3, tot);

    // mesas y agentes en círculo
    const R = 6, mesas = [], clicables = [];
    AGENTES.forEach((a, i) => {
      const ang = (i / AGENTES.length) * Math.PI * 2 + Math.PI / 6;
      const gr = new THREE.Group(); gr.position.set(Math.sin(ang) * R, 0, Math.cos(ang) * R); gr.lookAt(0, 0, 0); scene.add(gr);
      caja(2.2, 0.08, 1.1, '#f2f2f4', 0, 1.0, 0.45, gr);
      for (const [x, z] of [[-1, 0], [1, 0], [-1, 0.9], [1, 0.9]]) caja(0.06, 1.0, 0.06, '#b9bec9', x, 0.5, z, gr);
      // portátil
      caja(0.9, 0.04, 0.6, '#d5d8df', 0, 1.06, 0.55, gr);
      const scr = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.58, 0.03), mat('#1d1d1f'));
      scr.position.set(0, 1.36, 0.82); scr.rotation.x = -0.25; gr.add(scr);
      const brillo = new THREE.Mesh(new THREE.PlaneGeometry(0.82, 0.5), new THREE.MeshBasicMaterial({ color: a.color, toneMapped: false }));
      brillo.position.set(0, 1.36, 0.80); brillo.rotation.x = -0.25; brillo.rotation.y = Math.PI; gr.add(brillo);
      // silla
      caja(0.7, 0.1, 0.7, '#3a3f4b', 0, 0.55, -0.35, gr); caja(0.7, 0.7, 0.08, '#3a3f4b', 0, 0.95, -0.7, gr);
      // el agente (cuerpo de cápsula, cabeza, ojos)
      const ag = new THREE.Group(); ag.position.set(0, 0.6, -0.35); gr.add(ag);
      const cuerpo = new THREE.Mesh(new THREE.CapsuleGeometry(0.3, 0.45, 6, 16), mat(a.color, { roughness: 0.55 })); cuerpo.position.y = 0.55; cuerpo.castShadow = true; ag.add(cuerpo);
      const cabeza = new THREE.Mesh(new THREE.SphereGeometry(0.27, 24, 16), mat('#ffffff', { roughness: 0.4 })); cabeza.position.y = 1.18; cabeza.castShadow = true; ag.add(cabeza);
      const visor = new THREE.Mesh(new THREE.CapsuleGeometry(0.07, 0.22, 4, 8), mat('#1d1d1f')); visor.rotation.z = Math.PI / 2; visor.position.set(0, 1.2, 0.24); ag.add(visor);
      const ant = new THREE.Mesh(new THREE.SphereGeometry(0.06, 12, 8), mat(a.color, { emissive: a.color, emissiveIntensity: 0.6 })); ant.position.y = 1.55; ag.add(ant);
      caja(0.02, 0.12, 0.02, '#9aa0ad', 0, 1.47, 0, ag);
      // etiqueta
      const et = etiqueta(a.nombre, a.color); et.position.set(0, 3.1, 0.2); gr.add(et);
      // anillo de selección
      const sel = new THREE.Mesh(new THREE.RingGeometry(1.25, 1.42, 48), new THREE.MeshBasicMaterial({ color: a.color, transparent: true, opacity: 0 }));
      sel.rotation.x = -Math.PI / 2; sel.position.set(0, 0.02, 0.2); gr.add(sel);
      // zona clicable
      const hit = new THREE.Mesh(new THREE.BoxGeometry(2.4, 3.2, 2.2), new THREE.MeshBasicMaterial({ visible: false })); hit.position.set(0, 1.5, 0.2); hit.userData.i = i; gr.add(hit); clicables.push(hit);
      mesas.push({ gr, ag, cabeza, ant, brillo, sel, et, fase: i * 1.3 });
    });

    // plantas entre las mesas
    for (let i = 0; i < AGENTES.length; i++) {
      const ang = ((i + 0.5) / AGENTES.length) * Math.PI * 2 + Math.PI / 6;
      const x = Math.sin(ang) * 7.6, z = Math.cos(ang) * 7.6;
      const maceta = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.24, 0.55, 20), mat('#e9e3d8')); maceta.position.set(x, 0.27, z); maceta.castShadow = true; scene.add(maceta);
      for (let k = 0; k < 3; k++) { const h = new THREE.Mesh(new THREE.SphereGeometry(0.38 - k * 0.06, 16, 12), mat(k % 2 ? '#5e9e5a' : '#4c8a4a')); h.position.set(x + (k - 1) * 0.12, 0.85 + k * 0.28, z); h.castShadow = true; scene.add(h); }
    }

    // avisos que viajan de una mesa al panel
    const avisos = [];
    const geoAviso = new THREE.SphereGeometry(0.12, 16, 12);
    function lanzar(i) {
      const m = mesas[i], a = AGENTES[i];
      const p0 = new THREE.Vector3(); m.brillo.getWorldPosition(p0);
      const p2 = new THREE.Vector3(0, 2.6, -0.1); const p1 = p0.clone().lerp(p2, 0.5); p1.y += 2.4;
      const mesh = new THREE.Mesh(geoAviso, new THREE.MeshBasicMaterial({ color: a.color, toneMapped: false }));
      scene.add(mesh); avisos.push({ mesh, curva: new THREE.QuadraticBezierCurve3(p0, p1, p2), t0: performance.now(), i });
    }

    // interacción
    const ray = new THREE.Raycaster(), ptr = new THREE.Vector2();
    let abajo = null;
    const pos = (e) => { const r = renderer.domElement.getBoundingClientRect(); ptr.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1); };
    const tocar = (e) => { pos(e); ray.setFromCamera(ptr, cam); const h = ray.intersectObjects(clicables)[0]; return h ? h.object.userData.i : -1; };
    const onDown = (e) => { abajo = { x: e.clientX, y: e.clientY }; };
    const onUp = (e) => { if (!abajo || Math.hypot(e.clientX - abajo.x, e.clientY - abajo.y) > 6) return; const i = tocar(e); if (i >= 0) { onSelect?.(i); setPista(false); controls.autoRotate = false; } };
    const onMove = (e) => { if (e.pointerType !== 'mouse') return; renderer.domElement.style.cursor = tocar(e) >= 0 ? 'pointer' : 'grab'; };
    renderer.domElement.addEventListener('pointerdown', onDown);
    renderer.domElement.addEventListener('pointerup', onUp);
    renderer.domElement.addEventListener('pointermove', onMove);

    const ajustar = () => { const w = el.clientWidth, h = el.clientHeight; renderer.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix(); if (!tocado) { const d = cam.aspect < 0.9 ? 31 : cam.aspect < 1.3 ? 25 : 21; cam.position.copy(cam.position.clone().sub(controls.target).normalize().multiplyScalar(d).add(controls.target)); } };
    const ro = new ResizeObserver(ajustar); ro.observe(el); ajustar();

    // solo animar cuando se ve
    let visible = true;
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, { threshold: 0.05 }); io.observe(el);

    let raf, ultimoAviso = 0, ultimoPanel = 0;
    const reloj = new THREE.Clock();
    const bucle = () => {
      raf = requestAnimationFrame(bucle);
      if (!visible) return;
      const t = reloj.getElapsedTime(), ahora = performance.now();
      mesas.forEach((m, i) => {
        const s = selRef.current === i;
        m.ag.position.y = 0.6 + (reduce ? 0 : Math.sin(t * 2 + m.fase) * 0.03);
        m.cabeza.rotation.y = reduce ? 0 : Math.sin(t * 0.8 + m.fase) * 0.25;
        m.ant.scale.setScalar(1 + (reduce ? 0 : Math.max(0, Math.sin(t * 4 + m.fase)) * 0.5));
        m.brillo.material.color.set(AGENTES[i].color).multiplyScalar(0.75 + 0.25 * Math.sin(t * 3 + m.fase));
        m.sel.material.opacity += ((s ? 0.9 : 0) - m.sel.material.opacity) * 0.15;
        m.et.scale.setScalar(1); m.et.scale.set(s ? 3.8 : 3.2, s ? 0.95 : 0.8, 1);
      });
      if (!reduce && ahora - ultimoAviso > 1300) { ultimoAviso = ahora; lanzar(Math.floor(Math.random() * AGENTES.length)); }
      for (let k = avisos.length - 1; k >= 0; k--) {
        const a = avisos[k], u = (ahora - a.t0) / 1600;
        if (u >= 1) { scene.remove(a.mesh); a.mesh.material.dispose(); avisos.splice(k, 1); estado[a.i] = (estado[a.i] + 1) % 3; continue; }
        a.mesh.position.copy(a.curva.getPoint(u)); a.mesh.scale.setScalar(1 - 0.4 * u);
      }
      if (ahora - ultimoPanel > 500) { ultimoPanel = ahora; panel.pintar(estado); }
      controls.update();
      renderer.render(scene, cam);
    };
    bucle();

    return () => {
      cancelAnimationFrame(raf); ro.disconnect(); io.disconnect(); controls.dispose();
      renderer.domElement.removeEventListener('pointerdown', onDown);
      renderer.domElement.removeEventListener('pointerup', onUp);
      renderer.domElement.removeEventListener('pointermove', onMove);
      scene.traverse((o) => { o.geometry?.dispose?.(); if (o.material) { (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => { m.map?.dispose?.(); m.dispose(); }); } });
      renderer.dispose(); el.removeChild(renderer.domElement);
    };
  }, [onSelect]);

  if (fallo) return <div className="o3-fallo">Tu navegador no puede mostrar la oficina en 3D. Pide una demo y te la enseñamos en directo.</div>;
  return (
    <div className="o3-lienzo" ref={ref}>
      {pista && <span className="o3-pista" aria-hidden="true">Arrastra para girar · toca un agente</span>}
    </div>
  );
}
