import { Component, useEffect, useMemo, useRef, useState, type MutableRefObject, type ReactNode } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Edges } from '@react-three/drei'
import * as THREE from 'three'
import './core.css'

export interface EngineeringCoreProps {
  className?: string
}

type BoundaryProps = { children: ReactNode; fallback: ReactNode }
type BoundaryState = { failed: boolean }

class WebGLBoundary extends Component<BoundaryProps, BoundaryState> {
  state: BoundaryState = { failed: false }

  static getDerivedStateFromError(): BoundaryState {
    return { failed: true }
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children
  }
}

const plateLayout = [
  { z: -1.05, y: 0.14, scale: 0.76, tone: '#414a56' },
  { z: -0.55, y: -0.08, scale: 0.88, tone: '#505b68' },
  { z: -0.08, y: 0.05, scale: 1, tone: '#606d7c' },
  { z: 0.39, y: -0.14, scale: 0.9, tone: '#424e5c' },
  { z: 0.86, y: 0.1, scale: 0.72, tone: '#303c4a' },
]

const blockLayout = [
  [-2.85, 1.42, -0.75], [-2.45, -1.5, 0.45], [-1.35, 1.84, 0.9],
  [0.05, -1.85, -0.6], [1.4, 1.72, -0.55], [2.48, -1.18, 0.78],
  [2.8, 0.78, -0.15], [0.55, 1.52, 1.15], [-2.05, 0.42, 1.3],
] as const

function useMedia(query: string) {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    const media = window.matchMedia(query)
    const update = () => setMatches(media.matches)
    update()
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [query])

  return matches
}

function Plate({ index, explode, animate }: { index: number; explode: MutableRefObject<number>; animate: boolean }) {
  const group = useRef<THREE.Group>(null)
  const plate = plateLayout[index]
  const direction = index - (plateLayout.length - 1) / 2

  useFrame((_, delta) => {
    if (!group.current || !animate) return
    const separation = explode.current * direction * 0.34
    group.current.position.z = THREE.MathUtils.damp(group.current.position.z, plate.z + separation, 5, delta)
    group.current.position.x = THREE.MathUtils.damp(group.current.position.x, direction * explode.current * 0.12, 5, delta)
  })

  return (
    <group ref={group} position={[0, plate.y, plate.z]} scale={plate.scale}>
      <mesh position={[-0.45, 0, 0]}>
        <boxGeometry args={[4.35, 2.58, 0.12]} />
        <meshStandardMaterial color={plate.tone} metalness={0.32} roughness={0.38} />
        <Edges color="#a0adba" threshold={20} opacity={0.42} transparent />
      </mesh>
      <mesh position={[2.08 + direction * 0.04, 0.68, 0.03]}>
        <boxGeometry args={[0.72, 1.18, 0.15]} />
        <meshStandardMaterial color="#6b7785" metalness={0.4} roughness={0.32} />
        <Edges color="#8c9aa9" opacity={0.62} transparent />
      </mesh>
      <mesh position={[1.85, -0.84, 0.03]}>
        <boxGeometry args={[1.18, 0.48, 0.15]} />
        <meshStandardMaterial color="#465362" metalness={0.35} roughness={0.38} />
        <Edges color="#778695" opacity={0.52} transparent />
      </mesh>
      <mesh position={[-0.25, 0.42, 0.1]}>
        <boxGeometry args={[3.45, 0.055, 0.045]} />
        <meshBasicMaterial color="#1677ff" toneMapped={false} />
      </mesh>
      <mesh position={[0.96, -0.5, 0.1]}>
        <boxGeometry args={[1.05, 0.06, 0.045]} />
        <meshBasicMaterial color="#3d9cff" toneMapped={false} />
      </mesh>
    </group>
  )
}

function Scaffold() {
  return (
    <mesh>
      <boxGeometry args={[5.7, 3.35, 2.7]} />
      <meshBasicMaterial visible={false} />
      <Edges color="#8b9caf" transparent opacity={0.13} />
    </mesh>
  )
}

