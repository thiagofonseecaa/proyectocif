'use client';
import { useEffect, type RefObject } from 'react';

// En iOS el teclado reduce y desplaza la ventana visible, no la página completa.
export function ajustarViewportChat(shell: HTMLElement, viewport: Pick<VisualViewport, 'height' | 'offsetTop' | 'scale'> | null, ancho: number, alto: number, activo: Element | null) {
  if (ancho >= 768) {
    shell.style.removeProperty('--chat-alto-visible');
    shell.style.removeProperty('--chat-desplazamiento');
    delete shell.dataset.teclado;
    return;
  }
  // El zoom sigue siendo nativo: no compensamos ni anulamos su escala.
  if (viewport && Math.abs(viewport.scale - 1) > .01) return;
  const height = viewport?.height || alto;
  const offset = Math.max(0, viewport?.offsetTop || 0);
  const escribiendo = !!activo && shell.contains(activo) && activo.matches('input:not([type=checkbox]):not([type=file]), textarea, [contenteditable=true]');
  const mensajes = shell.querySelector<HTMLElement>('.chat-mensajes');
  const cercaDelFinal = mensajes && mensajes.scrollHeight - mensajes.clientHeight - mensajes.scrollTop < 96;
  shell.style.setProperty('--chat-alto-visible', `${height}px`);
  shell.style.setProperty('--chat-desplazamiento', `${offset}px`);
  shell.dataset.teclado = String(escribiendo && alto - height > 120);
  if (mensajes && cercaDelFinal) mensajes.scrollTop = mensajes.scrollHeight;
}

export function useViewportChat(ref: RefObject<HTMLElement | null>, habilitado: boolean) {
  useEffect(() => {
    if (!habilitado) return;
    const viewport = window.visualViewport;
    const root = document.documentElement;
    root.classList.add('pagina-chat');
    let frame = 0;
    let settle: ReturnType<typeof setTimeout> | undefined;
    const update = () => {
      if (ref.current) ajustarViewportChat(ref.current, viewport, window.innerWidth, window.innerHeight, document.activeElement);
    };
    const schedule = () => { cancelAnimationFrame(frame); frame = requestAnimationFrame(update); };
    const focus = () => { schedule(); clearTimeout(settle); settle = setTimeout(schedule, 350); };
    update();
    viewport?.addEventListener('resize', schedule);
    viewport?.addEventListener('scroll', schedule);
    window.addEventListener('resize', schedule);
    document.addEventListener('focusin', focus);
    document.addEventListener('focusout', focus);
    const shell = ref.current;
    return () => {
      cancelAnimationFrame(frame); clearTimeout(settle);
      viewport?.removeEventListener('resize', schedule);
      viewport?.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      document.removeEventListener('focusin', focus);
      document.removeEventListener('focusout', focus);
      root.classList.remove('pagina-chat');
      shell?.style.removeProperty('--chat-alto-visible');
      shell?.style.removeProperty('--chat-desplazamiento');
      if (shell) delete shell.dataset.teclado;
    };
  }, [ref, habilitado]);
}
