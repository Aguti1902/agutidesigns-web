/* Oficina 3D de Agutidesigns: la misma escena que el panel interno, en modo
   escaparate (sin interacción, cámara automática y actividad simulada). */
import * as THREE from 'three';

THREE.ColorManagement.enabled = false; // mismos colores que el panel (three r128)

const AGENTS=[{id:'ceo',nick:'GUTI',face:{bg:'#0b1433',hair:'#2a1d14',style:0,acc:''}},{id:'prospector',nick:'Bruno',face:{bg:'#2f6bff',hair:'#3b2a1a',style:0,acc:'gafas'}},{id:'demos',nick:'Lía',face:{bg:'#ff8f7e',hair:'#2b1d3a',style:1,acc:''}},{id:'redactor',nick:'Hugo',face:{bg:'#9db8ff',hair:'#1f2b3d',style:2,acc:'boli'}},{id:'seguimiento',nick:'Vera',face:{bg:'#3ee0a1',hair:'#432818',style:3,acc:'cascos'}},{id:'recontacto',nick:'Teo',face:{bg:'#b48cff',hair:'#111',style:0,acc:''}},{id:'finanzas',nick:'Max',face:{bg:'#6ee7b7',hair:'#5a3a22',style:1,acc:'gafas'}},{id:'cartera',nick:'Oriol',face:{bg:'#E5FC63',hair:'#2a2a2a',style:2,acc:''}},{id:'semanal',nick:'Iris',face:{bg:'#f4a7c0',hair:'#7a4b2a',style:3,acc:''}},{id:'resumen',nick:'Clara',face:{bg:'#b9d7f7',hair:'#2a1d14',style:1,acc:''}},{id:'webleads',nick:'Nora',face:{bg:'#f7d6b9',hair:'#5a3b22',style:2,acc:''}},{id:'pipeline',nick:'Sara',face:{bg:'#e8c9f7',hair:'#3b2416',style:2,acc:''}},{id:'contenido',nick:'Marta',face:{bg:'#ffd6c2',hair:'#6b3a1f',style:2,acc:''}},{id:'publicador',nick:'Pablo',face:{bg:'#cfe3ff',hair:'#1d1d1d',style:1,acc:''}},{id:'analista',nick:'Leo',face:{bg:'#d9f2c9',hair:'#2a1d14',style:1,acc:''}},{id:'ads',nick:'Álex',face:{bg:'#ffb3a7',hair:'#3b2416',style:2,acc:'gafas'}},{id:'cs',nick:'Elena',face:{bg:'#3ee0a1',hair:'#5a3a22',style:1,acc:''}},{id:'produccion',nick:'Diego',face:{bg:'#9be7c4',hair:'#1d1d1d',style:0,acc:'cascos'}},{id:'seo',nick:'Rafa',face:{bg:'#c9f2d9',hair:'#1d1d1d',style:1,acc:''}}];
const DEPTS=[
 {id:'direccion',name:'Dirección',color:'#e5fc63',hex:0xe5fc63},
 {id:'ventas',name:'Ventas',color:'#5b86ff',hex:0x2f6bff},
 {id:'marketing',name:'Marketing',color:'#ff7a68',hex:0xff6b5a},
 {id:'clientes',name:'Clientes y producción',color:'#3ee0a1',hex:0x3ee0a1},
 {id:'finanzas',name:'Finanzas',color:'#ffc65c',hex:0xffc65c}];
const DEPT_OF={ceo:'direccion',resumen:'direccion',semanal:'direccion',analista:'direccion',prospector:'ventas',demos:'ventas',redactor:'ventas',seguimiento:'ventas',recontacto:'ventas',webleads:'ventas',pipeline:'ventas',contenido:'marketing',seo:'marketing',publicador:'marketing',ads:'marketing',cs:'clientes',produccion:'clientes',finanzas:'finanzas',cartera:'finanzas'};
const HEADS={direccion:'ceo',ventas:'pipeline',marketing:'contenido',clientes:'cs',finanzas:'finanzas'};

let OF={};
const MARCA_BASE={placa:'GUTI · CEO',ceo:'GUTI',logo:'/logoazul.png',lema:'SIN PLANTILLAS · SOLO RESULTADOS',pantalla:'AGUTIDESIGNS · EN DIRECTO',pizarra:['Plan del día','+ respuestas = + clientes'],nombres:{},deptos:{},charla:null};
let MARCA=MARCA_BASE;

/* Actividad simulada: cada agente entra y sale de su turno en ciclos propios */
const SIM={};
AGENTS.forEach((a,i)=>{ SIM[a.id]={per:38+((i*17)%29),duty:a.id==='ceo'?0.22:0.42,off:(i*7.3)%40}; });
function simT(){ return OF.clock?OF.clock.elapsedTime:0; }
function agentWorking(a){ const s=SIM[a.id]; if(!s) return false; return ((simT()+s.off)%s.per)/s.per<s.duty; }
function agentStale(){ return false; }
function inSched(){ return false; }
function madridNow(){ const s=new Date().toLocaleString('en-US',{timeZone:'Europe/Madrid'}); return new Date(s); }

function makeCanvasTex(w,h,draw){ const c=document.createElement('canvas'); c.width=w; c.height=h; const g=c.getContext('2d'); draw&&draw(g,w,h); const t=new THREE.CanvasTexture(c); t.colorSpace=THREE.SRGBColorSpace; t.anisotropy=4; return {c,g,t}; }
/* rejilla para caminar sin atravesar muebles */
const GRID={x0:-16,z0:-11,cs:0.5,w:64,h:44};
function gIdx(x,z){ const i=Math.floor((x-GRID.x0)/GRID.cs), j=Math.floor((z-GRID.z0)/GRID.cs); return (i<0||j<0||i>=GRID.w||j>=GRID.h)?-1:j*GRID.w+i; }
function gBlock(x0,z0,x1,z1,pad=0.12){ for(let x=Math.min(x0,x1)-pad;x<=Math.max(x0,x1)+pad;x+=GRID.cs/2) for(let z=Math.min(z0,z1)-pad;z<=Math.max(z0,z1)+pad;z+=GRID.cs/2){ const k=gIdx(x,z); if(k>=0) OF.block[k]=1; } }
function gFree(x,z){ const k=gIdx(x,z); return k>=0&&!OF.block[k]; }
function gCenter(k){ return {x:GRID.x0+(k%GRID.w+0.5)*GRID.cs, z:GRID.z0+(Math.floor(k/GRID.w)+0.5)*GRID.cs}; }
function nearestFree(x,z){ let k=gIdx(x,z); if(k>=0&&!OF.block[k]) return k; for(let r=1;r<8;r++) for(let dx=-r;dx<=r;dx++) for(let dz=-r;dz<=r;dz++){ const q=gIdx(x+dx*GRID.cs,z+dz*GRID.cs); if(q>=0&&!OF.block[q]) return q; } return k; }
function astar(a,b){
  const W=GRID.w, N=W*GRID.h, g=new Float32Array(N).fill(1e9), from=new Int32Array(N).fill(-1), closed=new Uint8Array(N), heap=[];
  const hx=k=>{ const dx=Math.abs(k%W-b%W), dz=Math.abs(Math.floor(k/W)-Math.floor(b/W)); return Math.max(dx,dz)+0.414*Math.min(dx,dz); };
  const push=(k,f)=>{ heap.push([f,k]); let i=heap.length-1; while(i>0){ const p=(i-1)>>1; if(heap[p][0]<=heap[i][0]) break; [heap[p],heap[i]]=[heap[i],heap[p]]; i=p; } };
  const pop=()=>{ const top=heap[0], last=heap.pop(); if(heap.length){ heap[0]=last; let i=0; for(;;){ const l=2*i+1, r=l+1; let m=i; if(l<heap.length&&heap[l][0]<heap[m][0]) m=l; if(r<heap.length&&heap[r][0]<heap[m][0]) m=r; if(m===i) break; [heap[m],heap[i]]=[heap[i],heap[m]]; i=m; } } return top; };
  g[a]=0; push(hx(a),a); let it=0;
  while(heap.length&&it++<6000){ const [,k]=pop(); if(k===b) break; if(closed[k]) continue; closed[k]=1; const x=k%W, z=Math.floor(k/W);
    for(let dx=-1;dx<=1;dx++) for(let dz=-1;dz<=1;dz++){ if(!dx&&!dz) continue; const nx=x+dx, nz=z+dz; if(nx<0||nz<0||nx>=W||nz>=GRID.h) continue; const n=nz*W+nx;
      if(OF.block[n]&&n!==b) continue; if(dx&&dz&&(OF.block[z*W+nx]||OF.block[nz*W+x])) continue;
      const ng=g[k]+(dx&&dz?1.414:1); if(ng<g[n]){ g[n]=ng; from[n]=k; push(ng+hx(n),n); } } }
  if(from[b]<0&&a!==b) return null; const out=[]; for(let k=b;k!==-1&&k!==a;k=from[k]) out.push(gCenter(k)); return out.reverse(); }
function sight(p,q){ const d=Math.hypot(q.x-p.x,q.z-p.z), n=Math.ceil(d/0.2); for(let i=1;i<n;i++){ const t=i/n; if(!gFree(p.x+(q.x-p.x)*t,p.z+(q.z-p.z)*t)) return false; } return true; }
function routeTo(p,dst){
  const pos={x:p.g.position.x,z:p.g.position.z}; const a=nearestFree(pos.x,pos.z), b=nearestFree(dst.x,dst.z);
  let pts=astar(a,b)||[]; pts.push({x:dst.x,z:dst.z});
  const sm=[]; let cur=pos, i=0; while(i<pts.length){ let j=pts.length-1; while(j>i&&!sight(cur,pts[j])) j--; sm.push(pts[j]); cur=pts[j]; i=j+1; }
  p.path=sm; p.dest=dst; p.mode='walk'; standPose(p); p.cup.visible=false;
}

