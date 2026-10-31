'use client';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useAdjunto } from './useAdjunto';
import { DOCUMENT_ACCEPT, MAX_MEDIA_BYTES, leerArchivo, validarArchivo, type MediaInfo } from '../../lib/media';


function ImagenAmpliable({ url, nombre }: { url: string; nombre: string }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const abrir = () => { if (dialog.current && !dialog.current.open) dialog.current.showModal(); };
  return <>
    <button type="button" onClick={abrir} aria-label={'Ampliar imagen: ' + nombre} className="media-imagen-abrir">
      <img src={url} alt={nombre} className="max-h-80 max-w-full rounded-xl object-contain" />
    </button>
    <dialog ref={dialog} aria-label="Imagen ampliada" className="fixed inset-0 m-auto w-[95vw] max-w-5xl max-h-[94dvh] overflow-auto rounded-2xl border border-slate-600 bg-slate-950 p-4 text-white shadow-2xl backdrop:bg-black/80" onClick={e => { if (e.target === e.currentTarget) dialog.current?.close(); }}>
      <div className="mb-4 flex items-center justify-end">
        <button type="button" autoFocus onClick={() => dialog.current?.close()} className="min-h-11 rounded-xl border border-slate-500 px-4 py-2">Cerrar ✕</button>
      </div>
      <img src={url} alt={nombre} className="mx-auto max-h-[70dvh] max-w-full object-contain" />
      <a href={url} download={nombre} className="mt-4 inline-flex min-h-11 items-center rounded-xl bg-blue-600 px-5 py-2 text-sm">Descargar imagen</a>
    </dialog>
  </>;
}

function ContenidoAdjunto({ info, vig, aes, expires }: { info: MediaInfo; vig: string; aes: string; expires?: string }) {
  const contenedor = useRef<HTMLDivElement>(null);
  const media = useAdjunto(info, vig, aes, expires, contenedor);
  const imagen = info.mime.startsWith('image/'), audio = info.mime.startsWith('audio/'), video = info.mime.startsWith('video/');
  return <div ref={contenedor} className={imagen ? 'media-imagen' : 'media-archivo'}>
    {media.expired ? <p className="media-estado">Adjunto vencido.</p> : imagen ? <>
      {media.url ? <ImagenAmpliable url={media.url} nombre={info.name} /> : <div className="media-imagen-espera" role="status"><span aria-hidden="true">▧</span>{media.error ? 'No se pudo cargar la imagen' : media.busy ? 'Descifrando imagen…' : 'Cargando imagen…'}</div>}
    </> : <>
      <div className="media-archivo-cabecera"><span aria-hidden="true" className="media-archivo-icono">{audio ? '♫' : video ? '▷' : '▤'}</span><div><p>{audio ? 'Audio' : video ? 'Video' : info.name}</p><span>{audio ? 'Mensaje de audio' : video ? info.name : info.name.split('.').pop()?.toUpperCase()} · {(info.size / 1024 / 1024).toFixed(1)} MB</span></div></div>
      {media.url ? audio ? <audio controls preload="metadata" src={media.url} className="max-w-full" /> : video ? <video controls playsInline preload="metadata" src={media.url} className="max-w-full max-h-80 rounded-xl" /> : null : <button type="button" onClick={media.cargar} disabled={media.busy} className="media-cargar">{media.busy ? 'Descifrando…' : audio || video ? 'Cargar para reproducir' : 'Preparar descarga'}</button>}
      {media.url && <a href={media.url} download={info.name} className="media-descargar">Descargar {audio ? 'audio' : video ? 'video' : 'documento'} ↓</a>}
    </>}
    {media.error && !media.expired && <div className="media-error"><p role="alert">{media.error}</p><button type="button" onClick={media.cargar} disabled={media.busy}>Reintentar</button></div>}
  </div>;
}

export function MensajeMedia({ texto, path, vig, aes, expires }: { texto: string; path?: string; vig: string; aes: string; expires?: string }) {
  const info = leerArchivo(texto, path);
  if (!info) return <p className="text-sm">{path ? '[No se pudo leer el adjunto con estas claves]' : texto}</p>;
  return <ContenidoAdjunto key={JSON.stringify([texto, path, vig, aes, expires])} info={info} vig={vig} aes={aes} expires={expires} />;
}