function ConnectionField() {
  const geometry = useMemo(() => {
    const points = [
      [-2.4, 0.7, 0.15, -0.7, 0.15, 0.28], [-0.7, 0.15, 0.28, 0.2, 0.72, 0.05],
      [0.2, 0.72, 0.05, 1.7, 0.15, -0.2], [1.7, 0.15, -0.2, 2.45, 1.05, 0.2],
      [-2.15, -0.9, -0.15, -0.7, 0.15, 0.28], [-0.7, 0.15, 0.28, 0.45, -0.92, 0.18],
      [0.45, -0.92, 0.18, 1.7, 0.15, -0.2], [0.2, 0.72, 0.05, 0.45, -0.92, 0.18],
    ].flat();
    const buffer = new THREE.BufferGeometry();
    buffer.setAttribute('position', new THREE.Float32BufferAttribute(points, 3));
    return buffer;
  }, []);
  useEffect(() => () => geometry.dispose(), [geometry])
  const nodes = [[-2.4, 0.7, 0.15], [-0.7, 0.15, 0.28], [0.2, 0.72, 0.05], [1.7, 0.15, -0.2], [0.45, -0.92, 0.18]] as const;
  return <group position={[0, 0, 1.12]} scale={0.66}>
    <lineSegments geometry={geometry}><lineBasicMaterial color="#478cff" transparent opacity={0.4} toneMapped={false} /></lineSegments>
    {nodes.map((point, index) => <mesh key={index} position={point} scale={index === 1 ? 1.5 : 1}>
      <sphereGeometry args={[0.055, 8, 8]} /><meshBasicMaterial color={index === 1 ? '#a8c7ff' : '#3686ff'} toneMapped={false} />
    </mesh>)}
  </group>;
}

function ComputationalBlocks({ compact, explode, animate }: { compact: boolean; explode: MutableRefObject<number>; animate: boolean }) {
  const refs = useRef<Array<THREE.Mesh | null>>([])
  const blocks = compact ? blockLayout.slice(0, 5) : blockLayout

  useFrame((state, delta) => {
    if (!animate) return
    const t = state.clock.elapsedTime
    refs.current.forEach((mesh, index) => {
      if (!mesh) return
      const point = blocks[index]
      const expansion = 1 + explode.current * 0.12
      mesh.position.x = THREE.MathUtils.damp(mesh.position.x, point[0] * expansion, 4, delta)
      mesh.position.y = point[1] * expansion + Math.sin(t * 0.42 + index) * 0.035
      mesh.position.z = point[2] * expansion
      mesh.rotation.y = t * 0.07 + index * 0.17
    })
  })

  return (
    <group>
      {blocks.map((point, index) => (
        <mesh
          key={index}
          ref={(mesh) => { refs.current[index] = mesh }}
          position={[point[0], point[1], point[2]]}
        >
          <boxGeometry args={index % 3 === 0 ? [0.34, 0.24, 0.32] : [0.2, 0.2, 0.2]} />
          <meshStandardMaterial
            color={index % 3 === 0 ? '#2388ff' : '#697787'}
            emissive={index % 3 === 0 ? '#062d63' : '#000000'}
            emissiveIntensity={0.75}
            metalness={0.35}
            roughness={0.34}
          />
          <Edges color={index % 3 === 0 ? '#70b6ff' : '#a2afbc'} opacity={0.7} transparent />
        </mesh>
      ))}
    </group>
  )
}

function CoreScene({ compact, reducedMotion, active, explode, pointer }: {
  compact: boolean
  reducedMotion: boolean
  active: boolean
  explode: MutableRefObject<number>
  pointer: MutableRefObject<{ x: number; y: number }>
}) {
  const assembly = useRef<THREE.Group>(null)

  useFrame((_, delta) => {
    if (!assembly.current || !active || reducedMotion || compact) return
    assembly.current.rotation.y = THREE.MathUtils.damp(assembly.current.rotation.y, -0.62 + pointer.current.x * 0.09, 4, delta)
    assembly.current.rotation.x = THREE.MathUtils.damp(assembly.current.rotation.x, 0.28 - pointer.current.y * 0.055, 4, delta)
  })

  return (
    <>
      <hemisphereLight intensity={1.1} color="#e0e9f5" groundColor="#202936" />
      <directionalLight position={[-3, 5, 7]} intensity={2.7} color="#e5edff" />
      <directionalLight position={[5, -1, 2]} intensity={1.3} color="#6a9eea" />
      <group ref={assembly} rotation={[0.28, -0.62, -0.1]} scale={compact ? 0.72 : 0.92}>
        <Scaffold />
        <ConnectionField />
        {plateLayout.slice(0, compact ? 4 : 5).map((_, index) => (
          <Plate key={index} index={index} explode={explode} animate={active && !reducedMotion} />
        ))}
        <ComputationalBlocks compact={compact} explode={explode} animate={active && !reducedMotion} />
      </group>
    </>
  )
}