/* ---------- Oficinas con estructura propia (casos de éxito) ---------- */
function pantallas(){
  OF.offMat=new THREE.MeshBasicMaterial({color:0x05070f});
  OF.workTex=makeCanvasTex(256,160); const ini=MARCA.inicial||'a', ac=MARCA.acentoCss||'#e5fc63';
  OF.idleTex=makeCanvasTex(256,160,(g,w,h)=>{ const gr=g.createLinearGradient(0,0,w,h); gr.addColorStop(0,MARCA.pantallaA||'#071034'); gr.addColorStop(1,MARCA.pantallaB||'#0b2a8a'); g.fillStyle=gr; g.fillRect(0,0,w,h); g.fillStyle='#ffffff'; g.font='800 64px Archivo,Inter,Arial'; g.textAlign='center'; g.textBaseline='middle'; g.fillText(ini,w/2,h/2+2); g.fillStyle=ac; g.fillRect(w/2+26,h/2+18,10,10); });
  OF.workMat=new THREE.MeshBasicMaterial({map:OF.workTex.t}); OF.idleMat=new THREE.MeshBasicMaterial({map:OF.idleTex.t});
  OF.code=Array.from({length:22},()=>({w:20+Math.random()*150,i:Math.floor(Math.random()*4),c:(MARCA.codigo||['#7aa0ff','#e5fc63','#3ee0a1','#ffffff','#ff8f7e'])[Math.floor(Math.random()*5)]}));
}
function mesaRot(H,id,x,z,a,{ancho=2.1,mat,silla,pata,big=false}={}){
  const {box,cyl,scene}=H; const g=new THREE.Group(); g.position.set(x,0,z); g.rotation.y=a; scene.add(g);
  box(ancho,0.07,1.1,mat,0,0.76,0,g); [[-ancho/2+0.08,-.48],[ancho/2-0.08,-.48],[-ancho/2+0.08,.48],[ancho/2-0.08,.48]].forEach(([p,q])=>box(0.06,0.74,0.06,pata,p,0.37,q,g));
  cyl(0.03,0.03,0.28,pata,0,0.93,-0.3,g); box(0.32,0.03,0.2,pata,0,0.8,-0.3,g); box(1.0,0.6,0.05,H.mats.mBlack,0,1.32,-0.33,g);
  const s=new THREE.Mesh(new THREE.PlaneGeometry(0.92,0.52),OF.offMat); s.position.set(0,1.32,-0.302); g.add(s);
  box(0.62,0.025,0.2,pata,0,0.8,0.12,g,false);
  if(Math.random()<0.35){ cyl(0.09,0.07,0.16,H.mats.mWhite,ancho/2-0.25,0.88,-0.25,g,10); const pl=new THREE.Mesh(new THREE.IcosahedronGeometry(0.17,0),H.verde||H.mats.mGreen); pl.position.set(ancho/2-0.25,1.07,-0.25); pl.castShadow=true; g.add(pl); }
  const ch=new THREE.Group(); ch.position.set(0,0,0.95); g.add(ch);
  box(0.62,0.08,0.58,silla,0,0.47,0,ch); box(0.62,0.62,0.07,silla,0,0.85,0.3,ch); cyl(0.035,0.035,0.4,pata,0,0.25,0,ch,8); cyl(0.28,0.28,0.04,pata,0,0.04,0,ch,10);
  const ca=Math.cos(a), sa=Math.sin(a);
  for(let t=-ancho/2;t<=ancho/2+0.01;t+=0.25) for(const d of [-0.5,0,0.5]){ const px=x+ca*t+sa*d, pz=z-sa*t+ca*d; gBlock(px-0.1,pz-0.1,px+0.1,pz+0.1,0.05); }
  OF.desks[id]={x,z,screen:s,seat:{x:x+sa*0.82,z:z+ca*0.82,ry:a+Math.PI}};
}
function etiquetaSuelo(H,texto,color,x,z,w,ry=0){
  const lab=makeCanvasTex(1024,128,(g,ww,h)=>{ g.fillStyle=color; g.font='800 84px Archivo,Inter,Arial'; g.textBaseline='middle'; g.fillText(texto.toUpperCase(),6,h/2+4); });
  const pl=new THREE.Mesh(new THREE.PlaneGeometry(w,w/8),new THREE.MeshBasicMaterial({map:lab.t,transparent:true,depthWrite:false}));
  pl.rotation.x=-Math.PI/2; pl.rotation.z=ry; pl.position.set(x,0.05,z); H.scene.add(pl);
}
function logoPared(H,x,y,z,ry,ancho,color){
  const img=new Image(); img.onload=()=>{ const r=img.naturalHeight/img.naturalWidth; const {t}=makeCanvasTex(1024,Math.round(1024*r),(g,w,h)=>{ g.drawImage(img,0,0,w,h); g.globalCompositeOperation='source-in'; g.fillStyle=color; g.fillRect(0,0,w,h); });
    const p=new THREE.Mesh(new THREE.PlaneGeometry(ancho,ancho*r),new THREE.MeshBasicMaterial({map:t,transparent:true})); p.position.set(x,y,z); p.rotation.y=ry; H.scene.add(p); }; img.src=MARCA.logo;
}
function textoPared(H,texto,color,x,y,z,ry,ancho,font='600 34px "JetBrains Mono",monospace'){
  const tt=makeCanvasTex(1024,64,(g,w,h)=>{ g.fillStyle=color; g.font=font; g.textBaseline='middle'; g.fillText(texto,8,h/2); });
  const m=new THREE.Mesh(new THREE.PlaneGeometry(ancho,ancho/16),new THREE.MeshBasicMaterial({map:tt.t,transparent:true})); m.position.set(x,y,z); m.rotation.y=ry; H.scene.add(m);
}
function pantallaPared(H,x,y,z,ry){
  OF.wall=makeCanvasTex(1024,560); const g=new THREE.Group(); g.position.set(x,y,z); g.rotation.y=ry; H.scene.add(g);
  H.box(6.3,3.5,0.12,H.mats.mBlack,0,0,0,g); const scr=new THREE.Mesh(new THREE.PlaneGeometry(6.05,3.3),new THREE.MeshBasicMaterial({map:OF.wall.t})); scr.position.z=0.07; g.add(scr);
}
function planta(H,x,z,s,mMaceta,mHoja,mHoja2){
  H.cyl(0.24*s,0.18*s,0.5*s,mMaceta,x,0.25*s,z,H.scene,12); const f=new THREE.Mesh(new THREE.IcosahedronGeometry(0.5*s,0),mHoja); f.position.set(x,0.85*s,z); f.castShadow=true; H.scene.add(f);
  const f2=new THREE.Mesh(new THREE.IcosahedronGeometry(0.36*s,0),mHoja2); f2.position.set(x+0.15*s,1.25*s,z-0.05); f2.castShadow=true; H.scene.add(f2); gBlock(x-0.3*s,z-0.3*s,x+0.3*s,z+0.3*s,0.02);
}
function silla(H,x,z,ry,mat){ const c=new THREE.Group(); c.position.set(x,0,z); c.rotation.y=ry; H.scene.add(c); H.box(0.55,0.08,0.52,mat,0,0.47,0,c); H.box(0.55,0.55,0.07,mat,0,0.8,-0.27,c); H.cyl(0.035,0.035,0.4,H.mats.mDark,0,0.25,0,c,8); }
function bordesGrid(){ gBlock(-16.5,-11.6,16.5,-10.75,0); gBlock(-16.6,-11.5,-15.75,11.5,0); gBlock(-16.5,10.8,16.5,11.6,0); gBlock(15.8,-11.5,16.6,11.5,0); }
const DEP_ORDEN=['webleads','pipeline','prospector','demos','redactor','seguimiento','recontacto','contenido','seo','publicador','ads','cs','produccion','finanzas','cartera','resumen','semanal','analista'];

