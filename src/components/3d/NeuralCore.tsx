import { useEffect, useMemo, useRef, type RefObject } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import type { Quality } from '../../lib/device';

export type PointerVector = { x: number; y: number };

type NeuralCoreProps = {
  quality: Quality;
  stage: number;
  pointer: RefObject<PointerVector>;
  active: boolean;
  scrollProgress: number;
};

const networkNodes = [
  [-1.46, 0.52, 0.22], [-0.76, 1.04, -0.15], [0, 0.7, 0.24], [0.78, 1.02, -0.1],
  [1.47, 0.48, 0.16], [-1.58, -0.3, -0.12], [-0.74, -0.58, 0.16], [0.05, -0.31, -0.2],
  [0.83, -0.6, 0.2], [1.53, -0.2, -0.08], [-0.16, 0.06, 0.38],
] as const;

const networkEdges: Array<[number, number]> = [
  [0, 1], [1, 2], [2, 3], [3, 4], [5, 6], [6, 7], [7, 8], [8, 9],
  [0, 5], [1, 6], [2, 7], [3, 8], [4, 9], [1, 10], [2, 10], [6, 10], [7, 10],
];

function useOwnedGeometry<T extends THREE.BufferGeometry>(factory: () => T, dependencies: unknown[]) {
  const geometry = useMemo(factory, dependencies);

  useEffect(() => () => geometry.dispose(), [geometry]);
  return geometry;
}

function ParticleField({ quality, stage, active }: { quality: Quality; stage: number; active: boolean }) {
  const points = useRef<THREE.Points>(null);
  const material = useRef<THREE.PointsMaterial>(null);
  const geometry = useOwnedGeometry(() => {
    const count = quality === 'high' ? 1450 : quality === 'medium' ? 850 : 430;
    const values = new Float32Array(count * 3);

    for (let index = 0; index < count; index += 1) {
      const shell = 2.05 + (index % 17) * 0.105;
      const angle = index * 2.399963;
      const vertical = Math.sin(angle * 1.41) * shell * (0.47 + (index % 9) / 30);
      values[index * 3] = Math.cos(angle) * shell * (0.8 + (index % 5) / 22);
      values[index * 3 + 1] = vertical;
      values[index * 3 + 2] = Math.sin(angle) * shell * (0.62 + (index % 7) / 26);
    }

    const value = new THREE.BufferGeometry();
    value.setAttribute('position', new THREE.BufferAttribute(values, 3));
    return value;
  }, [quality]);

  useFrame(({ clock }, delta) => {
    if (!active || !points.current) return;
    points.current.rotation.y += delta * 0.025;
    points.current.rotation.x = Math.sin(clock.elapsedTime * 0.11) * 0.035;
    if (material.current) {
      material.current.opacity = 0.36 + stage * 0.075 + Math.sin(clock.elapsedTime * 0.8) * 0.035;
    }
  });

  return <points ref={points} geometry={geometry} dispose={null}>
    <pointsMaterial
      ref={material}
      color="#668bff"
      size={quality === 'low' ? 0.029 : 0.021}
      sizeAttenuation
      transparent
      opacity={0.42 + stage * 0.075}
      depthWrite={false}
      blending={THREE.AdditiveBlending}
    />
  </points>;
}

function Connections({ stage, active }: { stage: number; active: boolean }) {
  const material = useRef<THREE.LineBasicMaterial>(null);
  const nodes = useRef<Array<THREE.Mesh | null>>([]);
  const geometry = useOwnedGeometry(() => {
    const values: number[] = [];
    networkEdges.forEach(([from, to]) => values.push(...networkNodes[from], ...networkNodes[to]));
    const value = new THREE.BufferGeometry();
    value.setAttribute('position', new THREE.Float32BufferAttribute(values, 3));
    return value;
  }, []);

  useFrame(({ clock }) => {
    if (!active) return;
    if (material.current) material.current.opacity = 0.24 + stage * 0.09 + Math.sin(clock.elapsedTime * 1.2) * 0.035;
    nodes.current.forEach((node, index) => {
      if (!node) return;
      node.scale.setScalar(1 + Math.sin(clock.elapsedTime * 1.5 + index * 0.7) * 0.075 + stage * 0.045);
    });
  });

  return <group>
    <lineSegments geometry={geometry} dispose={null}>
      <lineBasicMaterial ref={material} color="#4b75ff" transparent opacity={0.28 + stage * 0.09} depthWrite={false} blending={THREE.AdditiveBlending} />
    </lineSegments>
    {networkNodes.map((position, index) => <mesh key={index} ref={(node) => { nodes.current[index] = node; }} position={position}>
      <sphereGeometry args={[index === 10 ? 0.105 : 0.055, 12, 12]} />
      <meshBasicMaterial color={index === 10 ? '#d1ddff' : '#74a0ff'} toneMapped={false} />
    </mesh>)}
  </group>;
}

