'use client';
import { AvatarChat, IconoChat } from './ElementosChat';

type Props = {
  nombre: string; grupo: boolean; vig: string; aes: string; mostrar: boolean; busy: boolean;
  onVig: (value: string) => void; onAes: (value: string) => void; onMostrar: (value: boolean) => void;
  onAbrir: () => void; onGrupo: () => void;
};

export default function AbrirConversacion(p: Props) {
  const debiles = (p.vig.length > 0 && p.vig.length < 12) || (p.aes.length > 0 && p.aes.length < 12) || (p.vig && p.vig === p.aes);
  return <div className="chat-apertura-scroll">
    <form autoComplete="off" onSubmit={e => { e.preventDefault(); if (!p.busy) p.onAbrir(); }} className="chat-apertura">
      <div className="chat-apertura-persona"><AvatarChat nombre={p.nombre} grupo={p.grupo} /><span>{p.grupo ? 'Conversación grupal' : 'Conversación privada'}<strong>{p.nombre}</strong></span></div>
      <div className="chat-apertura-titulo"><span aria-hidden="true"><IconoChat tipo="candado" size={25} /></span><h2>Abrí tu conversación</h2></div>
      <p className="chat-apertura-intro">Ingresá las dos claves que acordaron para leer y enviar mensajes.</p>
      <p className="chat-apertura-nota">Son las claves del chat, distintas de tu contraseña de acceso.</p>
      {p.grupo && <button type="button" onClick={p.onGrupo} className="chat-enlace">Ver información del grupo</button>}
      <div className="chat-clave-campo"><label htmlFor="clave-vig">Primera clave <span>Vigenère</span></label>
        <input id="clave-vig" name="secreto-conversacion-uno" data-lpignore="true" data-1p-ignore="true" autoCapitalize="none" autoCorrect="off" type={p.mostrar ? 'text' : 'password'} autoComplete="off" spellCheck={false} disabled={p.busy} value={p.vig} onChange={e => p.onVig(e.target.value)} placeholder="Ingresá la primera clave" />
      </div>
      <div className="chat-clave-campo"><label htmlFor="clave-aes">Segunda clave <span>AES</span></label>
        <input id="clave-aes" name="secreto-conversacion-dos" data-lpignore="true" data-1p-ignore="true" autoCapitalize="none" autoCorrect="off" type={p.mostrar ? 'text' : 'password'} autoComplete="off" spellCheck={false} disabled={p.busy} value={p.aes} onChange={e => p.onAes(e.target.value)} placeholder="Ingresá la segunda clave" />
      </div>
      <label className="chat-mostrar-claves"><input type="checkbox" checked={p.mostrar} onChange={e => p.onMostrar(e.target.checked)} />Mostrar claves</label>
      {debiles && <p role="status" className="chat-claves-aviso">Para una conversación nueva, usen dos frases largas y distintas. Si el chat ya existe, ingresá las claves originales.</p>}
      <button type="submit" disabled={p.busy} className="chat-abrir-boton">{p.busy ? 'Abriendo conversación…' : 'Abrir conversación'}{!p.busy && <span aria-hidden="true">→</span>}</button>
      <details className="chat-claves-ayuda"><summary>¿Cómo funcionan las claves?</summary><div>
        <p>{p.grupo ? 'Todos los integrantes deben usar las mismas dos claves.' : 'Vos y tu contacto deben usar las mismas dos claves.'} Acuérdenlas en persona o por otro medio de confianza.</p>
        <p>Para un chat nuevo, elijan dos frases distintas de al menos 12 caracteres. Eviten nombres, fechas y frases fáciles de adivinar.</p>
        <p>Si todavía no hay mensajes, no podemos comprobar si las claves coinciden. Ingresar otras claves aquí no cambia las de los mensajes anteriores ni las de las demás personas.</p>
      </div></details>
    </form>
  </div>;
}
