import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';

export interface ParallaxImageProps {
  children?: ReactNode;
  src?: string;
  alt?: string;
  className?: string;
  style?: CSSProperties;
  maxOffset?: number;
  strength?: number;
  scroll?: boolean;
  disabled?: boolean;
  loading?: 'eager' | 'lazy';
  width?: number | string;
  height?: number | string;
}

function initials(value: string) {
  const words = value.trim().split(/\s+/).filter(Boolean);
  return (words.slice(0, 2).map((word) => word[0]).join('') || '•').toUpperCase();
}

/** Uses direct DOM transforms so pointer/scroll updates never cause React renders. */
export function ParallaxImage({
  children,
  src,
  alt = '',
  className = '',
  style,
  maxOffset = 12,
  strength = 1,
  scroll = true,
  disabled = false,
  loading = 'lazy',
  width,
  height,
}: ParallaxImageProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [imageFailed, setImageFailed] = useState(false);
  const boundedOffset = Math.min(30, Math.max(0, maxOffset));
  const boundedStrength = Math.max(0, Math.min(1, strength));

  useEffect(() => {
    const element = ref.current;
    if (!element || disabled || typeof window === 'undefined') return;

    const pointer = window.matchMedia('(pointer: fine)');
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (!pointer.matches || motion.matches || boundedOffset === 0) return;

    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    let frame = 0;

    const clamp = (value: number) => Math.max(-boundedOffset, Math.min(boundedOffset, value));
    const apply = () => {
      frame = 0;
      currentX += (targetX - currentX) * 0.16;
      currentY += (targetY - currentY) * 0.16;
      element.style.transform = `translate3d(${currentX.toFixed(2)}px, ${currentY.toFixed(2)}px, 0)`;
      if (Math.abs(targetX - currentX) > 0.05 || Math.abs(targetY - currentY) > 0.05) {
        frame = window.requestAnimationFrame(apply);
      }
    };
    const schedule = () => {
      if (!frame) frame = window.requestAnimationFrame(apply);
    };
    const reset = () => {
      targetX = 0;
      targetY = 0;
      schedule();
    };
    const onPointerMove = (event: PointerEvent) => {
      const bounds = element.getBoundingClientRect();
      if (!bounds.width || !bounds.height) return;
      targetX = clamp(((event.clientX - bounds.left) / bounds.width - 0.5) * boundedOffset * boundedStrength * 2);
      targetY = clamp(((event.clientY - bounds.top) / bounds.height - 0.5) * boundedOffset * boundedStrength * 2);
      schedule();
    };
    const onScroll = () => {
      if (!scroll) return;
      const bounds = element.getBoundingClientRect();
      const viewportCenter = window.innerHeight / 2;
      const distance = (viewportCenter - (bounds.top + bounds.height / 2)) / Math.max(window.innerHeight, bounds.height);
      targetY = clamp(distance * boundedOffset * boundedStrength);
      schedule();
    };

    element.addEventListener('pointermove', onPointerMove);
    element.addEventListener('pointerleave', reset);
    if (scroll) window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    return () => {
      element.removeEventListener('pointermove', onPointerMove);
      element.removeEventListener('pointerleave', reset);
      if (scroll) window.removeEventListener('scroll', onScroll);
      if (frame) window.cancelAnimationFrame(frame);
      element.style.transform = '';
    };
  }, [boundedOffset, boundedStrength, disabled, scroll]);

  const fallback = (
    <span className="parallax-image__fallback" role={alt ? 'img' : undefined} aria-label={alt || undefined} aria-hidden={alt ? undefined : true}>
      {initials(alt || 'image')}
    </span>
  );
  const content = children ?? (
    src && !imageFailed ? (
      <img src={src} alt={alt} loading={loading} width={typeof width === 'number' ? width : undefined} height={typeof height === 'number' ? height : undefined} onError={() => setImageFailed(true)} />
    ) : fallback
  );

  return (
    <div
      ref={ref}
      className={`parallax-image ${disabled ? 'parallax-image--disabled' : ''} ${className}`.trim()}
      data-parallax={disabled ? 'disabled' : 'enabled'}
      style={{ ...style, maxWidth: width, height }}
    >
      {content}
    </div>
  );
}

export default ParallaxImage;