/* Spa Organic: estudio orgánico con jardín central, mesas en óvalo, madera y verde salvia */
function construirSpa(H){
  const {scene,M,box,cyl}=H; OF.desks={}; OF.windows=[]; OF.zones={};
  pantallas();
  const mMadera=M(0xc39a6b,{roughness:.6}), mMadera2=M(0x8f6a43,{roughness:.6}), mCarbon=M(0x2b2f2a,{roughness:.85}), mSalvia=M(0x8a9a77,{roughness:.9}), mCrema=M(0xf1ece2,{roughness:.9}),
    mOliva=M(0x5f6b48,{roughness:.6}), mTerra=M(0xc7865b,{roughness:.6}), mArena=M(0xe3d3b5,{roughness:.8}), mHoja=M(0x5f8a52,{roughness:.8}), mHoja2=M(0x3f6b3a,{roughness:.8}), mTronco=M(0x7a5a3a,{roughness:.9}), mPata=M(0x3a3528,{roughness:.6,metalness:.2});
  H.verde=mHoja;
  box(32.4,0.5,22.4,mCarbon,0,-0.27,0); const fl=box(32,0.06,22,mMadera,0,0,0); fl.castShadow=false;
  for(let z=-10.5;z<=10.5;z+=1.5) box(32,0.005,0.03,mMadera2,0,0.035,z,scene,false);
  box(32.4,5,0.3,mCrema,0,2.5,-11.2); box(0.3,5,22.4,mSalvia,-16.2,2.5,0);
  box(12,5,0.1,mCarbon,0,2.5,-11.0,scene,false);
  bordesGrid();
  for(const z of [-6.5,-1.5,3.5,8.5]){ const w=new THREE.Mesh(new THREE.PlaneGeometry(3.2,3.4),new THREE.MeshBasicMaterial({color:0xcfe0c4})); w.position.set(-16.03,2.4,z); w.rotation.y=Math.PI/2; scene.add(w); OF.windows.push(w);
    const arco=new THREE.Mesh(new THREE.CircleGeometry(1.6,24,0,Math.PI),new THREE.MeshBasicMaterial({color:0xcfe0c4})); arco.position.set(-16.03,4.1,z); arco.rotation.y=Math.PI/2; scene.add(arco); OF.windows.push(arco); }
  // jardín central con árbol
  cyl(3.0,3.2,0.55,mArena,0,0.28,0,scene,48); cyl(2.75,2.75,0.06,M(0x6f8a4f,{roughness:1}),0,0.58,0,scene,48);
  cyl(0.28,0.4,3.2,mTronco,0,2.1,0,scene,12);
  [[0,4.2,0,1.6],[0.9,3.7,0.5,1.1],[-0.8,3.8,-0.4,1.2],[0.2,4.9,-0.3,1.0]].forEach(([x,y,z,r],i)=>{ const c=new THREE.Mesh(new THREE.IcosahedronGeometry(r,1),i%2?mHoja2:mHoja); c.position.set(x,y,z); c.castShadow=true; scene.add(c); });
  for(let i=0;i<10;i++){ const a=i/10*Math.PI*2; const r=new THREE.Mesh(new THREE.IcosahedronGeometry(0.28,0),i%2?mHoja:mHoja2); r.position.set(Math.cos(a)*2.2,0.75,Math.sin(a)*2.2); scene.add(r); }
  for(let k=0;k<40;k++){ const a=k/40*Math.PI*2; gBlock(Math.cos(a)*3.1-0.1,Math.sin(a)*3.1-0.1,Math.cos(a)*3.1+0.1,Math.sin(a)*3.1+0.1,0.15); }
  gBlock(-2.6,-2.6,2.6,2.6,0);
  // lámparas colgantes
  for(const [x,z] of [[-5,-4],[5,-4],[-5,4],[5,4]]){ cyl(0.01,0.01,2.4,mPata,x,5.0,z,scene,4); const l=new THREE.Mesh(new THREE.SphereGeometry(0.35,16,8,0,Math.PI*2,0,Math.PI/2),mArena); l.rotation.x=Math.PI; l.position.set(x,3.8,z); scene.add(l); }
  // mesas en óvalo alrededor del jardín
  const colorDe={ventas:mOliva,marketing:mTerra,clientes:mSalvia,finanzas:mArena,direccion:mCarbon};
  const rx=8.4, rz=6.7, ini=-250*Math.PI/180, fin=70*Math.PI/180;
  DEP_ORDEN.forEach((id,i)=>{ const t=ini+(fin-ini)*(i/(DEP_ORDEN.length-1)); const x=rx*Math.cos(t), z=rz*Math.sin(t); const a=Math.atan2(x,z);
    mesaRot(H,id,x,z,a,{ancho:1.9,mat:mMadera2,silla:colorDe[DEPT_OF[id]]||mOliva,pata:mPata}); });
  // etiquetas de zona en el suelo, por dentro del óvalo
  const zonaA=(ids)=>{ const idx=ids.map(id=>DEP_ORDEN.indexOf(id)); const m=(Math.min(...idx)+Math.max(...idx))/2; return ini+(fin-ini)*(m/(DEP_ORDEN.length-1)); };
  [['ventas',['webleads','recontacto']],['marketing',['contenido','ads']],['clientes',['cs','produccion']],['finanzas',['finanzas','cartera']],['direccion',['resumen','analista']]].forEach(([d,ids])=>{ const t=zonaA(ids); const dep=DEPTS.find(x=>x.id===d);
    etiquetaSuelo(H,MARCA.deptos[d]||dep.name,'#'+(colorDe[d].color.getHexString()),Math.cos(t)*5.4,Math.sin(t)*4.3,3.4,0); });
  // dirección: mesa grande junto al logo
  mesaRot(H,'ceo',0,-8.6,0,{ancho:3,mat:mMadera2,silla:mCarbon,pata:mPata});
  logoPared(H,0,3.6,-10.94,0,7.5,'#ffffff');
  textoPared(H,MARCA.lema,'#e3d3b5',0,2.3,-10.94,0,7.5);
  const placa=makeCanvasTex(512,96,(g,w,h)=>{ g.fillStyle='#e3d3b5'; g.font='800 54px Archivo,Inter,Arial'; g.textBaseline='middle'; g.fillText(MARCA.placa,8,h/2+3); });
  // pantalla en la pared del fondo
  pantallaPared(H,10.6,2.7,-10.95,0);
  // barra de té (café) a la derecha
  box(0.8,0.95,5.2,mMadera2,15.4,0.48,-1.5); box(0.85,0.06,5.2,mCarbon,15.4,0.97,-1.5); cyl(0.12,0.12,0.3,mArena,15.3,1.15,-2.6,scene,10); cyl(0.12,0.12,0.3,mTerra,15.3,1.15,-0.4,scene,10); gBlock(14.9,-4.2,15.9,1.2);
  box(0.5,1.0,0.5,mCrema,13.6,0.5,-9.8); cyl(0.2,0.2,0.5,M(0x9cc4ff,{transparent:true,opacity:.5}),13.6,1.25,-9.8); gBlock(13.3,-10.1,13.9,-9.5);
  // rincón de descanso: cojines y alfombra redonda
  const alf=new THREE.Mesh(new THREE.CircleGeometry(2.6,40),new THREE.MeshStandardMaterial({color:0xc7a77a,roughness:.95})); alf.rotation.x=-Math.PI/2; alf.position.set(12.2,0.04,7.6); alf.receiveShadow=true; scene.add(alf);
  const sofa=new THREE.Group(); sofa.position.set(12.2,0,10.0); sofa.rotation.y=Math.PI; scene.add(sofa);
  box(3.6,0.4,0.95,mSalvia,0,0.28,0,sofa); box(3.6,0.55,0.25,mSalvia,0,0.65,-0.42,sofa); [-1.1,0,1.1].forEach(dx=>box(1.0,0.14,0.75,mCrema,dx,0.54,0.06,sofa)); gBlock(10.3,9.4,14.1,10.6);
  [[9.7,7.4],[14.7,7.4]].forEach(([x,z])=>{ const c=cyl(0.55,0.6,0.42,mTerra,x,0.21,z,scene,20); gBlock(x-0.5,z-0.5,x+0.5,z+0.5,0.02); });
  cyl(0.5,0.5,0.06,mMadera2,12.2,0.4,7.6); cyl(0.05,0.05,0.36,mPata,12.2,0.2,7.6,scene,8); gBlock(11.7,7.1,12.7,8.1);
  // mesa redonda de reuniones (comité)
  cyl(1.5,1.5,0.08,mMadera2,-11.2,0.76,7.4,scene,32); cyl(0.12,0.3,0.74,mPata,-11.2,0.37,7.4,scene,12); gBlock(-12.7,5.9,-9.7,8.9);
  OF.comite=[]; for(let i=0;i<6;i++){ const a=i/6*Math.PI*2+0.3; const x=-11.2+Math.cos(a)*2.1, z=7.4+Math.sin(a)*2.1; const ry=Math.atan2(-Math.cos(a),-Math.sin(a)); silla(H,x,z,ry+Math.PI,mOliva); OF.comite.push({x,z,ry}); }
  OF.comiteHead={x:-11.2,z:4.9,ry:0}; silla(H,-11.2,4.9,Math.PI,mCarbon);
  // pizarra
  const wb=makeCanvasTex(512,320,(g,w,h)=>{ g.fillStyle='#fbf8f2'; g.fillRect(0,0,w,h); g.strokeStyle='#5f6b48'; g.lineWidth=6; g.beginPath(); g.moveTo(30,260); g.lineTo(150,210); g.lineTo(260,200); g.lineTo(360,120); g.lineTo(480,60); g.stroke(); g.fillStyle='#2b2f2a'; g.font='700 34px Inter,Arial'; g.fillText(MARCA.pizarra[0],30,50); g.fillStyle='#c7865b'; g.font='600 26px Inter,Arial'; g.fillText(MARCA.pizarra[1],30,100); });
  const st=new THREE.Group(); st.position.set(-6.6,0,9.6); st.rotation.y=0.4; scene.add(st); box(2.4,1.5,0.06,mCrema,0,1.6,0,st); const bm=new THREE.Mesh(new THREE.PlaneGeometry(2.3,1.42),new THREE.MeshBasicMaterial({map:wb.t})); bm.position.set(0,1.6,0.035); st.add(bm); box(0.05,0.9,0.05,mPata,-1,0.45,0,st); box(0.05,0.9,0.05,mPata,1,0.45,0,st); gBlock(-7.8,9.2,-5.4,10.0);
  // plantas grandes
  [[-15.2,-10.2,1.3],[15.3,-10.2,1.2],[-15.2,10.3,1.2],[15.3,4.3,1.0],[6.8,10.3,1.1],[-3.6,-10.3,1.0],[3.6,-10.3,1.0]].forEach(([x,z,s])=>planta(H,x,z,s,mTerra,mHoja,mHoja2));
  OF.pois=[
    {k:'coffee',x:14.6,z:-3.2,ry:Math.PI/2},{k:'coffee',x:14.6,z:-1.5,ry:Math.PI/2},{k:'coffee',x:14.6,z:0.2,ry:Math.PI/2},{k:'water',x:13.6,z:-9.0,ry:Math.PI},
    {k:'sofa',x:11.1,z:9.95,ry:Math.PI,sit:true,sitY:0.6},{k:'sofa',x:13.3,z:9.95,ry:Math.PI,sit:true,sitY:0.6},{k:'arm',x:9.7,z:7.4,ry:Math.PI/2,sit:true,sitY:0.45},{k:'arm',x:14.7,z:7.4,ry:-Math.PI/2,sit:true,sitY:0.45},
    {k:'window',x:-15.2,z:-1.5,ry:-Math.PI/2},{k:'window',x:-15.2,z:3.5,ry:-Math.PI/2},{k:'window',x:-15.2,z:-6.5,ry:-Math.PI/2},
    {k:'plant',x:0,z:3.6,ry:Math.PI},{k:'plant',x:3.3,z:0.4,ry:-Math.PI/2},{k:'plant',x:-3.3,z:-0.4,ry:Math.PI/2}];
  OF.ball=new THREE.Mesh(new THREE.SphereGeometry(0.05,8,6),M(0xffffff)); OF.ball.visible=false; scene.add(OF.ball);
}

