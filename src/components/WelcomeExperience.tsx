import {
  Component,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

import './welcome.css';

export interface WelcomeExperienceProps {
  onComplete: () => void;
  visible?: boolean;
  replayKey?: number;
}

type WelcomeStyle = CSSProperties & Record<`--${string}`, string | number>;

interface WelcomeErrorBoundaryProps {
  children: ReactNode;
}

interface WelcomeErrorBoundaryState {
  hasError: boolean;
}

/** Keeps a decorative rendering problem from trapping the portfolio behind the welcome screen. */
class WelcomeVisualErrorBoundary extends Component<
  WelcomeErrorBoundaryProps,
  WelcomeErrorBoundaryState
> {
  state: WelcomeErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): WelcomeErrorBoundaryState {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="welcome__visual-fallback" role="img" aria-label="Display ready">
          <span className="welcome__visual-fallback-light" />
          <span className="welcome__visual-fallback-copy">DISPLAY READY</span>
        </div>
      );
    }

    return this.props.children;
  }
}

const statuses = [
  'POWERING DISPLAY',
  'CALIBRATING SIGNAL',
  'MAPPING SYSTEMS',
  'READY TO EXPLORE',
] as const;

const particles = [
  { x: 7, y: 21, delay: 0 },
  { x: 16, y: 69, delay: 1.2 },
  { x: 27, y: 31, delay: 2.4 },
  { x: 35, y: 79, delay: .6 },
  { x: 47, y: 18, delay: 1.8 },
  { x: 57, y: 73, delay: 3.1 },
  { x: 67, y: 27, delay: .9 },
  { x: 78, y: 65, delay: 2.1 },
  { x: 89, y: 35, delay: 1.4 },
  { x: 94, y: 82, delay: 2.8 },
];

const nodes = [
  { x: 14, y: 39, delay: 0 },
  { x: 26, y: 62, delay: 1.1 },
  { x: 39, y: 26, delay: 2.2 },
  { x: 58, y: 67, delay: .5 },
  { x: 74, y: 33, delay: 1.7 },
  { x: 84, y: 57, delay: 2.7 },
];

function styleForPosition(x: number, y: number, delay: number): WelcomeStyle {
  return {
    '--x': `${x}%`,
    '--y': `${y}%`,
    '--delay': `${delay}s`,
  };
}

function WelcomeVisual({ stage }: { stage: number }) {
  return (
    <div className="welcome__visual" aria-hidden="true">
      <div className="welcome__atmosphere" />
      {particles.map((particle, index) => (
        <span
          className="welcome__particle"
          key={`particle-${index}`}
          style={styleForPosition(particle.x, particle.y, particle.delay)}
        />
      ))}
      {nodes.map((node, index) => (
        <span
          className="welcome__node"
          key={`node-${index}`}
          style={styleForPosition(node.x, node.y, node.delay)}
        />
      ))}
      <div className="welcome__orbit welcome__orbit--one" />
      <div className="welcome__orbit welcome__orbit--two" />
      <div className="welcome__orbit welcome__orbit--three" />
      <div className="welcome__device">
        <div className="welcome__screen-shell">
          <div className="welcome__camera" />
          <div className="welcome__display">
            <div className={`welcome__display-plane${stage >= 2 ? ' is-visible' : ''}`}>
              <div className="welcome__plane-grid" />
              <div className="welcome__plane-scan" />
              <span className="welcome__plane-label welcome__plane-label--top">KOUSHICK / 01</span>
              <span className="welcome__plane-label welcome__plane-label--bottom">PORTFOLIO SYSTEM</span>
            </div>
            <span className="welcome__light" />
          </div>
        </div>
        <div className="welcome__base">
          <span className="welcome__trackpad" />
        </div>
      </div>
    </div>
  );
}

function restoreFocus(element: HTMLElement | null) {
  if (element?.isConnected) {
    try {
      element.focus({ preventScroll: true });
    } catch {
      element.focus();
    }
  }
}

