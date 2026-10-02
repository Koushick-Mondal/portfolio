import { useEffect, useRef } from 'react';
import './developer-scene.css';

const labels = [
  ['FRONTEND', 'React / TypeScript', '12%', '18%'],
  ['API', 'REST / Node.js', '74%', '12%'],
  ['DATABASE', 'MongoDB / MySQL', '78%', '72%'],
  ['AI / ML', 'Python / LangGraph', '10%', '74%'],
  ['CLOUD', 'Docker / deploy', '43%', '3%'],
] as const;

export default function DeveloperScene() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const node = ref.current;
    if (!node || !matchMedia('(pointer:fine)').matches) return;
    const move = (event: PointerEvent) => {
      const bounds = node.getBoundingClientRect();
      const x = ((event.clientX - bounds.left) / bounds.width - .5) * 2;
      const y = ((event.clientY - bounds.top) / bounds.height - .5) * 2;
      node.style.setProperty('--scene-x', `${x * 9}px`);
      node.style.setProperty('--scene-y', `${y * 7}px`);
    };
    const leave = () => { node.style.setProperty('--scene-x', '0px'); node.style.setProperty('--scene-y', '0px'); };
    node.addEventListener('pointermove', move); node.addEventListener('pointerleave', leave);
    return () => { node.removeEventListener('pointermove', move); node.removeEventListener('pointerleave', leave); };
  }, []);
  return <div className="developer-scene" ref={ref} aria-hidden="true">
    <div className="scene-orbit scene-orbit-a"/><div className="scene-orbit scene-orbit-b"/>
    <div className="scene-architecture">
      {labels.map(([title, detail, left, top]) => <div className="scene-label" style={{ left, top }} key={title}><b>{title}</b><span>{detail}</span></div>)}
    </div>
    <div className="scene-laptop">
      <div className="scene-screen"><div className="screen-bar"><i/><i/><i/><span>koushick.dev / workspace</span></div><div className="screen-content"><div className="code-lines"><b/><b/><b/><b/><b/><b/><b/><b/></div><div className="code-panel"><span>const</span> intelligence <em>=</em> <strong>build</strong>(<small>ideas</small>)<br/><span>await</span> system.<strong>learn</strong>()<br/><i>→</i> product.<strong>ship</strong>()</div><div className="screen-chart"><svg viewBox="0 0 130 55"><path d="M0 45 C18 32 20 42 36 30 S60 37 74 20 S95 29 112 8 S122 17 130 2"/><circle cx="74" cy="20" r="3"/><circle cx="112" cy="8" r="3"/></svg></div></div></div>
      <div className="scene-keyboard"><span/><span/><span/><span/><span/><span/><span/><span/><span/><span/><span/><span/></div><div className="scene-base"/>
    </div>
    <div className="scene-pipeline"><span>UI</span><i/><span>API</span><i/><span>DATA</span><i/><span>AI</span><i/><span>SHIP</span></div>
    <span className="scene-caption">COMPUTATIONAL WORKSPACE / 001</span>
  </div>;
}