/* Clínica (Vela-Segalà): pasillo central con salas de cristal, blanco y negro con el color de cada negocio */
function construirClinica(H){
  const {scene,M,box,cyl}=H; OF.desks={}; OF.windows=[]; OF.zones={};
  pantallas();
  const ac=MARCA.acento||0x2f6bff; const mAc=M(ac,{roughness:.45}), mBlanco=M(0xf6f7f9,{roughness:.25,metalness:.05}), mNegro=M(0x16181d,{roughness:.7}), mGris=M(0xd9dce3,{roughness:.6}),
    mPata=M(0x2a2d35,{roughness:.4,metalness:.4}), mHoja=M(0x4f9a6a,{roughness:.8}), mHoja2=M(0x2f7a4a,{roughness:.8}), mCristal=new THREE.MeshStandardMaterial({color:0xdfe8ff,roughness:.05,transparent:true,opacity:.18,depthWrite:false}), mMarco=M(0x16181d,{metalness:.5,roughness:.3});
  const acC=new THREE.Color(ac), acSuave=M(acC.clone().lerp(new THREE.Color(0xffffff),0.75).getHex(),{roughness:.9});
  H.verde=mHoja;
  box(32.4,0.5,22.4,mNegro,0,-0.27,0); const fl=box(32,0.06,22,mBlanco,0,0,0); fl.castShadow=false;
  box(32,0.01,2.4,acSuave,0,0.04,0,scene,false); box(32,0.012,0.08,mAc,0,0.05,-1.2,scene,false); box(32,0.012,0.08,mAc,0,0.05,1.2,scene,false);
  box(32.4,5,0.3,M(0xffffff,{roughness:.9}),0,2.5,-11.2); box(0.3,5,22.4,mNegro,-16.2,2.5,0);
  box(32.4,0.3,0.05,mAc,0,4.6,-11.03,scene,false);
  bordesGrid();
  for(const z of [-8,-4,4,8]){ const w=new THREE.Mesh(new THREE.PlaneGeometry(2.6,3.2),new THREE.MeshBasicMaterial({color:0x9cc4ff})); w.position.set(-16.03,2.5,z); w.rotation.y=Math.PI/2; scene.add(w); OF.windows.push(w); }
  const cristal=(x0,z0,x1,z1,puerta)=>{ const len=Math.hypot(x1-x0,z1-z0), eje=x0===x1?'z':'x'; const segs=puerta?[[0,puerta[0]],[puerta[1],len]]:[[0,len]];
    segs.forEach(([a,b])=>{ if(b-a<0.05) return; const mid=(a+b)/2, L=b-a; const cx=eje==='x'?x0+mid:x0, cz=eje==='z'?z0+mid:z0;
      const m=new THREE.Mesh(new THREE.BoxGeometry(eje==='x'?L:0.05,2.7,eje==='z'?L:0.05),mCristal); m.position.set(cx,1.35,cz); scene.add(m);
      box(eje==='x'?L:0.07,0.07,eje==='z'?L:0.07,mMarco,cx,2.72,cz,scene,false); box(eje==='x'?L:0.07,0.05,eje==='z'?L:0.07,mAc,cx,0.06,cz,scene,false);
      if(eje==='x') gBlock(x0+a,z0-0.05,x0+b,z0+0.05,0.08); else gBlock(x0-0.05,z0+a,x0+0.05,z0+b,0.08); }); };
  // salas de atrás: A (citas), B (marketing y gestión), C (comité)
  cristal(-15.9,-1.6,-6.0,-1.6,[3.8,5.2]); cristal(-6.0,-10.9,-6.0,-1.6); cristal(-5.6,-1.6,4.2,-1.6,[4.2,5.6]); cristal(4.2,-10.9,4.2,-1.6); cristal(4.6,-1.6,15.9,-1.6,[1.0,2.4]); cristal(4.6,-10.9,4.6,-1.6);
  // salas de delante: D (dirección), E (pacientes); F recepción abierta
  cristal(-15.9,1.6,-6.0,1.6,[3.8,5.2]); cristal(-6.0,1.6,-6.0,10.9); cristal(-5.6,1.6,4.2,1.6,[4.2,5.6]); cristal(4.2,1.6,4.2,10.9);
  // sala A: 7 mesas de citas
  const sillaDe={ventas:mAc,marketing:mNegro,finanzas:mGris,clientes:mAc,direccion:mNegro};
  [['webleads',-13.4,-8.6],['pipeline',-10.9,-8.6],['prospector',-8.4,-8.6],['demos',-13.4,-4.6],['redactor',-10.9,-4.6],['seguimiento',-8.4,-4.6],['recontacto',-8.4,-6.6]].forEach(([id,x,z],i)=>mesaRot(H,id,x,z,id==='recontacto'?-Math.PI/2:(i<3?0:Math.PI),{ancho:2.0,mat:mBlanco,silla:sillaDe.ventas,pata:mPata}));
  // sala B: marketing (4) y gestión (2)
  [['contenido',-3.4,-8.6,0],['seo',-0.9,-8.6,0],['publicador',1.6,-8.6,0],['ads',-3.4,-4.6,Math.PI],['finanzas',-0.9,-4.6,Math.PI],['cartera',1.6,-4.6,Math.PI]].forEach(([id,x,z,a])=>mesaRot(H,id,x,z,a,{ancho:2.0,mat:mBlanco,silla:sillaDe[DEPT_OF[id]],pata:mPata}));
  // sala D: dirección
  mesaRot(H,'ceo',-11,8.6,Math.PI,{ancho:3,mat:mNegro,silla:mAc,pata:mPata});
  [['resumen',-13.6,4.4,0],['semanal',-11,4.4,0],['analista',-8.4,4.4,0]].forEach(([id,x,z,a])=>mesaRot(H,id,x,z,a,{ancho:2.0,mat:mBlanco,silla:mNegro,pata:mPata}));
  // sala E: pacientes / clientas
  [['cs',-2.6,5.0,0],['produccion',0.6,5.0,0]].forEach(([id,x,z,a])=>mesaRot(H,id,x,z,a,{ancho:2.0,mat:mBlanco,silla:mAc,pata:mPata}));
  const sillon=(x,z,ry)=>{ const g=new THREE.Group(); g.position.set(x,0,z); g.rotation.y=ry; scene.add(g); box(0.9,0.42,0.85,acSuave,0,0.3,0,g); box(0.9,0.55,0.18,acSuave,0,0.65,-0.34,g); gBlock(x-0.45,z-0.45,x+0.45,z+0.45,0.02); };
  // etiquetas
  etiquetaSuelo(H,MARCA.deptos.ventas||'Citas','#'+acC.getHexString(),-11,-2.4,6); etiquetaSuelo(H,(MARCA.deptos.marketing||'Marketing')+' · '+(MARCA.deptos.finanzas||'Gestión'),'#16181d',-0.6,-2.4,7.5);
  etiquetaSuelo(H,'Comité','#16181d',10.2,-2.4,4); etiquetaSuelo(H,'Dirección','#16181d',-11,2.4,5); etiquetaSuelo(H,MARCA.deptos.clientes||'Pacientes','#'+acC.getHexString(),-0.6,2.4,5.5); etiquetaSuelo(H,'Recepción','#16181d',10.2,2.4,5);
  // sala C: comité
  box(4.6,0.08,1.8,mNegro,10.2,0.76,-6.6); box(0.12,0.72,1.2,mPata,8.4,0.37,-6.6); box(0.12,0.72,1.2,mPata,12,0.37,-6.6); gBlock(7.8,-7.5,12.6,-5.7);
  OF.comite=[]; [8.8,10.2,11.6].forEach(x=>{ silla(H,x,-8.05,0,mGris); OF.comite.push({x,z:-8.05,ry:0}); silla(H,x,-5.15,Math.PI,mGris); OF.comite.push({x,z:-5.15,ry:Math.PI}); });
  silla(H,7.3,-6.6,Math.PI/2,mAc); OF.comiteHead={x:7.3,z:-6.6,ry:Math.PI/2};
  pantallaPared(H,10.2,2.6,-10.95,0);
  logoPared(H,-5.0,3.75,-11.03,0,8.5,'#16181d');
  textoPared(H,MARCA.lema,'#'+acC.getHexString(),-5.0,2.95,-11.03,0,8.5);
  // recepción: mostrador curvo, sala de espera
  const most=new THREE.Mesh(new THREE.CylinderGeometry(2.2,2.2,1.05,32,1,true,Math.PI*0.15,Math.PI*0.7),mBlanco); most.position.set(12.4,0.53,4.2); most.material.side=THREE.DoubleSide; scene.add(most);
  box(0.6,0.08,3.4,mAc,10.4,1.08,4.6,scene,false); gBlock(10.2,2.8,14.4,6.2);
  const sofa=new THREE.Group(); sofa.position.set(12.2,0,10.2); sofa.rotation.y=Math.PI; scene.add(sofa);
  box(3.4,0.42,0.9,mNegro,0,0.3,0,sofa); box(3.4,0.6,0.22,mNegro,0,0.7,-0.4,sofa); [-1.0,0,1.0].forEach(dx=>box(0.95,0.12,0.7,acSuave,dx,0.56,0.06,sofa)); gBlock(10.4,9.6,14.0,10.8);
  sillon(7.0,8.4,Math.PI/2); sillon(7.0,6.4,Math.PI/2);
  cyl(0.45,0.45,0.06,mBlanco,8.6,0.42,7.4); cyl(0.05,0.05,0.4,mPata,8.6,0.2,7.4,scene,8); gBlock(8.1,6.9,9.1,7.9);
  box(0.6,1.0,0.6,mBlanco,15.3,0.5,2.6); cyl(0.2,0.2,0.5,M(0x9cc4ff,{transparent:true,opacity:.5}),15.3,1.25,2.6); gBlock(15.0,2.3,15.6,2.9);
  box(0.7,1.0,1.6,mNegro,15.3,0.5,9.6); box(0.4,0.5,0.4,mAc,15.25,1.25,9.4); gBlock(14.9,8.8,15.7,10.4);
  [[-15.3,-10.3,1.0],[15.3,-10.3,1.0],[-15.3,10.3,1.1],[5.0,10.3,1.0],[-5.3,10.3,0.9],[3.6,-2.2,0.7]].forEach(([x,z,s])=>planta(H,x,z,s,mBlanco,mHoja,mHoja2));
  OF.pois=[
    {k:'coffee',x:14.6,z:9.4,ry:Math.PI/2},{k:'coffee',x:14.6,z:8.4,ry:Math.PI/2},{k:'water',x:14.7,z:2.6,ry:Math.PI/2},
    {k:'sofa',x:11.2,z:10.2,ry:Math.PI,sit:true,sitY:0.6},{k:'sofa',x:13.2,z:10.2,ry:Math.PI,sit:true,sitY:0.6},{k:'arm',x:7.0,z:8.4,ry:Math.PI/2,sit:true,sitY:0.5},{k:'arm',x:7.0,z:6.4,ry:Math.PI/2,sit:true,sitY:0.5},
    {k:'window',x:-15.3,z:-0.4,ry:-Math.PI/2},{k:'window',x:-15.3,z:0.6,ry:-Math.PI/2},
    {k:'plant',x:4.4,z:-0.6,ry:Math.PI},{k:'plant',x:-4.6,z:9.6,ry:Math.PI}];
  OF.ball=new THREE.Mesh(new THREE.SphereGeometry(0.05,8,6),M(0xffffff)); OF.ball.visible=false; scene.add(OF.ball);
}
const CONSTRUCTORES={spa:construirSpa,clinica:construirClinica};


