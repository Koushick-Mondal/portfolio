import { useEffect, useId, useRef, useState, type PointerEvent, type WheelEvent } from 'react';

export interface AchievementGalleryItem {
  title: string;
  year: string;
  detail: string;
  image?: string | null;
  organization?: string;
  credential?: string;
}

export type AchievementItem = AchievementGalleryItem;

export interface AchievementGalleryProps {
  items: AchievementGalleryItem[];
  className?: string;
  heading?: string;
  lightbox?: boolean;
}

function getInitials(value: string) {
  const words = value.trim().split(/\s+/).filter(Boolean);
  return (words.slice(0, 2).map((word) => word[0]).join('') || '•').toUpperCase();
}

export function AchievementGallery({
  items,
  className = '',
  heading = 'Achievements',
  lightbox = true,
}: AchievementGalleryProps) {
  const railRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const bodyOverflow = useRef('');
  const dragRef = useRef<{ pointerId: number; startX: number; startScroll: number; moved: boolean } | null>(null);
  const suppressClick = useRef(false);
  const [imageStates, setImageStates] = useState<Record<number, 'loading' | 'loaded' | 'error'>>({});
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [reducedMotion, setReducedMotion] = useState(false);
  const headingId = useId();
  const railId = useId();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReducedMotion(media.matches);
    update();
    media.addEventListener?.('change', update);
    return () => media.removeEventListener?.('change', update);
  }, []);

  const updateImageState = (index: number, state: 'loaded' | 'error') => {
    setImageStates((current) => ({ ...current, [index]: state }));
  };

  const focusOnNextFrame = (element: HTMLElement | null) => {
    if (typeof window === 'undefined') return;
    if (typeof window.requestAnimationFrame === 'function') window.requestAnimationFrame(() => element?.focus());
    else window.setTimeout(() => element?.focus(), 0);
  };

  const closeLightbox = () => {
    const dialog = dialogRef.current;
    if (dialog?.open) {
      if (typeof dialog.close === 'function') dialog.close();
      else dialog.removeAttribute('open');
    }
    bodyOverflow.current = bodyOverflow.current || '';
    if (typeof document !== 'undefined') document.body.style.overflow = bodyOverflow.current;
    setLightboxIndex(null);
    focusOnNextFrame(triggerRef.current);
  };

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog || lightboxIndex === null) return;
    triggerRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    bodyOverflow.current = document.body.style.overflow;
    if (!dialog.open) {
      if (typeof dialog.showModal === 'function') dialog.showModal();
      else dialog.setAttribute('open', '');
    }
    document.body.style.overflow = 'hidden';
    focusOnNextFrame(closeButtonRef.current);
  }, [lightboxIndex]);

  useEffect(() => () => {
    if (dialogRef.current?.open) {
      if (typeof dialogRef.current.close === 'function') dialogRef.current.close();
      else dialogRef.current.removeAttribute('open');
    }
    if (typeof document !== 'undefined') document.body.style.overflow = bodyOverflow.current;
  }, []);

  const openLightbox = (index: number, event: React.MouseEvent<HTMLButtonElement>) => {
    if (suppressClick.current) {
      suppressClick.current = false;
      return;
    }
    if (!lightbox || !items[index]?.image || imageStates[index] !== 'loaded') return;
    triggerRef.current = event.currentTarget;
    setLightboxIndex(index);
  };

  const scrollRail = (direction: number) => {
    const rail = railRef.current;
    if (!rail) return;
    const amount = Math.max(180, rail.clientWidth * 0.8) * direction;
    if (typeof rail.scrollBy === 'function') rail.scrollBy({ left: amount, behavior: reducedMotion ? 'auto' : 'smooth' });
    else rail.scrollLeft += amount;
  };

  const onWheel = (event: WheelEvent<HTMLDivElement>) => {
    const rail = railRef.current;
    if (!rail || rail.scrollWidth <= rail.clientWidth) return;
    const delta = Math.abs(event.deltaX) >= Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
    if (!delta) return;
    event.preventDefault();
    rail.scrollLeft += delta;
  };

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    const rail = railRef.current;
    if (!rail || event.pointerType === 'touch') return;
    dragRef.current = { pointerId: event.pointerId, startX: event.clientX, startScroll: rail.scrollLeft, moved: false };
    rail.setPointerCapture?.(event.pointerId);
  };
  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const rail = railRef.current;
    const drag = dragRef.current;
    if (!rail || !drag || drag.pointerId !== event.pointerId) return;
    const distance = event.clientX - drag.startX;
    if (Math.abs(distance) > 4) drag.moved = true;
    if (drag.moved) rail.scrollLeft = drag.startScroll - distance;
  };
  const onPointerUp = (event: PointerEvent<HTMLDivElement>) => {
    const rail = railRef.current;
    const drag = dragRef.current;
    if (rail && drag?.pointerId === event.pointerId) {
      rail.releasePointerCapture?.(event.pointerId);
      if (drag.moved) {
        suppressClick.current = true;
        window.setTimeout(() => { suppressClick.current = false; }, 0);
      }
    }
    dragRef.current = null;
  };

  const selected = lightboxIndex === null ? null : items[lightboxIndex];

  return (
    <section className={`achievement-gallery ${className}`.trim()} aria-labelledby={headingId}>
      <div className="achievement-gallery__header">
        <h2 id={headingId}>{heading}</h2>
        <div className="achievement-gallery__controls">
          <button type="button" className="achievement-gallery__button" onClick={() => scrollRail(-1)} aria-label="Show previous achievements" aria-controls={railId} disabled={items.length < 2}>←</button>
          <button type="button" className="achievement-gallery__button" onClick={() => scrollRail(1)} aria-label="Show next achievements" aria-controls={railId} disabled={items.length < 2}>→</button>
        </div>
      </div>
      <div
        ref={railRef}
        id={railId}
        className="achievement-gallery__rail"
        role="region"
        aria-label="Scrollable achievements"
        tabIndex={0}
        onWheel={onWheel}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        {items.map((item, index) => {
          const hasImage = Boolean(item.image);
          const state = imageStates[index];
          const showImage = hasImage && state !== 'error';
          const image = showImage ? (
            <img
              src={item.image || undefined}
              alt={item.title}
              loading="lazy"
              onLoad={() => updateImageState(index, 'loaded')}
              onError={() => updateImageState(index, 'error')}
            />
          ) : (
            <div className={`achievement-gallery__abstract achievement-gallery__abstract--${index % 6}`} role="img" aria-label={`${item.title} abstract tile`}><span>{getInitials(item.organization || item.title)}</span><i /><b /><em /></div>
          );
          return (
            <article className="achievement-gallery__item" key={`${item.title}-${item.year}-${index}`}>
              {showImage && lightbox ? (
                <button type="button" className="achievement-gallery__image-button" disabled={state !== 'loaded'} onClick={(event) => openLightbox(index, event)} aria-label={`View image for ${item.title}`} style={{ aspectRatio: '16 / 10' }}>
                  {image}
                </button>
              ) : <div className="achievement-gallery__image" style={{ aspectRatio: '16 / 10' }}>{image}</div>}
              <div className="achievement-gallery__body">
                <p className="achievement-gallery__year">{item.year}</p>
                <h3>{item.title}</h3>
                {item.organization ? <p className="achievement-gallery__organization">{item.organization}</p> : null}
                <p className="achievement-gallery__detail">{item.detail}</p>
                {item.credential ? <a className="achievement-gallery__credential" href={item.credential} target="_blank" rel="noreferrer">View credential ↗</a> : null}
              </div>
            </article>
          );
        })}
      </div>
      {lightbox && selected?.image && imageStates[lightboxIndex ?? -1] === 'loaded' ? (
        <dialog
          ref={dialogRef}
          className="achievement-gallery__dialog"
          aria-label={`${selected.title} image`}
          onCancel={(event) => { event.preventDefault(); closeLightbox(); }}
          onClose={() => { if (lightboxIndex !== null) closeLightbox(); }}
        >
          <button ref={closeButtonRef} type="button" className="achievement-gallery__dialog-close" onClick={closeLightbox} aria-label="Close image">×</button>
          <img src={selected.image} alt={selected.title} onError={() => { if (lightboxIndex !== null) updateImageState(lightboxIndex, 'error'); closeLightbox(); }} />
          <p>{selected.title}</p>
        </dialog>
      ) : null}
    </section>
  );
}

export default AchievementGallery;
