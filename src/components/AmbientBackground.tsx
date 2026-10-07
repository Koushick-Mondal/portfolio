import { useEffect, useRef, type CSSProperties } from 'react';

const points = Array.from({ length: 18 }, (_, index) => ({
  left: `${(index * 37) % 100}%`,
  top: `${(index * 61) % 100}%`,
  delay: `${(index % 7) * 1.3}s`,
  size: `${index % 3 === 0 ? 3 : 2}px`,
}));

export default function AmbientBackground() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    let frame = 0;
    let targetX = 50;
    let targetY = 35;
    let x = targetX;
    let y = targetY;
    const onPointer = (event: PointerEvent) => {
      if (event.pointerType === 'touch') return;
      targetX = (event.clientX / window.innerWidth) * 100;
      targetY = (event.clientY / window.innerHeight) * 100;
    };
    const update = () => {
      x += (targetX - x) * 0.035;
      y += (targetY - y) * 0.035;
      node.style.setProperty('--ambient-x', `${x}%`);
      node.style.setProperty('--ambient-y', `${y}%`);
      node.style.setProperty('--ambient-scroll', `${Math.min(window.scrollY / Math.max(1, document.body.scrollHeight - window.innerHeight), 1)}`);
      frame = requestAnimationFrame(update);
    };
    window.addEventListener('pointermove', onPointer, { passive: true });
    frame = requestAnimationFrame(update);
    return () => { window.removeEventListener('pointermove', onPointer); cancelAnimationFrame(frame); };
  }, []);
  return <div ref={ref} className="ambient-background" aria-hidden="true"><div className="ambient-aurora ambient-aurora-one"/><div className="ambient-aurora ambient-aurora-two"/><div className="ambient-network"/><div className="ambient-points">{points.map((point, index) => <i key={index} style={{ '--left': point.left, '--top': point.top, '--delay': point.delay, '--size': point.size } as CSSProperties}/>)}</div><div className="ambient-wave ambient-wave-one"/><div className="ambient-wave ambient-wave-two"/></div>;
}
