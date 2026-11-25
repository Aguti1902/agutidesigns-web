// Opciones de personalización de la oficina 3D (compartidas por el editor y la escena).
export const NOMBRES_AG = { ceo: 'Tú', prospector: 'Bruno', demos: 'Lía', redactor: 'Hugo', seguimiento: 'Vera', recontacto: 'Teo', finanzas: 'Max', cartera: 'Oriol', semanal: 'Iris', resumen: 'Clara', webleads: 'Nora', pipeline: 'Sara', contenido: 'Marta', publicador: 'Pablo', analista: 'Leo', ads: 'Álex', cs: 'Elena', produccion: 'Diego', seo: 'Rafa' };
// El agente que representa a cada departamento contratado.
export const AGENTE_DE = { atencion: 'seguimiento', citas: 'demos', ventas: 'pipeline', redes: 'publicador', google: 'cs', contenido: 'contenido' };
export const TEMAS = [
  { id: 'agutidesigns', t: 'Noche', c: { pared: '#0b1433', pared2: '#101c48', suelo: '#e9ecf3', acento: '#0047ff', detalle: '#e5fc63' }, e: { suelo: 'liso', pared: 'liso', techo: false } },
  { id: 'claro', t: 'Luminosa', c: { pared: '#e9e6df', pared2: '#d9d4c9', suelo: '#d8c3a5', acento: '#2f6bff', detalle: '#ffb547' }, e: { suelo: 'parquet', pared: 'liso' } },
  { id: 'industrial', t: 'Industrial', c: { pared: '#8a4b34', pared2: '#7a4330', suelo: '#9a9a96', acento: '#f2a541', detalle: '#f2a541' }, e: { suelo: 'hormigon', pared: 'ladrillo', techo: true, lamparas: true } },
  { id: 'madera', t: 'Madera cálida', c: { pared: '#6e4a35', pared2: '#5b3a29', suelo: '#d9b48f', acento: '#c56a2d', detalle: '#f4d35e' }, e: { suelo: 'parquet', pared: 'madera' } },
  { id: 'verde', t: 'Natural', c: { pared: '#1f3d2f', pared2: '#2b5240', suelo: '#e8efe6', acento: '#3ea36b', detalle: '#e5fc63' }, e: { suelo: 'baldosa', pared: 'paneles' } },
  { id: 'rosa', t: 'Salón de belleza', c: { pared: '#f3d6dc', pared2: '#ecc3cc', suelo: '#fbf3f4', acento: '#d14d72', detalle: '#ffd1dc' }, e: { suelo: 'marmol', pared: 'rayas' } },
  { id: 'negro', t: 'Elegante', c: { pared: '#111111', pared2: '#1c1c1c', suelo: '#e8e4dc', acento: '#c9a24a', detalle: '#c9a24a' }, e: { suelo: 'marmol', pared: 'paneles' } },
  { id: 'clinica', t: 'Clínica', c: { pared: '#eef3f7', pared2: '#e1e9f0', suelo: '#f7fafc', acento: '#1aa3a3', detalle: '#7fd6c2' }, e: { suelo: 'baldosa', pared: 'liso' } },
];
export const SUELOS = [['liso', 'Liso'], ['parquet', 'Parqué'], ['baldosa', 'Baldosa'], ['marmol', 'Mármol'], ['hormigon', 'Hormigón'], ['moqueta', 'Moqueta'], ['ajedrez', 'Ajedrez']];
export const PAREDES = [['liso', 'Lisa'], ['ladrillo', 'Ladrillo'], ['madera', 'Madera'], ['paneles', 'Paneles'], ['hormigon', 'Hormigón'], ['rayas', 'Rayas']];
export const MUEBLES = [
  ['recepcion', 'Recepción', 'Mostrador a la entrada'], ['plantas', 'Plantas'], ['arbol', 'Árbol grande'], ['sofa', 'Sofá y zona de descanso'],
  ['cocina', 'Cocina y cafetera'], ['vending', 'Máquina de café y snacks'], ['agua', 'Fuente de agua'], ['pingpong', 'Mesa de ping-pong'],
  ['futbolin', 'Futbolín'], ['cuadros', 'Cuadros en la pared', 'Puedes poner tus fotos en «Tu marca»'], ['estanteria', 'Estantería'],
];
export const MUEBLES_DEF = { plantas: true, sofa: true, pingpong: true, cocina: true, agua: true, cuadros: false, estanteria: false, recepcion: false, futbolin: false, vending: false, arbol: false };
