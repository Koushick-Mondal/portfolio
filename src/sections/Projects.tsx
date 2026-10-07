import { memo, useEffect, useRef, useState, type CSSProperties, type KeyboardEvent } from 'react';
import { createPortal } from 'react-dom';
import { projects, type Project, type ProjectVisual } from '../data/projects';
import ProjectVisualFrame from '../components/ProjectVisual';
import { portfolioImages } from '../data/portfolioImages';
import ProjectCardShell from '../components/ProjectCardShell';
import './projects.css';

const sceneLines: Record<ProjectVisual, string[]> = {
  care: [
    'M32 348 C148 224 224 448 346 302 S565 108 700 254 S842 414 1014 166',
    'M-10 178 C166 254 268 54 420 184 S712 426 1030 270',
    'M168 530 C302 358 420 558 560 352 S768 80 932 246',
  ],
  ocean: [
    'M-40 142 C124 52 248 244 424 136 S758 16 1060 180',
    'M-32 228 C144 118 284 338 470 216 S770 98 1050 278',
    'M-32 324 C178 198 308 440 506 312 S810 182 1060 388',
    'M-20 430 C160 320 350 548 554 416 S824 274 1064 496',
  ],
  storage: [
    'M74 178 H300 L380 98 H680 L760 178 H926 V438 H74 Z',
    'M74 178 H926 M74 302 H926 M74 438 H926',
    'M238 178 V438 M500 98 V438 M764 178 V438',
  ],
  solar: [
    'M24 116 L246 116 L330 232 L518 232 L610 96 L986 96',
    'M24 302 L210 302 L300 188 L470 414 L650 248 L986 248',
    'M24 486 L280 486 L380 350 L590 504 L720 368 L986 368',
  ],
  career: [
    'M38 514 C166 488 144 244 310 270 S480 56 610 190 S764 438 990 86',
    'M78 78 C260 98 184 382 390 402 S590 168 702 308 S860 510 996 428',
    'M270 544 C292 414 478 488 500 298 S718 78 824 158',
  ],
  knowledge: [
    'M72 302 C66 102 288 58 420 180 C516 24 792 78 780 260 C974 280 942 526 710 500 C598 594 370 552 330 450 C126 502 18 404 72 302Z',
    'M186 310 C270 152 380 352 490 208 S694 168 824 310',
    'M224 414 C350 288 420 492 570 358 S734 266 846 402',
  ],
};

const sceneNodes: Record<ProjectVisual, Array<[number, number, number]>> = {
  care: [[108, 338, 7], [270, 210, 4], [420, 184, 8], [560, 354, 5], [700, 254, 9], [890, 240, 4]],
  ocean: [[188, 178, 5], [424, 278, 9], [690, 158, 4], [834, 388, 7]],
  storage: [[238, 178, 6], [380, 98, 8], [500, 302, 5], [680, 98, 9], [764, 302, 6]],
  solar: [[246, 116, 6], [300, 188, 8], [470, 414, 5], [610, 96, 9], [720, 368, 6]],
  career: [[310, 270, 8], [390, 402, 5], [610, 190, 9], [702, 308, 6], [824, 158, 4]],
  knowledge: [[330, 450, 5], [420, 180, 8], [570, 358, 4], [710, 500, 7], [780, 260, 10]],
};

const visualLabels: Record<ProjectVisual, string> = {
  care: 'CARE MATCH / HOSPITAL GRAPH',
  ocean: 'OCEAN / GEOSPATIAL',
  storage: 'DISTRIBUTED STORAGE',
  solar: 'SOLAR / MECHANICAL SYSTEM',
  career: 'CAREER PATHWAYS',
  knowledge: 'KNOWLEDGE GRAPH',
};