function initOffice(host){
  let renderer;
  try{ renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'}); }catch(e){ return false; }
  OF.block=new Uint8Array(GRID.w*GRID.h);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.75)); renderer.shadowMap.enabled=true; renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  renderer.outputColorSpace=THREE.SRGBColorSpace; renderer.toneMapping=THREE.ACESFilmicToneMapping; renderer.toneMappingExposure=1.05;
  host.prepend(renderer.domElement); renderer.domElement.setAttribute('aria-hidden','true');
  const scene=new THREE.Scene(); const cam=new THREE.OrthographicCamera(-10,10,10,-10,0.1,240);
  OF.renderer=renderer; OF.scene=scene; OF.cam=cam; OF.az=Math.PI/4.6; OF.el=0.66;
  const hemi=new THREE.HemisphereLight(0xdfe8ff,0x0a1235,0.85*Math.PI); scene.add(hemi); OF.hemi=hemi;
  const sun=new THREE.DirectionalLight(0xffffff,1.15*Math.PI); sun.position.set(12,24,14); sun.castShadow=true; sun.shadow.mapSize.set(2048,2048);
  Object.assign(sun.shadow.camera,{left:-21,right:21,top:17,bottom:-17,near:1,far:80}); sun.shadow.bias=-0.0006; sun.shadow.radius=3; scene.add(sun); OF.sun=sun;
  const M=(c,o={})=>new THREE.MeshStandardMaterial(Object.assign({color:c,roughness:.7,metalness:.05},o));
  const box=(w,h,d,mat,x,y,z,parent=scene,shadow=true)=>{ const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat); m.position.set(x,y,z); m.castShadow=shadow; m.receiveShadow=true; parent.add(m); return m; };
  const cyl=(rt,rb,h,mat,x,y,z,parent=scene,seg=16)=>{ const m=new THREE.Mesh(new THREE.CylinderGeometry(rt,rb,h,seg),mat); m.position.set(x,y,z); m.castShadow=true; m.receiveShadow=true; parent.add(m); return m; };
  const mFloor=M(0xe9ecf3,{roughness:.55}), mSlab=M(0x0b1433), mWall=M(0x0b1433,{roughness:.9}), mWall2=M(0x101c48,{roughness:.9}), mBlue=M(0x0047ff,{roughness:.45}), mWhite=M(0xf6f8fc,{roughness:.4}),
    mDark=M(0x1a2244,{roughness:.6,metalness:.3}), mBlack=M(0x0a0d18,{roughness:.4,metalness:.2}), mWood=M(0xc9a27a,{roughness:.6}), mLime=M(0xe5fc63,{roughness:.6}), mGreen=M(0x2bbf86,{roughness:.8}), mGreen2=M(0x16804f,{roughness:.8}),
    mGlass=new THREE.MeshStandardMaterial({color:0xb9d0ff,roughness:.05,metalness:.1,transparent:true,opacity:.22,depthWrite:false}), mFrame=M(0x1a2244,{metalness:.5,roughness:.3});
  OF.mats={mDark,mWhite};
  const H={scene,M,box,cyl,mats:{mFloor,mSlab,mWall,mWall2,mBlue,mWhite,mDark,mBlack,mWood,mLime,mGreen,mGreen2,mGlass,mFrame}};
  if(MARCA.tema&&CONSTRUCTORES[MARCA.tema]){ CONSTRUCTORES[MARCA.tema](H); } else {
  // suelo, paredes
  box(32.4,0.5,22.4,mSlab,0,-0.27,0); const fl=box(32,0.06,22,mFloor,0,0,0); fl.castShadow=false;
  box(32.4,0.08,0.06,mBlue,0,0.02,11.22,scene,false); box(0.06,0.08,22.4,mBlue,16.22,0.02,0,scene,false);
  box(32.4,5,0.3,mWall,0,2.5,-11.2); box(0.3,5,22.4,mWall2,-16.2,2.5,0);
  box(32.4,0.14,0.05,mBlue,0,0.55,-11.03,scene,false); box(0.05,0.14,22.4,mBlue,-16.03,0.55,0,scene,false);
  gBlock(-16.5,-11.6,16.5,-10.75,0); gBlock(-16.6,-11.5,-15.75,11.5,0); gBlock(-16.5,10.8,16.5,11.6,0); gBlock(15.8,-11.5,16.6,11.5,0);
  // ventanas
  OF.windows=[]; for(const z of [-1.0,3.2,7.4]){ const w=new THREE.Mesh(new THREE.PlaneGeometry(3,2.4),new THREE.MeshBasicMaterial({color:0x9cc4ff})); w.position.set(-16.03,2.6,z); w.rotation.y=Math.PI/2; scene.add(w); OF.windows.push(w);
    box(0.08,0.08,3.2,mDark,-16,1.38,z,scene,false); box(0.08,0.08,3.2,mDark,-16,3.82,z,scene,false); box(0.08,2.4,0.06,mDark,-16,2.6,z,scene,false); }
  // zonas de departamento
  const ZONES={direccion:[-15.6,-6.1,-10.6,-3.0],ventas:[-15.6,-2.6,-2.2,10.6],marketing:[-5.6,4.6,-10.6,-3.0],clientes:[-1.6,6.6,-2.2,4.0],finanzas:[-1.6,6.6,4.6,10.6]};
  OF.zones=ZONES;
  DEPTS.forEach(d=>{ const [x0,x1,z0,z1]=ZONES[d.id]; const rug=new THREE.Mesh(new THREE.PlaneGeometry(x1-x0,z1-z0),new THREE.MeshStandardMaterial({color:d.hex,roughness:.95,transparent:true,opacity:.14,depthWrite:false}));
    rug.rotation.x=-Math.PI/2; rug.position.set((x0+x1)/2,0.036,(z0+z1)/2); rug.receiveShadow=true; scene.add(rug);
    const edge=new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.PlaneGeometry(x1-x0,z1-z0)),new THREE.LineBasicMaterial({color:d.hex,transparent:true,opacity:.7})); edge.rotation.x=-Math.PI/2; edge.position.set((x0+x1)/2,0.04,(z0+z1)/2); scene.add(edge);
    const lab=makeCanvasTex(1024,128,(g,w,h)=>{ g.fillStyle=d.color; g.font='800 84px Archivo,Arial'; g.textBaseline='middle'; g.fillText((MARCA.deptos[d.id]||d.name).toUpperCase(),6,h/2+4); });
    const lw=Math.min(x1-x0-0.6,8.5); const pl=new THREE.Mesh(new THREE.PlaneGeometry(lw,lw/8),new THREE.MeshBasicMaterial({map:lab.t,transparent:true,depthWrite:false}));
    pl.rotation.x=-Math.PI/2; pl.position.set(x0+0.3+lw/2,0.045,z1-0.25-lw/16); scene.add(pl); });
  // mesas
  OF.desks={};
  const desk=(id,x,z,face='n',big=false)=>{
    const g=new THREE.Group(); g.position.set(x,0,z); if(face==='s') g.rotation.y=Math.PI; scene.add(g);
    const W=big?3:2.3; box(W,0.07,1.1,big?mWood:mWhite,0,0.76,0,g); [[-W/2+0.08,-.48],[W/2-0.08,-.48],[-W/2+0.08,.48],[W/2-0.08,.48]].forEach(([a,b])=>box(0.06,0.74,0.06,mDark,a,0.37,b,g));
    if(!big) box(W,0.4,0.04,mDark,0,1.0,-0.56,g);
    cyl(0.03,0.03,0.28,mDark,0,0.93,-0.3,g); box(0.32,0.03,0.2,mDark,0,0.8,-0.3,g); box(1.0,0.6,0.05,mBlack,0,1.32,-0.33,g);
    const s=new THREE.Mesh(new THREE.PlaneGeometry(0.92,0.52),OF.offMat); s.position.set(0,1.32,-0.302); g.add(s);
    box(0.62,0.025,0.2,mDark,0,0.8,0.12,g,false);
    if(Math.random()<0.4) cyl(0.05,0.045,0.12,Math.random()<0.5?mLime:mBlue,-0.8,0.86,0.05,g,10);
    if(Math.random()<0.3){ cyl(0.09,0.07,0.16,mWhite,0.85,0.88,-0.25,g,10); const pl=new THREE.Mesh(new THREE.IcosahedronGeometry(0.17,0),mGreen); pl.position.set(0.85,1.07,-0.25); pl.castShadow=true; g.add(pl); }
    const ch=new THREE.Group(); ch.position.set(0,0,0.95); g.add(ch);
    const dc=DEPTS.find(d=>d.id===DEPT_OF[id]); const seatMat=M(dc?dc.hex:0x0047ff,{roughness:.5});
    box(0.62,0.08,0.58,seatMat,0,0.47,0,ch); box(0.62,0.62,0.07,mWall,0,0.85,0.3,ch); cyl(0.035,0.035,0.4,mDark,0,0.25,0,ch,8); cyl(0.28,0.28,0.04,mDark,0,0.04,0,ch,10);
    const sz=face==='s'?z-0.82:z+0.82; gBlock(x-W/2,z-0.55,x+W/2,z+0.55);
    OF.desks[id]={x,z,screen:s,seat:{x,z:sz,ry:face==='s'?0:Math.PI}}; };
  OF.offMat=new THREE.MeshBasicMaterial({color:0x05070f});
  OF.workTex=makeCanvasTex(256,160); OF.idleTex=makeCanvasTex(256,160,(g,w,h)=>{ const gr=g.createLinearGradient(0,0,w,h); gr.addColorStop(0,'#071034'); gr.addColorStop(1,'#0b2a8a'); g.fillStyle=gr; g.fillRect(0,0,w,h); g.fillStyle='#ffffff'; g.font='800 64px Archivo,Arial'; g.textAlign='center'; g.textBaseline='middle'; g.fillText('a',w/2,h/2+2); g.fillStyle='#e5fc63'; g.fillRect(w/2+22,h/2+18,10,10); });
  OF.workMat=new THREE.MeshBasicMaterial({map:OF.workTex.t}); OF.idleMat=new THREE.MeshBasicMaterial({map:OF.idleTex.t});
  OF.code=Array.from({length:22},()=>({w:20+Math.random()*150,i:Math.floor(Math.random()*4),c:['#7aa0ff','#e5fc63','#3ee0a1','#ffffff','#ff8f7e'][Math.floor(Math.random()*5)]}));
  // Dirección: despacho de cristal del CEO + 3 mesas
  const glassWall=(x0,z0,x1,z1,door)=>{ const len=Math.hypot(x1-x0,z1-z0), along=x0===x1?'z':'x';
    const segs=door?[[0,door[0]],[door[1],len]]:[[0,len]];
    segs.forEach(([a,b])=>{ if(b-a<0.05) return; const mid=(a+b)/2, L=b-a; const cx=along==='x'?x0+mid:x0, cz=along==='z'?z0+mid:z0;
      const m=new THREE.Mesh(new THREE.BoxGeometry(along==='x'?L:0.05,2.6,along==='z'?L:0.05),mGlass); m.position.set(cx,1.3,cz); scene.add(m);
      box(along==='x'?L:0.08,0.08,along==='z'?L:0.08,mFrame,cx,2.62,cz,scene,false);
      if(along==='x') gBlock(x0+a,z0-0.05,x0+b,z0+0.05,0.08); else gBlock(x0-0.05,z0+a,x0+0.05,z0+b,0.08); }); };
  glassWall(-15.6,-6.0,-10.4,-6.0,[2.8,4.0]); glassWall(-10.4,-10.6,-10.4,-6.0);
  desk('ceo',-13.0,-8.5,'s',true);
  const plaque=makeCanvasTex(512,96,(g,w,h)=>{ g.fillStyle='#e5fc63'; g.font='800 54px Archivo,Arial'; g.textBaseline='middle'; g.fillText(MARCA.placa,8,h/2+3); });
  const pq=new THREE.Mesh(new THREE.PlaneGeometry(2.2,0.41),new THREE.MeshBasicMaterial({map:plaque.t,transparent:true})); pq.position.set(-14.3,2.2,-5.96); scene.add(pq);
  box(2.2,0.8,0.5,mWall,-14.6,0.4,-10.4); const award=cyl(0.12,0.16,0.3,mLime,-14.6,0.95,-10.4,scene,10);
  desk('resumen',-14.2,-4.2); desk('semanal',-11.6,-4.2); desk('analista',-9.0,-4.2);
  // Ventas (7)
  [[-14.2,0.0],[-11.6,0.0],[-9.0,0.0],[-6.4,0.0],[-14.2,4.6],[-11.6,4.6],[-9.0,4.6]].forEach(([x,z],i)=>desk(['pipeline','prospector','demos','redactor','recontacto','seguimiento','webleads'][i],x,z));
  // pizarra de ventas
  const wb=makeCanvasTex(512,320,(g,w,h)=>{ g.fillStyle='#fbfcff'; g.fillRect(0,0,w,h); g.strokeStyle='#0047ff'; g.lineWidth=6; g.beginPath(); g.moveTo(30,260); g.lineTo(150,200); g.lineTo(260,215); g.lineTo(360,120); g.lineTo(480,60); g.stroke();
    g.fillStyle='#0b1433'; g.font='700 34px Inter,Arial'; g.fillText(MARCA.pizarra[0],30,50); g.fillStyle='#ff6b5a'; g.font='600 26px Inter,Arial'; g.fillText(MARCA.pizarra[1],30,100); });
  const board=new THREE.Mesh(new THREE.PlaneGeometry(2.6,1.6),new THREE.MeshBasicMaterial({map:wb.t})); board.position.set(-16.02,2.4,-1.0+0.001); board.rotation.y=Math.PI/2; board.visible=false;
  const stand=new THREE.Group(); stand.position.set(-5.2,0,8.6); stand.rotation.y=-0.5; scene.add(stand); box(2.4,1.5,0.06,mWhite,0,1.6,0,stand); const bm=new THREE.Mesh(new THREE.PlaneGeometry(2.3,1.42),new THREE.MeshBasicMaterial({map:wb.t})); bm.position.set(0,1.6,0.035); stand.add(bm);
  box(0.05,0.9,0.05,mDark,-1.0,0.45,0,stand); box(0.05,0.9,0.05,mDark,1.0,0.45,0,stand); gBlock(-6.4,8.2,-4.0,9.0);
  // Marketing (4) + logo
  [['contenido',-3.6,-9.0],['seo',-1.0,-9.0],['publicador',-3.6,-5.0],['ads',-1.0,-5.0]].forEach(([id,x,z])=>desk(id,x,z));
  const logoImg=new Image(); logoImg.onload=()=>{ const {t}=makeCanvasTex(1024,282,(g,w,h)=>{ g.drawImage(logoImg,0,0,w,h); g.globalCompositeOperation='source-in'; g.fillStyle='#ffffff'; g.fillRect(0,0,w,h); });
    const p=new THREE.Mesh(new THREE.PlaneGeometry(8,8*282/1024),new THREE.MeshBasicMaterial({map:t,transparent:true})); p.position.set(1.4,3.55,-11.03); scene.add(p); }; logoImg.src=MARCA.logo;
  const tagTex=makeCanvasTex(1024,64,(g,w,h)=>{ g.fillStyle='#e5fc63'; g.font='600 34px "JetBrains Mono",monospace'; g.textBaseline='middle'; g.fillText(MARCA.lema,8,h/2); });
  const tag=new THREE.Mesh(new THREE.PlaneGeometry(8,0.5),new THREE.MeshBasicMaterial({map:tagTex.t,transparent:true})); tag.position.set(1.4,2.25,-11.03); scene.add(tag);
  // Clientes y producción (2) + Finanzas (2)
  desk('cs',0.6,0.2); desk('produccion',3.2,0.2); desk('finanzas',0.6,6.4); desk('cartera',3.2,6.4);
  const safe=box(0.9,1.1,0.8,mDark,5.6,0.55,9.9); box(0.12,0.12,0.04,mLime,5.6,0.7,9.48,scene,false); gBlock(5.1,9.4,6.1,10.4);
  // Sala de comité (cristal)
  glassWall(8.4,-4.4,15.9,-4.4,[0.6,1.8]); glassWall(8.4,-10.6,8.4,-4.4);
  box(4.4,0.08,1.8,mWood,12.2,0.76,-7.5); box(0.12,0.72,1.2,mDark,10.6,0.37,-7.5); box(0.12,0.72,1.2,mDark,13.8,0.37,-7.5); gBlock(10.0,-8.4,14.4,-6.6);
  const cchair=(x,z,ry)=>{ const c=new THREE.Group(); c.position.set(x,0,z); c.rotation.y=ry; scene.add(c); box(0.55,0.08,0.52,mWall2,0,0.47,0,c); box(0.55,0.55,0.07,mWall2,0,0.8,-0.27,c); cyl(0.035,0.035,0.4,mDark,0,0.25,0,c,8); };
  OF.comite=[]; [10.8,12.2,13.6].forEach(x=>{ cchair(x,-8.95,0); OF.comite.push({x,z:-8.95,ry:0}); cchair(x,-6.05,Math.PI); OF.comite.push({x,z:-6.05,ry:Math.PI}); });
  cchair(9.25,-7.5,Math.PI/2); OF.comiteHead={x:9.25,z:-7.5,ry:Math.PI/2};
  OF.wall=makeCanvasTex(1024,560); box(6.3,3.5,0.12,mBlack,12.2,2.6,-10.98);
  const scr=new THREE.Mesh(new THREE.PlaneGeometry(6.05,3.3),new THREE.MeshBasicMaterial({map:OF.wall.t})); scr.position.set(12.2,2.6,-10.91); scene.add(scr);
  const glow=new THREE.PointLight(0x2f6bff,Math.PI,12,1); glow.position.set(12.2,3,-9); scene.add(glow);
  // Cocina
  box(0.75,0.9,4.2,mWhite,15.4,0.45,-0.6); box(0.8,0.06,4.2,mDark,15.4,0.92,-0.6); box(0.45,0.62,0.5,mBlack,15.45,1.26,-1.8); cyl(0.05,0.05,0.1,mLime,15.2,1.0,-1.8,scene,8); box(0.45,0.5,0.5,mBlue,15.45,1.2,0.4); gBlock(15.0,-2.7,15.9,1.5);
  const water=[9.0,1.9]; box(0.5,1.0,0.5,mWhite,water[0],0.5,water[1]); cyl(0.2,0.2,0.5,M(0x9cc4ff,{transparent:true,opacity:.5}),water[0],1.25,water[1]); gBlock(8.7,1.6,9.3,2.2);
  // Zona de descanso: sofá, sillones, ping-pong
  const rug=new THREE.Mesh(new THREE.CircleGeometry(2.8,40),new THREE.MeshStandardMaterial({color:0x0047ff,roughness:.95})); rug.rotation.x=-Math.PI/2; rug.position.set(12.2,0.035,8.0); rug.receiveShadow=true; scene.add(rug);
  const sofa=new THREE.Group(); sofa.position.set(12.2,0,10.0); sofa.rotation.y=Math.PI; scene.add(sofa);
  box(3.4,0.42,0.95,mWall,0,0.3,0,sofa); box(3.4,0.6,0.25,mWall,0,0.7,-0.42,sofa); box(0.25,0.55,0.95,mWall,-1.6,0.5,0,sofa); box(0.25,0.55,0.95,mWall,1.6,0.5,0,sofa);
  [-0.95,0,0.95].forEach(dx=>box(0.9,0.12,0.75,mBlue,dx,0.56,0.06,sofa)); gBlock(10.4,9.4,14.0,10.6);
  cyl(0.55,0.55,0.08,mWhite,12.2,0.42,8.0); cyl(0.06,0.06,0.38,mDark,12.2,0.2,8.0,scene,8); cyl(0.12,0.1,0.1,mLime,12.0,0.51,7.9,scene,10); gBlock(11.6,7.4,12.8,8.6);
  const arm=(x,z,ry)=>{ const a=new THREE.Group(); a.position.set(x,0,z); a.rotation.y=ry; scene.add(a); box(0.85,0.4,0.85,mLime,0,0.3,0,a); box(0.85,0.5,0.18,mLime,0,0.65,-0.34,a); gBlock(x-0.45,z-0.45,x+0.45,z+0.45,0.02); };
  arm(9.6,8.0,Math.PI/2); arm(14.8,8.0,-Math.PI/2);
  const pp=new THREE.Group(); pp.position.set(12.2,0,4.4); scene.add(pp);
  box(2.74,0.06,1.52,M(0x0b3d91,{roughness:.5}),0,0.76,0,pp); box(0.02,0.16,1.6,mWhite,0,0.86,0,pp); box(2.74,0.005,0.03,mWhite,0,0.795,0,pp,false); [[-1.2,-.6],[1.2,-.6],[-1.2,.6],[1.2,.6]].forEach(([a,b])=>box(0.06,0.74,0.06,mDark,a,0.37,b,pp)); gBlock(10.8,3.6,13.6,5.2);
  OF.ball=new THREE.Mesh(new THREE.SphereGeometry(0.05,8,6),M(0xffffff)); OF.ball.visible=false; scene.add(OF.ball);
  // Plantas
  const plant=(x,z,s=1)=>{ cyl(0.24*s,0.18*s,0.5*s,mWhite,x,0.25*s,z,scene,12); const f=new THREE.Mesh(new THREE.IcosahedronGeometry(0.5*s,0),mGreen); f.position.set(x,0.85*s,z); f.castShadow=true; scene.add(f); const f2=new THREE.Mesh(new THREE.IcosahedronGeometry(0.36*s,0),mGreen2); f2.position.set(x+0.15*s,1.25*s,z-0.05); f2.castShadow=true; scene.add(f2); gBlock(x-0.3*s,z-0.3*s,x+0.3*s,z+0.3*s,0.02); };
  plant(-6.8,-10.4); plant(-15.4,10.4,1.1); plant(15.5,10.6,1.2); plant(7.4,10.4,.9); plant(5.4,-10.4,.9); plant(15.5,-3.8,.8); plant(-6.6,-3.6,.8); plant(7.4,-4.0,.9);
  // Puntos de interés
  OF.pois=[
    {k:'coffee',x:14.7,z:-1.8,ry:Math.PI/2},{k:'coffee',x:14.7,z:-0.6,ry:Math.PI/2},{k:'coffee',x:14.7,z:0.6,ry:Math.PI/2},{k:'water',x:9.0,z:2.6,ry:Math.PI},
    {k:'sofa',x:11.25,z:9.95,ry:Math.PI,sit:true,sitY:0.6},{k:'sofa',x:13.15,z:9.95,ry:Math.PI,sit:true,sitY:0.6},{k:'arm',x:9.6,z:8.0,ry:Math.PI/2,sit:true,sitY:0.5},{k:'arm',x:14.8,z:8.0,ry:-Math.PI/2,sit:true,sitY:0.5},
    {k:'pingpong',x:10.4,z:4.4,ry:Math.PI/2,pair:'pp'},{k:'pingpong',x:14.0,z:4.4,ry:-Math.PI/2,pair:'pp'},
    {k:'window',x:-15.2,z:2.0,ry:-Math.PI/2},{k:'window',x:-15.2,z:6.2,ry:-Math.PI/2},{k:'window',x:-15.2,z:-2.2,ry:-Math.PI/2},
    {k:'plant',x:7.4,z:9.6,ry:Math.PI},{k:'plant',x:-6.6,z:-2.9,ry:Math.PI}];
  }
  OF.pois.forEach(p=>p.busy=null); OF.comite.forEach(p=>p.busy=null);
  // Personas
  OF.people=AGENTS.map(a=>makePerson({...a,nick:MARCA.nombres[a.id]||a.nick},OF.desks[a.id]||OF.desks.pipeline));
  OF.people.forEach(p=>{ placeAt(p,p.desk.seat); sitPose(p,0.47); p.mode='sit'; p.act='desk'; p.timer=1+Math.random()*8; });
  OF.byId=Object.fromEntries(OF.people.map(p=>[p.a.id,p]));
  OF.clock=new THREE.Clock(); OF.target=new THREE.Vector3(0,1.2,-0.4); OF.tgt=new THREE.Vector3();
  return true;
}

