import { useEffect, useRef, useState } from 'react';
import { ArrowDown, ArrowUpRight, ExternalLink, Menu, Moon, Sun, X } from 'lucide-react';
import { CursorFollower, Reveal, ScrollProgress } from './components/Motion';
import AIEnvironment from './components/AIEnvironment';
import ContactForm from './components/ContactForm';
import CredentialsVault from './components/CredentialsVault';
import ExperienceCard from './components/ExperienceCard';
import PersonalPhoto from './components/PersonalPhoto';
import WelcomeExperience from './components/WelcomeExperience';
import WorldEnvironment from './components/WorldEnvironment';
import ArchitectureConstellation from './components/ArchitectureConstellation';
import Projects from './sections/Projects';
import { credentials } from './data/credentials';
import { education } from './data/education';
import { experience } from './data/experience';
import { leadership } from './data/leadership';
import { links, profile } from './data/profile';
import { skillGroups } from './data/skills';
import { portfolioImages } from './data/portfolioImages';

const navigation = [
  ['About', 'about'], ['Systems', 'systems'], ['Work', 'work'], ['Experience', 'experience'], ['Education', 'education'], ['Credentials', 'credentials'], ['Achievements', 'achievements'], ['Contact', 'contact'],
] as const;

const welcomeStorageKey = 'koushick-engineering-world-welcome-seen';
const themeStorageKey = 'koushick-engineering-world-theme';

function initialTheme(): 'dark' | 'light' {
  if (typeof window === 'undefined') return 'dark';
  try {
    return window.localStorage.getItem(themeStorageKey) === 'light' ? 'light' : 'dark';
  } catch {
    return 'dark';
  }
}

function shouldShowWelcome() {
  if (typeof window === 'undefined') return true;
  try {
    return window.localStorage.getItem(welcomeStorageKey) !== '1';
  } catch {
    return true;
  }
}