const ProjectArtwork = memo(function ProjectArtwork({ visual, index, title }: { visual: ProjectVisual; index: number; title: string }) {
  const gradientId = `projects-gradient-${index}`;
  const glowId = `projects-glow-${index}`;

  return (
    <svg className="projects-art" viewBox="0 0 1000 600" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#4d6dff" />
          <stop offset="0.48" stopColor="#26b9ee" />
          <stop offset="1" stopColor="#a188ff" stopOpacity="0.22" />
        </linearGradient>
        <filter id={glowId} x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="15" />
        </filter>
      </defs>
      <g className="projects-art__grid">
        {Array.from({ length: 11 }, (_, i) => <path key={`v${i}`} d={`M${i * 100} 0V600`} />)}
        {Array.from({ length: 7 }, (_, i) => <path key={`h${i}`} d={`M0 ${i * 100}H1000`} />)}
      </g>
      <circle className="projects-art__halo" cx={214 + index * 96} cy="300" r="178" fill={`url(#${gradientId})`} filter={`url(#${glowId})`} />
      <g className="projects-art__lines" fill="none" stroke={`url(#${gradientId})`}>
        {sceneLines[visual].map((path, lineIndex) => <path key={path} d={path} pathLength="1" style={{ '--line-delay': `${lineIndex * 0.16}s` } as CSSProperties} />)}
      </g>
      <g className="projects-art__nodes">
        {sceneNodes[visual].map(([cx, cy, r], nodeIndex) => <g key={`${cx}-${cy}`} style={{ '--node-delay': `${nodeIndex * 0.13}s` } as CSSProperties}><circle className="projects-art__pulse" cx={cx} cy={cy} r={r * 4} /><circle cx={cx} cy={cy} r={r} /></g>)}
      </g>
      <text className="projects-art__coordinate" x="36" y="558">SYS / 0{index + 1} — {visualLabels[visual]}</text>
      <title>{`${title} — original abstract visual study`}</title>
    </svg>
  );
});

function ProjectDialog({ project, index, triggerRef, onClose }: { project: Project; index: number; triggerRef: React.RefObject<HTMLButtonElement | null>; onClose: () => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const lockSnapshotRef = useRef<{ body: string; document: string } | null>(null);
  const titleId = `project-dialog-title-${index}`;
  const descriptionId = `project-dialog-description-${index}`;

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (!lockSnapshotRef.current) lockSnapshotRef.current = { body: document.body.style.overflow, document: document.documentElement.style.overflow };
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    if (!dialog.open) dialog.showModal();
    dialog.querySelector<HTMLButtonElement>('button')?.focus({ preventScroll: true });

    return () => {
      if (dialog.open) dialog.close();
      const snapshot = lockSnapshotRef.current;
      if (snapshot) {
        document.body.style.overflow = snapshot.body;
        document.documentElement.style.overflow = snapshot.document;
        lockSnapshotRef.current = null;
      }
      const trigger = triggerRef.current;
      if (trigger && document.contains(trigger)) trigger.focus({ preventScroll: true });
    };
  }, [triggerRef]);

  const trapFocus = (event: KeyboardEvent<HTMLDialogElement>) => {
    if (event.key !== 'Tab') return;
    const controls = Array.from(event.currentTarget.querySelectorAll<HTMLElement>('button:not([disabled]), a[href]'));
    const first = controls[0];
    const last = controls[controls.length - 1];
    if (!first || !last) return;
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  return createPortal(
    <dialog ref={dialogRef} className="project-dialog" aria-labelledby={titleId} aria-describedby={descriptionId}
      onKeyDown={trapFocus} onCancel={(event) => { event.preventDefault(); onClose(); }}>
      <div className="project-dialog__header"><span className="projects-mono">Project details / 0{index + 1}</span><button type="button" onClick={onClose} aria-label="Close project details">Close <span aria-hidden="true">×</span></button></div>
      <p className="project-dialog__eyebrow">{project.eyebrow}</p>
      <h2 id={titleId}>{project.title}</h2>
      <p id={descriptionId} className="project-dialog__description">{project.description}</p>
       <dl className="project-dialog__meta"><div><dt>Category</dt><dd>{project.category}</dd></div><div><dt>Status</dt><dd>{project.status}</dd></div>{project.date && <div><dt>Date</dt><dd>{project.date}</dd></div>}</dl>
      <h3>Highlights</h3>
      <ul>{project.highlights.map((highlight) => <li key={highlight}>{highlight}</li>)}</ul>
       {project.stack?.length ? <><h3>Stack</h3><p className="project-dialog__muted">{project.stack.join(' · ')}</p></> : null}
       <div className="project-dialog__links">{project.live && <a className="project-dialog__link" href={project.live} target="_blank" rel="noopener noreferrer">Open live project <span aria-hidden="true">↗</span></a>}{project.github && <a className="project-dialog__link" href={project.github} target="_blank" rel="noopener noreferrer">View GitHub repository <span aria-hidden="true">↗</span></a>}{project.repositoryReference && <a className="project-dialog__link" href="https://github.com/Koushick-Mondal" target="_blank" rel="noopener noreferrer">Explore GitHub profile <span aria-hidden="true">↗</span></a>}</div>
       {project.linkNote && <p className="project-dialog__note">{project.linkNote}</p>}
       <p className="project-dialog__note">Artwork is an original visual study, not a product screenshot.</p>
    </dialog>,
    document.body,
  );
}

