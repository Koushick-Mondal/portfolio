import {
  Component,
  createElement,
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ErrorInfo,
  type ReactNode,
  type RefObject,
} from 'react';
import { canUseWebGL, detectQuality, type Quality } from '../lib/device';
import './world-environment.css';

type Pointer = { x: number; y: number };

type SceneProps = {
  quality: Quality;
  active: boolean;
  pointer: RefObject<Pointer>;
  scrollProgress: number;
  onReady?: () => void;
  onFailure?: () => void;
};

type BoundaryProps = { children: ReactNode; onFailure: () => void };
type BoundaryState = { failed: boolean };

class WebGLErrorBoundary extends Component<BoundaryProps, BoundaryState> {
  state: BoundaryState = { failed: false };

  static getDerivedStateFromError(): BoundaryState {
    return { failed: true };
  }

  componentDidCatch(_error: Error, _info: ErrorInfo) {
    this.props.onFailure();
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}

function useMedia(query: string) {
  const [matches, setMatches] = useState(() => (
    typeof window !== 'undefined'
      && typeof window.matchMedia === 'function'
      && window.matchMedia(query).matches
  ));

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;
    const media = window.matchMedia(query);
    const update = () => setMatches(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, [query]);

  return matches;
}

function clampProgress(value: number) {
  return Math.min(1, Math.max(0, Number.isFinite(value) ? value : 0));
}

function useVisibility(host: RefObject<HTMLDivElement | null>) {
  const [sectionVisible, setSectionVisible] = useState(true);
  const [documentVisible, setDocumentVisible] = useState(() => (
    typeof document === 'undefined' || document.visibilityState !== 'hidden'
  ));

  useEffect(() => {
    const node = host.current;
    if (!node || typeof IntersectionObserver === 'undefined') return;

    // A fixed host is always in the viewport, so observe its section when it
    // is mounted inside one. This keeps the renderer idle between sections.
    const section = node.closest<HTMLElement>('[data-world-section], section') ?? node;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry) setSectionVisible(entry.isIntersecting);
    }, { threshold: 0.01 });
    observer.observe(section);
    return () => observer.disconnect();
  }, [host]);

  useEffect(() => {
    const update = () => setDocumentVisible(document.visibilityState !== 'hidden');
    document.addEventListener('visibilitychange', update);
    return () => document.removeEventListener('visibilitychange', update);
  }, []);

  return sectionVisible && documentVisible;
}

