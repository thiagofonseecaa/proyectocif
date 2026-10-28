export function IconoChat({ tipo, size = 20 }: { tipo: 'candado' | 'enviar' | 'ajustes' | 'agregar'; size?: number }) {
  return <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    {tipo === 'candado' ? <><rect x="5" y="10" width="14" height="11" rx="3" /><path d="M8 10V6a4 4 0 0 1 8 0v4m-4 5v2" /></> : tipo === 'enviar' ? <><path d="m3 3 19 9-19 9 4-9zM7 12h15" /></> : tipo === 'agregar' ? <><circle cx="9" cy="7" r="4" /><path d="M2 21v-2a7 7 0 0 1 12-5m5-4v8m-4-4h8" /></> : <><path d="M4 7h16M4 17h16" /><circle cx="9" cy="7" r="3" fill="currentColor" stroke="none" /><circle cx="15" cy="17" r="3" fill="currentColor" stroke="none" /></>}
  </svg>;
}

export function AvatarChat({ nombre, grupo = false, online = false }: { nombre: string; grupo?: boolean; online?: boolean }) {
  const palabras = nombre.trim().split(/[\s._-]+/).filter(Boolean);
  const iniciales = palabras.length > 1 ? palabras[0][0] + palabras[1][0] : nombre.slice(0, 2);
  let tono = 0;
  for (const letra of nombre) tono = (tono + letra.charCodeAt(0)) % 4;
  return <span aria-hidden="true" className={`chat-avatar chat-avatar-${grupo ? 'grupo' : tono}`}>
    {iniciales.toUpperCase() || '?'}{online && <i className="chat-presencia" />}
  </span>;
}

export function fechaActividad(value?: string | null): string {
  if (!value) return '';
  const fecha = new Date(value);
  if (Number.isNaN(fecha.getTime())) return '';
  const hoy = new Date();
  const ayer = new Date(hoy); ayer.setDate(hoy.getDate() - 1);
  if (fecha.toDateString() === hoy.toDateString()) return fecha.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
  if (fecha.toDateString() === ayer.toDateString()) return 'Ayer';
  return fecha.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' });
}
