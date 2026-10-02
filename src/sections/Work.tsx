import { memo, useEffect, useRef, useState, type CSSProperties, type KeyboardEvent } from 'react';
import { projects, type ProjectVisual } from '../data/projects';
import './work.css';

const sceneLineSets: Record<ProjectVisual, string[]> = {
  topology: [
    'M60 370 C160 250 230 460 350 310 S570 120 700 260 S850 410 970 180',
    'M20 185 C180 260 260 70 420 190 S710 420 1010 280',
    'M180 520 C300 360 420 560 555 360 S760 90 920 250',
  ],
  ocean: [
    'M-30 150 C120 70 250 240 420 140 S750 20 1060 180',
    'M-20 230 C160 130 270 330 465 220 S770 100 1050 280',
    'M-30 325 C180 210 300 440 500 320 S790 190 1060 390',
    'M-20 430 C160 330 340 540 550 420 S820 280 1060 490',
  ],
  storage: [
    'M80 180 H300 L380 100 H680 L760 180 H920 V430 H80 Z',
    'M80 180 H920 M80 300 H920 M80 430 H920',
    'M240 180 V430 M500 100 V430 M760 180 V430',
  ],
  transactions: [
    'M30 120 L250 120 L330 230 L520 230 L610 100 L980 100',
    'M30 300 L210 300 L300 190 L470 410 L650 250 L980 250',
    'M30 480 L280 480 L380 350 L590 500 L720 370 L980 370',
  ],
  career: [
    'M40 510 C170 490 140 250 310 270 S480 60 610 190 S760 430 980 90',
    'M80 80 C260 100 180 380 390 400 S590 170 700 310 S860 500 990 430',
    'M270 540 C290 420 480 490 500 300 S720 80 820 160',
  ],
  knowledge: [
    'M70 300 C70 100 290 60 420 180 C510 30 790 80 780 260 C970 280 940 520 710 500 C600 590 370 550 330 450 C130 500 20 400 70 300Z',
    'M190 310 C270 160 380 350 490 210 S690 170 820 310',
    'M230 410 C350 290 420 490 570 360 S730 270 840 400',
  ],
};

const nodeSets: Record<ProjectVisual, Array<[number, number, number]>> = {
  topology: [[110, 340, 7], [270, 210, 4], [420, 190, 8], [560, 355, 5], [700, 260, 9], [890, 245, 4]],
  ocean: [[190, 180, 5], [420, 280, 9], [690, 160, 4], [830, 390, 7]],
  storage: [[240, 180, 6], [380, 100, 8], [500, 300, 5], [680, 100, 9], [760, 300, 6]],
  transactions: [[250, 120, 6], [300, 190, 8], [470, 410, 5], [610, 100, 9], [720, 370, 6]],
  career: [[310, 270, 8], [390, 400, 5], [610, 190, 9], [700, 310, 6], [820, 160, 4]],
  knowledge: [[330, 450, 5], [420, 180, 8], [570, 360, 4], [710, 500, 7], [780, 260, 10]],
};

const visualLabels: Record<ProjectVisual, string> = {
  topology: 'NETWORK TOPOLOGY / VISUAL STUDY',
  ocean: 'OCEAN / GEOSPATIAL / VISUAL STUDY',
  storage: 'DISTRIBUTED STORAGE / VISUAL STUDY',
  transactions: 'TRANSACTION ANOMALY / VISUAL STUDY',
  career: 'CAREER PATHWAYS / VISUAL STUDY',
  knowledge: 'KNOWLEDGE GRAPH / VISUAL STUDY',
};

const ProjectArtwork = memo(function ProjectArtwork({ visual, index }: { visual: ProjectVisual; index: number }) {
  const gradientId = `work-gradient-${index}`;
  const glowId = `work-glow-${index}`;

  return (
    <svg className="project-art" viewBox="0 0 1000 600" role="img" aria-labelledby={`work-art-title-${index}`}>
       <title id={`work-art-title-${index}`}>Original visual study — not a product screenshot</title>
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#375fff" />
          <stop offset="0.5" stopColor="#3478ff" />
          <stop offset="1" stopColor="#7bb8ff" stopOpacity="0.16" />
        </linearGradient>
        <filter id={glowId} x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="12" />
        </filter>
      </defs>
      <g className="project-art__grid" aria-hidden="true">
        {Array.from({ length: 11 }, (_, i) => <path key={`v${i}`} d={`M${i * 100} 0V600`} />)}
        {Array.from({ length: 7 }, (_, i) => <path key={`h${i}`} d={`M0 ${i * 100}H1000`} />)}
      </g>
      <circle className="project-art__halo" cx={220 + index * 95} cy={300} r="170" fill={`url(#${gradientId})`} filter={`url(#${glowId})`} />
      <g className="project-art__lines" fill="none" stroke={`url(#${gradientId})`}>
        {sceneLineSets[visual].map((path, lineIndex) => (
          <path key={path} d={path} pathLength="1" style={{ '--line-delay': `${lineIndex * 0.18}s` } as CSSProperties} />
        ))}
      </g>
      <g className="project-art__nodes">
        {nodeSets[visual].map(([cx, cy, r], nodeIndex) => (
          <g key={`${cx}-${cy}`} style={{ '--node-delay': `${nodeIndex * 0.15}s` } as CSSProperties}>
            <circle className="project-art__pulse" cx={cx} cy={cy} r={r * 4} />
            <circle cx={cx} cy={cy} r={r} />
          </g>
        ))}
      </g>
       <text className="project-art__coordinate" x="38" y="558">SYS / 0{index + 1} — {visualLabels[visual]}</text>
    </svg>
  );
});

