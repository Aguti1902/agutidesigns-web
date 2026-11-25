// Editor de la oficina 3D: estilo, estructura del local, mobiliario y marca del cliente.
import { useState } from 'react';
import { X, Palette, Building2, Sofa, BadgeCheck, Users } from 'lucide-react';
import { DEPTO } from '../../data/oficinaSaas';
import { supabase } from '../../lib/oficinaSupabase';
import { TEMAS, MUEBLES, MUEBLES_DEF, SUELOS, PAREDES, AGENTE_DE, NOMBRES_AG } from './oficinaOpciones';

const COLORES = [['pared', 'Paredes'], ['suelo', 'Suelo'], ['acento', 'Color principal'], ['detalle', 'Detalles']];
const PESTANAS = [['estilo', 'Estilo', <Palette key="i" size={15} />], ['local', 'Local', <Building2 key="i" size={15} />], ['muebles', 'Muebles', <Sofa key="i" size={15} />], ['marca', 'Tu marca', <BadgeCheck key="i" size={15} />], ['equipo', 'Equipo', <Users key="i" size={15} />]];

function Opciones({ valor, opciones, cambiar, cols = 3 }) {
  return (
    <div className="ed-op" style={{ '--cols': cols }}>
      {opciones.map(([v, t, muestra]) => (
        <button key={String(v)} type="button" className={valor === v ? 'is-on' : ''} onClick={() => cambiar(v)}>
          {muestra && <i style={{ background: muestra }} />}{t}
        </button>
      ))}
    </div>
  );
}
function Interruptor({ on, cambiar, titulo, sub }) {
  return <label className="sw"><input type="checkbox" checked={!!on} onChange={(e) => cambiar(e.target.checked)} /><span /><div><b>{titulo}</b>{sub && <small>{sub}</small>}</div></label>;
}

