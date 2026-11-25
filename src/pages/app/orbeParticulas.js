// Esfera de partículas para la llamada (misma técnica que la portada de nexgent.io): esfera de Fibonacci
// deformada con ruido, que late con la voz (nivel 0–1) y cambia de color según escucha, piensa o habla.
import * as THREE from 'three';

const NOISE = `
vec3 mod289(vec3 x){return x-floor(x*(1./289.))*289.;}
vec4 mod289(vec4 x){return x-floor(x*(1./289.))*289.;}
vec4 permute(vec4 x){return mod289(((x*34.)+1.)*x);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-.85373472095314*r;}
float snoise(vec3 v){const vec2 C=vec2(1./6.,1./3.);const vec4 D=vec4(0.,.5,1.,2.);
vec3 i=floor(v+dot(v,C.yyy));vec3 x0=v-i+dot(i,C.xxx);vec3 g=step(x0.yzx,x0.xyz);vec3 l=1.-g;
vec3 i1=min(g.xyz,l.zxy);vec3 i2=max(g.xyz,l.zxy);vec3 x1=x0-i1+C.xxx;vec3 x2=x0-i2+C.yyy;vec3 x3=x0-D.yyy;
i=mod289(i);vec4 p=permute(permute(permute(i.z+vec4(0.,i1.z,i2.z,1.))+i.y+vec4(0.,i1.y,i2.y,1.))+i.x+vec4(0.,i1.x,i2.x,1.));
float n_=.142857142857;vec3 ns=n_*D.wyz-D.xzx;vec4 j=p-49.*floor(p*ns.z*ns.z);vec4 x_=floor(j*ns.z);vec4 y_=floor(j-7.*x_);
vec4 x=x_*ns.x+ns.yyyy;vec4 y=y_*ns.x+ns.yyyy;vec4 h=1.-abs(x)-abs(y);vec4 b0=vec4(x.xy,y.xy);vec4 b1=vec4(x.zw,y.zw);
vec4 s0=floor(b0)*2.+1.;vec4 s1=floor(b1)*2.+1.;vec4 sh=-step(h,vec4(0.));vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
vec3 p0=vec3(a0.xy,h.x);vec3 p1=vec3(a0.zw,h.y);vec3 p2=vec3(a1.xy,h.z);vec3 p3=vec3(a1.zw,h.w);
vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;
vec4 m=max(.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.);m=m*m;
return 42.*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));}`;

// Paletas por estado: [claro, medio, profundo]
const PALETAS = {
  escuchando: [[0.72, 0.93, 0.95], [0.37, 0.76, 0.84], [0.23, 0.51, 0.96]],
  pensando: [[0.86, 0.80, 1.0], [0.58, 0.46, 0.98], [0.35, 0.28, 0.85]],
  hablando: [[0.85, 0.97, 1.0], [0.45, 0.82, 0.98], [0.20, 0.55, 1.0]],
  parado: [[0.62, 0.66, 0.74], [0.42, 0.46, 0.55], [0.30, 0.33, 0.42]],
};

function fibSphere(n, r) {
  const a = new Float32Array(n * 3); const g = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < n; i++) { const y = 1 - (i / (n - 1)) * 2; const rad = Math.sqrt(1 - y * y); const t = g * i; a[i * 3] = Math.cos(t) * rad * r; a[i * 3 + 1] = y * r; a[i * 3 + 2] = Math.sin(t) * rad * r; }
  return a;
}