export function AdjuntarMedia({ onSend, children }: { onSend: (file: File) => Promise<void>; children?: ReactNode }) {
  const [menu, setMenu] = useState(false);
  const [file, setFile] = useState<File | null>(null), [preview, setPreview] = useState('');
  const [error, setError] = useState(''), [busy, setBusy] = useState(false);
  const [recording, setRecording] = useState(false), [requesting, setRequesting] = useState(false), [seconds, setSeconds] = useState(0);
  const input = useRef<HTMLInputElement>(null), recorder = useRef<MediaRecorder | null>(null), stream = useRef<MediaStream | null>(null);
  const previewUrl = useRef('');
  const mounted = useRef(true), sending = useRef(false), request = useRef(0), cancelled = useRef(false);
  useEffect(() => { mounted.current = true; return () => {
    mounted.current = false; request.current++; cancelled.current = true;
    if (recorder.current?.state === 'recording') recorder.current.stop();
    stream.current?.getTracks().forEach(track => track.stop());
    URL.revokeObjectURL(previewUrl.current); previewUrl.current = '';
  }; }, []);
  useEffect(() => {
    if (!recording) return;
    const timer = setInterval(() => setSeconds(value => value + 1), 1000);
    const limit = setTimeout(() => recorder.current?.state === 'recording' && recorder.current.stop(), 300000);
    return () => { clearInterval(timer); clearTimeout(limit); };
  }, [recording]);
  const choose = (candidate: File) => {
    try {
      validarArchivo(candidate);
      const url = URL.createObjectURL(candidate);
      URL.revokeObjectURL(previewUrl.current); previewUrl.current = url;
      setPreview(url); setFile(candidate); setError(''); setMenu(false);
    }
    catch (e) { setError((e as Error).message); }
  };
  const descartar = () => {
    URL.revokeObjectURL(previewUrl.current); previewUrl.current = '';
    setPreview(''); setFile(null);
  };
  const record = async () => {
    if (requesting || recording || sending.current) return;
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
      setError('Este navegador no permite grabar audio. Podés adjuntar un audio guardado desde el clip.'); return;
    }
    const current = ++request.current; setRequesting(true); setError(''); cancelled.current = false;
    try {
      const microphone = await navigator.mediaDevices.getUserMedia({ audio: true });
      if (!mounted.current || current !== request.current) { microphone.getTracks().forEach(t => t.stop()); return; }
      stream.current = microphone;
      const mime = ['audio/webm;codecs=opus', 'audio/mp4', 'audio/ogg;codecs=opus'].find(type => MediaRecorder.isTypeSupported(type));
      if (!mime) throw new Error('No hay un formato de grabación compatible. Adjuntá un audio.');
      const rec = new MediaRecorder(microphone, { mimeType: mime }); recorder.current = rec;
      const chunks: Blob[] = []; let size = 0;
      rec.ondataavailable = event => { if (event.data.size) { chunks.push(event.data); size += event.data.size; }
        if (size > MAX_MEDIA_BYTES && rec.state === 'recording') rec.stop(); };
      rec.onerror = () => { cancelled.current = true; microphone.getTracks().forEach(t => t.stop()); if (mounted.current) { setError('No se pudo completar la grabación.'); setRecording(false); } };
      rec.onstop = () => {
        microphone.getTracks().forEach(t => t.stop());
        if (!mounted.current) return;
        setRecording(false);
        if (cancelled.current) return;
        const extension = mime.includes('mp4') ? 'm4a' : mime.includes('ogg') ? 'ogg' : 'webm';
        choose(new File(chunks, `audio-${Date.now()}.${extension}`, { type: mime }));
      };
      rec.start(1000); setSeconds(0); setRecording(true);
    } catch (e) { stream.current?.getTracks().forEach(t => t.stop()); if (mounted.current) setError((e as Error).name === 'NotAllowedError' ? 'El micrófono está bloqueado. Permití su uso en el navegador o adjuntá un audio.' : (e as Error).message); }
    finally { if (mounted.current) setRequesting(false); }
  };
  const send = async () => {
    if (!file || sending.current) return;
    sending.current = true; setBusy(true); setError('');
    try { await onSend(file); if (mounted.current) descartar(); }
    catch (e) { if (mounted.current) setError((e as Error).message); }
    finally { sending.current = false; if (mounted.current) setBusy(false); }
  };
  const accion = 'inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-blue-400/25 bg-blue-500/10 px-4 py-2.5 text-sm font-medium text-blue-100 hover:bg-blue-500/20 disabled:opacity-40';
  const seleccionar = (accept: string) => { setMenu(false); if (input.current) { input.current.accept = accept; input.current.click(); } };
  const icono = (tipo: string) => <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{tipo === 'foto' ? <><rect x="3" y="3" width="18" height="18" rx="4"/><circle cx="8" cy="8" r="1"/><path d="m3 17 5-5 4 4 4-6 5 7"/></> : tipo === 'video' ? <><rect x="3" y="6" width="12" height="12" rx="3"/><path d="m15 10 6-3v10l-6-3"/></> : tipo === 'archivo-audio' ? <><path d="M9 18V5l11-2v13M9 8l11-2"/><circle cx="6" cy="18" r="3"/><circle cx="17" cy="16" r="3"/></> : <><rect x="9" y="2" width="6" height="13" rx="3"/><path d="M5 10v2a7 7 0 0 0 14 0v-2M12 19v3M8 22h8"/></>}</svg>;
  return <div className="space-y-3">
    <input ref={input} type="file" accept="image/jpeg,image/png,image/webp,audio/mpeg,audio/mp4,audio/wav,audio/ogg,audio/webm,video/mp4,video/webm,.m4a" className="hidden"
      onChange={e => { const candidate = e.target.files?.[0]; if (candidate) choose(candidate); e.target.value = ''; }} />
    {menu && !file && !recording && !requesting && !busy && <div id="media-opciones" className="media-menu" aria-label="Opciones para adjuntar">
      {[['foto', 'Foto o video', 'image/jpeg,image/png,image/webp,video/mp4,video/webm'], ['archivo-audio', 'Audio guardado', 'audio/mpeg,audio/mp4,audio/wav,audio/ogg,audio/webm,.m4a'], ['documento', 'Documento', DOCUMENT_ACCEPT]].map(([tipo, texto, formatos]) => <button type="button" key={tipo} onClick={() => seleccionar(formatos)}>{tipo === 'documento' ? <span aria-hidden="true">▤</span> : icono(tipo)}{texto}</button>)}
      <p>Hasta 20 MB · PDF, Office, texto y multimedia</p>
    </div>}
    {requesting && <p role="status" className="media-grabacion">Esperando permiso del micrófono…</p>}
    {recording && <div className="media-grabacion"><span role="status">● Grabando {Math.floor(seconds / 60)}:{String(seconds % 60).padStart(2, '0')} / 5:00</span><button type="button" onClick={() => recorder.current?.stop()} className={accion}>Finalizar</button><button type="button" onClick={() => { cancelled.current = true; recorder.current?.stop(); }}>Cancelar</button></div>}
    {file && <div className="rounded-2xl border border-slate-600 bg-slate-800/70 p-4 space-y-3">
      <p className="text-xs break-all">{file.name} · {(file.size / 1024 / 1024).toFixed(1)} MB</p>
      {preview && (validarArchivo(file).startsWith('audio/') ? <audio controls src={preview} className="max-w-full" /> : validarArchivo(file).startsWith('image/') ? <img src={preview} alt="Vista previa del adjunto" className="max-h-40 max-w-full rounded-xl object-contain" /> : validarArchivo(file).startsWith('video/') ? <video controls playsInline src={preview} className="max-h-40 max-w-full" /> : <div className="media-documento-previa"><span aria-hidden="true">▤</span><p>Documento listo para enviar</p></div>)}
      <div className="flex gap-3 text-xs"><button type="button" onClick={send} disabled={busy} className="min-h-11 rounded-xl bg-blue-600 px-5 py-3 text-sm font-medium disabled:opacity-50">{busy ? 'Cifrando y enviando…' : (validarArchivo(file).startsWith('image/') ? 'Enviar foto' : validarArchivo(file).startsWith('audio/') ? 'Enviar audio' : validarArchivo(file).startsWith('video/') ? 'Enviar video' : 'Enviar documento')}</button>
        <button type="button" className={accion} onClick={descartar} disabled={busy}>Descartar</button></div>
    </div>}
    {error && <p role="alert" className="text-xs text-red-400">{error}</p>}
    {!file && !recording && !requesting && !busy && <div className="media-componer"><button type="button" aria-label="Adjuntar archivo" title="Adjuntar archivo" aria-expanded={menu} aria-controls="media-opciones" onClick={() => setMenu(v => !v)} className="media-icono-boton"><svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="m8 13 7-7a3 3 0 0 1 4 4L9 20a5 5 0 0 1-7-7L13 2m-8 14a2 2 0 0 0 3 1l10-10" /></svg></button><div className="media-texto">{children}</div><button type="button" onClick={record} aria-label="Grabar mensaje de voz" title="Grabar mensaje de voz" className="media-icono-boton">{icono('audio')}</button></div>}
  </div>;
}