function useScrollProgress(
  host: RefObject<HTMLDivElement | null>,
  providedProgress: number | undefined,
  reducedMotion: boolean,
) {
  const [measuredProgress, setMeasuredProgress] = useState(0);

  useEffect(() => {
    if (providedProgress !== undefined || reducedMotion) {
      setMeasuredProgress(0);
      return;
    }

    const node = host.current;
    if (!node || typeof window === 'undefined') return;
    const section = node.closest<HTMLElement>('[data-world-section], section') ?? document.body;
    let frame = 0;

    const update = () => {
      frame = 0;
      const bounds = section.getBoundingClientRect();
      const travel = Math.max(bounds.height, window.innerHeight, 1);
      setMeasuredProgress(clampProgress(-bounds.top / travel));
    };
    const schedule = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule, { passive: true });
    return () => {
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [host, providedProgress, reducedMotion]);

  return providedProgress === undefined ? measuredProgress : clampProgress(providedProgress);
}

/*
 * Keep the renderer in a lazy module so pages that only need the atmospheric
 * fallback do not download Three.js/R3F until WebGL is actually available.
 */
const WorldWebGL = lazy(async () => {
  const [{ Canvas, useFrame }, THREE] = await Promise.all([
    import('@react-three/fiber'),
    import('three'),
  ]);

  type Particle = { x: number; y: number; z: number; phase: number; speed: number; size: number };

  const seeded = (index: number, channel: number) => {
    const value = Math.sin(index * 12.9898 + channel * 78.233) * 43758.5453;
    return value - Math.floor(value);
  };

  function SceneContent({ quality, active, pointer, scrollProgress, onReady }: SceneProps) {
    const particleCount = quality === 'high' ? 420 : quality === 'medium' ? 250 : 120;
    const particles = useRef<InstanceType<typeof THREE.InstancedMesh>>(null);
    const sceneGroup = useRef<InstanceType<typeof THREE.Group>>(null);
    const wireGroup = useRef<InstanceType<typeof THREE.Group>>(null);
    const temporary = useMemo(() => new THREE.Object3D(), []);
    const particleData = useMemo<Particle[]>(() => Array.from({ length: particleCount }, (_, index) => ({
      x: (seeded(index, 1) - 0.5) * 8.5,
      y: (seeded(index, 2) - 0.5) * 5.5,
      z: (seeded(index, 3) - 0.5) * 4.5,
      phase: seeded(index, 4) * Math.PI * 2,
      speed: 0.15 + seeded(index, 5) * 0.35,
      size: 0.35 + seeded(index, 6) * 0.8,
    })), [particleCount]);

    const particleGeometry = useMemo(() => new THREE.IcosahedronGeometry(0.025, 0), []);
    const particleMaterial = useMemo(() => new THREE.MeshBasicMaterial({
      color: 0x66d9ff,
      transparent: true,
      opacity: quality === 'low' ? 0.42 : 0.58,
      depthWrite: false,
    }), [quality]);

    const nodePositions = useMemo(() => [
      [-2.8, 1.15, -0.55], [-1.25, -0.75, 0.35], [0.15, 1.45, -0.1],
      [1.5, 0.15, 0.55], [2.75, -1.1, -0.35], [0.7, -1.45, -0.7],
    ].map(([x, y, z]) => new THREE.Vector3(x, y, z)), []);
    const lineGeometry = useMemo(() => {
      const vertices: number[] = [];
      [[0, 1], [0, 2], [1, 2], [1, 3], [2, 3], [3, 4], [3, 5], [4, 5]].forEach(([from, to]) => {
        vertices.push(...nodePositions[from].toArray(), ...nodePositions[to].toArray());
      });
      return new THREE.BufferGeometry().setAttribute(
        'position',
        new THREE.Float32BufferAttribute(vertices, 3),
      );
    }, [nodePositions]);
    const lineMaterial = useMemo(() => new THREE.LineBasicMaterial({
      color: 0x2e8daa,
      transparent: true,
      opacity: 0.22,
      depthWrite: false,
    }), []);
    const nodeGeometry = useMemo(() => new THREE.SphereGeometry(0.045, 6, 6), []);
    const nodeMaterial = useMemo(() => new THREE.MeshBasicMaterial({
      color: 0xb1f1ff,
      transparent: true,
      opacity: 0.68,
      depthWrite: false,
    }), []);
    const wireMaterial = useMemo(() => new THREE.MeshBasicMaterial({
      color: 0x4ec4df,
      wireframe: true,
      transparent: true,
      opacity: 0.2,
      depthWrite: false,
    }), []);
    const wireMaterialWarm = useMemo(() => new THREE.MeshBasicMaterial({
      color: 0x8d8cff,
      wireframe: true,
      transparent: true,
      opacity: 0.14,
      depthWrite: false,
    }), []);
    const wireGeometry = useMemo(() => new THREE.OctahedronGeometry(0.88, 1), []);
    const wireGeometrySmall = useMemo(() => new THREE.IcosahedronGeometry(0.52, 1), []);
    const wireGeometryKnot = useMemo(() => new THREE.TorusKnotGeometry(0.42, 0.075, 48, 6), []);

    useEffect(() => {
      onReady?.();
      return () => {
        particleGeometry.dispose();
        particleMaterial.dispose();
        lineGeometry.dispose();
        lineMaterial.dispose();
        nodeGeometry.dispose();
        nodeMaterial.dispose();
        wireMaterial.dispose();
        wireMaterialWarm.dispose();
        wireGeometry.dispose();
        wireGeometrySmall.dispose();
        wireGeometryKnot.dispose();
      };
    }, [
      lineGeometry, lineMaterial, nodeGeometry, nodeMaterial, onReady, particleGeometry,
      particleMaterial, wireGeometry, wireGeometryKnot, wireGeometrySmall, wireMaterial,
      wireMaterialWarm,
    ]);

    useFrame(({ clock }) => {
      if (!active) return;
      const time = clock.getElapsedTime();
      const pointerX = pointer.current.x * 0.16;
      const pointerY = pointer.current.y * 0.12;

      if (sceneGroup.current) {
        sceneGroup.current.rotation.y += 0.0007;
        sceneGroup.current.rotation.x = pointerY * 0.08 + scrollProgress * 0.05;
        sceneGroup.current.position.y = scrollProgress * -0.18;
      }
      if (wireGroup.current) {
        wireGroup.current.rotation.x = time * 0.07 + pointerY * 0.16;
        wireGroup.current.rotation.y = time * 0.1 + pointerX * 0.2;
      }

      const mesh = particles.current;
      if (!mesh) return;
      particleData.forEach((particle, index) => {
        const drift = time * particle.speed + particle.phase;
        temporary.position.set(
          particle.x + Math.sin(drift) * 0.08 + pointerX * (0.28 + particle.size * 0.1),
          particle.y + Math.cos(drift * 0.8) * 0.07 + pointerY * (0.2 + particle.size * 0.1) - scrollProgress * 0.22,
          particle.z + Math.sin(drift * 0.55) * 0.06,
        );
        temporary.scale.setScalar(particle.size);
        temporary.updateMatrix();
        mesh.setMatrixAt(index, temporary.matrix);
      });
      mesh.instanceMatrix.needsUpdate = true;
    });

    return createElement(
      'group',
      { ref: sceneGroup },
      createElement('instancedMesh', { ref: particles, args: [particleGeometry, particleMaterial, particleCount] }),
      createElement('lineSegments', { geometry: lineGeometry, material: lineMaterial }),
      createElement('instancedMesh', {
        args: [nodeGeometry, nodeMaterial, nodePositions.length],
        onUpdate: (mesh: InstanceType<typeof THREE.InstancedMesh>) => {
          nodePositions.forEach((position, index) => {
            temporary.position.copy(position);
            temporary.scale.setScalar(1);
            temporary.updateMatrix();
            mesh.setMatrixAt(index, temporary.matrix);
          });
          mesh.instanceMatrix.needsUpdate = true;
        },
      }),
      createElement(
        'group',
        { ref: wireGroup },
        createElement('mesh', { geometry: wireGeometry, material: wireMaterial, position: [-2.1, 0.85, -0.7] }),
        createElement('mesh', { geometry: wireGeometrySmall, material: wireMaterialWarm, position: [2.2, -0.65, -0.4] }),
        createElement('mesh', { geometry: wireGeometryKnot, material: wireMaterial, position: [0.3, 1.6, -1.15] }),
      ),
    );
  }

  function DynamicScene(props: SceneProps) {
    const canvas = useRef<HTMLCanvasElement>(null);
    const handleContextLoss = useCallback((event: Event) => {
      event.preventDefault();
      props.onFailure?.();
    }, [props]);

    useEffect(() => {
      const element = canvas.current;
      if (!element) return;
      element.addEventListener('webglcontextlost', handleContextLoss);
      return () => element.removeEventListener('webglcontextlost', handleContextLoss);
    }, [handleContextLoss]);

    const CanvasElement = Canvas as unknown as React.ComponentType<Record<string, unknown>>;
    return createElement(
      CanvasElement,
      {
        ref: canvas,
        className: 'world-environment__canvas',
        camera: { position: [0, 0, 7], fov: 42 },
        dpr: props.quality === 'high' ? [1, 1.35] : 1,
        frameloop: props.active ? 'always' : 'demand',
        gl: { alpha: true, antialias: props.quality !== 'low', powerPreference: 'high-performance' },
      },
      createElement(SceneContent, props),
    );
  }

  return { default: DynamicScene };
});

export type WorldEnvironmentProps = {
  sectionProgress?: number;
  className?: string;
};

export default function WorldEnvironment({ sectionProgress, className = '' }: WorldEnvironmentProps) {
  const host = useRef<HTMLDivElement>(null);
  const pointer = useRef<Pointer>({ x: 0, y: 0 });
  const [quality, setQuality] = useState<Quality>('medium');
  const [webgl, setWebgl] = useState<boolean | null>(null);
  const reducedMotion = useMedia('(prefers-reduced-motion: reduce)');
  const coarsePointer = useMedia('(pointer: coarse)');
  const visible = useVisibility(host);
  const scrollProgress = useScrollProgress(host, sectionProgress, reducedMotion);
  const simplified = reducedMotion || coarsePointer;
  const active = visible && !reducedMotion;
  const renderQuality: Quality = simplified ? 'low' : quality;

  const handleFailure = useCallback(() => setWebgl(false), []);
  const handleReady = useCallback(() => setWebgl(true), []);

  useEffect(() => {
    setQuality(detectQuality());
    setWebgl(canUseWebGL());
  }, []);

  useEffect(() => {
    if (reducedMotion || coarsePointer) {
      pointer.current = { x: 0, y: 0 };
      return;
    }
    const move = (event: PointerEvent) => {
      pointer.current.x = (event.clientX / Math.max(window.innerWidth, 1)) * 2 - 1;
      pointer.current.y = -(event.clientY / Math.max(window.innerHeight, 1)) * 2 + 1;
    };
    window.addEventListener('pointermove', move, { passive: true });
    return () => window.removeEventListener('pointermove', move);
  }, [coarsePointer, reducedMotion]);

  const style = {
    '--world-progress': scrollProgress,
  } as CSSProperties;
  const classes = ['world-environment', className].filter(Boolean).join(' ');

  return <div
    ref={host}
    className={classes}
    data-quality={renderQuality}
    data-reduced-motion={reducedMotion ? 'true' : 'false'}
    style={style}
    aria-hidden="true"
  >
    <div className="world-environment__fallback">
      <span className="world-environment__glow world-environment__glow--one" />
      <span className="world-environment__glow world-environment__glow--two" />
      <span className="world-environment__horizon" />
      <span className="world-environment__grain" />
    </div>
    {webgl === true && !reducedMotion && <WebGLErrorBoundary onFailure={handleFailure}>
      <Suspense fallback={null}>
        <WorldWebGL
          quality={renderQuality}
          active={active}
          pointer={pointer}
          scrollProgress={scrollProgress}
          onReady={handleReady}
          onFailure={handleFailure}
        />
      </Suspense>
    </WebGLErrorBoundary>}
  </div>;
}
