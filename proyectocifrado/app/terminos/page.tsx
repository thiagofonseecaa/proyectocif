import PaginaInformacion from '../componentes/PaginaInformacion';
import { terminos } from '../../lib/textosInformacion';
export const metadata = { title: 'Términos de uso | Entre Claves' };
export default function Terminos() {
  return <PaginaInformacion titulo="Términos de uso" introduccion="Conocé las condiciones de uso y las responsabilidades que acompañan el acceso a Entre Claves. Leelas junto con la información de privacidad." resumen={['Cuidá tu cuenta y compartí las claves solo con los participantes de cada conversación.', 'Compartí contenido autorizado y respetá a otras personas.', 'El proyecto puede requerir mantenimiento y no ofrece disponibilidad ni seguridad absolutas.']} secciones={terminos} />;
}
