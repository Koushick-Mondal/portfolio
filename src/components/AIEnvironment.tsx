import { Component, lazy, Suspense, useCallback, useEffect, useRef, useState, type CSSProperties, type ErrorInfo, type ReactNode, type RefObject } from 'react';
import { canUseWebGL, detectQuality, type Quality } from '../lib/device';
import type { PointerVector } from './3d/NeuralCore';

const NeuralCanvas = lazy(() => import('./3d/NeuralCanvas'));

type BoundaryProps = { children: ReactNode; onFailure: () => void };
type BoundaryState = { failed: boolean };

class WebGLBoundary extends Component<BoundaryProps, BoundaryState> {
  state: BoundaryState = { failed: false };
  static getDerivedStateFromError(): BoundaryState { return { failed: true }; }
  componentDidCatch(_error: Error, _info: ErrorInfo) { this.props.onFailure(); }
  render() { return this.state.failed ? null : this.props.children; }
}

function useMedia(query: string) {
  const [matches, setMatches] = useState(() => typeof window !== 'undefined' && typeof window.matchMedia === 'function' && window.matchMedia(query).matches);
  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return;
    const media = window.matchMedia(query);
    const update = () => setMatches(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, [query]);
  return matches;
}

function useVisibility(host: RefObject<HTMLDivElement | null>) {
  const [visible, setVisible] = useState(true);
  const [documentVisible, setDocumentVisible] = useState(() => typeof document === 'undefined' || document.visibilityState !== 'hidden');

  useEffect(() => {
    const node = host.current;
    if (!node || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry) setVisible(entry.isIntersecting);
    }, { threshold: 0.05 });
    observer.observe(node);
    return () => observer.disconnect();
  }, [host]);

  useEffect(() => {
    const update = () => setDocumentVisible(document.visibilityState !== 'hidden');
    document.addEventListener('visibilitychange', update);
    return () => document.removeEventListener('visibilitychange', update);
  }, []);

  return visible && documentVisible;
}

function useHeroProgress(host: RefObject<HTMLDivElement | null>, reducedMotion: boolean) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (reducedMotion) {
      setProgress(0);
      return;
    }

    const node = host.current;
    const hero = node?.closest<HTMLElement>('.hero') ?? document.getElementById('home');
    if (!hero) return;
    let frame = 0;
    const update = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        const bounds = hero.getBoundingClientRect();
        setProgress(Math.min(1, Math.max(0, -bounds.top / Math.max(bounds.height, 1))));
      });
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update, { passive: true });
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [host, reducedMotion]);

  return progress;
}

const stageLabels = ['Core idle', 'Sampling vectors…', 'Traversing connections…', 'Synthesizing response…'];

function Fallback({ stage, onClick, reducedMotion }: { stage: number; onClick: () => void; reducedMotion: boolean }) {
  return <button
    type="button"
    className={`neural-fallback ${stage && !reducedMotion ? 'is-processing' : ''}`}
    onClick={onClick}
    aria-label="Activate neural core"
    aria-pressed={stage > 0}
    style={{ '--inference-stage': stage } as CSSProperties}
  >
    <span className="neural-fallback__halo neural-fallback__halo--one" />
    <span className="neural-fallback__halo neural-fallback__halo--two" />
    <span className="neural-fallback__ring neural-fallback__ring--one" />
    <span className="neural-fallback__ring neural-fallback__ring--two" />
    <span className="neural-fallback__core" />
    {Array.from({ length: 16 }, (_, index) => <i key={index} style={{ '--i': index } as CSSProperties} />)}
  </button>;
}

export default function AIEnvironment({ onInference }: { onInference?: (active: boolean) => void }) {
  const host = useRef<HTMLDivElement>(null);
  const pointer = useRef<PointerVector>({ x: 0, y: 0 });
  const [quality, setQuality] = useState<Quality>('medium');
  const [webgl, setWebgl] = useState<boolean | null>(null);
  const [canvasReady, setCanvasReady] = useState(false);
  const [stage, setStage] = useState(0);
  const reducedMotion = useMedia('(prefers-reduced-motion: reduce)');
  const visible = useVisibility(host);
  const scrollProgress = useHeroProgress(host, reducedMotion);
  const rendererActive = visible && !reducedMotion;

  const handleReady = useCallback(() => setCanvasReady(true), []);
  const handleFailure = useCallback(() => {
    setCanvasReady(false);
    setWebgl(false);
  }, []);

  useEffect(() => {
    if (reducedMotion) setCanvasReady(false);
  }, [reducedMotion]);

  useEffect(() => {
    setQuality(detectQuality());
    setWebgl(canUseWebGL());
  }, []);

  useEffect(() => {
    if (reducedMotion) return;
    const move = (event: PointerEvent) => {
      if (event.pointerType === 'touch') return;
      pointer.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = -(event.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('pointermove', move, { passive: true });
    return () => window.removeEventListener('pointermove', move);
  }, [reducedMotion]);

  useEffect(() => {
    if (!stage) return;
    const timer = window.setTimeout(() => {
      if (stage >= 3) {
        setStage(0);
        onInference?.(false);
      } else {
        setStage(stage + 1);
      }
    }, reducedMotion ? 170 : 760);
    return () => window.clearTimeout(timer);
  }, [stage, reducedMotion, onInference]);

  useEffect(() => () => onInference?.(false), [onInference]);

  const activate = useCallback(() => {
    if (stage) return;
    onInference?.(true);
    setStage(1);
  }, [onInference, stage]);

  const style = {
    '--scroll-progress': scrollProgress,
    '--inference-stage': stage,
  } as CSSProperties;

  return <div ref={host} className="ai-environment" data-quality={quality} style={style}>
    <div className="ai-environment__labels" aria-hidden="true"><span>MEMORY</span><span>INFERENCE</span><span>REASONING</span><span>AGENTS</span></div>
    {(!canvasReady || webgl !== true || reducedMotion) && <Fallback stage={stage} onClick={activate} reducedMotion={reducedMotion} />}
    {webgl === true && !reducedMotion && <WebGLBoundary onFailure={handleFailure}>
      <Suspense fallback={null}>
        <NeuralCanvas quality={quality} stage={stage} pointer={pointer} active={rendererActive} scrollProgress={scrollProgress} onReady={handleReady} onFailure={handleFailure} />
      </Suspense>
    </WebGLBoundary>}
    <button type="button" className="core-interaction" onClick={activate} aria-controls="core-inference-status" aria-pressed={stage > 0}>
      {stage ? stageLabels[stage] : 'CLICK CORE / RUN INFERENCE'} <span aria-hidden="true">↗</span>
    </button>
    <span id="core-inference-status" className="core-status" role="status" aria-live="polite" aria-atomic="true">{stageLabels[stage]}</span>
  </div>;
}