export function WelcomeExperience({
  onComplete,
  visible = true,
  replayKey = 0,
}: WelcomeExperienceProps) {
  const [stage, setStage] = useState(0);
  const [dismissed, setDismissed] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const enterButtonRef = useRef<HTMLButtonElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const completedRef = useRef(false);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  const complete = useCallback(() => {
    if (completedRef.current) return;
    completedRef.current = true;
    setDismissed(true);

    // A callback should never leave this optional experience blocking the page.
    try {
      onCompleteRef.current();
    } catch {
      // The portfolio remains usable even if its host callback is unavailable.
    }
  }, []);

  useEffect(() => {
    completedRef.current = false;
    setDismissed(false);
    setStage(0);

    if (!visible) return;

    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) {
      setStage(statuses.length - 1);
    }

    const timers: number[] = [];
    if (!reduceMotion) {
      [850, 1750, 2750].forEach((delay, index) => {
        timers.push(window.setTimeout(() => setStage(index + 1), delay));
      });
    }

    // The experience is always bounded, including when a host forgets to hide it.
    timers.push(window.setTimeout(complete, 7000));

    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, [complete, replayKey, visible]);

  useEffect(() => {
    if (!visible || dismissed) return;

    previousFocusRef.current = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;
    const focusFrame = window.requestAnimationFrame(() => {
      enterButtonRef.current?.focus({ preventScroll: true });
    });

    return () => {
      window.cancelAnimationFrame(focusFrame);
      restoreFocus(previousFocusRef.current);
    };
  }, [dismissed, replayKey, visible]);

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' && document.activeElement !== enterButtonRef.current) {
      event.preventDefault();
      complete();
      return;
    }

    if (event.key === 'Escape') {
      event.preventDefault();
      complete();
      return;
    }

    if (event.key !== 'Tab') return;
    const focusable = rootRef.current?.querySelectorAll<HTMLElement>('button:not([disabled])');
    if (!focusable?.length) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  if (!visible || dismissed) return null;

  return (
    <div
      className={`welcome-experience welcome-experience--stage-${stage}`}
      ref={rootRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="welcome-experience-title"
      onKeyDown={handleKeyDown}
    >
      <div className="welcome__backdrop" />
      <WelcomeVisualErrorBoundary>
        <WelcomeVisual stage={stage} />
      </WelcomeVisualErrorBoundary>

      <div className="welcome__content">
        <div className="welcome__statusbar" aria-live="polite" aria-atomic="true">
          <span className="welcome__status-mark" aria-hidden="true" />
          <span>{statuses[stage]}</span>
          <span className="welcome__status-count">{String(stage + 1).padStart(2, '0')} / 04</span>
        </div>
        <div className="welcome__copy">
          <p className="welcome__identity">KOUSHICK MONDAL <span>SYSTEM ONLINE</span></p>
          <p className="welcome__overline">ENGINEERING WORLD / ONLINE</p>
          <h1
            id="welcome-experience-title"
            className={`welcome__title${stage >= 3 ? ' is-sharp' : ''}`}
          >
            WELCOME TO ENGINEER&apos;S WORLD
          </h1>
          <p className="welcome__subtitle">WITH KOUSHICK</p>
          <p className="welcome__role">AI BUILDER <b>•</b> SOFTWARE ENGINEER <b>•</b> FULL-STACK DEVELOPER</p>
          <p className="welcome__lede">Building intelligent systems, products and experiences.</p>
        </div>
        <div className="welcome__actions">
          <button className="welcome__enter" type="button" ref={enterButtonRef} onClick={complete}>
            <span>ENTER PORTFOLIO</span>
            <span className="welcome__enter-arrow" aria-hidden="true">↗</span>
          </button>
          <button className="welcome__skip" type="button" onClick={complete}>
            SKIP INTRO
          </button>
        </div>
      </div>

      <p className="welcome__hint" aria-hidden="true">PRESS ENTER TO CONTINUE <span>ESC</span></p>
    </div>
  );
}

export default WelcomeExperience;