function Projects() {
  const [selectedProject, setSelectedProject] = useState<{ project: Project; index: number } | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  const signalVisual = (project: Project, active: boolean) => {
    window.dispatchEvent(new CustomEvent('portfolio:project', { detail: { project: project.title, visual: project.visual, active } }));
  };

  return (
    <section className="projects-section" id="work" aria-labelledby="projects-title">
      <header className="projects-header">
        <div><p className="projects-kicker projects-mono">03 / SELECTED SYSTEMS</p><h2 id="projects-title">Work in <em>motion.</em></h2></div>
        <p className="projects-intro">Six lenses on the same question: how can software make complex things more useful?</p>
      </header>
      <div className="projects-grid">
        {projects.map((project, index) => (
          <ProjectCardShell title={project.title} showHeader={false} className={`project-scene project-scene--${project.visual}`} key={project.title} onMouseEnter={() => signalVisual(project, true)} onMouseLeave={() => signalVisual(project, false)}>
             <div className="project-scene__visual"><ProjectVisualFrame className="project-visual-shell" src={portfolioImages.projects[project.title]} alt={`${project.title} project visual`}><ProjectArtwork visual={project.visual} index={index} title={project.title} /></ProjectVisualFrame><span className="project-scene__disclosure projects-mono">Original visual study · not a product screenshot</span></div>
            <div className="project-scene__copy">
              <span className="project-scene__number projects-mono">0{index + 1}</span>
              <p className="project-scene__eyebrow projects-mono">{project.eyebrow}</p>
              <h3>{project.title}</h3>
              <p className="project-scene__description">{project.description}</p>
               <div className="project-scene__footer"><span className="projects-mono">{project.category}</span><div className="project-scene__actions">{project.live && <a href={project.live} target="_blank" rel="noreferrer">Live <span aria-hidden="true">↗</span></a>}<button type="button" className="project-view" aria-haspopup="dialog" aria-label={`View details for ${project.title}`} onClick={(event) => { triggerRef.current = event.currentTarget; setSelectedProject({ project, index }); }}>View project <span aria-hidden="true">↗</span></button></div></div>
            </div>
          </ProjectCardShell>
        ))}
      </div>
      <p className="projects-note projects-mono">Project descriptions reflect the current build context · links appear only where known</p>
      {selectedProject && <ProjectDialog project={selectedProject.project} index={selectedProject.index} triggerRef={triggerRef} onClose={() => setSelectedProject(null)} />}
    </section>
  );
}

export default Projects;
