import PaginaInformacion from '../componentes/PaginaInformacion';
import { privacidad } from '../../lib/textosInformacion';
export const metadata = { title: 'Privacidad y uso de datos | Entre Claves' };
export default function Privacidad() {
  return <PaginaInformacion titulo="Privacidad y uso de datos" introduccion="Queremos que sepas qué información utiliza Entre Claves y cómo interviene en cada conversación. Esta política describe el funcionamiento actual del proyecto." resumen={['Los mensajes y adjuntos se cifran en tu navegador antes de enviarse.', 'Tu contraseña de acceso y las claves de conversación cumplen funciones distintas.', 'Podés consultar al equipo sobre tus datos y solicitar su revisión o eliminación.']} secciones={privacidad} />;
}