// canvas: <canvas>; leer(): { nivel, fase } en cada fotograma. Devuelve una función para limpiar.
export function montarOrbe(canvas, leer) {
  let renderer;
  try { renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' }); } catch { return () => {}; }
  const pequeno = window.innerWidth < 700; const DPR = Math.min(window.devicePixelRatio || 1, pequeno ? 1.5 : 2);
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  renderer.setPixelRatio(DPR);
  const scene = new THREE.Scene(); const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100); camera.position.set(0, 0, 7.8);
  const grupo = new THREE.Group(); scene.add(grupo);
  const N = pequeno ? 7000 : 16000;
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(fibSphere(N, 1.6), 3));
  const rnd = new Float32Array(N); for (let i = 0; i < N; i++) rnd[i] = Math.random(); geo.setAttribute('aRnd', new THREE.BufferAttribute(rnd, 1));
  const u = { uTime: { value: 0 }, uLevel: { value: 0 }, uPR: { value: DPR }, uC1: { value: new THREE.Vector3(...PALETAS.escuchando[0]) }, uC2: { value: new THREE.Vector3(...PALETAS.escuchando[1]) }, uC3: { value: new THREE.Vector3(...PALETAS.escuchando[2]) }, uAg: { value: 0.25 } };
  const mat = new THREE.ShaderMaterial({
    uniforms: u, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    vertexShader: `${NOISE}
      uniform float uTime,uLevel,uPR,uAg; attribute float aRnd; varying float vN; varying float vA; varying vec3 vP;
      void main(){
        vec3 n=normalize(position); float t=uTime*uAg;
        float d=snoise(n*1.4+vec3(t,t*.7,-t*.5)); float d2=snoise(n*4.0-vec3(t*1.3));
        vN=d;
        vec3 p=position*(1.0+d*(.14+uLevel*.32)+d2*(.03+uLevel*.08));
        p+=n*uLevel*aRnd*.35;
        vP=p; vec4 mv=modelViewMatrix*vec4(p,1.); gl_Position=projectionMatrix*mv;
        gl_PointSize=(1.3+aRnd*1.7+max(d,0.)*2.0+uLevel*1.6)*uPR*(6.0/-mv.z);
        vA=smoothstep(-1.5,1.2,p.z);
      }`,
    fragmentShader: `
      uniform vec3 uC1,uC2,uC3; uniform float uLevel; varying float vN; varying float vA; varying vec3 vP;
      void main(){
        vec2 c=gl_PointCoord-.5; float r=length(c); if(r>.5) discard; float a=smoothstep(.5,.0,r);
        float k=clamp(vP.y*.32+.5+vN*.25,0.,1.);
        vec3 col=mix(mix(uC1,uC2,smoothstep(0.,.5,k)),uC3,smoothstep(.5,1.,k));
        col+=vec3(1.)*max(vN-.35,0.)*(.8+uLevel);
        gl_FragColor=vec4(col,a*vA*(.75+uLevel*.25));
      }`,
  });
  grupo.add(new THREE.Points(geo, mat));
  // brillo interior
  const glow = new THREE.Mesh(new THREE.SphereGeometry(2.05, 48, 48), new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.BackSide, uniforms: { uC: u.uC2, uLevel: u.uLevel },
    vertexShader: 'varying vec3 vN; varying vec3 vV; void main(){ vN=normalize(normalMatrix*normal); vec4 mv=modelViewMatrix*vec4(position,1.); vV=normalize(-mv.xyz); gl_Position=projectionMatrix*mv; }',
    fragmentShader: 'uniform vec3 uC; uniform float uLevel; varying vec3 vN; varying vec3 vV; void main(){ float f=pow(1.-abs(dot(vN,vV)),2.2); gl_FragColor=vec4(uC*f,f*(.22+uLevel*.3)); }',
  }));
  grupo.add(glow);
  // anillos con «mensajes» que viajan
  const anillos = [[2.35, 0.9, 0], [2.7, -0.5, 1.2]].map(([r, tilt, rot], idx) => {
    const M = 360; const pos = new Float32Array(M * 3); const ua = new Float32Array(M);
    for (let i = 0; i < M; i++) { const a = (i / M) * Math.PI * 2; pos[i * 3] = Math.cos(a) * r; pos[i * 3 + 2] = Math.sin(a) * r; ua[i] = i / M; }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('aU', new THREE.BufferAttribute(ua, 1));
    const m = new THREE.ShaderMaterial({ transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      uniforms: { uTime: u.uTime, uPR: u.uPR, uC: u.uC1, uOff: { value: idx * 0.33 }, uSpeed: { value: 0.06 + idx * 0.03 } },
      vertexShader: 'uniform float uTime,uPR,uOff,uSpeed; attribute float aU; varying float vG; void main(){ float h=fract(aU-uTime*uSpeed-uOff); float h2=fract(aU-uTime*uSpeed-uOff-.5); vG=smoothstep(.05,0.,h)+smoothstep(.05,0.,h2); vec4 mv=modelViewMatrix*vec4(position,1.); gl_Position=projectionMatrix*mv; gl_PointSize=(1.1+vG*4.5)*uPR; }',
      fragmentShader: 'uniform vec3 uC; varying float vG; void main(){ vec2 c=gl_PointCoord-.5; if(length(c)>.5) discard; gl_FragColor=vec4(uC,(.14+vG*.85)); }' });
    const p = new THREE.Points(g, m); p.rotation.set(tilt, rot, tilt * 0.4); grupo.add(p); return p;
  });

  function medir() { const w = canvas.clientWidth; const h = canvas.clientHeight; if (!w || !h) return; renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); }
  medir(); const ro = new ResizeObserver(medir); ro.observe(canvas);
  let vivo = true; let nivel = 0; const t0 = performance.now(); const obj = new THREE.Vector3();
  const tic = () => {
    if (!vivo) return;
    const { nivel: n = 0, fase = 'escuchando' } = leer() || {};
    nivel += (Math.min(1, n) - nivel) * 0.18; u.uLevel.value = nivel;
    const pal = PALETAS[fase] || PALETAS.escuchando;
    [u.uC1, u.uC2, u.uC3].forEach((x, i) => { obj.set(...pal[i]); x.value.lerp(obj, 0.06); });
    u.uAg.value += ((fase === 'pensando' ? 0.9 : fase === 'hablando' ? 0.45 : 0.25) - u.uAg.value) * 0.05;
    const t = (performance.now() - t0) / 1000; u.uTime.value = reduce ? 4 : t;
    grupo.rotation.y = t * (fase === 'pensando' ? 0.25 : 0.07); grupo.scale.setScalar(1 + nivel * 0.06);
    anillos.forEach((a, i) => { a.rotation.y += reduce ? 0 : 0.0015 * (i + 1); });
    renderer.render(scene, camera);
    if (!reduce) requestAnimationFrame(tic);
  };
  tic();
  return () => { vivo = false; ro.disconnect(); geo.dispose(); mat.dispose(); renderer.dispose(); };
}