function DataPulses({ quality, stage, active }: { quality: Quality; stage: number; active: boolean }) {
  const pulseRefs = useRef<Array<THREE.Mesh | null>>([]);
  const count = quality === 'high' ? 15 : quality === 'medium' ? 10 : 6;

  useFrame(({ clock }) => {
    if (!active) return;
    const elapsed = clock.elapsedTime;
    pulseRefs.current.forEach((pulse, index) => {
      if (!pulse) return;
      const [fromIndex, toIndex] = networkEdges[index % networkEdges.length];
      const from = networkNodes[fromIndex];
      const to = networkNodes[toIndex];
      const progress = (elapsed * (0.15 + stage * 0.035) + index * 0.13) % 1;
      const eased = progress * progress * (3 - 2 * progress);
      pulse.position.set(
        THREE.MathUtils.lerp(from[0], to[0], eased),
        THREE.MathUtils.lerp(from[1], to[1], eased),
        THREE.MathUtils.lerp(from[2], to[2], eased),
      );
      pulse.scale.setScalar(0.7 + stage * 0.12 + Math.sin(elapsed * 3 + index) * 0.12);
    });
  });

  return <group>
    {Array.from({ length: count }, (_, index) => <mesh key={index} ref={(pulse) => { pulseRefs.current[index] = pulse; }}>
      <octahedronGeometry args={[0.055, 0]} />
      <meshBasicMaterial color="#b2eaff" transparent opacity={0.62 + stage * 0.08} toneMapped={false} blending={THREE.AdditiveBlending} />
    </mesh>)}
  </group>;
}

function Orbits({ active }: { active: boolean }) {
  const orbitGroup = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (!active || !orbitGroup.current) return;
    orbitGroup.current.rotation.y += delta * 0.018;
    orbitGroup.current.rotation.z -= delta * 0.011;
  });

  const rings = [
    { radius: 1.42, rotation: [1.05, 0.2, 0.15] as [number, number, number], color: '#7194ff', opacity: 0.34 },
    { radius: 1.73, rotation: [0.22, 0.84, -0.48] as [number, number, number], color: '#70d4ff', opacity: 0.28 },
    { radius: 2.02, rotation: [1.32, -0.52, 0.42] as [number, number, number], color: '#a287ff', opacity: 0.25 },
    { radius: 2.28, rotation: [0.62, 1.12, 0.92] as [number, number, number], color: '#7d8dff', opacity: 0.2 },
    { radius: 2.52, rotation: [1.72, 0.42, -1.05] as [number, number, number], color: '#9bdcff', opacity: 0.16 },
  ];

  return <group ref={orbitGroup}>
    {rings.map((ring) => <mesh key={ring.radius} rotation={ring.rotation}>
      <torusGeometry args={[ring.radius, 0.0045, 6, 128]} />
      <meshBasicMaterial color={ring.color} transparent opacity={ring.opacity} depthWrite={false} blending={THREE.AdditiveBlending} />
    </mesh>)}
  </group>;
}

