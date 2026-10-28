'use client';

import Link from 'next/link';
import IconoCuenta from '../componentes/IconoCuenta';
import MarcaSeguridad from '../componentes/MarcaSeguridad';
import HistorialAccesos from './HistorialAccesos';
import SeguridadDosPasos from '../componentes/SeguridadDosPasos';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import type { User } from '@supabase/supabase-js';
import { supabase } from '../../lib/supabase';

function fecha(value?: string) {
  return value ? new Date(value).toLocaleString('es-AR', { dateStyle: 'medium', timeStyle: 'short' }) : 'Sin información';
}
function mensajeError(code?: string) {
  switch (code) {
    case 'same_password': return 'Elegí una contraseña diferente de la actual.';
    case 'weak_password': return 'La contraseña no cumple los requisitos de seguridad del servicio. Usá una más larga y difícil de adivinar.';
    case 'invalid_credentials':
    case 'invalid_password': return 'La contraseña actual no es correcta.';
    case 'reauthentication_not_valid': return 'El código no es válido o venció. Solicitá uno nuevo.';
    case 'over_request_rate_limit':
    case 'over_email_send_rate_limit': return 'Hubo demasiados intentos. Esperá unos minutos antes de volver a intentar.';
    default: return 'No se pudo guardar el cambio. Revisá la contraseña actual y tu conexión e intentá nuevamente.';
  }
}

