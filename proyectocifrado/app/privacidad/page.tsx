import Link from 'next/link';
import MarcaSeguridad from '../componentes/MarcaSeguridad';

export const metadata = { title: 'Privacidad y uso de datos | Entre Claves' };

export default function Privacidad() {
  return <main className="cuenta-shell min-h-dvh px-5 py-8 text-slate-100"><article className="mx-auto max-w-3xl">
    <Link href="/login" aria-label="Entre Claves, ir al inicio"><MarcaSeguridad compacta /></Link>
    <h1 className="mt-10 text-3xl font-semibold tracking-tight">Privacidad y uso de datos</h1>
    <p className="mt-3 text-sm text-slate-400">Actualizado el 27 de octubre de 2026</p>
    <p className="mt-6 text-slate-300 leading-7">Entre Claves es un proyecto educativo de mensajería cifrada. Esta página explica cómo se utiliza la información en la aplicación.</p>
    <div className="panel-cuenta mt-8 p-6 sm:p-8 space-y-7 text-sm leading-7 text-slate-300">
      <section><h2 className="text-lg font-semibold text-white">Datos de tu cuenta</h2><p>Se utiliza tu correo electrónico, nombre de usuario y datos de acceso para identificarte, iniciar sesión y recuperar tu cuenta. También se registran contactos, grupos, invitaciones, lecturas de mensajes y actividad de seguridad para que estas funciones puedan operar.</p></section>
      <section><h2 className="text-lg font-semibold text-white">Mensajes y archivos</h2><p>El contenido de los mensajes y los archivos adjuntos se cifra en tu navegador antes de enviarse. Para leerlos se necesitan las claves compartidas de la conversación. El servicio también conserva información necesaria para entregarlos, como quién los envía, la conversación y las fechas.</p><p className="mt-2">Cambiar o recuperar tu contraseña de acceso no recupera las claves del chat. Compartilas únicamente con las personas que participan en la conversación.</p></section>
      <section><h2 className="text-lg font-semibold text-white">Servicios utilizados</h2><p>Vercel aloja la web y Supabase proporciona el acceso a las cuentas, la base de datos y el almacenamiento de archivos. Estos servicios procesan la información necesaria para su funcionamiento.</p></section>
      <section><h2 className="text-lg font-semibold text-white">Sesión en tu navegador</h2><p>La aplicación guarda información de sesión en el navegador para mantener tu acceso. En un equipo compartido, cerrá sesión al terminar.</p></section>
      <section><h2 className="text-lg font-semibold text-white">Duración y eliminación</h2><p>La duración elegida en una conversación determina el vencimiento de los mensajes según las opciones disponibles. El vencimiento no elimina capturas ni copias que otra persona haya guardado fuera de la aplicación. Los datos de la cuenta se conservan para mantener el servicio; para solicitar su revisión o eliminación, contactá al equipo responsable del proyecto por el medio que te facilitó el acceso.</p></section>
      <section><h2 className="text-lg font-semibold text-white">Consultas sobre tus datos</h2><p>Si encontrás un dato incorrecto o necesitás información sobre el uso de tu cuenta, consultá al equipo responsable del proyecto. No compartas contraseñas ni códigos de verificación para hacer una consulta.</p></section>
    </div>
    <nav aria-label="Volver" className="mt-7 flex flex-wrap gap-6 text-sm text-blue-300"><Link href="/cuenta" className="hover:underline">Mi cuenta</Link><Link href="/login" className="hover:underline">Volver al inicio</Link></nav>
  </article></main>;
}