function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [inferenceActive, setInferenceActive] = useState(false);
  const [skillIndex, setSkillIndex] = useState(0);
  const [ready, setReady] = useState(false);
  const [welcomeVisible, setWelcomeVisible] = useState(shouldShowWelcome);
  const [welcomeReplayKey, setWelcomeReplayKey] = useState(0);
  const [theme, setTheme] = useState<'dark' | 'light'>(initialTheme);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuTriggerRef = useRef<HTMLButtonElement>(null);
  const resumeUrl = `${import.meta.env.BASE_URL}resume.pdf`;

  useEffect(() => {
    const timer = window.setTimeout(() => setReady(true), 120);
    const ids = ['home', ...navigation.map(([, id]) => id)];
    if (!('IntersectionObserver' in window)) return () => window.clearTimeout(timer);
    const observer = new IntersectionObserver((entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (visible) setActiveSection(visible.target.id);
    }, { rootMargin: '-35% 0px -55% 0px', threshold: [0.05, 0.2, 0.5] });
    ids.forEach((id) => { const node = document.getElementById(id); if (node) observer.observe(node); });
    return () => { window.clearTimeout(timer); observer.disconnect(); };
  }, []);

  useEffect(() => {
    document.body.classList.toggle('menu-is-open', menuOpen);
    return () => document.body.classList.remove('menu-is-open');
  }, [menuOpen]);

  useEffect(() => {
    document.body.classList.toggle('welcome-is-open', welcomeVisible);
    return () => document.body.classList.remove('welcome-is-open');
  }, [welcomeVisible]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      window.localStorage.setItem(themeStorageKey, theme);
    } catch {
      // Theme still applies for the current visit when storage is unavailable.
    }
  }, [theme]);

  useEffect(() => {
    if (!menuOpen) return;
    const menu = menuRef.current;
    const controls = () => Array.from(menu?.querySelectorAll<HTMLElement>('a[href], button:not([disabled])') ?? []);
    controls()[0]?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { setMenuOpen(false); return; }
      if (event.key !== 'Tab') return;
      const items = controls();
      const first = items[0];
      const last = items[items.length - 1];
      if (!first || !last) return;
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => { document.removeEventListener('keydown', onKeyDown); menuTriggerRef.current?.focus({ preventScroll: true }); };
  }, [menuOpen]);

  const scrollTo = (id: string) => {
    setMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  };
  const currentYear = new Date().getFullYear();
  const completeWelcome = () => {
    try {
      window.localStorage.setItem(welcomeStorageKey, '1');
    } catch {
      // Storage can be unavailable in private browsing; the current visit can still continue.
    }
    setWelcomeVisible(false);
  };
  const replayWelcome = () => {
    setMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'auto' });
    setWelcomeReplayKey((value) => value + 1);
    setWelcomeVisible(true);
  };

  return <div className={`site-shell ${ready ? 'is-ready' : ''}`}>
    <WorldEnvironment />
    <WelcomeExperience onComplete={completeWelcome} visible={welcomeVisible} replayKey={welcomeReplayKey} />
    <ScrollProgress /><CursorFollower />
    <a className="skip-link" href="#about">Skip to content</a>
     <header className="site-nav" inert={menuOpen || welcomeVisible} aria-hidden={menuOpen || welcomeVisible || undefined}>
       <a className="brand" href="#home" aria-label="Koushick Mondal home"><span className="brand-mark">K<span>M</span></span><span><strong>KOUSHICK MONDAL</strong><small>SOFTWARE ENGINEER / FULL-STACK DEVELOPER</small></span></a>
       <div className="nav-status"><i /> LABPUR, WEST BENGAL <span>GREATER KOLKATA AREA</span></div>
       <div className="nav-actions">
         <nav className="nav-links" aria-label="Primary navigation">{navigation.map(([label, id]) => <a key={id} className={activeSection === id ? 'is-active' : ''} href={`#${id}`}>{label}</a>)}</nav>
         <button type="button" className="theme-toggle" aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`} aria-pressed={theme === 'light'} onClick={() => setTheme((value) => value === 'dark' ? 'light' : 'dark')}>
           {theme === 'dark' ? <Sun size={15} aria-hidden="true" /> : <Moon size={15} aria-hidden="true" />}
           <span>{theme === 'dark' ? 'LIGHT' : 'DARK'}</span>
         </button>
         <button ref={menuTriggerRef} type="button" className="menu-trigger" aria-expanded={menuOpen} aria-controls="mobile-nav" onClick={() => setMenuOpen(true)}>MENU <Menu size={16} /></button>
       </div>
     </header>
    {menuOpen && <div ref={menuRef} className="mobile-nav" id="mobile-nav" role="dialog" aria-modal="true" aria-label="Navigation">
      <div className="mobile-nav__top"><span className="mono">NAV / 00</span><button type="button" onClick={() => setMenuOpen(false)} aria-label="Close navigation">CLOSE <X /></button></div>
      <nav>{navigation.map(([label, id], index) => <a key={id} href={`#${id}`} onClick={(event) => { event.preventDefault(); scrollTo(id); }}><span>0{index + 1}</span>{label}<ArrowUpRight /></a>)}</nav>
      <a className="mobile-nav__resume mono" href={resumeUrl}>DOWNLOAD RESUME ↗</a>
    </div>}

     <main inert={menuOpen || welcomeVisible} aria-hidden={menuOpen || welcomeVisible || undefined}>
      <section className="hero" id="home" aria-labelledby="hero-title">
        <div className="hero__atmosphere" aria-hidden="true" />
        <div className="hero__meta mono"><span><i /> ONLINE / SOFTWARE ENGINEERING LAB</span><span>PORTFOLIO — {currentYear}</span></div>
        <div className="hero__copy">
          <p className="eyebrow">SOFTWARE ENGINEER · FULL-STACK DEVELOPER · AI BUILDER</p>
          <h1 id="hero-title">KOUSHICK<br /><em>MONDAL.</em></h1>
          <p className="hero__lede">Software Engineer and Full-Stack Developer building AI projects and student-focused products — Founder & CEO of GrowBharat and Co-Founder of CyberHiveX.</p>
          <div className="hero__actions"><a className="button button--primary" href="#work">EXPLORE MY WORK <ArrowDown size={16} /></a><a className="button button--text" href={resumeUrl}>DOWNLOAD RESUME <ArrowUpRight size={16} /></a></div>
        </div>
        <div className={`hero__core ${inferenceActive ? 'is-inference' : ''}`}><AIEnvironment onInference={setInferenceActive} /></div>
        <div className="hero__labels mono" aria-hidden="true"><span>CODE</span><span>AI SYSTEMS</span><span>DATA</span><span>NETWORKS</span><span>PRODUCTS</span></div>
        <div className="hero__footer mono"><span>SOFTWARE <b>→</b> AI <b>→</b> SYSTEMS <b>→</b> SHIP</span><a href="#about">SCROLL TO DISCOVER <ArrowDown size={14} /></a></div>
      </section>

      <section className="section about" id="about" aria-labelledby="about-title">
        <div className="section-kicker mono">01 / THE BUILDER BEHIND THE SYSTEM <span>SUMMARY</span></div>
        <Reveal><h2 id="about-title">I BUILD<br /><em>USEFUL SYSTEMS.</em></h2></Reveal>
        <div className="about__grid"><div className="about__photo-wrap"><PersonalPhoto src={portfolioImages.profile.primary} alt="Koushick Mondal" variant="about" aspectRatio="4 / 5" objectPosition="center" parallax reveal glow grain border depth /><span className="about__photo-caption mono">PERSONAL SYSTEM / 001</span></div><Reveal className="about__body"><p className="large-copy">{profile.summary}</p><p>I’m most at home in JavaScript, TypeScript, React.js, Node.js, Python, MongoDB, and MySQL. Alongside engineering work, I’m building GrowBharat and contributing through campus and developer communities.</p><div className="metadata mono"><span>DEGREE<strong>B.TECH CSE · LPU</strong></span><span>DATES<strong>2025 — 2029</strong></span><span>BASED IN<strong>LABPUR, WEST BENGAL</strong></span></div></Reveal></div>
      </section>

      <section className="section systems" id="systems" aria-label="Engineering stack">
        <div className="section-kicker mono">02 / ENGINEERING STACK <span>KNOWLEDGE CONSTELLATION</span></div>
        <ArchitectureConstellation skillGroups={skillGroups} activeIndex={skillIndex} onSelect={setSkillIndex} />
      </section>

      <Projects />

        <section className="section experience" id="experience" aria-labelledby="experience-title"><div className="section-kicker mono">04 / EXPERIENCE <span>CV / PROFESSIONAL WORK</span></div><div className="experience__heading"><h2 id="experience-title">WORKING<br />TOWARD<br /><em>BETTER SYSTEMS.</em></h2><p>Real roles, exact titles, and the work described in the CV.</p></div><div className="experience__rail">{experience.map((item, index) => <Reveal className="experience-item" key={`${item.company}-${item.role}`}><div className="experience-item__marker"><span>0{index + 1}</span><i /></div><ExperienceCard organization={item.company} role={item.role} date={item.date} location={item.location} text={item.text} details={item.details} tags={item.tags} image={portfolioImages.experience[item.company]} /></Reveal>)}</div><div className="leadership"><div className="leadership__heading"><span className="mono">LEADERSHIP & CAMPUS AMBASSADOR ROLES</span><p>Community and campus work listed in the CV.</p></div><div className="leadership__list">{leadership.map((item) => <div className="leadership__row" key={`${item.organization}-${item.role}`}><span className="mono">{item.date ?? 'DATE NOT SPECIFIED'}</span><strong>{item.role}</strong><span>{item.organization}</span></div>)}</div></div></section>

        <section className="section education" id="education" aria-labelledby="education-title"><div className="section-kicker mono">05 / EDUCATION <span>ACADEMIC FOUNDATION</span></div><div className="education__heading"><h2 id="education-title">THE<br /><em>FOUNDATION.</em></h2><p>Academic milestones kept separate from the credential vault so recruiters can distinguish formal education from optional learning.</p></div><div className="education__list">{education.map((item, index) => <article className="education__row" key={`${item.institution}-${item.degree}`}><span className="mono">0{index + 1}</span><div><h3>{item.degree}</h3><p>{item.institution}{item.location ? ` · ${item.location}` : ''}</p></div><time className="mono">{item.date}</time></article>)}</div></section>

        <section className="credentials-shell" id="credentials" aria-label="Credentials and recognition"><span id="achievements" className="credentials-anchor" aria-hidden="true" /><CredentialsVault credentials={credentials} /></section>

       <section className="contact" id="contact" aria-labelledby="contact-title"><div className="section-kicker mono">07 / OPEN CHANNEL <span>LET’S TALK ABOUT THE NEXT BUILD</span></div><div className="contact__heading"><h2 id="contact-title">LET’S BUILD<br />SOMETHING<br /><em>USEFUL.</em></h2><div><div className="contact__convergence" aria-hidden="true"><span /><i /><b /><em /></div><p>Have an idea, opportunity, or technical problem worth solving?</p><a className="button button--primary" href={links.email}>START A CONVERSATION <ArrowUpRight size={16} /></a></div></div><div className="contact__grid"><div className="contact__links"><a href={links.email}><span className="mono">EMAIL</span>mondalkoushick393@gmail.com <ArrowUpRight size={16} /></a><a href={links.phone}><span className="mono">PHONE</span>+91 8900500157 <ArrowUpRight size={16} /></a><a href={links.linkedin} target="_blank" rel="noreferrer"><span className="mono">LINKEDIN</span>koushick-mondal <ExternalLink size={16} /></a><a href={links.github} target="_blank" rel="noreferrer"><span className="mono">GITHUB</span>Koushick-Mondal <ExternalLink size={16} /></a><a href={links.portfolio} target="_blank" rel="noreferrer"><span className="mono">PORTFOLIO</span>koushickmondal.vercel.app <ExternalLink size={16} /></a><a href={resumeUrl}><span className="mono">RESUME</span>Download PDF <ArrowUpRight size={16} /></a></div><ContactForm /></div></section>
    </main>
     <footer className="footer" inert={menuOpen || welcomeVisible} aria-hidden={menuOpen || welcomeVisible || undefined}><a className="brand" href="#home"><span className="brand-mark">K<span>M</span></span><span><strong>KOUSHICK MONDAL</strong><small>SOFTWARE ENGINEER · {currentYear}</small></span></a><span className="mono">BUILD · LEARN · EXPERIMENT · IMPROVE</span><div className="footer__actions"><button className="footer__replay mono" type="button" onClick={replayWelcome}>REPLAY EXPERIENCE ↗</button><a className="mono" href="#home">BACK TO TOP ↑</a></div></footer>
  </div>;
}

export default App;