export default function MiCuenta() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(true), [loadError, setLoadError] = useState('');
  const [retry, setRetry] = useState(0), [profileError, setProfileError] = useState('');
  const [actual, setActual] = useState(''), [nueva, setNueva] = useState(''), [repetida, setRepetida] = useState('');
  const [visible, setVisible] = useState(false), [busy, setBusy] = useState(false);
  const [error, setError] = useState(''), [success, setSuccess] = useState('');
  const [needsCode, setNeedsCode] = useState(false), [code, setCode] = useState('');
  const lock = useRef(false), actor = useRef<string | null>(null), alive = useRef(false);
  const [intentoActual, setIntentoActual] = useState(retry);
  if (intentoActual !== retry) {
    setIntentoActual(retry); setLoading(true); setLoadError(''); setProfileError('');
  }

  useEffect(() => {
    let cancelled = false;
    alive.current = true;
    async function load() {
      try {
        const { data, error: failure } = await supabase.auth.getUser();
        if (cancelled) return;
        if (failure) {
          if (failure.status === 401 || failure.code === 'session_not_found' || failure.name === 'AuthSessionMissingError') { router.replace('/login'); return; }
          throw failure;
        }
        if (!data.user) { router.replace('/login'); return; }
        actor.current = data.user.id; setUser(data.user);
        const profile = await supabase.from('usuarios').select('username').eq('id', data.user.id).maybeSingle();
        if (cancelled) return;
        setUsername(profile.data?.username || '');
        if (profile.error || !profile.data) setProfileError('No se pudo cargar el nombre del perfil. Podés volver a intentar.');
      } catch { if (!cancelled) setLoadError('No pudimos cargar tu cuenta. Revisá la conexión y volvé a intentar.'); }
      finally { if (!cancelled) setLoading(false); }
    }
    void load();
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (cancelled) return;
      if (event === 'SIGNED_OUT' || (actor.current && session?.user && session.user.id !== actor.current)) {
        cancelled = true;
        actor.current = null; setUser(null); setActual(''); setNueva(''); setRepetida(''); setCode(''); router.replace('/login');
      }
    });
    return () => { cancelled = true; alive.current = false; listener.subscription.unsubscribe(); };
  }, [router, retry]);

  async function guardar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user || lock.current) return;
    setError(''); setSuccess('');
    if (!actual) { setError('Ingresá tu contraseña actual.'); return; }
    if (nueva.length < 12) { setError('La nueva contraseña debe tener al menos 12 caracteres. Podés usar una frase larga.'); return; }
    if (nueva !== repetida) { setError('Las nuevas contraseñas no coinciden.'); return; }
    if (nueva === actual) { setError('Elegí una contraseña diferente de la actual.'); return; }
    if (needsCode && !code.trim()) { setError('Ingresá el código de confirmación.'); return; }
    lock.current = true; setBusy(true);
    const expected = user.id;
    try {
      const fresh = await supabase.auth.getUser();
      if (fresh.error || fresh.data.user?.id !== expected || actor.current !== expected) throw new Error('Tu sesión cambió. Volvé a iniciar sesión antes de cambiar la contraseña.');
      const result = await supabase.auth.updateUser({ password: nueva, current_password: actual, ...(needsCode ? { nonce: code.trim() } : {}) });
      if (!alive.current || actor.current !== expected) return;
      if (result.error) {
        if (result.error.code === 'reauthentication_needed') { setNeedsCode(true); setError('Por seguridad, necesitás confirmar este cambio con un código. Pulsá “Solicitar código”.'); return; }
        setError(mensajeError(result.error.code)); return;
      }
      setActual(''); setNueva(''); setRepetida(''); setCode(''); setNeedsCode(false); setVisible(false);
      setSuccess('Contraseña actualizada. Usá la nueva contraseña la próxima vez que inicies sesión. Las claves de tus conversaciones siguen siendo las mismas.');
    } catch (e) { if (alive.current) setError(e instanceof Error ? e.message : 'No se pudo actualizar la contraseña.'); }
    finally { lock.current = false; if (alive.current) setBusy(false); }
  }

  async function solicitarCodigo() {
    if (lock.current) return;
    lock.current = true; setBusy(true); setError(''); setSuccess('');
    try {
      const result = await supabase.auth.reauthenticate();
      if (!alive.current) return;
      if (result.error) setError(mensajeError(result.error.code));
      else setSuccess('Código solicitado. Revisá tu correo y la carpeta de spam.');
    } catch { if (alive.current) setError('No se pudo solicitar el código. Revisá tu conexión.'); }
    finally { lock.current = false; if (alive.current) setBusy(false); }
  }

  const initials = (username || user?.email || 'U').slice(0, 2).toUpperCase();
  const inputClass = 'mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 disabled:opacity-60';
  return <main className="cuenta-shell min-h-dvh text-slate-100">
    <header className="border-b border-slate-800 bg-gray-900 px-5 py-4 sm:px-8">
      <div className="max-w-5xl mx-auto flex flex-wrap gap-4 items-center justify-between">
        <Link href="/chat" className="font-semibold text-lg" aria-label="Entre Claves, volver a chats"><MarcaSeguridad compacta /></Link>
        <Link href="/chat" className="rounded-lg border border-slate-700 px-4 py-2 text-sm hover:bg-slate-800">← Volver a los chats</Link>
      </div>
    </header>
    <div className="cuenta-contenido max-w-6xl mx-auto px-5 py-8 sm:px-8 sm:py-12">
      <div className="cuenta-hero">
      <h1 className="text-3xl font-semibold tracking-tight">Mi cuenta</h1>
      <p className="mt-3 text-sm text-slate-300">Consultá tus datos y elegí qué querés administrar.</p></div>
      {loading ? <p role="status" className="mt-10 text-slate-300">Cargando tu cuenta…</p> : loadError ? <div role="alert" className="mt-8 space-y-4"><p>{loadError}</p><button onClick={() => setRetry(v => v + 1)} className="bg-blue-600 rounded-lg px-4 py-2">Reintentar</button></div> : user && <div className="cuenta-opciones mt-6 space-y-4">
          <section id="perfil" aria-labelledby="perfil-title" className="panel-cuenta rounded-2xl border border-slate-800 bg-gray-900 p-6">
            <div className="flex items-center gap-4 mb-6">
              <div aria-hidden="true" className="h-14 w-14 shrink-0 rounded-2xl bg-blue-500/15 text-blue-300 flex items-center justify-center text-xl font-semibold">{initials}</div>
              <div className="min-w-0"><h2 id="perfil-title" className="text-lg font-semibold break-words">{username || 'Tu perfil'}</h2><p className="text-sm text-slate-300 mt-1">Datos de tu cuenta</p></div>
            </div>
            {profileError && <p role="alert" className="text-amber-300 text-sm mb-4">{profileError} <button className="underline" onClick={() => setRetry(v => v + 1)}>Reintentar</button></p>}
            <dl className="perfil-datos space-y-5 text-sm">
              <div><dt className="text-slate-300 text-sm mb-1">Correo electrónico</dt><dd className="break-all">{user.email || 'No disponible'}</dd></div>
              <div><dt className="text-slate-300 text-sm mb-1">Verificación del correo</dt><dd>{user.email_confirmed_at ? 'Correo confirmado' : 'Correo sin confirmar'}</dd></div>
            </dl>
            <details className="perfil-detalles"><summary>Más datos de la cuenta</summary><p className="mt-3 text-sm text-slate-300">Cuenta creada el {fecha(user.created_at)}.</p></details>
          </section>
        <details id="contrasena" className="cuenta-acordeon panel-cuenta" onToggle={e => { if (!e.currentTarget.open && !busy) { setActual(''); setNueva(''); setRepetida(''); setCode(''); setNeedsCode(false); setVisible(false); setError(''); setSuccess(''); } }}>
          <summary><IconoCuenta tipo="clave" /><span><strong>Cambiar contraseña</strong><span>Actualizá la contraseña que usás para ingresar.</span></span><span className="cuenta-chevron" aria-hidden="true">⌄</span></summary>
          <div className="cuenta-acordeon-cuerpo">
          <p className="mb-5 text-sm text-slate-300">Este cambio no modifica las claves de tus conversaciones.</p>
          <form onSubmit={guardar} className="space-y-5">
            <input type="text" name="username" autoComplete="username" value={user.email || ''} readOnly hidden />
            <div><label htmlFor="actual" className="text-sm">Contraseña actual</label><input id="actual" autoComplete="current-password" type={visible ? 'text' : 'password'} required disabled={busy} value={actual} onChange={e => setActual(e.target.value)} className={inputClass} /></div>
            <div><label htmlFor="nueva" className="text-sm">Nueva contraseña</label><input id="nueva" autoComplete="new-password" type={visible ? 'text' : 'password'} required minLength={12} disabled={busy} value={nueva} onChange={e => setNueva(e.target.value)} aria-describedby="password-help" className={inputClass} /><p id="password-help" className="text-sm text-slate-300 mt-2">Al menos 12 caracteres. Una frase larga es más fácil de recordar.</p></div>
            <div><label htmlFor="repetida" className="text-sm">Repetir nueva contraseña</label><input id="repetida" autoComplete="new-password" type={visible ? 'text' : 'password'} required minLength={12} disabled={busy} value={repetida} onChange={e => setRepetida(e.target.value)} className={inputClass} /></div>
            <label className="flex items-center gap-2 text-sm text-slate-300"><input type="checkbox" checked={visible} onChange={e => setVisible(e.target.checked)} />Mostrar contraseñas</label>
            {needsCode && <div className="space-y-3"><button type="button" disabled={busy} onClick={solicitarCodigo} className="text-blue-300 underline text-sm">Solicitar código</button><div><label htmlFor="codigo" className="text-sm">Código de confirmación</label><input id="codigo" autoComplete="one-time-code" inputMode="numeric" value={code} onChange={e => setCode(e.target.value)} disabled={busy} className={inputClass} /></div></div>}
            {error && <p role="alert" className="text-sm text-red-300">{error}</p>}
            {success && <p role="status" className="text-sm text-emerald-300">{success}</p>}
            <button type="submit" disabled={busy} className="w-full rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 px-4 py-3 text-sm font-medium">{busy ? 'Procesando…' : 'Guardar nueva contraseña'}</button>
          </form>
          <p className="mt-5 text-sm"><Link href="/recuperar-contrasena" className="text-blue-300 hover:underline">Olvidé mi contraseña actual</Link></p>
          </div>
        </details>
        <details className="cuenta-acordeon panel-cuenta">
          <summary><IconoCuenta tipo="escudo" /><span><strong>Verificación en dos pasos</strong><span>Protegé tu cuenta con un código adicional.</span></span><span className="cuenta-chevron" aria-hidden="true">⌄</span></summary>
          <div className="cuenta-acordeon-cuerpo"><SeguridadDosPasos key={'mfa-' + user.id} userId={user.id} /></div>
        </details>
        <details className="cuenta-acordeon panel-cuenta">
          <summary><IconoCuenta tipo="actividad" /><span><strong>Actividad de la cuenta</strong><span>Revisá tus ingresos y cambios recientes.</span></span><span className="cuenta-chevron" aria-hidden="true">⌄</span></summary>
          <div className="cuenta-acordeon-cuerpo"><HistorialAccesos key={user.id} userId={user.id} /></div>
        </details>
        <details className="cuenta-acordeon panel-cuenta">
          <summary><IconoCuenta tipo="campana" /><span><strong>Notificaciones</strong><span>Dónde consultar tus mensajes y solicitudes.</span></span><span className="cuenta-chevron" aria-hidden="true">⌄</span></summary>
          <div className="cuenta-acordeon-cuerpo text-sm text-slate-300 space-y-3"><p>Consultá tus mensajes en Chats y las invitaciones en Solicitudes.</p><p>Por ahora, Entre Claves no envía notificaciones al celular ni al escritorio cuando la web está cerrada.</p><Link href="/chat" className="inline-block text-blue-300 hover:underline">Ir a mis conversaciones →</Link></div>
        </details>
        <details className="cuenta-acordeon panel-cuenta">
          <summary><IconoCuenta tipo="privacidad" /><span><strong>Privacidad y uso de datos</strong><span>Conocé qué información utiliza Entre Claves.</span></span><span className="cuenta-chevron" aria-hidden="true">⌄</span></summary>
          <div className="cuenta-acordeon-cuerpo text-sm text-slate-300 space-y-3"><p>Usamos los datos de tu cuenta para permitir el acceso, conectar tus contactos y mantener tus conversaciones.</p><p>Los mensajes y adjuntos se cifran antes de enviarse. Las claves de las conversaciones son distintas de tu contraseña de acceso.</p><Link href="/privacidad" className="inline-block text-blue-300 hover:underline">Leer privacidad y uso de datos →</Link></div>
        </details>
      </div>}
    </div>
  </main>;
}
