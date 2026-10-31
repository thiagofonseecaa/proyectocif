import Link from 'next/link';
import MarcaSeguridad from './MarcaSeguridad';
import { CORREO_SOPORTE, FECHA_CONDICIONES } from '../../lib/condiciones';
type Seccion = { id: string; titulo: string; parrafos: string[] };
export default function PaginaInformacion({ titulo, introduccion, resumen, secciones }: { titulo: string; introduccion: string; resumen: string[]; secciones: Seccion[] }) {
  return <main className="cuenta-shell informacion-shell min-h-dvh text-slate-100">
    <header><Link href="/" aria-label="Entre Claves, ir al inicio"><MarcaSeguridad compacta /></Link><Link href="/">Volver al inicio →</Link></header>
    <article><div className="informacion-hero"><span>TRANSPARENCIA Y CONFIANZA</span><h1>{titulo}</h1><p>{introduccion}</p><small>Vigente desde el {FECHA_CONDICIONES}</small></div>
      <aside className="informacion-resumen" aria-label="Información principal"><h2>Lo esencial</h2><ul>{resumen.map(texto => <li key={texto}>{texto}</li>)}</ul></aside>
      <nav className="informacion-indice" aria-label="Contenido de esta página">{secciones.map(s => <a key={s.id} href={'#' + s.id}>{s.titulo}</a>)}</nav>
      <div className="informacion-secciones">{secciones.map(s => <section key={s.id} id={s.id}><h2>{s.titulo}</h2>{s.parrafos.map(p => <p key={p}>{p}</p>)}</section>)}</div>
      <aside className="informacion-contacto"><h2>¿Necesitás ayuda?</h2><p>Para consultas de soporte y privacidad, escribinos a <a href={'mailto:' + CORREO_SOPORTE}>{CORREO_SOPORTE}</a>.</p><small>No envíes contraseñas, claves de conversación ni códigos del autenticador.</small></aside>
      <footer><p>Entre Claves · Proyecto educativo de mensajería cifrada</p><nav aria-label="Información del servicio"><Link href="/ayuda">Ayuda y contacto</Link><Link href="/terminos">Términos de uso</Link><Link href="/privacidad">Privacidad y uso de datos</Link><Link href="/">Volver al inicio</Link></nav></footer>
    </article>
  </main>;
}
