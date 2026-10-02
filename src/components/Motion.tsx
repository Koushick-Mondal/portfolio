import { useEffect, useRef, useState, type ReactNode } from 'react';

export function Reveal({ children, className = '' }: {children: ReactNode; className?: string}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => { const el = ref.current; if (!el) return; const observer = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) { el.classList.add('is-visible'); observer.unobserve(el); } }, { threshold: .08 }); observer.observe(el); return () => observer.disconnect(); }, []);
  return <div className={`reveal ${className}`} ref={ref}>{children}</div>;
}

export function CursorFollower() {
  const ref = useRef<HTMLDivElement>(null);
  const [label, setLabel] = useState('');
  useEffect(() => {
    if (!matchMedia('(pointer:fine) and (prefers-reduced-motion:no-preference)').matches) return;
    let x = -100, y = -100, currentX = x, currentY = y, frame = 0;
    const move = (e: MouseEvent) => { x = e.clientX; y = e.clientY; const target = (e.target as HTMLElement).closest('a, button'); setLabel(target ? (target.getAttribute('data-cursor') || 'OPEN ↗') : ''); };
    const loop = () => { currentX += (x-currentX)*.19; currentY += (y-currentY)*.19; if (ref.current) ref.current.style.transform = `translate3d(${currentX}px,${currentY}px,0)`; frame=requestAnimationFrame(loop); };
    window.addEventListener('mousemove', move); loop(); return () => { window.removeEventListener('mousemove', move); cancelAnimationFrame(frame); };
  }, []);
  return <div ref={ref} className={`cursor ${label ? 'cursor-active' : ''}`} aria-hidden="true"><span>{label}</span></div>;
}

export function ScrollProgress() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => { const update = () => { if(ref.current) ref.current.style.transform = `scaleX(${scrollY / Math.max(1, document.documentElement.scrollHeight-innerHeight)})`; }; window.addEventListener('scroll',update,{passive:true}); return () => window.removeEventListener('scroll',update); }, []);
  return <div className="scroll-progress" ref={ref} aria-hidden="true"/>;
}