function CSSFallback() {
  return (
    <div className="engineering-core__fallback" aria-hidden="true">
      <div className="engineering-core__fallback-frame">
        <i /><i /><i /><i />
        <span className="engineering-core__fallback-channel engineering-core__fallback-channel--a" />
        <span className="engineering-core__fallback-channel engineering-core__fallback-channel--b" />
      </div>
      <div className="engineering-core__fallback-nodes"><b /><b /><b /><b /><b /></div>
    </div>
  )
}

function canUseWebGL() {
  try {
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('webgl2') || canvas.getContext('webgl')
    context?.getExtension('WEBGL_lose_context')?.loseContext()
    return Boolean(context)
  } catch {
    return false
  }
}

export default function EngineeringCore({ className = '' }: EngineeringCoreProps) {
  const host = useRef<HTMLDivElement>(null)
  const explode = useRef(0)
  const pointer = useRef({ x: 0, y: 0 })
  const [visible, setVisible] = useState(true)
  const [documentVisible, setDocumentVisible] = useState(() => !document.hidden)
  const [webGL, setWebGL] = useState<boolean | null>(null)
  const compact = useMedia('(max-width: 720px)')
  const reducedMotion = useMedia('(prefers-reduced-motion: reduce)')
  const active = visible && documentVisible

  useEffect(() => setWebGL(canUseWebGL()), [])

  useEffect(() => {
    const update = () => setDocumentVisible(!document.hidden)
    document.addEventListener('visibilitychange', update)
    return () => document.removeEventListener('visibilitychange', update)
  }, [])

  useEffect(() => {
    const node = host.current
    if (!node) return
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting))
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const node = host.current
    if (reducedMotion) explode.current = 0
    if (!node || reducedMotion || !active) return
    let frame = 0
    const update = () => {
      frame = 0
      const rect = node.getBoundingClientRect()
      const travelled = Math.max(0, -rect.top)
      explode.current = Math.min(1, travelled / Math.max(rect.height * 0.85, 1))
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [reducedMotion, active])

  useEffect(() => {
    if (compact || reducedMotion || !active) {
      pointer.current = { x: 0, y: 0 }
      return
    }
    const onPointerMove = (event: PointerEvent) => {
      pointer.current.x = (event.clientX / window.innerWidth) * 2 - 1
      pointer.current.y = -(event.clientY / window.innerHeight) * 2 + 1
    }
    window.addEventListener('pointermove', onPointerMove, { passive: true })
    return () => window.removeEventListener('pointermove', onPointerMove)
  }, [compact, reducedMotion, active])

  const wrapperClass = useMemo(
    () => ['engineering-core', className].filter(Boolean).join(' '),
    [className],
  )

  return (
    <div ref={host} className={wrapperClass} aria-hidden="true">
      {webGL === false ? <CSSFallback /> : webGL === true ? (
        <WebGLBoundary fallback={<CSSFallback />}>
          <Canvas
            className="engineering-core__canvas"
            camera={{ position: [0, 0, 8], fov: 41, near: 0.1, far: 50 }}
            dpr={compact ? 1 : [1, 1.5]}
            frameloop={active ? (reducedMotion ? 'demand' : 'always') : 'never'}
            gl={{ alpha: true, antialias: !compact, powerPreference: 'high-performance' }}
          >
            <CoreScene key={String(reducedMotion)} compact={compact} reducedMotion={reducedMotion} active={active} explode={explode} pointer={pointer} />
          </Canvas>
        </WebGLBoundary>
      ) : null}
    </div>
  )
}