const stackedQuery = '(max-width: 800px), (max-height: 700px), (prefers-reduced-motion: reduce)';

export default function Work() {
  const sectionRef = useRef<HTMLElement>(null);
  const frameRef = useRef<number | null>(null);
  const activeIndexRef = useRef(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isStacked, setIsStacked] = useState(() => window.matchMedia(stackedQuery).matches);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const media = window.matchMedia(stackedQuery);
    const update = () => {
      frameRef.current = null;
      if (media.matches) return;
      const rect = section.getBoundingClientRect();
      const distance = Math.max(1, section.offsetHeight - window.innerHeight);
      const nextProgress = Math.min(1, Math.max(0, -rect.top / distance));
      section.style.setProperty('--work-offset', `${nextProgress * -100 * (projects.length - 1)}vw`);
      const nextIndex = Math.min(projects.length - 1, Math.round(nextProgress * (projects.length - 1)));
      if (activeIndexRef.current !== nextIndex) {
        activeIndexRef.current = nextIndex;
        setActiveIndex(nextIndex);
      }
    };
    const requestUpdate = () => {
      if (frameRef.current === null) frameRef.current = requestAnimationFrame(update);
    };

    const updateLayout = () => {
      setIsStacked(media.matches);
      requestUpdate();
    };
    update();
    media.addEventListener('change', updateLayout);
    window.addEventListener('scroll', requestUpdate, { passive: true });
    window.addEventListener('resize', requestUpdate);
    return () => {
      window.removeEventListener('scroll', requestUpdate);
      window.removeEventListener('resize', requestUpdate);
      media.removeEventListener('change', updateLayout);
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    };
  }, []);

  const scrollToProject = (index: number) => {
    const section = sectionRef.current;
    if (!section) return;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (window.matchMedia(stackedQuery).matches) {
      section.querySelector<HTMLElement>(`[data-project-index="${index}"]`)?.scrollIntoView({
        behavior: reduceMotion ? 'auto' : 'smooth',
        block: 'start',
      });
      return;
    }
    const sectionTop = window.scrollY + section.getBoundingClientRect().top;
    const distance = section.offsetHeight - window.innerHeight;
    window.scrollTo({
      top: sectionTop + distance * (index / (projects.length - 1)),
      behavior: 'smooth',
    });
  };

  const handleIndexKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    let next = index;
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = Math.min(projects.length - 1, index + 1);
    else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = Math.max(0, index - 1);
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = projects.length - 1;
    else return;
    event.preventDefault();
    const button = event.currentTarget.parentElement?.children[next] as HTMLButtonElement | undefined;
    button?.focus();
    scrollToProject(next);
  };

  return (
    <section
      className="work-section"
      id="work"
      ref={sectionRef}
      aria-labelledby="work-title"
    >
      <div className="work-sticky">
        <header className="work-header">
          <p className="work-kicker">Selected / systems</p>
          <h2 id="work-title">Work in motion.</h2>
        </header>

        <div className="work-track">
          {projects.map((project, index) => (
            <article
              className={`project-scene${activeIndex === index ? ' is-active' : ''}${project.verified ? '' : ' project-scene--forthcoming'}`}
              data-project-index={index}
              id={`project-${index + 1}`}
              key={project.title}
              aria-labelledby={`project-title-${index}`}
              inert={!isStacked && activeIndex !== index}
            >
              <div className="project-visual">
                <ProjectArtwork visual={project.visual} index={index} />
                <span className="project-visual__note">Original visual study · not a product screenshot</span>
              </div>
              <div className="project-copy">
                <div className="project-number" aria-hidden="true">0{index + 1}</div>
                <p className="project-eyebrow">{project.verified ? project.eyebrow : 'Concept / project'}</p>
                <h3 id={`project-title-${index}`}>{project.title}</h3>
                <p className="project-description">{project.verified ? project.description : project.status}</p>
                {project.verified && <div className="project-footer">
                  <span>{project.status}</span>
                  <a href="#contact">Start a conversation <span aria-hidden="true">↗</span></a>
                </div>}
              </div>
            </article>
          ))}
        </div>

        <nav className="work-index" aria-label="Project index">
          {projects.map((project, index) => (
            <button
              type="button"
              className={activeIndex === index ? 'is-active' : ''}
              aria-label={`View project ${index + 1}: ${project.title}`}
              aria-current={activeIndex === index ? 'step' : undefined}
              onClick={() => scrollToProject(index)}
              onKeyDown={(event) => handleIndexKeyDown(event, index)}
              key={project.title}
            >
              <span>0{index + 1}</span>
              <i aria-hidden="true" />
              <strong>{project.title}</strong>
            </button>
          ))}
        </nav>
      </div>
    </section>
  );
}
