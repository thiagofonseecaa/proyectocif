export default function IconoCuenta({ tipo }: { tipo: 'clave' | 'escudo' | 'actividad' | 'campana' | 'privacidad' }) {
  const trazos = {
    clave: <><circle cx="8" cy="9" r="4" /><path d="m11 12 9 9m-4-4 3-3m-6 0 3-3" /></>,
    escudo: <><path d="m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6z" /><path d="m8 12 3 3 5-6" /></>,
    actividad: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
    campana: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" /></>,
    privacidad: <><rect x="5" y="10" width="14" height="11" rx="2" /><path d="M8 10V6a4 4 0 0 1 8 0v4m-4 5v2" /></>,
  };
  return <span className="cuenta-opcion-icono" aria-hidden="true"><svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">{trazos[tipo]}</svg></span>;
}
