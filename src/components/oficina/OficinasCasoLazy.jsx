import { OficinaMarca, BloqueOficinas } from './OficinasCaso';
import './OficinasCaso.css';

export default function OficinasCasoLazy({ caso }) {
  if (caso.oficinas) return <BloqueOficinas caso={caso} />;
  return <OficinaMarca marca={caso.marca} titulo={`${caso.nombre} · equipo digital`} fondo={caso.fondo} color={caso.marca.acentoCss || "#e3d3b5"} />;
}
