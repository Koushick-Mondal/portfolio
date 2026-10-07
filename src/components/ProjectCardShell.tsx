import { useId, useRef, type PointerEvent, type ReactNode } from 'react';
import './project-card-shell.css';

export interface ProjectCardShellProps {
  title: string;
  category?: ReactNode;
  children: ReactNode;
  metadata?: ReactNode;
  className?: string;
  showHeader?: boolean;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

function resetCardStyle(element: HTMLElement | null) {
  if (!element) return;
  element.style.setProperty('--project-card-rotate-x', '0deg');
  element.style.setProperty('--project-card-rotate-y', '0deg');
  element.style.setProperty('--project-card-glow-x', '50%');
  element.style.setProperty('--project-card-glow-y', '50%');
}

export function ProjectCardShell({ title, category, children, metadata, className = '', showHeader = true, onMouseEnter, onMouseLeave }: ProjectCardShellProps) {
  const cardRef = useRef<HTMLElement | null>(null);
  const titleId = useId();

  const handlePointerMove = (event: PointerEvent<HTMLElement>) => {
    if (event.pointerType && event.pointerType !== 'mouse') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const card = cardRef.current;
    if (!card) return;
    const bounds = card.getBoundingClientRect();
    if (!bounds.width || !bounds.height) return;

    const horizontal = (event.clientX - bounds.left) / bounds.width * 2 - 1;
    const vertical = (event.clientY - bounds.top) / bounds.height * 2 - 1;
    const x = Math.max(-1, Math.min(1, horizontal));
    const y = Math.max(-1, Math.min(1, vertical));
    const clampDegrees = (value: number) => Math.max(-2, Math.min(2, value));

    card.style.setProperty('--project-card-rotate-x', `${clampDegrees(y * -2)}deg`);
    card.style.setProperty('--project-card-rotate-y', `${clampDegrees(x * 2)}deg`);
    card.style.setProperty('--project-card-glow-x', `${(x + 1) * 50}%`);
    card.style.setProperty('--project-card-glow-y', `${(y + 1) * 50}%`);
  };

  return (
    <article
      ref={cardRef}
      className={`project-card-shell ${showHeader ? '' : 'project-card-shell--bare'} ${className}`.trim()}
      aria-labelledby={showHeader ? titleId : undefined}
      aria-label={showHeader ? undefined : title}
      onPointerMove={handlePointerMove}
      onPointerLeave={() => resetCardStyle(cardRef.current)}
      onPointerCancel={() => resetCardStyle(cardRef.current)}
      onFocus={() => resetCardStyle(cardRef.current)}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {showHeader ? <div className="project-card-shell__header">
        <div>
          {category ? <p className="project-card-shell__category">{category}</p> : null}
          <h3 id={titleId}>{title}</h3>
        </div>
        {metadata ? <div className="project-card-shell__metadata">{metadata}</div> : null}
      </div> : null}
      <div className="project-card-shell__body">{children}</div>
    </article>
  );
}

export default ProjectCardShell;