export function EditorOficina({ o, cfg, setCfg, cerrar }) {
  const [st, setSt] = useState(''); const [tab, setTab] = useState('estilo');
  const col = { ...TEMAS[0].c, ...(cfg.colores || {}) }; const mu = { ...MUEBLES_DEF, ...(cfg.muebles || {}) };
  const est = cfg.estructura || {}; const fotos = cfg.fotos || [];
  const cambia = (c) => setCfg({ ...cfg, ...c });
  const cEst = (c) => cambia({ estructura: { ...est, ...c } });
  const tieneLogo = cfg.logo_ruta || cfg.logo_data;

  async function guardar() {
    setSt('Guardando…');
    try {
      if (!o.demo) { const { error } = await supabase.from('of_negocios').update({ oficina: cfg }).eq('id', o.negocio.id); if (error) throw error; }
      o.setEstado((s) => ({ ...s, negocio: { ...s.negocio, oficina: cfg } })); setSt('Guardado.'); setTimeout(cerrar, 700);
    } catch { setSt('No se ha podido guardar.'); }
  }
  // Sube una imagen: en la demo (o si pesa mucho) se guarda en el navegador; si no, en tu carpeta privada.
  async function subir(f, tipo) {
    if (!f) return null;
    if (o.demo || f.size > 5e6) return new Promise((ok) => { const r = new FileReader(); r.onload = () => ok({ data: r.result }); r.readAsDataURL(f); });
    const ruta = `${o.negocio.id}/${tipo}-${crypto.randomUUID()}.${(f.name.split('.').pop() || 'png').toLowerCase()}`;
    const { error } = await supabase.storage.from('oficina-material').upload(ruta, f, { contentType: f.type });
    if (error) return null;
    await supabase.from('of_material').insert({ negocio_id: o.negocio.id, nombre: f.name, tipo: tipo === 'logo-oficina' ? 'logo' : 'foto', ruta, tamano: f.size });
    return { ruta };
  }
  async function subirLogo(f) {
    setSt('Subiendo logo…'); const r = await subir(f, 'logo-oficina');
    if (!r) { setSt('No se ha podido subir.'); return; }
    cambia({ logo_ruta: r.ruta, logo_data: r.data, logo_color: cfg.logo_color || 'original' }); setSt('Logo listo. Pulsa «Guardar».');
  }
  async function subirFoto(f, i) {
    setSt('Subiendo foto…'); const r = await subir(f, 'foto-oficina');
    if (!r) { setSt('No se ha podido subir.'); return; }
    const n = [...fotos]; n[i] = r; cambia({ fotos: n, muebles: { ...mu, cuadros: true } }); setSt('');
  }

  return (
    <aside className="ed" aria-label="Personaliza tu oficina">
      <header><b>Personaliza tu oficina</b><button className="ico" onClick={cerrar} aria-label="Cerrar"><X size={18} /></button></header>
      <nav className="ed-tabs" aria-label="Apartados">
        {PESTANAS.map(([k, t, ic]) => <button key={k} type="button" className={tab === k ? 'is-on' : ''} onClick={() => setTab(k)}>{ic}{t}</button>)}
      </nav>

      {tab === 'estilo' && <>
        <section><h3>Estilo de partida</h3><div className="ed-temas">{TEMAS.map((t) => (
          <button key={t.id} className={JSON.stringify(t.c) === JSON.stringify(col) ? 'is-on' : ''} onClick={() => cambia({ colores: t.c, estructura: { ...est, ...t.e } })}>
            <span>{['pared', 'suelo', 'acento', 'detalle'].map((k) => <i key={k} style={{ background: t.c[k] }} />)}</span>{t.t}</button>
        ))}</div></section>
        <section><h3>Colores</h3><div className="ed-col">{COLORES.map(([k, t]) => (
          <label key={k}><input type="color" value={col[k]} onChange={(e) => cambia({ colores: { ...col, [k]: e.target.value, ...(k === 'pared' ? { pared2: e.target.value } : {}) } })} /><span>{t}</span></label>
        ))}</div></section>
        <section><h3>Luz</h3>
          <Opciones valor={cfg.luz || 'neutra'} cambiar={(v) => cambia({ luz: v })} opciones={[['calida', 'Cálida', '#ffd9a0'], ['neutra', 'Neutra', '#ffffff'], ['fria', 'Fría', '#d6e4ff']]} />
          <label className="ed-rango"><span>Brillo</span><input type="range" min="0.7" max="1.3" step="0.05" value={cfg.brillo || 1} onChange={(e) => cambia({ brillo: +e.target.value })} /></label>
          <Interruptor on={est.lamparas} cambiar={(v) => cEst({ lamparas: v })} titulo="Lámparas colgantes" sub="Luz cálida sobre las mesas" />
        </section>
      </>}

      {tab === 'local' && <>
        <section><h3>Suelo</h3><Opciones valor={est.suelo || 'liso'} cambiar={(v) => cEst({ suelo: v })} opciones={SUELOS} /></section>
        <section><h3>Paredes</h3><Opciones valor={est.pared || 'liso'} cambiar={(v) => cEst({ pared: v })} opciones={PAREDES} />
          <Interruptor on={est.zocalo !== false} cambiar={(v) => cEst({ zocalo: v })} titulo="Zócalo" />
          <Interruptor on={est.paredDcha} cambiar={(v) => cEst({ paredDcha: v })} titulo="Cerrar el lado derecho" sub="Añade una tercera pared" /></section>
        <section><h3>Altura del techo</h3><Opciones valor={est.altura || 'normal'} cambiar={(v) => cEst({ altura: v })} opciones={[['baja', 'Baja'], ['normal', 'Normal'], ['alta', 'Loft alto']]} />
          <Interruptor on={est.techo} cambiar={(v) => cEst({ techo: v })} titulo="Vigas en el techo" sub="Estilo industrial" />
          <Interruptor on={est.columnas} cambiar={(v) => cEst({ columnas: v })} titulo="Columnas" /></section>
        <section><h3>Ventanas</h3>
          <Opciones valor={est.ventanas ?? 3} cambiar={(v) => cEst({ ventanas: v })} cols={6} opciones={[[0, '0'], [1, '1'], [2, '2'], [3, '3'], [4, '4'], [5, '5']]} />
          <Interruptor on={est.ventanal} cambiar={(v) => cEst({ ventanal: v })} titulo="Ventanales de suelo a techo" />
          <Interruptor on={est.ventanasFondo} cambiar={(v) => cEst({ ventanasFondo: v })} titulo="Ventanas también al fondo" /></section>
        <section><h3>Despachos y sala de reuniones</h3>
          <Opciones valor={est.despachos || 'cristal'} cambiar={(v) => cEst({ despachos: v })} cols={2} opciones={[['cristal', 'De cristal'], ['madera', 'De madera'], ['pared', 'Pared opaca'], ['ninguno', 'Planta abierta']]} /></section>
        <section><h3>Zonas de cada departamento</h3><Interruptor on={est.zonas !== false} cambiar={(v) => cEst({ zonas: v })} titulo="Alfombras y nombres en el suelo" /></section>
      </>}

      {tab === 'muebles' && <>
        <section><h3>Mesas</h3><Opciones valor={est.mesas || 'blanca'} cambiar={(v) => cEst({ mesas: v })} cols={2} opciones={[['blanca', 'Blancas', '#f6f8fc'], ['madera', 'Madera', '#c9a27a'], ['negra', 'Negras', '#2a2d36'], ['color', 'Tu color', col.acento]]} /></section>
        <section><h3>Sillas</h3><Opciones valor={est.sillas || 'departamento'} cambiar={(v) => cEst({ sillas: v })} cols={2} opciones={[['departamento', 'Color de su departamento'], ['marca', 'Tu color', col.acento], ['negro', 'Negras', '#0a0d18'], ['blanco', 'Blancas', '#f2f2f2']]} /></section>
        <section><h3>Qué hay en tu oficina</h3><div className="ed-mu">{MUEBLES.map(([k, t, sub]) => (
          <Interruptor key={k} on={mu[k]} cambiar={(v) => cambia({ muebles: { ...mu, [k]: v } })} titulo={t} sub={sub} />
        ))}</div></section>
      </>}

      {tab === 'marca' && <>
        <section><h3>Tu logo</h3>
          <label className="ed-logo"><input type="file" accept="image/png,image/svg+xml,image/jpeg,image/webp" onChange={(e) => subirLogo(e.target.files?.[0])} />
            {cfg.logo_data && <img src={cfg.logo_data} alt="" />}<span>{tieneLogo ? 'Cambiar logo' : 'Subir logo (mejor PNG con fondo transparente)'}</span></label>
          {tieneLogo && <>
            <Opciones valor={cfg.logo_color || 'original'} cambiar={(v) => cambia({ logo_color: v })} opciones={[['original', 'Sus colores'], ['#ffffff', 'Blanco', '#ffffff'], ['acento', 'Tu color', col.acento]]} />
            <button className="enlace enlace--gris" onClick={() => cambia({ logo_ruta: undefined, logo_data: undefined })}>Quitar logo y poner el nombre</button>
          </>}
          <h3>Tamaño</h3><Opciones valor={cfg.logo_tam || 'M'} cambiar={(v) => cambia({ logo_tam: v })} opciones={[['S', 'Pequeño'], ['M', 'Mediano'], ['L', 'Grande']]} />
          <h3>Dónde se ve</h3>
          <Interruptor on={cfg.logo_pared !== false} cambiar={(v) => cambia({ logo_pared: v })} titulo="En la pared principal" />
          <Interruptor on={cfg.logo_suelo} cambiar={(v) => cambia({ logo_suelo: v })} titulo="Grande en el suelo" />
          <Interruptor on={cfg.logo_recepcion} cambiar={(v) => cambia({ logo_recepcion: v, muebles: { ...mu, recepcion: v || mu.recepcion } })} titulo="En el mostrador de recepción" />
        </section>
        <section><h3>Letrero de neón</h3>
          <label className="campo"><span>Texto</span><input value={cfg.neon || ''} maxLength={28} onChange={(e) => cambia({ neon: e.target.value })} placeholder="Ej.: Hecho con cariño" /></label>
          {cfg.neon && <label className="ed-col"><label><input type="color" value={cfg.neon_color || '#ff3df0'} onChange={(e) => cambia({ neon_color: e.target.value })} /><span>Color del neón</span></label></label>}
        </section>
        <section><h3>Tus fotos en los cuadros</h3><div className="ed-fotos">{[0, 1, 2].map((i) => (
          <label key={i} className="ed-foto"><input type="file" accept="image/png,image/jpeg,image/webp" onChange={(e) => subirFoto(e.target.files?.[0], i)} />
            {fotos[i]?.data ? <img src={fotos[i].data} alt="" /> : fotos[i]?.ruta ? <b>Foto {i + 1} ✓</b> : <span>+ Foto {i + 1}</span>}</label>
        ))}</div>{fotos.some(Boolean) && <button className="enlace enlace--gris" onClick={() => cambia({ fotos: [] })}>Quitar las fotos</button>}</section>
        <section><h3>Rótulos</h3>
          <label className="campo"><span>Placa del despacho</span><input value={cfg.placa || ''} maxLength={18} onChange={(e) => cambia({ placa: e.target.value })} placeholder={o.negocio.nombre.toUpperCase().slice(0, 18)} /></label>
          <label className="campo"><span>Frase de la pared</span><input value={cfg.lema || ''} maxLength={34} onChange={(e) => cambia({ lema: e.target.value })} placeholder={o.negocio.sector || 'Tu lema'} /></label>
          <label className="campo"><span>Pantalla grande</span><input value={cfg.pantalla || ''} maxLength={30} onChange={(e) => cambia({ pantalla: e.target.value })} placeholder={`${o.negocio.nombre.toUpperCase().slice(0, 16)} · EN DIRECTO`} /></label>
          <label className="campo"><span>Pizarra</span><input value={cfg.pizarra || ''} maxLength={26} onChange={(e) => cambia({ pizarra: e.target.value })} placeholder="Hoy en la oficina" /></label></section>
      </>}

      {tab === 'equipo' && <section><h3>Ponle nombre a tu equipo</h3>
        <p className="muted" style={{ fontSize: '.86rem' }}>Es el nombre que verás sobre su cabeza y en lo que se dicen entre ellos.</p>
        {o.deptos.map(({ depto }) => (
          <label key={depto} className="campo"><span>{DEPTO[depto].nombre}</span>
            <input value={cfg.nombres?.[AGENTE_DE[depto]] || ''} maxLength={14} onChange={(e) => cambia({ nombres: { ...(cfg.nombres || {}), [AGENTE_DE[depto]]: e.target.value } })} placeholder={NOMBRES_AG[AGENTE_DE[depto]]} /></label>
        ))}</section>}

      <footer><button className="btn btn--pri btn--ancho" onClick={guardar}>Guardar mi oficina</button><button className="btn btn--fan btn--ancho" onClick={() => setCfg({})}>Volver al diseño original</button>{st && <small className="muted">{st}</small>}</footer>
    </aside>
  );
}
