'use client';
import MarcaSeguridad from '../componentes/MarcaSeguridad';

import { useRef, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { VERSION_CONDICIONES } from '../../lib/condiciones';

function errorAcceso(code?: string) {
  switch (code) {
    case 'invalid_credentials': return 'El correo o la contraseña no son correctos. Si ya tenés una cuenta, podés recuperar tu contraseña.';
    case 'email_not_confirmed': return 'Confirmá tu correo antes de ingresar. Revisá tu bandeja de entrada y spam.';
    case 'user_already_exists': case 'email_exists': return 'Ese correo ya tiene una cuenta. Elegí Iniciar sesión o recuperá tu contraseña.';
    case 'weak_password': return 'Elegí una contraseña más larga y difícil de adivinar.';
    case 'over_request_rate_limit': case 'over_email_send_rate_limit': return 'Hubo demasiados intentos. Esperá unos minutos y volvé a intentar.';
    case 'signup_disabled': return 'El registro no está disponible en este momento. Contactá al equipo de soporte.';
    default: return 'No se pudo completar la solicitud. Revisá los datos y tu conexión. Si continúa, contactá a soporte.';
  }
}

function evaluarContrasena(password: string) {
  let puntaje = 0;
  if (password.length >= 8) puntaje++;
  if (password.length >= 12) puntaje++;
  if (/[A-Z]/.test(password)) puntaje++;
  if (/[0-9]/.test(password)) puntaje++;
  if (/[^A-Za-z0-9]/.test(password)) puntaje++;

  if (puntaje <= 1) return { nivel: 'Muy debil', color: '#ef4444', ancho: '20%' };
  if (puntaje === 2) return { nivel: 'Debil', color: '#f97316', ancho: '40%' };
  if (puntaje === 3) return { nivel: 'Media', color: '#eab308', ancho: '60%' };
  if (puntaje === 4) return { nivel: 'Fuerte', color: '#3b82f6', ancho: '80%' };
  return { nivel: 'Muy fuerte', color: '#22c55e', ancho: '100%' };
}

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [repetida, setRepetida] = useState('');
  const envio = useRef(false);
  const [esRegistro, setEsRegistro] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [cargando, setCargando] = useState(false);
  const [verPassword, setVerPassword] = useState(false);
  const [aceptaCondiciones, setAceptaCondiciones] = useState(false);

  const fortaleza = password ? evaluarContrasena(password) : null;

  const handleSubmit = async () => {
    if (envio.current) return;
    if (esRegistro && !aceptaCondiciones) { setMensaje('Para continuar, aceptá los términos de uso y leé la información de privacidad.'); return; }
    if (!email.trim() || !password) {
      setMensaje('Ingresá tu correo y contraseña.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) { setMensaje('Ingresá un correo válido.'); return; }
    if (esRegistro && password.length < 12) {
      setMensaje('La contraseña debe tener al menos 12 caracteres. Podés usar una frase larga.');
      return;
    }
    if (esRegistro && password !== repetida) { setMensaje('Las contraseñas no coinciden.'); return; }
    envio.current = true; setCargando(true);
    setMensaje('');
    try {
    if (esRegistro) {
      const { data, error } = await supabase.auth.signUp({ email: email.trim(), password, options: { data: { condiciones_version: VERSION_CONDICIONES, condiciones_aceptadas_en: new Date().toISOString() } } });
      if (error) setMensaje(errorAcceso(error.code));
      else if (data.session) window.location.replace('/chat');
      else { setEsRegistro(false); setPassword(''); setRepetida(''); setAceptaCondiciones(false); setMensaje('Revisá tu correo y confirmá tu cuenta antes de iniciar sesión. Si ya estabas registrado, usá tu contraseña o recuperala por correo.'); }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (error) setMensaje(errorAcceso(error.code));
      else window.location.replace('/chat');
    }
    } catch {
      setMensaje('No pudimos conectar. Revisá tu conexión y volvé a intentar.');
    } finally {
      envio.current = false; setCargando(false);
    }
  };

  return (
    <main className="auth-shell min-h-screen bg-gray-950 text-gray-100 flex items-center justify-center p-6">
      <div className="w-full max-w-sm bg-gray-900 rounded-xl border border-gray-800 p-8">
        <MarcaSeguridad />
        <h1 className="text-2xl font-semibold mb-1 text-center">Bienvenido</h1>
        <p className="text-gray-500 text-sm mb-8 text-center">Tu espacio para conversar en privado.</p>

        <div className="flex gap-2 mb-6">
          <button aria-pressed={!esRegistro} disabled={cargando} onClick={() => { setEsRegistro(false); setMensaje(''); setRepetida(''); setAceptaCondiciones(false); }}
            className={`flex-1 py-2 rounded-lg text-sm ${!esRegistro ? 'bg-blue-600 text-white' : 'border border-gray-700 text-gray-400'}`}>
            Iniciar sesión
          </button>
          <button aria-pressed={esRegistro} disabled={cargando} onClick={() => { setEsRegistro(true); setMensaje(''); setAceptaCondiciones(false); }}
            className={`flex-1 py-2 rounded-lg text-sm ${esRegistro ? 'bg-blue-600 text-white' : 'border border-gray-700 text-gray-400'}`}>
            Registrarse
          </button>
        </div>

        <form onSubmit={e => { e.preventDefault(); void handleSubmit(); }}>
        <label htmlFor="login-email" className="text-xs text-gray-500">Correo electrónico</label>
        <input id="login-email" name="email" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)}
          type="email" required disabled={cargando} placeholder="tu@email.com"
          className="w-full mt-1 mb-4 bg-gray-950 border border-gray-700 rounded-lg p-3 text-sm focus:outline-none focus:border-blue-500" />

        <label htmlFor="login-password" className="text-xs text-gray-500">Contraseña</label>
        <div className="relative mt-1">
          <input id="login-password" name="password" autoComplete={esRegistro ? 'new-password' : 'current-password'} value={password} onChange={e => setPassword(e.target.value)}
            type={verPassword ? 'text' : 'password'} required disabled={cargando}
            placeholder="••••••••"
            className="w-full bg-gray-950 border border-gray-700 rounded-lg p-3 pr-10 text-sm focus:outline-none focus:border-blue-500" />
          <button
            type="button" onClick={() => setVerPassword(!verPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 text-xs">
            {verPassword ? 'Ocultar' : 'Ver'}
          </button>
        </div>

        {esRegistro && fortaleza && (
          <div className="mt-2">
            <div className="w-full bg-gray-800 rounded-full h-1.5">
              <div style={{ width: fortaleza.ancho, backgroundColor: fortaleza.color, height: '6px', borderRadius: '9999px', transition: 'all 0.3s' }}></div>
            </div>
            <p style={{ color: fortaleza.color }} className="text-xs mt-1">{fortaleza.nivel}</p>
          </div>
        )}

        {esRegistro && <div className="mt-4"><label htmlFor="registro-repetida" className="text-xs text-gray-500">Repetir contraseña</label><input id="registro-repetida" autoComplete="new-password" type={verPassword ? 'text' : 'password'} required minLength={12} disabled={cargando} value={repetida} onChange={e => setRepetida(e.target.value)} className="w-full mt-1 bg-gray-950 border border-gray-700 rounded-lg p-3 text-sm" /></div>}
        {esRegistro && <p className="mt-3 mb-4 text-sm text-slate-300">Usá al menos 12 caracteres. Elegí una frase larga y distinta de las que usás en otros servicios.</p>}

        {!esRegistro && <div className="my-4 text-right"><a href="/recuperar-contrasena" className="text-sm text-blue-300 hover:underline">Olvidé mi contraseña</a></div>}

        {esRegistro && <div className="aceptacion-condiciones"><label><input type="checkbox" checked={aceptaCondiciones} onChange={e => setAceptaCondiciones(e.target.checked)} disabled={cargando} /><span>Acepto los <a href="/terminos" target="_blank" rel="noopener noreferrer">Términos de uso</a> y he leído la <a href="/privacidad" target="_blank" rel="noopener noreferrer">Política de privacidad</a>.</span></label></div>}
        <button type="submit" disabled={cargando || (esRegistro && !aceptaCondiciones)}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg text-sm disabled:opacity-50">
          {cargando ? 'Cargando...' : esRegistro ? 'Crear cuenta' : 'Ingresar'}
        </button>
        </form>

        {mensaje && <p role="status" className="mt-4 text-sm text-center text-yellow-400">{mensaje}</p>}
        <p className="mt-6 text-center text-xs text-slate-400"><a href="/ayuda" className="hover:text-blue-300 hover:underline">Ayuda</a><span aria-hidden="true"> · </span><a href="/terminos" className="hover:text-blue-300 hover:underline">Términos</a><span aria-hidden="true"> · </span><a href="/privacidad" className="hover:text-blue-300 hover:underline">Privacidad y uso de datos</a></p>
      </div>
    </main>
  );
}
