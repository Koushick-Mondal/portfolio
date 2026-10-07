import { lazy, Suspense, useEffect, useRef, type RefObject } from 'react';
import { Canvas } from '@react-three/fiber';
import type { PointerVector } from './NeuralCore';
import type { Quality } from '../../lib/device';

const NeuralCore = lazy(() => import('./NeuralCore'));

type NeuralCanvasProps = {
  quality: Quality;
  stage: number;
  pointer: RefObject<PointerVector>;
  active: boolean;
  scrollProgress: number;
  onReady?: () => void;
  onFailure?: () => void;
};

function SceneReady({ onReady }: { onReady?: () => void }) {
  useEffect(() => { onReady?.(); }, [onReady]);
  return null;
}

export default function NeuralCanvas({ quality, stage, pointer, active, scrollProgress, onReady, onFailure }: NeuralCanvasProps) {
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const element = canvas.current;
    if (!element) return;
    const handleContextLoss = (event: Event) => {
      event.preventDefault();
      onFailure?.();
    };
    element.addEventListener('webglcontextlost', handleContextLoss);
    return () => element.removeEventListener('webglcontextlost', handleContextLoss);
  }, [onFailure]);

  return <Canvas
    ref={canvas}
    camera={{ position: [0, 0, 6.35], fov: 42 }}
    dpr={quality === 'high' ? [1, 1.5] : 1}
    frameloop={active ? 'always' : 'demand'}
    gl={{ alpha: true, antialias: quality !== 'low', powerPreference: 'high-performance' }}
  >
    <Suspense fallback={null}>
      <NeuralCore quality={quality} stage={stage} pointer={pointer} active={active} scrollProgress={scrollProgress} />
      <SceneReady onReady={onReady} />
    </Suspense>
  </Canvas>;
}