function deptOf(a){ return DEPTS.find(d=>d.id===DEPT_OF[a.id])||DEPTS[1]; }
function labelTex(p){ const st=agentWorking(p.a)?'w':agentStale(p.a)?'s':'i'; if(p.lblSt===st&&p.lbl) return; p.lblSt=st;
  const {g,t}=p.lblTex||(p.lblTex=makeCanvasTex(320,72)); g.clearRect(0,0,320,72); const name=p.a.id==='ceo'?MARCA.placa:p.a.nick;
  g.font='700 34px Inter,Arial'; const tw=g.measureText(name).width; const w=tw+58, x=(320-w)/2;
  g.fillStyle='rgba(5,10,31,.9)'; g.beginPath(); g.roundRect?g.roundRect(x,10,w,48,24):g.rect(x,10,w,48); g.fill();
  g.strokeStyle=st==='w'?'#e5fc63':deptOf(p.a).color; g.lineWidth=st==='w'?3:2; g.stroke();
  g.fillStyle=st==='w'?'#e5fc63':st==='s'?'#ffc65c':deptOf(p.a).color; g.beginPath(); g.arc(x+22,34,7,0,7); g.fill();
  g.fillStyle='#fff'; g.textBaseline='middle'; g.fillText(name,x+38,35); t.needsUpdate=true;
  if(!p.lbl){ p.lbl=new THREE.Sprite(new THREE.SpriteMaterial({map:t,transparent:true,depthWrite:false})); p.lbl.scale.set(3.2,0.72,1); p.lbl.position.y=2.25; p.lbl.renderOrder=5; p.g.add(p.lbl); } }
function showBubble(p,text){
  if(!p) return; const {c,g,t}=p.bubTex||(p.bubTex=makeCanvasTex(640,200)); g.clearRect(0,0,640,200);
  const words=String(text).split(/\s+/); const lines=[]; let cur=''; g.font='600 30px Inter,Arial';
  for(const w of words){ const tryL=cur?cur+' '+w:w; if(g.measureText(tryL).width>560){ lines.push(cur); cur=w; if(lines.length===3) break; } else cur=tryL; }
  if(lines.length<3&&cur) lines.push(cur); if(lines.length===3&&words.join(' ').length>lines.join(' ').length) lines[2]=lines[2].replace(/\s*\S*$/,'…');
  const h=lines.length*38+34; g.fillStyle='#ffffff'; g.beginPath(); g.roundRect?g.roundRect(10,6,620,h,26):g.rect(10,6,620,h); g.fill();
  g.beginPath(); g.moveTo(300,h+6); g.lineTo(320,h+30); g.lineTo(340,h+6); g.fill();
  g.fillStyle='#0b1433'; g.textBaseline='top'; lines.forEach((l,i)=>g.fillText(l,34,22+i*38)); t.needsUpdate=true;
  if(!p.bub){ p.bub=new THREE.Sprite(new THREE.SpriteMaterial({map:t,transparent:true,depthWrite:false,depthTest:false})); p.bub.scale.set(6.4,2.0,1); p.bub.position.y=3.9; p.bub.renderOrder=9; p.g.add(p.bub); }
  p.bub.visible=true; p.bub.material.opacity=1; p.bubT=8; }
