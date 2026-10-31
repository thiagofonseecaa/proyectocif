'use client';
import { useEffect, useState, type RefObject } from 'react';
import { supabase } from '../../lib/supabase';
import { MEDIA_BUCKET, descifrarArchivo, type MediaInfo } from '../../lib/media';

export function useAdjunto(info: MediaInfo, vig: string, aes: string, expires: string | undefined, contenedor: RefObject<HTMLDivElement | null>) {
  const [url, setUrl] = useState(''), [error, setError] = useState('');
  const [busy, setBusy] = useState(false), [expired, setExpired] = useState(() => !!expires && Date.parse(expires) <= Date.now());
  const [intento, setIntento] = useState(0);
  const { path, mime, name, size } = info;
  useEffect(() => {
    let activo = true, iniciado = false, objectUrl = '';
    let observer: IntersectionObserver | undefined;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const vencio = () => !!expires && Date.parse(expires) <= Date.now();
    const retirar = () => { if (objectUrl) URL.revokeObjectURL(objectUrl); objectUrl = ''; };
    const comprobarVencimiento = () => {
      if (!activo || !expires) return;
      const remaining = Date.parse(expires) - Date.now();
      if (remaining <= 0) { retirar(); setUrl(''); setExpired(true); observer?.disconnect(); }
      else if (Number.isFinite(remaining)) timer = setTimeout(comprobarVencimiento, Math.min(remaining, 2147483647));
    };
    queueMicrotask(comprobarVencimiento);
    const cargar = async () => {
      if (iniciado || !activo || vencio()) return;
      iniciado = true; observer?.disconnect(); setBusy(true); setError('');
      try {
        const response = await supabase.storage.from(MEDIA_BUCKET).download(path);
        if (!activo || vencio()) return;
        if (response.error || !response.data) throw new Error('No pudimos cargar el adjunto. Revisá tu conexión y volvé a intentar.');
        const plain = await descifrarArchivo(response.data, { version: 1, path, mime, name, size }, vig, aes);
        if (!activo || vencio()) return;
        objectUrl = URL.createObjectURL(plain); setUrl(objectUrl);
      } catch (e) { if (activo && !vencio()) setError(e instanceof Error ? e.message : 'No se pudo abrir el adjunto.'); }
      finally { if (activo) setBusy(false); }
    };
    if (!vencio()) {
      if (intento > 0) queueMicrotask(() => { void cargar(); });
      else if (mime.startsWith('image/')) {
        if (typeof IntersectionObserver === 'undefined' || !contenedor.current) queueMicrotask(() => { void cargar(); });
        else {
          observer = new IntersectionObserver(entries => { if (entries.some(e => e.isIntersecting)) void cargar(); }, { rootMargin: '240px' });
          observer.observe(contenedor.current);
        }
      }
    }
    return () => { activo = false; observer?.disconnect(); clearTimeout(timer); retirar(); };
  }, [path, mime, name, size, vig, aes, expires, intento, contenedor]);
  return { url, error, busy, expired, cargar: () => setIntento(v => v + 1) };
}
