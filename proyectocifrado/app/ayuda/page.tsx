import type { Metadata } from 'next';
import Link from 'next/link';
import MarcaSeguridad from '../componentes/MarcaSeguridad';
import { CORREO_SOPORTE } from '../../lib/condiciones';

export const metadata: Metadata = { title: 'Ayuda y contacto | Entre Claves', description: 'Cómo empezar, abrir conversaciones, enviar archivos y proteger tu acceso a Entre Claves.' };

const preguntas = [
  { id: 'conversaciones', titulo: 'Conversaciones y contactos', items: [
    ['¿Cómo empiezo a conversar?', 'Iniciá sesión y elegí Agregar contacto. Escribí el correo completo de una persona registrada y enviá la solicitud. Cuando la acepte en Solicitudes, aparecerá en Chats. Antes de conversar, acuerden las dos claves por un medio de confianza.'],
    ['¿Qué claves tengo que ingresar al abrir un chat?', 'Las dos claves que acordaste con la otra persona. Son distintas de la contraseña de tu cuenta. En un grupo, todos los integrantes deben usar las mismas dos claves. Para conversaciones nuevas, elijan frases largas y distintas.'],
    ['¿Qué pasa si olvido las claves del chat?', 'Pedí las claves originales a otro integrante de la conversación por un medio de confianza. Recuperar la contraseña de acceso no recupera las claves del chat. Escribir otras claves no cambia las de los mensajes anteriores.'],
    ['¿Cómo creo un grupo?', 'Entrá en Grupos, elegí Crear grupo, escribí un nombre y seleccioná contactos para invitar. Cada persona debe aceptar la invitación en Solicitudes. Desde Información del grupo, los administradores pueden gestionar su nombre, integrantes e invitaciones.'],
  ] },
  { id: 'acceso', titulo: 'Acceso y seguridad', items: [
    ['¿No puedo iniciar sesión?', 'Revisá que el correo y la contraseña sean correctos. Si acabás de registrarte y recibiste un correo de confirmación, abrí ese enlace antes de ingresar. Si olvidaste la contraseña, solicitá un enlace nuevo desde Olvidé mi contraseña. Revisá también spam.'],
    ['¿De dónde sale el código de seis números?', 'Lo genera la aplicación autenticadora que vinculaste al activar la verificación en dos pasos, como Contraseñas en iPhone o una aplicación TOTP compatible. Ingresá el código actual de la cuenta correspondiente a Entre Claves. No se envía por correo.'],
    ['¿Qué hago si el código no funciona?', 'Comprobá que elegiste la cuenta correcta en tu autenticador y que tu dispositivo tenga la hora automática. Si el código está por cambiar, esperá el siguiente. Si perdiste el autenticador principal, usá el de respaldo, si lo configuraste. Si no tenés acceso a ninguno, contactá al equipo para revisar la recuperación; el enlace por correo no desactiva el segundo factor.'],
    ['¿Por qué se cerró mi sesión?', 'El chat se bloquea después de 15 minutos sin actividad para dejar de mostrar mensajes y claves. Volvé a iniciar sesión y abrí la conversación con sus claves originales. En dispositivos compartidos, cerrá sesión al terminar.'],
  ] },
  { id: 'archivos', titulo: 'Mensajes y archivos', items: [
    ['¿Cómo envío una foto, un video o un documento?', 'Abrí una conversación y usá el clip para elegir el tipo de archivo. Revisá la vista previa y tocá Enviar. El límite es de 20 MB por archivo. Se admiten fotos JPEG, PNG y WebP; audio y video en los formatos compatibles; y documentos PDF, TXT, CSV, DOCX, XLSX y PPTX.'],
    ['¿Cómo grabo un mensaje de voz?', 'Tocá el micrófono junto al campo de mensaje y permití su uso cuando el navegador lo solicite. Elegí Finalizar, escuchá la grabación y enviala. Podés cancelar antes de enviarla. Las grabaciones duran hasta cinco minutos. Si el navegador no permite grabar, adjuntá un audio guardado desde el clip.'],
    ['¿Qué significa la duración de los mensajes?', 'Determina cuándo vencen los mensajes nuevos. El tiempo empieza al enviarlos; cambiar el plazo no modifica los anteriores. En grupos, tus envíos deben respetar el máximo del administrador. El vencimiento no borra capturas ni copias descargadas por otras personas.'],
    ['¿Recibo notificaciones si cierro la web?', 'Por ahora no hay notificaciones en el celular ni en el escritorio con la web cerrada. Al volver, consultá Chats y Solicitudes. La aplicación vuelve a actualizar las conversaciones cuando recupera la conexión.'],
  ] },
];

export default function Ayuda() {
  return <main className="cuenta-shell informacion-shell ayuda-shell min-h-dvh text-slate-100">
    <header><Link href="/" aria-label="Entre Claves, ir al inicio"><MarcaSeguridad compacta /></Link><Link href="/">← Volver al inicio</Link></header>
    <article>
      <div className="informacion-hero"><span>ESTAMOS PARA AYUDARTE</span><h1>Ayuda y contacto</h1><p>Encontrá cómo empezar, resolver dudas y cuidar el acceso a tus conversaciones.</p></div>
      <nav className="informacion-indice" aria-label="Temas de ayuda">{preguntas.map(p => <a href={'#' + p.id} key={p.id}>{p.titulo}</a>)}</nav>
      <div className="ayuda-temas">{preguntas.map(p => <section id={p.id} key={p.id} aria-labelledby={p.id + '-titulo'}><h2 id={p.id + '-titulo'}>{p.titulo}</h2>{p.items.map(([titulo, respuesta]) => <details className="ayuda-pregunta" key={titulo}><summary>{titulo}<span aria-hidden="true">⌄</span></summary><p>{respuesta}</p></details>)}</section>)}</div>
      <aside className="informacion-contacto"><h2>Contactá al equipo</h2><p>Si necesitás asistencia o querés consultar sobre tus datos, escribí a <a href={'mailto:' + CORREO_SOPORTE}>{CORREO_SOPORTE}</a>.</p><p>Contanos qué estabas intentando hacer y qué mensaje apareció. Si adjuntás una captura, ocultá los datos personales.</p><small>No envíes contraseñas, claves de conversación, códigos temporales ni secretos de tu autenticador.</small></aside>
      <footer><p>Entre Claves · Proyecto educativo de mensajería cifrada</p><nav aria-label="Información del servicio"><Link href="/">Volver al inicio</Link><Link href="/privacidad">Privacidad y uso de datos</Link><Link href="/terminos">Términos de uso</Link></nav></footer>
    </article>
  </main>;
}
