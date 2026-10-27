export const formatDate = (d) => new Date(d).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
