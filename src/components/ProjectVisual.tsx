import { useEffect, useState, type CSSProperties, type ReactNode } from 'react';

export type ProjectVisualImageState = 'fallback' | 'loading' | 'loaded' | 'error';

export interface ProjectVisualProps {
  children: ReactNode;
  image?: string | null;
  src?: string | null;
  alt?: string;
  title?: string;
  className?: string;
  aspectRatio?: string | number;
  loading?: 'eager' | 'lazy';
}

export function ProjectVisual({
  children,
  image,
  src,
  alt = '',
  title,
  className = '',
  aspectRatio = '16 / 10',
  loading = 'lazy',
}: ProjectVisualProps) {
  const source = src || image || '';
  const [state, setState] = useState<ProjectVisualImageState>(source ? 'loading' : 'fallback');

  useEffect(() => {
    setState(source ? 'loading' : 'fallback');
  }, [source]);

  const style = { aspectRatio } as CSSProperties;
  const showImage = Boolean(source) && state !== 'error';

  return (
    <figure className={`project-visual ${className}`.trim()} data-image-state={state} style={style} aria-busy={state === 'loading'}>
      {showImage ? (
        <img src={source} alt={alt} loading={loading} onLoad={() => setState('loaded')} onError={() => setState('error')} />
      ) : (
        <div className="project-visual__fallback">{children}</div>
      )}
      {title ? <figcaption className="project-visual__title">{title}</figcaption> : null}
    </figure>
  );
}

export default ProjectVisual;