function makePerson(a,desk){
  const f=a.face, skinC=['#f2c9a5','#e0ac7e','#c68a5a','#f6d5bd'][f.style%4];
  const M=c=>new THREE.MeshStandardMaterial({color:c,roughness:.75});
  const isCeo=a.id==='ceo'; const shirt=M(isCeo?0x0b1433:f.bg), skin=M(skinC), hair=M(f.hair), pants=M(isCeo?0x0b1433:0x1a2244), shoe=M(0x0a0d18), dark=M(0x111111);
  const g=new THREE.Group(); OF.scene.add(g); const body=new THREE.Group(); g.add(body);
  const part=(geo,mat,parent,x,y,z)=>{ const m=new THREE.Mesh(geo,mat); m.position.set(x,y,z); m.castShadow=true; parent.add(m); return m; };
  const legs=[-1,1].map(s=>{ const hip=new THREE.Group(); hip.position.set(0.11*s,0.74,0); body.add(hip); part(new THREE.BoxGeometry(0.17,0.38,0.19),pants,hip,0,-0.19,0);
    const knee=new THREE.Group(); knee.position.set(0,-0.38,0); hip.add(knee); part(new THREE.BoxGeometry(0.15,0.36,0.17),pants,knee,0,-0.18,0); part(new THREE.BoxGeometry(0.16,0.07,0.26),shoe,knee,0,-0.36,0.04); return {hip,knee}; });
  part(new THREE.CylinderGeometry(0.25,0.27,0.62,12),shirt,body,0,1.06,0); part(new THREE.SphereGeometry(0.25,12,8,0,Math.PI*2,0,Math.PI/2),shirt,body,0,1.36,0);
  if(isCeo){ part(new THREE.BoxGeometry(0.16,0.42,0.02),M(0xffffff),body,0,1.12,0.255); part(new THREE.BoxGeometry(0.07,0.36,0.03),M(0xe5fc63),body,0,1.12,0.27); }
  else { const dc=deptOf(a); part(new THREE.BoxGeometry(0.1,0.06,0.02),M(dc.hex),body,0.13,1.22,0.255); }
  const arms=[-1,1].map(s=>{ const sh=new THREE.Group(); sh.position.set(0.33*s,1.3,0); body.add(sh); part(new THREE.BoxGeometry(0.12,0.5,0.14),shirt,sh,0,-0.24,0); part(new THREE.SphereGeometry(0.075,8,6),skin,sh,0,-0.53,0); return sh; });
  const head=new THREE.Group(); head.position.set(0,1.62,0); body.add(head); part(new THREE.SphereGeometry(0.23,16,12),skin,head,0,0,0);
  const hs=f.style%4; const cap=part(new THREE.SphereGeometry(0.245,16,10,0,Math.PI*2,0,Math.PI*0.55),hair,head,0,0.03,-0.02); cap.rotation.x=-0.25;
  if(hs===1) part(new THREE.BoxGeometry(0.42,0.42,0.14),hair,head,0,-0.14,-0.15); if(hs===3) part(new THREE.SphereGeometry(0.11,10,8),hair,head,0,0.2,-0.2); if(hs===2) part(new THREE.BoxGeometry(0.3,0.08,0.12),hair,head,0.06,0.2,0.12);
  [-1,1].forEach(s=>part(new THREE.SphereGeometry(0.028,6,6),dark,head,0.08*s,0.0,0.21));
  if(f.acc==='gafas') [-1,1].forEach(s=>part(new THREE.TorusGeometry(0.06,0.012,6,14),dark,head,0.085*s,0.0,0.225));
  if(f.acc==='cascos'){ part(new THREE.TorusGeometry(0.25,0.025,6,18,Math.PI),dark,head,0,0.02,0); [-1,1].forEach(s=>part(new THREE.BoxGeometry(0.06,0.13,0.11),dark,head,0.25*s,0,0)); }
  const cup=part(new THREE.CylinderGeometry(0.05,0.045,0.11,10),M(0xffffff),arms[1],0,-0.6,0.06); cup.visible=false;
  const hit=new THREE.Mesh(new THREE.CylinderGeometry(0.42,0.42,2.0,8),new THREE.MeshBasicMaterial({visible:false})); hit.position.y=1.0; g.add(hit);
  const ring=new THREE.Mesh(new THREE.RingGeometry(0.42,0.52,32),new THREE.MeshBasicMaterial({color:0xe5fc63,transparent:true,opacity:0})); ring.rotation.x=-Math.PI/2; ring.position.y=0.05; g.add(ring);
  const p={a,desk,g,body,legs,arms,head,cup,hit,ring,mode:'sit',path:[],timer:0,phase:Math.random()*10,ry:0,act:'desk',poi:null};
  labelTex(p); return p; }
function placeAt(p,pt){ p.g.position.set(pt.x,0,pt.z); p.ry=pt.ry||0; p.g.rotation.y=p.ry; }
function standPose(p){ p.body.position.y=0; p.legs.forEach(l=>{ l.hip.rotation.x=0; l.knee.rotation.x=0; }); p.arms.forEach(a=>{ a.rotation.x=0; a.rotation.z=0; }); }
function sitPose(p,seatY){ p.body.position.y=(seatY||0.47)-0.74+0.02; p.legs.forEach(l=>{ l.hip.rotation.x=-Math.PI/2; l.knee.rotation.x=Math.PI/2; }); }
function freePoi(p){ if(p.poi){ p.poi.busy=null; p.poi=null; } }
const IS_HEAD=id=>Object.values(HEADS).includes(id);
function comiteOn(){ return inSched('ceo')||(OF.byId?.ceo&&agentWorking(OF.byId.ceo.a)); }
function goTo(p,act,dst,next){ freePoi(p); p.act=act; p.next=next; routeTo(p,dst); }
function decide(p){
  if(p.forced){ const f=p.forced; p.forced=null; goTo(p,f.act,f.dst,f.next); return; }
  const working=agentWorking(p.a);
  if((p.a.id==='ceo'&&working)||(IS_HEAD(p.a.id)&&p.a.id!=='ceo'&&comiteOn()&&!working)){
    if(p.act==='comite'&&p.mode==='sit'){ p.timer=6; return; }
    const seat=p.a.id==='ceo'?OF.comiteHead:OF.comite.find(s=>!s.busy||s.busy===p);
    if(seat){ freePoi(p); seat.busy=p; p.poi=seat; p.act='comite'; p.next={k:'sit',sitY:0.5}; routeTo(p,seat); return; } }
  if(working){ freePoi(p); if(p.act==='work'&&p.mode==='sit'){ p.timer=4; return; } p.act='work'; p.next={k:'seat'}; routeTo(p,p.desk.seat); return; }
  const r=Math.random(); let kind;
  if(r<0.36) kind='desk'; else if(r<0.52) kind='coffee'; else if(r<0.57) kind='water'; else if(r<0.65) kind='sofa'; else if(r<0.7) kind='arm'; else if(r<0.8) kind='visit'; else if(r<0.88) kind='pingpong'; else if(r<0.95) kind='window'; else kind='plant';
  freePoi(p);
  if(kind==='desk'){ p.act='desk'; p.next={k:'seat'}; routeTo(p,p.desk.seat); return; }
  if(kind==='visit'){ const mates=OF.people.filter(o=>o!==p&&o.mode==='sit'&&(o.act==='desk'||o.act==='work')&&(DEPT_OF[o.a.id]===DEPT_OF[p.a.id]||Math.random()<0.35));
    if(mates.length){ const o=mates[Math.floor(Math.random()*mates.length)]; p.with=o.a.id==='ceo'?MARCA.ceo:o.a.nick; visitPos(p,o,'visit'); return; } kind='coffee'; }
  const opts=OF.pois.filter(q=>q.k===kind&&!q.busy); if(!opts.length){ p.act='desk'; p.next={k:'seat'}; routeTo(p,p.desk.seat); return; }
  const q=opts[Math.floor(Math.random()*opts.length)]; q.busy=p; p.poi=q; p.act=kind; p.next={k:q.sit?'sit':'stand',ry:q.ry,sitY:q.sitY}; routeTo(p,q);
}
function visitPos(p,o,act){ const s=o.desk.seat, side=Math.random()<0.5?-1:1; const dst={x:s.x+0.78*side,z:s.z+(s.ry===0?-0.15:0.15)}; dst.ry=Math.atan2(s.x-dst.x,s.z-dst.z); p.act=act; p.next={k:'stand',ry:dst.ry}; routeTo(p,dst); }
function arrive(p){
  const d=p.dest; p.g.position.set(d.x,0,d.z); if(d.ry!=null) p.ry=d.ry;
  if(p.next.k==='seat'){ p.ry=p.desk.seat.ry; sitPose(p,0.47); p.mode='sit'; p.timer=agentWorking(p.a)?4:14+Math.random()*30; }
  else if(p.next.k==='sit'){ sitPose(p,p.next.sitY); p.mode='sit'; p.timer=p.act==='comite'?6:14+Math.random()*26; }
  else { standPose(p); p.mode='stand'; p.timer=p.act==='talk'?9:8+Math.random()*18; if(p.act==='coffee'||p.act==='water') p.cup.visible=true; if(p.say){ showBubble(p,p.say); p.say=null; } }
}
function stepPerson(p,dt,t){
  const ph=t+p.phase;
  if(p.mode==='walk'){
    const q=p.path[0]; if(!q){ arrive(p); return; }
    const dx=q.x-p.g.position.x, dz=q.z-p.g.position.z, dist=Math.hypot(dx,dz), sp=1.8*dt;
    const want=Math.atan2(dx,dz); let da=want-p.ry; da=Math.atan2(Math.sin(da),Math.cos(da)); p.ry+=da*Math.min(1,dt*10);
    if(dist<=sp){ p.g.position.x=q.x; p.g.position.z=q.z; p.path.shift(); } else { p.g.position.x+=dx/dist*sp; p.g.position.z+=dz/dist*sp; }
    const w=Math.sin(ph*9); p.legs[0].hip.rotation.x=w*0.55; p.legs[1].hip.rotation.x=-w*0.55; p.legs[0].knee.rotation.x=Math.max(0,-w)*0.7; p.legs[1].knee.rotation.x=Math.max(0,w)*0.7;
    p.arms[0].rotation.x=-w*0.5; p.arms[1].rotation.x=w*0.5; p.body.position.y=Math.abs(Math.cos(ph*9))*0.04; p.head.rotation.x=0; p.head.rotation.y=0;
  } else if(p.mode==='sit'){
    const typing=p.act==='work';
    if(p.act==='work'||p.act==='desk'){ const amp=typing?0.07:0.02, sp=typing?16:3; p.arms[0].rotation.x=-1.15+Math.sin(ph*sp)*amp; p.arms[1].rotation.x=-1.15+Math.sin(ph*sp+1.7)*amp;
      p.head.rotation.x=typing?0.12+Math.sin(ph*2)*0.03:Math.sin(ph*0.7)*0.06; p.head.rotation.y=typing?0:Math.sin(ph*0.4)*0.35; }
    else if(p.act==='comite'){ const talk=Math.sin(ph*0.6+p.phase)>0.4; p.arms[0].rotation.x=talk?-0.9+Math.sin(ph*5)*0.25:-0.6; p.arms[1].rotation.x=-0.6; p.head.rotation.y=Math.sin(ph*0.5)*0.6; }
    else { p.arms[0].rotation.x=-0.35; p.arms[1].rotation.x=-0.35+Math.max(0,Math.sin(ph*0.9))*-0.5; p.head.rotation.y=Math.sin(ph*0.5)*0.5; p.head.rotation.x=0; }
    p.timer-=dt; if(p.timer<=0) decide(p);
  } else {
    p.body.position.y=Math.sin(ph*1.6)*0.008;
    if(p.act==='pingpong'){ p.arms[1].rotation.x=-0.9+Math.sin(ph*4)*0.6; p.arms[1].rotation.z=Math.sin(ph*4)*0.3; p.arms[0].rotation.x=-0.3; }
    else if(p.cup.visible){ const s=Math.sin(ph*0.8); p.arms[1].rotation.x=s>0.6?-1.9:-0.5; p.arms[0].rotation.x=0; }
    else if(p.act==='talk'||p.act==='visit'){ const g=Math.max(0,Math.sin(ph*2.2)); p.arms[0].rotation.x=-g*1.0; p.arms[1].rotation.x=-Math.max(0,Math.sin(ph*2.2+2))*0.7; }
    else { p.arms[0].rotation.x=0; p.arms[1].rotation.x=0; }
    p.head.rotation.y=p.act==='talk'?0:Math.sin(ph*0.6)*0.4; p.timer-=dt; if(p.timer<=0) decide(p);
  }
  p.g.rotation.y=p.ry;
  if(p.mode!=='walk'&&p.act!=='work'&&p.act!=='comite'&&agentWorking(p.a)&&Math.random()<dt*0.8) decide(p);
  if(p.mode==='sit'&&p.act==='work'&&!agentWorking(p.a)){ p.act='desk'; p.timer=Math.min(p.timer,4); }
  if(p.mode==='sit'&&p.act==='comite'&&!(p.a.id==='ceo'?agentWorking(p.a):comiteOn())){ p.timer=Math.min(p.timer,2); p.act='desk'; }
  p.desk.screen.material=p.act==='work'&&p.mode==='sit'?OF.workMat:(p.mode==='sit'&&p.act==='desk')?OF.idleMat:OF.offMat;
  p.ring.material.opacity+=((OF.sel===p?0.9:0)-p.ring.material.opacity)*Math.min(1,dt*8);
  if(p.bub&&p.bub.visible){ p.bubT-=dt; if(p.bubT<1) p.bub.material.opacity=Math.max(0,p.bubT); if(p.bubT<=0) p.bub.visible=false; }
}
/* conversaciones reales: cada mensaje del canal de la empresa se ve en la oficina */

