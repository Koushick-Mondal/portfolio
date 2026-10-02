import { useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from 'react';
import './ai-lab.css';

type LabNode = {
  id: string;
  label: string;
  index: string;
  description: string;
  accent: string;
  position: [number, number];
};

const nodes: LabNode[] = [
  { id: 'ai', label: 'AI', index: '01', description: 'Models, agents and evaluation loops for software that can reason over information.', accent: '#a985ff', position: [50, 20] },
  { id: 'software', label: 'SOFTWARE', index: '02', description: 'Interfaces, APIs and application logic composed into dependable digital products.', accent: '#6f91ff', position: [22, 46] },
  { id: 'security', label: 'SECURITY', index: '03', description: 'Threat-aware thinking across identity, data handling and defensive system design.', accent: '#f0b36a', position: [36, 78] },
  { id: 'cloud', label: 'CLOUD', index: '04', description: 'Services, deployment paths and infrastructure that help systems run beyond a laptop.', accent: '#65c8ca', position: [72, 77] },
  { id: 'data', label: 'DATA', index: '05', description: 'Structured information, retrieval and signals that give software useful context.', accent: '#86d79e', position: [86, 45] },
  { id: 'product', label: 'PRODUCT', index: '06', description: 'A clear problem, a considered experience and an iterative path from idea to use.', accent: '#e783bd', position: [69, 43] },
];

const edges: Array<[string, string]> = [
  ['ai', 'data'], ['ai', 'product'], ['ai', 'software'], ['software', 'security'],
  ['software', 'product'], ['security', 'cloud'], ['data', 'cloud'], ['product', 'data'],
];

const getNode = (id: string) => nodes.find((node) => node.id === id)!;

export default function AiLab() {
  const [activeId, setActiveId] = useState(nodes[0].id);
  const stageRef = useRef<HTMLDivElement>(null);
  const active = getNode(activeId);

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerType === 'touch' || !stageRef.current) return;
    const rect = stageRef.current.getBoundingClientRect();
    stageRef.current.style.setProperty('--pointer-x', `${((event.clientX - rect.left) / rect.width) * 100}%`);
    stageRef.current.style.setProperty('--pointer-y', `${((event.clientY - rect.top) / rect.height) * 100}%`);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
    let next = index;
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = (index + 1) % nodes.length;
    else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = (index - 1 + nodes.length) % nodes.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = nodes.length - 1;
    else return;
    event.preventDefault();
    setActiveId(nodes[next].id);
    event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>('button')[next]?.focus();
  };

  return (
    <section className="ai-lab" id="ai-lab" aria-labelledby="ai-lab-title">
      <div className="ai-lab__header">
        <span className="eyebrow">03 / THE CONNECTED LAB</span>
        <span className="eyebrow ai-lab__header-note">SIX LENSES · ONE SYSTEM</span>
      </div>
      <div className="ai-lab__intro">
        <div>
          <h2 id="ai-lab-title">THINK IN<br /><em>systems.</em></h2>
          <p>Ideas get more useful when disciplines talk to each other. Explore the working vocabulary behind the build.</p>
        </div>
        <span className="eyebrow ai-lab__hint">SELECT A NODE<br />OR MOVE THROUGH THE FIELD</span>
      </div>

      <div className="ai-lab__grid">
        <div
          className="ai-lab__stage"
          ref={stageRef}
          onPointerMove={handlePointerMove}
          aria-label="Interactive connection map"
        >
          <div className="ai-lab__scanline" aria-hidden="true" />
          <svg className="ai-lab__network" viewBox="0 0 100 100" role="img" aria-labelledby="network-title network-description">
            <title id="network-title">Connected engineering disciplines</title>
            <desc id="network-description">A network linking artificial intelligence, software, security, cloud, data and product.</desc>
            <g className="ai-lab__edges" aria-hidden="true">
              {edges.map(([from, to]) => {
                const start = getNode(from).position;
                const end = getNode(to).position;
                const linked = from === activeId || to === activeId;
                return <line key={`${from}-${to}`} className={linked ? 'is-linked' : ''} x1={start[0]} y1={start[1]} x2={end[0]} y2={end[1]} />;
              })}
            </g>
            <circle className="ai-lab__orbit ai-lab__orbit--one" cx="50" cy="50" r="35" />
            <circle className="ai-lab__orbit ai-lab__orbit--two" cx="50" cy="50" r="18" />
            <g className="ai-lab__nodes" aria-hidden="true">
              {nodes.map((node) => <circle key={node.id} className={node.id === activeId ? 'is-active' : ''} cx={node.position[0]} cy={node.position[1]} r={node.id === activeId ? 1.8 : 1.1} style={{ '--node-accent': node.accent } as CSSProperties} />)}
            </g>
          </svg>
          <span className="ai-lab__stage-label eyebrow">LIVE MAP / 06 NODES / 08 LINKS</span>
          <span className="ai-lab__crosshair ai-lab__crosshair--top" aria-hidden="true">+</span>
          <span className="ai-lab__crosshair ai-lab__crosshair--bottom" aria-hidden="true">+</span>
        </div>

        <div className="ai-lab__details">
          <div className="ai-lab__active" role="tabpanel" id="lab-panel" aria-labelledby={`lab-tab-${activeId}`}>
            <span className="eyebrow">ACTIVE LENS / {active.index}</span>
            <h3 style={{ '--active-accent': active.accent } as CSSProperties}>{active.label}</h3>
            <p aria-live="polite">{active.description}</p>
          </div>
          <div className="ai-lab__controls" role="tablist" aria-label="Choose a discipline">
            {nodes.map((node, index) => (
              <button
                key={node.id}
                type="button"
                 role="tab"
                 id={`lab-tab-${node.id}`}
                 aria-controls="lab-panel"
                aria-selected={node.id === activeId}
                tabIndex={node.id === activeId ? 0 : -1}
                className={node.id === activeId ? 'is-active' : ''}
                onClick={() => setActiveId(node.id)}
                onKeyDown={(event) => handleKeyDown(event, index)}
              >
                <span className="eyebrow">{node.index}</span><span>{node.label}</span><i aria-hidden="true" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