function MicroGeometry({ quality, active }: { quality: Quality; active: boolean }) {
  const group = useRef<THREE.Group>(null);
  const positions = useMemo(() => [
    [-2.05, 0.78, 0.18], [1.94, 0.92, -0.1], [-2.1, -0.82, 0.05], [2.08, -0.72, 0.2],
    [-1.72, 1.45, -0.35], [1.63, 1.42, 0.25], [-1.72, -1.42, -0.22], [1.76, -1.35, -0.3],
  ], []);
  const visiblePositions = quality === 'low' ? positions.slice(0, 4) : positions;

  useFrame(({ clock }, delta) => {
    if (!active || !group.current) return;
    group.current.rotation.y -= delta * 0.028;
    group.current.rotation.x = Math.sin(clock.elapsedTime * 0.24) * 0.04;
  });

  return <group ref={group}>
    {visiblePositions.map((position, index) => <mesh key={index} position={position as [number, number, number]} rotation={[index * 0.4, index * 0.7, index * 0.22]}>
      {index % 2 === 0 ? <boxGeometry args={[0.045, 0.045, 0.045]} /> : <tetrahedronGeometry args={[0.055, 0]} />}
      <meshBasicMaterial color={index % 2 === 0 ? '#7898ff' : '#9edbff'} transparent opacity={0.48} depthWrite={false} />
    </mesh>)}
  </group>;
}

function CoreBody({ stage, active }: { stage: number; active: boolean }) {
  const group = useRef<THREE.Group>(null);
  useFrame(({ clock }, delta) => {
    if (!active || !group.current) return;
    group.current.rotation.x += delta * 0.035;
    group.current.rotation.y -= delta * 0.048;
    const scale = 1 + stage * 0.035 + Math.sin(clock.elapsedTime * 1.4) * 0.018;
    group.current.scale.setScalar(scale);
  });

  return <group ref={group}>
    <mesh>
      <dodecahedronGeometry args={[0.48, 1]} />
      <meshBasicMaterial color="#d5e6ff" transparent opacity={0.1 + stage * 0.025} wireframe toneMapped={false} />
    </mesh>
    <mesh rotation={[0.2, 0.5, 0.1]}>
      <octahedronGeometry args={[0.35, 1]} />
      <meshBasicMaterial color="#7095ff" transparent opacity={0.24 + stage * 0.035} wireframe toneMapped={false} blending={THREE.AdditiveBlending} />
    </mesh>
    <mesh scale={0.52 + stage * 0.03}>
      <icosahedronGeometry args={[0.5, 1]} />
      <meshBasicMaterial color="#c4f0ff" transparent opacity={0.11 + stage * 0.02} toneMapped={false} />
    </mesh>
  </group>;
}

export default function NeuralCore({ quality, stage, pointer, active, scrollProgress }: NeuralCoreProps) {
  const assembly = useRef<THREE.Group>(null);
  const { camera } = useThree();

  useFrame((_, delta) => {
    const boundedProgress = THREE.MathUtils.clamp(scrollProgress, 0, 1);
    camera.position.z = THREE.MathUtils.damp(camera.position.z, 6.35 - boundedProgress * 1.05, 3.2, delta);
    camera.position.y = THREE.MathUtils.damp(camera.position.y, boundedProgress * 0.12, 3.2, delta);
    camera.lookAt(0, 0, 0);

    if (!active || !assembly.current) return;
    const target = pointer.current;
    assembly.current.rotation.y = THREE.MathUtils.damp(assembly.current.rotation.y, target.x * 0.11, 3.5, delta);
    assembly.current.rotation.x = THREE.MathUtils.damp(assembly.current.rotation.x, target.y * 0.07, 3.5, delta);
    const expansion = 1 + boundedProgress * 0.08;
    assembly.current.scale.setScalar(expansion);
  });

  return <>
    <ambientLight intensity={0.22} />
    <pointLight position={[2, 2, 3]} color="#527bff" intensity={7} distance={7} />
    <pointLight position={[-3, -1, 2]} color="#8a62ff" intensity={4.5} distance={6} />
    <group ref={assembly}>
      <ParticleField quality={quality} stage={stage} active={active} />
      <Orbits active={active} />
      <Connections stage={stage} active={active} />
      <DataPulses quality={quality} stage={stage} active={active} />
      <MicroGeometry quality={quality} active={active} />
      <CoreBody stage={stage} active={active} />
    </group>
  </>;
}