const CHARLA=[
  ['webleads','pipeline','Te paso un contacto nuevo de la web: pide presupuesto.'],
  ['pipeline','ceo','Respondido y con propuesta de llamada en su calendario.'],
  ['contenido','publicador','El artículo de hoy está listo para publicar.'],
  ['publicador','todos','Publicado en el blog y en LinkedIn.'],
  ['ceo','todos','Foco de hoy: contestar rápido a cada presupuesto.'],
  ['cs','produccion','Un cliente pide un cambio en su web, te lo apunto.'],
  ['analista','ceo','Resumen de ayer listo en el panel.'],
  ['ads','ceo','Campaña revisada: dentro del tope de gasto.'],
  ['seguimiento','redactor','Este contacto no ha contestado: toca segundo correo.'],
  ['finanzas','ceo','Facturas del mes apuntadas.'],
  ['seo','contenido','Te dejo dos temas nuevos para el blog.'],
  ['prospector','demos','Tres empresas nuevas para preparar demo.'],
];
function talkTick(){
  if(!OF.byId) return; OF.ti=(OF.ti||0)+1; const CH=MARCA.charla||CHARLA; const [from,toId,text]=CH[(OF.ti-1)%CH.length];
  const p=OF.byId[from]; const to=OF.byId[toId]||OF.byId[HEADS[toId]]||null; if(!p) return;
  const txt=(to&&to!==p?'@'+(to.a.id==='ceo'?MARCA.ceo:to.a.nick)+' ':toId==='todos'?'@todos ':'')+text;
  if(to&&to!==p&&p.act!=='work'&&p.act!=='comite'&&p.mode!=='walk'){ freePoi(p); p.with=to.a.id==='ceo'?MARCA.ceo:to.a.nick; p.say=txt; visitPos(p,to,'talk'); }
  else showBubble(p,txt);
}

function drawWork(){ const {g,t}=OF.workTex, w=256,h=160; g.fillStyle='#050a1f'; g.fillRect(0,0,w,h); g.fillStyle='#0047ff'; g.fillRect(0,0,w,14); g.fillStyle='#e5fc63'; g.fillRect(6,4,6,6);
  for(let i=0;i<14;i++){ const L=OF.code[(i+Math.floor(performance.now()/420))%OF.code.length]; g.fillStyle=L.c; g.globalAlpha=.85; g.fillRect(10+L.i*14,22+i*10,L.w,5); } g.globalAlpha=1; t.needsUpdate=true; }

function updateWall(){
  if(!OF.wall) return; const {g,t}=OF.wall, w=1024,h=560;
  const gr=g.createLinearGradient(0,0,w,h); gr.addColorStop(0,MARCA.pantallaA||'#071034'); gr.addColorStop(1,MARCA.pantallaB||'#0a1f6e'); g.fillStyle=gr; g.fillRect(0,0,w,h);
  g.fillStyle=MARCA.acentoCss||'#e5fc63'; g.beginPath(); g.arc(46,52,10,0,7); g.fill();
  g.font='600 26px "JetBrains Mono",monospace'; g.fillStyle='#cfd8ff'; g.textBaseline='middle'; g.fillText(MARCA.pantalla,70,53);
  const now=madridNow(); g.textAlign='right'; g.fillText(String(now.getHours()).padStart(2,'0')+':'+String(now.getMinutes()).padStart(2,'0'),w-40,53); g.textAlign='left';
  const n=OF.people?OF.people.filter(p=>agentWorking(p.a)).length:0, tot=OF.people?OF.people.length:AGENTS.length;
  g.fillStyle='#8d9ac4'; g.font='600 24px Inter,Arial'; g.fillText('AGENTES TRABAJANDO AHORA',44,128);
  g.fillStyle='#ffffff'; g.font='800 112px Archivo,Inter,Arial'; g.fillText(n+' / '+tot,40,210);
  g.fillStyle='#16224f'; g.fillRect(44,262,w-88,16); g.fillStyle='#0047ff'; g.fillRect(44,262,(w-88)*Math.min(1,n/tot),16);
  g.fillStyle='#8d9ac4'; g.font='500 22px Inter,Arial'; g.fillText('El resto, en la oficina esperando su turno',44,304);
  const deps=DEPTS.filter(d=>d.id!=='direccion');
  deps.forEach((d,i)=>{ const ps=OF.people?OF.people.filter(p=>DEPT_OF[p.a.id]===d.id):[], k=ps.filter(p=>agentWorking(p.a)).length; const x=44+i*((w-88)/4);
    g.fillStyle='#0b1847'; g.fillRect(x,340,(w-88)/4-14,170); g.fillStyle=d.color; g.font='800 76px Archivo,Inter,Arial'; g.fillText(String(k),x+20,420);
    g.fillStyle='#8d9ac4'; g.font='500 22px Inter,Arial'; g.fillText((MARCA.deptos[d.id]||d.name).split(' ')[0],x+20,480); });
  t.needsUpdate=true; }
function dayLight(){ const n=madridNow(), h=n.getHours()+n.getMinutes()/60; const day=h>=7.5&&h<19.5, dusk=(h>=19.5&&h<21)||(h>=6.5&&h<7.5);
  const col=day?(MARCA.ventana||0x9cc4ff):dusk?0x5a5fc0:0x101a4a; OF.windows.forEach(w=>w.material.color.setHex(col)); OF.hemi.intensity=(day?0.85:0.6)*Math.PI; OF.sun.intensity=(day?1.15:0.6)*Math.PI; OF.sun.color.setHex(day?0xffffff:0x9db8ff); }

/* Recorrido de cámara: pasa por las zonas de la oficina sin parar */
const RUTA=[{x:0,z:-0.4,zoom:1},{x:-10,z:2,zoom:0.72},{x:-5,z:-7,zoom:0.74},{x:12,z:-7.5,zoom:0.7},{x:12,z:6.5,zoom:0.74},{x:2,z:3,zoom:0.8}];

export function montarOficina(host,{quieto=false,marca=null,interactivo=false}={}){
  MARCA={...MARCA_BASE,...(marca||{})};
  OF={}; if(!initOffice(host)) return null;
  OF.uaz=0; OF.uel=0; OF.uz=1; let pausa=0;
  if(interactivo){ const cv=OF.renderer.domElement; let drag=null; cv.style.cursor='grab'; cv.style.touchAction='pan-y';
    cv.addEventListener('pointerdown',e=>{ drag={x:e.clientX,y:e.clientY,az:OF.uaz,el:OF.uel}; cv.setPointerCapture(e.pointerId); cv.style.cursor='grabbing'; pausa=12; });
    cv.addEventListener('pointermove',e=>{ if(!drag) return; OF.uaz=drag.az-(e.clientX-drag.x)*0.008; OF.uel=Math.max(-0.3,Math.min(0.5,drag.el+(e.clientY-drag.y)*0.004)); pausa=12; });
    cv.addEventListener('pointerup',()=>{ drag=null; cv.style.cursor='grab'; });
    cv.addEventListener('wheel',e=>{ if(!e.ctrlKey&&!e.metaKey) return; e.preventDefault(); OF.uz=Math.max(0.45,Math.min(1.6,OF.uz*(1+Math.sign(e.deltaY)*0.08))); pausa=12; },{passive:false});
    OF.zoomIn=()=>{ OF.uz=Math.max(0.45,OF.uz*0.85); pausa=12; }; OF.zoomOut=()=>{ OF.uz=Math.min(1.6,OF.uz*1.18); pausa=12; }; }
  const sizeOffice=()=>{ const w=host.clientWidth, h=host.clientHeight; OF.renderer.setSize(w,h,false); OF.aspect=w/Math.max(1,h); };
  const ro=new ResizeObserver(sizeOffice); ro.observe(host); sizeOffice();
  let visible=true; const io=new IntersectionObserver(([e])=>{ visible=e.isIntersecting; }); io.observe(host);
  OF.people.forEach(p=>{ if(agentWorking(p.a)){ p.act='work'; } });
  updateWall(); dayLight(); OF.people.forEach(labelTex);
  const iv1=setInterval(()=>{ if(visible&&!document.hidden){ updateWall(); OF.people.forEach(labelTex); dayLight(); } },1000);
  const iv2=setInterval(()=>{ if(visible&&!document.hidden) talkTick(); },4500);
  setTimeout(()=>{ if(OF.byId) talkTick(); },1200);
  let raf=0, camT=0;
  const loop=()=>{
    raf=requestAnimationFrame(loop);
    if(!visible||document.hidden){ OF.clock.getDelta(); return; }
    const dt=Math.min(0.05,OF.clock.getDelta()), t=OF.clock.elapsedTime;
    OF.people.forEach(p=>stepPerson(p,dt,t));
    if(Math.floor(t*8)!==OF.lastCode){ OF.lastCode=Math.floor(t*8); drawWork(); }
    const pl=OF.pois.filter(q=>q.k==='pingpong'&&q.busy&&q.busy.mode==='stand'&&q.busy.act==='pingpong');
    if(pl.length===2){ OF.ball.visible=true; const s=(Math.sin(t*4)+1)/2; OF.ball.position.set(10.9+s*2.6,0.85+Math.abs(Math.sin(t*8))*0.35,4.4+Math.sin(t*2)*0.3); } else OF.ball.visible=false;
    if(pausa>0) pausa-=dt; else if(!quieto) camT+=dt;
    const a=OF.aspect||1.6, base=a<1?15:a<1.4?12:Math.max(10.5,18.5/a);
    const seg=9, k=camT/seg, i=Math.floor(k)%RUTA.length, f=k-Math.floor(k), e=f<0.35?0:(f-0.35)/0.65, s=e*e*(3-2*e);
    const A=RUTA[i], B=RUTA[(i+1)%RUTA.length], zm=A.zoom+(B.zoom-A.zoom)*s;
    OF.tgt.set(A.x+(B.x-A.x)*s,1.0,A.z+(B.z-A.z)*s); if(camT===0) OF.target.copy(OF.tgt); else OF.target.lerp(OF.tgt,Math.min(1,dt*2));
    OF.az=Math.PI/4.6+Math.sin(camT*0.07)*0.42+OF.uaz; OF.el=Math.max(0.3,Math.min(1.25,0.62+Math.sin(camT*0.05)*0.08+OF.uel));
    const c=OF.cam, z=base*(a<1?Math.max(zm,0.85):zm)*OF.uz; c.left=-z*a; c.right=z*a; c.top=z; c.bottom=-z; c.updateProjectionMatrix();
    const R=50; c.position.set(OF.target.x+R*Math.cos(OF.el)*Math.sin(OF.az),R*Math.sin(OF.el),OF.target.z+R*Math.cos(OF.el)*Math.cos(OF.az)); c.lookAt(OF.target);
    OF.renderer.render(OF.scene,c);
  };
  loop();
  const off=()=>{ cancelAnimationFrame(raf); clearInterval(iv1); clearInterval(iv2); ro.disconnect(); io.disconnect();
    OF.scene.traverse(o=>{ if(o.geometry) o.geometry.dispose(); const m=o.material; if(m){ (Array.isArray(m)?m:[m]).forEach(x=>{ if(x.map) x.map.dispose(); x.dispose(); }); } });
    OF.renderer.dispose(); OF.renderer.domElement.remove(); OF={}; };
  off.zoom=(k)=>{ if(k<0) OF.zoomIn?.(); else OF.zoomOut?.(); };
  return off;
}
