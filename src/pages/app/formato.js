// Utilidades de formato y estado compartidas por el panel (sin componentes).
import { Headphones, CalendarCheck, Handshake, Megaphone, Star, PenLine, MessageCircle, Sparkles, Clapperboard, FileText, AlertTriangle } from 'lucide-react';
import { DEPTO } from '../../data/oficinaSaas';
import { HERRAMIENTAS } from './conexiones';

export const ICONO = { atencion: Headphones, citas: CalendarCheck, ventas: Handshake, redes: Megaphone, google: Star, contenido: PenLine };
export const fmt = (n, d = 0) => Number(n || 0).toLocaleString('es-ES', { maximumFractionDigits: d, minimumFractionDigits: d });
export const hora = (d) => new Date(d).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
export const diaLargo = (d) => { const t = new Date(d).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' }); return t[0].toUpperCase() + t.slice(1); };
export function hace(d) {
  const s = (Date.now() - new Date(d).getTime()) / 1000;
  if (s < 60) return 'ahora'; if (s < 3600) return `hace ${Math.floor(s / 60)} min`; if (s < 86400) return `hace ${Math.floor(s / 3600)} h`;
  const dias = Math.floor(s / 86400); return dias === 1 ? 'ayer' : `hace ${dias} días`;
}
export const duracion = (min) => (min < 60 ? `${Math.round(min)} min` : `${fmt(min / 60, min < 600 ? 1 : 0)} h`);

// Estado en directo de un agente (lo que se enseña en su tarjeta).
export function estadoDe({ depto, agente, ajustes, conexiones, eventos, ahora }) {
  const necesita = HERRAMIENTAS.filter((h) => h.deptos.includes(depto) && h.proveedor !== 'clave');
  const conectado = depto === 'redes' || depto === 'contenido' || necesita.some((h) => conexiones.some((c) => c.herramienta === h.id && c.estado === 'conectada'));
  const ultimo = eventos.find((e) => e.depto === depto && e.tipo !== 'sistema');
  if (ajustes?.pausado) return { clave: 'pausa', txt: 'En pausa', tarea: 'No hará nada hasta que lo reactives' };
  if (agente?.estado === 'trabajando' && ahora - new Date(agente.actualizado).getTime() < 3 * 60e3) return { clave: 'trabajando', txt: 'Trabajando', tarea: agente.tarea };
  if (!conectado) return { clave: 'espera', txt: 'Esperando conexión', tarea: `Conecta ${necesita.map((h) => h.nombre).slice(0, 2).join(' o ')} para que empiece` };
  if (agente?.estado === 'preparando') return { clave: 'espera', txt: 'Preparado', tarea: 'Empieza en cuanto le cuentes cómo es tu negocio' };
  return { clave: 'listo', txt: 'Disponible', tarea: ultimo ? `Último: ${ultimo.texto.replace(/^Ha /, 'ha ')}` : 'Esperando su primera tarea', cuando: ultimo?.creado };
}


export const CAMPOS = [
  ['sector', 'A qué te dedicas', 'Peluquería y estética'], ['horarios', 'Tu horario', 'L-V 9:30-20:00 · S 9:00-14:00'],
  ['direccion', 'Dirección', 'Carrer…, Cornellà de Llobregat'], ['telefono', 'Teléfono', '600 000 000'],
  ['precios', 'Servicios y precios', 'Corte 18 € · Tinte desde 35 €…', true], ['tono', 'Cómo hablas con tus clientes', 'Cercano, de tú, con algún emoji'],
  ['instrucciones', 'Lo que nunca deben hacer o decir', 'No dar descuentos. No confirmar citas sin mirar la agenda…', true],
];

// Sección del panel de cada departamento.
export const SECCION_DE = { citas: 'agenda', ventas: 'clientes', redes: 'publicaciones', google: 'resenas', contenido: 'articulos', atencion: 'conversaciones' };

export const uid = (p = 'x') => `${p}${Date.now()}${Math.random().toString(36).slice(2, 6)}`;

// ---------- tipos de lo que te necesita ----------
export function tipoDe(e) {
  const a = e.detalle?.accion;
  if (a === 'publicar') return 'post';
  if (a === 'responder_resena') return 'resena';
  if (a === 'articulo') return 'articulo';
  if (a === 'video') return 'video';
  if (a === 'seguimiento') return 'seguimiento';
  if (e.depto === 'citas') return 'cita';
  if (e.detalle?.conversacion) return 'conversacion';
  return 'aviso';
}
export const TIPOS = {
  conversacion: { t: 'Clientes que te esperan', s: 'Tu agente te ha pasado la conversación', I: MessageCircle, c: '#e5484d' },
  cita: { t: 'Citas por confirmar', s: 'Confírmalas y se les avisa solo', I: CalendarCheck, c: '#7c5cff' },
  post: { t: 'Publicaciones para aprobar', s: 'Revisa y se publican solas', I: Sparkles, c: '#ff6b5a' },
  video: { t: 'Vídeos para revisar', s: 'Guion listo: elige la voz y apruébalo', I: Clapperboard, c: '#ff6b5a' },
  resena: { t: 'Reseñas delicadas', s: 'Mejor responder en menos de 24 h', I: Star, c: '#e0a100' },
  articulo: { t: 'Artículos para el blog', s: 'Revisa y se publican en tu web', I: FileText, c: '#14a3a3' },
  seguimiento: { t: 'Seguimientos listos', s: 'Mensaje escrito: solo pulsa Enviar', I: Handshake, c: '#14995a' },
  aviso: { t: 'Avisos', s: 'Cosas que conviene que sepas', I: AlertTriangle, c: '#d97a06' },
};

