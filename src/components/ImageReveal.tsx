import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';

export type ImageRevealEffect = 'fade' | 'slide-up' | 'clip' | 'scale' | 'blur';

export interface ImageRevealProps {
  children: ReactNode;
  effect?: ImageRevealEffect;
  className?: string;
  threshold?: number;
  once?: boolean;
  delay?: number;
}

/** A progressive enhancement: content remains in the DOM when observation is unavailable. */
export function ImageReveal({
  children,
  effect = 'fade',
  className = '',
  threshold = 0.08,
  once = true,
  delay = 0,
}: ImageRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element || typeof window === 'undefined') return;

    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const showImmediately = media.matches || !('IntersectionObserver' in window);
    setReducedMotion(media.matches);
    if (showImmediately) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        setVisible(true);
        if (once) observer.unobserve(element);
      },
      { threshold: Math.min(1, Math.max(0, threshold)) },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [once, threshold]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => {
      setReducedMotion(media.matches);
      if (media.matches) setVisible(true);
    };
    media.addEventListener?.('change', update);
    return () => media.removeEventListener?.('change', update);
  }, []);

  const style = {
    '--image-reveal-delay': `${Math.max(0, delay)}ms`,
  } as CSSProperties;

  return (
    <div
      ref={ref}
      className={`image-reveal image-reveal--${effect} ${visible ? 'is-visible' : 'is-pending'} ${className}`.trim()}
      data-reveal-effect={effect}
      data-reveal-state={visible ? 'visible' : 'pending'}
      data-reduced-motion={reducedMotion ? 'true' : 'false'}
      style={style}
    >
      {children}
    </div>
  );
}

export default ImageReveal;
