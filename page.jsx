import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Github, Linkedin, Mail, ExternalLink, Terminal, 
  Code2, Menu, X, Trophy, MapPin, 
  ArrowRight, Command, Search, Zap, Target, 
  Briefcase, MessageSquare, Send, Bot, MessageCircle,
  Sparkles, Code, Orbit, Cpu, Shield, Users, Instagram,
  ArrowUpRight, CheckCircle2, Star, FileText, Activity
} from 'lucide-react';

// ==========================================
// DATA & CONTENT
// ==========================================
const personalInfo = {
  name: "Koushick Mondal",
  title: "Software Engineer",
  tagline: "Architecting scalable systems. Solving high-stakes algorithmic challenges.",
  about: "I am a Computer Science engineer who treats software development as a craft. I specialize in building resilient web architectures and optimizing complex logic. From securing top global ranks in competitive programming to standing as a finalist in national hackathons, I thrive under pressure, adapt rapidly, and deliver measurable impact. I also actively mentor students who struggle with focus, face distractions, or feel lost on where to start. If you need guidance in your journey, I'm here to help!",
  email: "mondalkoushick393@gmail.com",
  whatsapp: "https://wa.me/918900500157",
  whatsappCommunity: "https://chat.whatsapp.com/LTpoke0oXbf7UbZVX8PLUf",
  location: "India",
  github: "https://github.com/Koushick-Mondal",
  linkedin: "https://www.linkedin.com/in/koushick-mondal-4058a72b6/",
  instagram: "https://www.instagram.com/classy.koushick/"
};

const topAchievements = [
  { id: "a1", metric: "99.51", unit: "Percentile", title: "Naukri Young Turks", description: "Ranked among the absolute top tier of emerging tech talent nationwide.", colSpan: "md:col-span-2", color: "from-blue-500 to-cyan-400" },
  { id: "a2", metric: "Top 2K", unit: "Global", title: "IICPC CodeFest", description: "Global Rank 1551. Verified elite algorithmic problem-solving capabilities.", colSpan: "md:col-span-1", color: "from-purple-500 to-pink-500" },
  { id: "a3", metric: "Finalist", unit: "SIH 2024", title: "Smart India Hackathon", description: "Selected for the Grand Finale out of thousands of teams for hardware-software innovation.", colSpan: "md:col-span-3", color: "from-amber-400 to-orange-500" }
];

const projects = [
  { id: 1, title: "Zero-Power Solar Tracker", problem: "Traditional trackers consume electrical energy, reducing net efficiency.", solution: "Engineered a sustainable mechanism that autonomously aligns panels using thermodynamics.", impact: "Grand Finalist at Smart India Hackathon (SIH) 2024.", tech: ["Hardware", "Physics", "Systems Design"], link: "#", github: "#" },
  { id: 2, title: "Tiki Topple: AI Arena", problem: "Balancing hidden mechanics with an intelligent opponent in web games.", solution: "Built an advanced AI arena using Greedy + Minimax approach, with a modern Framer Motion frontend.", impact: "Top 5 Finalist at Board2Code Hackathon.", tech: ["React", "Framer Motion", "Game AI", "Minimax"], link: "#", github: "#" },
  { id: 3, title: "AI Memory Agent", problem: "Standard AI lacks emotional intelligence, memory, and personalized career adaptability.", solution: "Engineered a multi-agent system featuring a 'Second Brain', real-time emotion tracking, and dynamic career paths.", impact: "Creates hyper-personalized learning and job matching experiences.", tech: ["AI Agents", "Emotion Tracking", "Next.js"], link: "#", github: "#" },
  { id: 4, title: "Snakes & Ladders Multiplayer", problem: "Synchronizing complex game state and board rendering across multiple sessions.", solution: "Developed a dynamic grid with custom dice roll algorithms and robust event-driven state handling.", impact: "Demonstrates strong foundational knowledge in algorithmic UI rendering.", tech: ["JavaScript", "React", "State Management"], link: "#", github: "#" },
  { id: 5, title: "Optimized Snake Engine", problem: "Browser-based games suffer from frame drops and inefficient memory allocation.", solution: "Implemented a highly optimized 60fps game loop utilizing efficient data structures (queues).", impact: "Showcases deep understanding of browser painting and collision detection.", tech: ["JavaScript", "Game Loop", "Data Structures"], link: "#", github: "#" },
  { id: 6, title: "Awwwards-Level OS Portfolio", problem: "Standard portfolios fail to capture attention and lack premium micro-interactions.", solution: "Engineered a cinematic web app featuring physics-based cursors, scroll velocity, and WebGL-style canvases.", impact: "Demonstrates top 1% UI/UX and advanced React/Math state management.", tech: ["React", "Tailwind", "Physics Hooks", "Canvas"], link: "https://github.com/Koushick-Mondal", github: "https://github.com/Koushick-Mondal" }
];

const marqueeSkills = [
  "Node.js", "MongoDB", "Express.js", "React.js", "Next.js", 
  "JavaScript", "TypeScript", "Python", "C++", "C", "Java", 
  "Tailwind CSS", "Framer", "UI/UX Design", "Artificial Intelligence", 
  "Game Development", "Cybersecurity", "Data Structures", "Algorithms", 
  "Docker", "Linux", "Git", "Power BI", "AutoCAD", "Solar Energy", 
  "Medical Coding", "NDT", "ICT", "Engineering", "Entrepreneurship"
];

// ==========================================
// ADVANCED PHYSICS & ANIMATION HOOKS
// ==========================================

// Smooth Intersection Observer with Blur Reveal Support
const useOnScreen = (ref, threshold = 0.1) => {
  const [isIntersecting, setIntersecting] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIntersecting(true);
        observer.unobserve(entry.target);
      }
    }, { threshold, rootMargin: "0px 0px -100px 0px" });
    
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [ref, threshold]);
  return isIntersecting;
};

// Scroll Velocity Hook (GSAP/Lenis Simulation)
const useScrollVelocity = () => {
  const [velocity, setVelocity] = useState(0);
  const lastY = useRef(typeof window !== 'undefined' ? window.scrollY : 0);
  const lastTime = useRef(Date.now());

  useEffect(() => {
    const handleScroll = () => {
      const now = Date.now();
      const currentY = window.scrollY;
      const dt = now - lastTime.current || 16;
      const dy = currentY - lastY.current;
      const v = dy / dt;
      
      setVelocity(v);
      lastY.current = currentY;
      lastTime.current = now;
    };
    
    // Decay velocity back to 0 smoothly
    const render = () => {
      setVelocity(prev => prev * 0.9); // Friction
      requestAnimationFrame(render);
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    const raf = requestAnimationFrame(render);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      cancelAnimationFrame(raf);
    };
  }, []);
  
  return velocity;
};

// ==========================================
// CINEMATIC UI COMPONENTS
// ==========================================

// 1. Boot Sequence (Cinematic Startup)
const BootSequence = ({ onComplete }) => {
  const [lines, setLines] = useState([]);
  const [isDone, setIsDone] = useState(false);
  const bootLogs = [
    "INIT Koushick_Core v3.0...",
    "MOUNTING /dev/neural_net... [OK]",
    "LOADING UI_COMPONENTS... [OK]",
    "INITIALIZING PHYSICS ENGINE... [OK]",
    "ESTABLISHING SECURE CONNECTION...",
    "ACCESS GRANTED. WELCOME."
  ];

  useEffect(() => {
    let currentLine = 0;
    const interval = setInterval(() => {
      if (currentLine < bootLogs.length) {
        setLines(prev => [...prev, bootLogs[currentLine]]);
        currentLine++;
      } else {
        clearInterval(interval);
        setTimeout(() => {
          setIsDone(true);
          setTimeout(onComplete, 800); // Wait for fade out
        }, 500);
      }
    }, 150);
    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div className={`fixed inset-0 z-[99999] bg-[#02010a] flex flex-col justify-end p-8 md:p-24 font-mono text-cyan-400 text-sm md:text-lg transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${isDone ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100 scale-100'}`}>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(34,211,238,0.1)_0%,transparent_100%)] animate-pulse" />
      <div className="relative z-10 flex flex-col gap-2">
        {lines.map((line, i) => (
          <div key={i} className="animate-in fade-in slide-in-from-bottom-2 duration-300">{line}</div>
        ))}
        {!isDone && <div className="w-3 h-5 bg-cyan-400 animate-pulse mt-2" />}
      </div>
    </div>
  );
};

// 2. Velocity-Aware Physics Cursor
const CustomCursor = () => {
  const cursorRef = useRef(null);
  const dotRef = useRef(null);
  const requestRef = useRef(null);
  const mouse = useRef({ x: 0, y: 0 });
  const pos = useRef({ x: 0, y: 0 });
  const vel = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const onMouseMove = (e) => { mouse.current = { x: e.clientX, y: e.clientY }; };
    window.addEventListener('mousemove', onMouseMove);

    const render = () => {
      // Spring physics
      const dx = mouse.current.x - pos.current.x;
      const dy = mouse.current.y - pos.current.y;
      
      vel.current.x += dx * 0.15;
      vel.current.y += dy * 0.15;
      vel.current.x *= 0.6; // Friction
      vel.current.y *= 0.6;
      
      pos.current.x += vel.current.x;
      pos.current.y += vel.current.y;

      // Calculate stretching based on velocity
      const speed = Math.sqrt(vel.current.x**2 + vel.current.y**2);
      const angle = Math.atan2(vel.current.y, vel.current.x) * (180 / Math.PI);
      const scaleX = 1 + Math.min(speed * 0.05, 2); // Max stretch
      const scaleY = 1 - Math.min(speed * 0.02, 0.5); // Max squash

      if (cursorRef.current && dotRef.current) {
        cursorRef.current.style.transform = `translate3d(${pos.current.x}px, ${pos.current.y}px, 0) rotate(${angle}deg) scale(${scaleX}, ${scaleY})`;
        dotRef.current.style.transform = `translate3d(${mouse.current.x}px, ${mouse.current.y}px, 0)`;
      }
      requestRef.current = requestAnimationFrame(render);
    };
    requestRef.current = requestAnimationFrame(render);

    const handleHover = (e) => {
      if (e.target.closest('a, button, .magnetic')) {
        cursorRef.current?.classList.add('bg-white', 'mix-blend-difference', 'scale-[3]');
        cursorRef.current?.classList.remove('border-white/50');
      } else {
        cursorRef.current?.classList.remove('bg-white', 'mix-blend-difference', 'scale-[3]');
        cursorRef.current?.classList.add('border-white/50');
      }
    };
    window.addEventListener('mouseover', handleHover);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseover', handleHover);
      cancelAnimationFrame(requestRef.current);
    };
  }, []);

  return (
    <div className="hidden lg:block pointer-events-none z-[9999] fixed inset-0 mix-blend-difference">
      <div ref={dotRef} className="absolute w-1.5 h-1.5 bg-white rounded-full -ml-[3px] -mt-[3px] will-change-transform" />
      <div ref={cursorRef} className="absolute w-10 h-10 border border-white/50 rounded-full -ml-5 -mt-5 transition-colors duration-200 will-change-transform" />
    </div>
  );
};

// 3. WebGL-Style Canvas Aurora Background (Highly Performant)
const CanvasAurora = ({ isGodMode }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    let width, height;
    let animationFrameId;

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };
    window.addEventListener('resize', resize);
    resize();

    // Orb physics
    const orbs = Array.from({ length: 4 }).map(() => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      radius: Math.random() * 300 + 200,
      color: isGodMode ? [0, 255, 0] : [
        [34, 211, 238], // Cyan
        [168, 85, 247], // Purple
        [59, 130, 246], // Blue
        [236, 72, 153]  // Pink
      ][Math.floor(Math.random() * 4)]
    }));

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.globalCompositeOperation = 'screen';

      orbs.forEach(orb => {
        orb.x += orb.vx;
        orb.y += orb.vy;

        if (orb.x < -orb.radius || orb.x > width + orb.radius) orb.vx *= -1;
        if (orb.y < -orb.radius || orb.y > height + orb.radius) orb.vy *= -1;

        const gradient = ctx.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, orb.radius);
        gradient.addColorStop(0, `rgba(${orb.color[0]}, ${orb.color[1]}, ${orb.color[2]}, 0.15)`);
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(orb.x, orb.y, orb.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isGodMode]);

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0 opacity-80" />;
};

// 4. Kinetic Typography (Blur to Focus Stagger)
const BlurRevealText = ({ text, className = "" }) => {
  const ref = useRef(null);
  const isVisible = useOnScreen(ref);
  const words = text.split(' ');

  return (
    <div ref={ref} className={`flex flex-wrap gap-[0.2em] ${className}`}>
      {words.map((word, i) => (
        <span 
          key={i} 
          className="inline-block transition-all duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)] will-change-transform"
          style={{ 
            opacity: isVisible ? 1 : 0, 
            transform: isVisible ? 'translateY(0) scale(1)' : 'translateY(40px) scale(1.1)',
            filter: isVisible ? 'blur(0px)' : 'blur(10px)',
            transitionDelay: `${i * 100}ms` 
          }}
        >
          {word}
        </span>
      ))}
    </div>
  );
};

// 5. Magnetic Spring Button
const MagneticButton = ({ children, className = "", onClick, href, target }) => {
  const buttonRef = useRef(null);
  const textRef = useRef(null);

  const handleMouseMove = (e) => {
    if (!buttonRef.current) return;
    const { left, top, width, height } = buttonRef.current.getBoundingClientRect();
    const x = (e.clientX - left - width / 2);
    const y = (e.clientY - top - height / 2);
    
    // Move button background
    buttonRef.current.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;
    // Parallax text slightly more
    if (textRef.current) textRef.current.style.transform = `translate(${x * 0.1}px, ${y * 0.1}px)`;
  };

  const handleMouseLeave = () => {
    if (!buttonRef.current) return;
    buttonRef.current.style.transform = `translate(0px, 0px)`;
    if (textRef.current) textRef.current.style.transform = `translate(0px, 0px)`;
  };

  const Wrapper = href ? 'a' : 'button';

  return (
    <Wrapper 
      href={href} target={target} onClick={onClick} ref={buttonRef}
      onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}
      className={`magnetic relative inline-flex items-center justify-center transition-transform duration-500 ease-out will-change-transform ${className}`}
    >
      <span ref={textRef} className="relative z-10 flex items-center justify-center transition-transform duration-500 ease-out will-change-transform pointer-events-none">
        {children}
      </span>
    </Wrapper>
  );
};

// 6. Scroll-Reactive 3D Card (GSAP Alternative)
const VelocityCard = ({ children, className = "" }) => {
  const cardRef = useRef(null);
  const velocity = useScrollVelocity();
  const isVisible = useOnScreen(cardRef);

  useEffect(() => {
    if (!cardRef.current) return;
    // Skew and scale based on scroll velocity
    const skew = Math.max(Math.min(velocity * -0.5, 5), -5); 
    const scale = 1 - Math.min(Math.abs(velocity * 0.005), 0.02);
    cardRef.current.style.transform = `perspective(1000px) rotateX(${skew}deg) scale(${scale})`;
  }, [velocity]);

  return (
    <div
      ref={cardRef}
      className={`transition-all duration-500 ease-out will-change-transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-16'} ${className}`}
    >
      {children}
    </div>
  );
};

// 7. Advanced 3D Tilt Card with Glare
const TiltCard = ({ children, className = "" }) => {
  const cardRef = useRef(null);
  const glareRef = useRef(null);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateX = ((y - centerY) / centerY) * -8; // Max 8 degrees
    const rotateY = ((x - centerX) / centerX) * 8;

    cardRef.current.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
    
    // Glare effect
    if (glareRef.current) {
      glareRef.current.style.transform = `translate(${x - rect.width}px, ${y - rect.height}px)`;
      glareRef.current.style.opacity = '1';
    }
  };

  const handleMouseLeave = () => {
    if (!cardRef.current) return;
    cardRef.current.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
    if (glareRef.current) glareRef.current.style.opacity = '0';
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`relative overflow-hidden rounded-[2rem] border border-white/5 bg-white/[0.02] backdrop-blur-xl transition-all duration-300 ease-out will-change-transform ${className}`}
    >
      <div 
        ref={glareRef} 
        className="absolute w-[200%] h-[200%] bg-gradient-to-tr from-transparent via-white/10 to-transparent pointer-events-none opacity-0 transition-opacity duration-300 rounded-full blur-2xl z-0" 
      />
      <div className="relative z-10 h-full">
        {children}
      </div>
    </div>
  );
};

// ==========================================
// INTERACTIVE FEATURES
// ==========================================

const CommandPalette = ({ isOpen, setIsOpen }) => {
  const [search, setSearch] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); setIsOpen(p => !p); }
      if (e.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setIsOpen]);

  useEffect(() => { if (isOpen) setTimeout(() => inputRef.current?.focus(), 50); }, [isOpen]);

  if (!isOpen) return null;

  const links = [
    { name: "Home", href: "#hero", icon: Target }, { name: "About & Philosophy", href: "#philosophy", icon: Bot },
    { name: "Verified Impact", href: "#achievements", icon: Trophy }, { name: "Selected Works", href: "#projects", icon: Code2 },
    { name: "Contact & Mentorship", href: "#contact", icon: Mail }, { name: "GitHub Repository", href: personalInfo.github, icon: Github, external: true },
    { name: "LinkedIn Profile", href: personalInfo.linkedin, icon: Linkedin, external: true },
    { name: "Instagram Profile", href: personalInfo.instagram, icon: Instagram, external: true }
  ];
  const filtered = links.filter(l => l.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="fixed inset-0 z-[200] flex items-start justify-center pt-[15vh] px-4 animate-in fade-in duration-200">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setIsOpen(false)} />
      <div className="relative w-full max-w-2xl bg-[#0a0a0a] border border-white/10 rounded-[2rem] shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden">
        <div className="flex items-center px-6 border-b border-white/5">
          <Search size={22} className="text-zinc-500" />
          <input ref={inputRef} type="text" placeholder="What are you looking for?" className="w-full bg-transparent border-none text-white px-4 py-6 outline-none placeholder:text-zinc-600 text-xl font-light" value={search} onChange={(e) => setSearch(e.target.value)} />
          <kbd className="hidden sm:inline-flex px-3 py-1 bg-white/5 rounded-lg text-xs text-zinc-400 font-mono">ESC</kbd>
        </div>
        <div className="max-h-[50vh] overflow-y-auto p-4">
          {filtered.length === 0 ? <div className="px-4 py-12 text-center text-zinc-500 font-light">No modules found for "{search}"</div> : (
            <div className="space-y-1">
              <div className="px-4 py-3 text-xs font-bold text-zinc-600 uppercase tracking-widest">System Navigation</div>
              {filtered.map((link, idx) => {
                const Icon = link.icon;
                return (
                  <a key={idx} href={link.href} onClick={() => setIsOpen(false)} target={link.external ? "_blank" : "_self"} className="flex items-center gap-4 px-4 py-4 text-zinc-400 hover:text-white hover:bg-white/5 rounded-2xl transition-all group">
                    <Icon size={20} className="text-zinc-600 group-hover:text-cyan-400 transition-colors" />
                    <span className="text-lg font-light">{link.name}</span>
                    {link.external && <ExternalLink size={16} className="ml-auto text-zinc-700 group-hover:text-zinc-400" />}
                  </a>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// AI Copilot
const AICopilot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([{ role: "ai", text: "Koushick_OS AI initialized. Ask me about his stack, hackathons, or mentorship." }]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, isOpen]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    setMessages(prev => [...prev, { role: "user", text: input.trim() }]);
    setInput("");
    setTimeout(() => {
      const q = input.toLowerCase();
      let res = "Context not found. Try asking about 'skills', 'achievements', 'mentorship', or 'hire'.";
      if (q.includes("skill") || q.includes("tech") || q.includes("stack")) res = "Expertise: MERN Stack, C/C++, Python, AI development, and competitive programming.";
      if (q.includes("hackathon") || q.includes("sih")) res = "Grand Finalist at SIH 2024 (Zero-power solar tracker) & Top 5 at Board2Code (Tiki Topple AI Arena).";
      if (q.includes("guide") || q.includes("mentor") || q.includes("student") || q.includes("focus") || q.includes("group")) res = "He runs an active mentorship community! You can join his WhatsApp group from the Mentorship section, or DM him directly at +918900500157.";
      if (q.includes("hire") || q.includes("contact")) res = "Actively seeking impactful roles. Email: mondalkoushick393@gmail.com";
      setMessages(prev => [...prev, { role: "ai", text: res }]);
    }, 800);
  };

  return (
    <div className="fixed bottom-8 right-8 z-[150] flex flex-col items-end pointer-events-auto">
      {isOpen && (
        <div className="bg-[#050505]/90 backdrop-blur-2xl border border-white/10 rounded-[2rem] shadow-[0_0_50px_rgba(0,0,0,0.8)] w-[340px] h-[450px] mb-6 flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
          <div className="bg-white/5 p-5 border-b border-white/5 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center border border-cyan-500/30"><Orbit size={16} className="text-cyan-400 animate-spin-slow" /></div>
              <div>
                <div className="font-semibold text-white text-sm">Copilot</div>
                <div className="text-xs text-cyan-400 flex items-center gap-1"><div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse"></div> Processing</div>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-zinc-500 hover:text-white transition-colors bg-white/5 p-2 rounded-full"><X size={16}/></button>
          </div>
          <div className="flex-1 p-5 overflow-y-auto space-y-6">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed ${msg.role === 'user' ? 'bg-white text-black rounded-br-none' : 'bg-white/5 text-zinc-300 border border-white/5 rounded-bl-none'}`}>{msg.text}</div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          <form onSubmit={handleSend} className="p-4 border-t border-white/5 flex gap-3">
            <input type="text" value={input} onChange={e => setInput(e.target.value)} placeholder="Send protocol..." className="flex-1 bg-white/5 border border-white/10 rounded-full px-5 py-3 text-sm text-white outline-none focus:border-cyan-500/50 transition-colors" />
            <button type="submit" className="bg-white text-black w-11 h-11 rounded-full flex items-center justify-center hover:scale-105 transition-transform"><Send size={16} className="ml-1" /></button>
          </form>
        </div>
      )}
      <MagneticButton onClick={() => setIsOpen(!isOpen)} className="bg-white text-black w-16 h-16 rounded-full shadow-[0_0_30px_rgba(255,255,255,0.2)] flex items-center justify-center relative group">
        <div className="absolute inset-0 rounded-full bg-cyan-400 opacity-0 group-hover:opacity-20 scale-150 transition-all duration-500 blur-xl"></div>
        {isOpen ? <X size={24} /> : <Bot size={24} />}
      </MagneticButton>
    </div>
  );
};

// ==========================================
// MAIN APP ENTRY
// ==========================================
export default function App() {
  const [booting, setBooting] = useState(true);
  const [isGodMode, setIsGodMode] = useState(false);
  const [cmdOpen, setCmdOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Konami Code Easter Egg
  useEffect(() => {
    const konami = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
    let idx = 0;
    const handleKey = (e) => {
      if (e.key === konami[idx]) {
        idx++;
        if (idx === konami.length) {
          setIsGodMode(true);
          idx = 0;
          alert("SYSTEM OVERRIDE: GOD MODE ACTIVATED.");
        }
      } else { idx = 0; }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  useEffect(() => {
    const handleHashClick = (e) => {
      const href = e.target.closest('a')?.getAttribute('href');
      if (href && href.startsWith('#') && href !== '#') {
        e.preventDefault();
        document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener('click', handleHashClick);
    return () => document.removeEventListener('click', handleHashClick);
  }, []);

  if (booting) return <BootSequence onComplete={() => setBooting(false)} />;

  return (
    <div className={`min-h-screen ${isGodMode ? 'bg-green-950 text-green-400' : 'bg-[#02010a] text-zinc-300'} font-sans selection:bg-cyan-500/30 selection:text-cyan-100 overflow-x-hidden cursor-none`}>
      
      <CustomCursor />
      <CanvasAurora isGodMode={isGodMode} />
      <CommandPalette isOpen={cmdOpen} setIsOpen={setCmdOpen} />
      <AICopilot />

      {/* Global Grain Texture */}
      <div className="fixed inset-0 pointer-events-none z-50 opacity-[0.04] mix-blend-overlay" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>

      {/* ULTRA MINIMAL NAVBAR */}
      <nav className="fixed top-0 w-full z-[100] py-6 px-8 pointer-events-none mix-blend-difference">
        <div className="max-w-7xl mx-auto flex justify-between items-center pointer-events-auto">
          <a href="#" className="text-xl md:text-2xl font-black tracking-tighter uppercase magnetic flex gap-2">
            <span className="text-white">KOUSHICK</span>
            <span className={`text-transparent bg-clip-text bg-gradient-to-r ${isGodMode ? 'from-green-400 to-emerald-600' : 'from-cyan-400 to-purple-500'}`}>
              MONDAL
            </span>
          </a>
          <div className="hidden md:flex gap-8 text-white font-bold text-sm tracking-widest uppercase">
            {["achievements", "projects", "philosophy"].map(l => (
              <a key={l} href={`#${l}`} className="magnetic hover:text-cyan-400 transition-colors">{l}</a>
            ))}
          </div>
          <button onClick={() => setCmdOpen(true)} className="hidden md:flex items-center gap-3 px-5 py-2.5 bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/10 rounded-full text-sm text-white font-medium transition-all magnetic">
            <Command size={16} /> <span>Menu</span> <kbd className="font-mono text-xs text-zinc-400 ml-2">⌘K</kbd>
          </button>
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden text-white bg-white/10 p-3 rounded-full backdrop-blur-md">
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {/* MOBILE MENU */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[90] bg-[#050505]/95 backdrop-blur-2xl flex flex-col justify-center items-center gap-8 animate-in fade-in duration-300">
          {["about", "achievements", "projects", "contact"].map((item) => (
            <a key={item} href={`#${item}`} onClick={() => setMobileMenuOpen(false)} className="text-4xl font-black text-white uppercase tracking-tighter hover:text-cyan-400 transition-colors">{item}</a>
          ))}
        </div>
      )}

      <main className="relative z-10 w-full pt-32 pb-24 space-y-40">
        
        {/* CINEMATIC HERO SECTION */}
        <section id="hero" className="min-h-[85vh] flex flex-col justify-center max-w-7xl mx-auto px-6 lg:px-8 relative">
          
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_at_center,black_10%,transparent_70%)] pointer-events-none -z-10" />

          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-md w-fit mb-8 shadow-[0_0_20px_rgba(255,255,255,0.05)] animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <Cpu size={14} className={isGodMode ? 'text-green-500' : 'text-cyan-400'} />
            <span className="text-zinc-300 font-mono text-sm uppercase tracking-widest">System Architect</span>
          </div>
          
          <BlurRevealText 
            text="ENGINEERING DIGITAL IMPACT."
            className="text-[12vw] md:text-[8rem] font-black text-white tracking-tighter leading-[0.85] mb-12 uppercase"
          />
          
          <div className="max-w-2xl animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-500 fill-mode-both">
            <p className="text-xl md:text-2xl text-zinc-400 leading-relaxed font-light mb-12">
              I am <strong className="text-white font-medium">Koushick Mondal</strong>. {personalInfo.tagline}
            </p>
            
            <div className="flex flex-wrap items-center gap-6">
              <MagneticButton href="#projects" className="px-8 py-5 bg-white text-black font-bold rounded-full overflow-hidden group">
                <span className="relative z-10 flex items-center gap-3">Deploy Systems <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" /></span>
              </MagneticButton>
              
              <MagneticButton href={personalInfo.whatsapp} target="_blank" className="px-8 py-5 bg-[#111] border border-white/10 text-white font-bold rounded-full hover:border-green-500/50 hover:shadow-[0_0_20px_rgba(34,197,94,0.2)] transition-all flex items-center gap-3">
                <MessageCircle size={18} className="text-green-500" /> Secure Comms
              </MagneticButton>
            </div>
          </div>
        </section>

        {/* INFINITE CINEMATIC MARQUEE */}
        <div className="relative w-full overflow-hidden border-y border-white/5 bg-black/50 py-6 flex whitespace-nowrap -rotate-2 scale-110">
          <div className="absolute inset-0 z-10 pointer-events-none bg-gradient-to-r from-[#02010a] via-transparent to-[#02010a]" />
          <div className="animate-marquee flex gap-16 items-center">
            {[...marqueeSkills, ...marqueeSkills].map((skill, idx) => (
              <div key={idx} className="flex items-center gap-6 text-zinc-600 font-mono text-3xl font-black uppercase tracking-widest hover:text-white transition-colors duration-500">
                <span>{skill}</span>
                <Sparkles size={20} className={isGodMode ? 'text-green-500/50' : 'text-cyan-500/50'} />
              </div>
            ))}
          </div>
        </div>

        {/* VERIFIED IMPACT (BENTO BOX) */}
        <section id="achievements" className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="mb-16">
            <BlurRevealText text="VERIFIED IMPACT." className="text-5xl md:text-7xl font-black text-white tracking-tighter" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {topAchievements.map((item, idx) => (
              <VelocityCard key={item.id} className={`${item.colSpan}`}>
                <TiltCard className="p-10 flex flex-col justify-between group h-full min-h-[300px]">
                  <div className="flex justify-between items-start mb-12 relative z-10">
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${item.color} bg-opacity-20 flex items-center justify-center border border-white/20 shadow-xl`}>
                      <Trophy size={24} className="text-white" />
                    </div>
                    <span className="text-zinc-500 text-xs font-mono tracking-widest uppercase border border-white/10 px-3 py-1 rounded-full">{item.unit}</span>
                  </div>
                  <div className="relative z-10">
                    <div className="text-6xl md:text-8xl font-black text-white mb-4 tracking-tighter drop-shadow-lg">{item.metric}</div>
                    <h4 className="text-xl text-white font-bold mb-2">{item.title}</h4>
                    <p className="text-zinc-400 text-sm leading-relaxed max-w-sm">{item.description}</p>
                  </div>
                </TiltCard>
              </VelocityCard>
            ))}
          </div>
        </section>

        {/* CASE STUDIES (CINEMATIC SHOWCASE) */}
        <section id="projects" className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="mb-20">
            <BlurRevealText text="SELECTED WORKS." className="text-5xl md:text-7xl font-black text-white tracking-tighter" />
          </div>

          <div className="space-y-12">
            {projects.map((project, idx) => (
              <VelocityCard key={project.id} className="group p-0 border border-white/10 rounded-[2rem] overflow-hidden bg-[#050505]">
                <div className="grid md:grid-cols-12 gap-0 h-full">
                  <div className="md:col-span-7 p-10 md:p-16 flex flex-col justify-center relative z-10">
                    <h3 className="text-4xl md:text-5xl font-black text-white mb-10 tracking-tight group-hover:text-cyan-400 transition-colors duration-500">{project.title}</h3>
                    
                    <div className="space-y-6 text-lg">
                      <p><strong className="text-white block mb-1">Problem.</strong> <span className="text-zinc-400 font-light">{project.problem}</span></p>
                      <p><strong className="text-white block mb-1">Solution.</strong> <span className="text-zinc-400 font-light">{project.solution}</span></p>
                      <div className="p-5 rounded-2xl bg-white/5 border border-white/10 mt-6 backdrop-blur-md">
                        <strong className="text-cyan-400 block mb-1">Impact.</strong> 
                        <span className="text-white font-medium">{project.impact}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="md:col-span-5 bg-[#0a0a0a] p-10 border-l border-white/5 flex flex-col justify-between relative overflow-hidden">
                    {/* Animated background pattern inside card */}
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:20px_20px] opacity-50 group-hover:scale-110 transition-transform duration-1000 ease-out"></div>
                    
                    <div className="relative z-10 flex flex-wrap gap-2 mb-12">
                      {project.tech.map(t => <span key={t} className="px-4 py-2 bg-white/5 border border-white/10 rounded-full text-sm text-white font-mono backdrop-blur-md">{t}</span>)}
                    </div>
                    
                    <div className="relative z-10 flex gap-4 mt-auto">
                      {project.link !== "#" && (
                        <MagneticButton href={project.link} target="_blank" className="flex-1 py-5 bg-white text-black font-bold rounded-full text-center hover:bg-zinc-200">
                          Deploy Module
                        </MagneticButton>
                      )}
                      <MagneticButton href={project.github || personalInfo.github} target="_blank" className="w-16 h-16 bg-[#111] border border-white/10 text-white rounded-full flex items-center justify-center hover:border-white/30">
                        <Github size={24} />
                      </MagneticButton>
                    </div>
                  </div>
                </div>
              </VelocityCard>
            ))}
          </div>
        </section>

        {/* PHILOSOPHY & MENTORSHIP */}
        <section id="philosophy" className="max-w-7xl mx-auto px-6 lg:px-8 border-t border-white/10 pt-32">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-stretch">
            <VelocityCard>
              <h3 className="text-5xl font-black text-white tracking-tighter mb-10">THE PHILOSOPHY.</h3>
              <p className="text-xl text-zinc-400 leading-relaxed font-light mb-10">
                {personalInfo.about}
              </p>
              <div className="inline-flex items-center gap-3 px-6 py-4 rounded-full bg-white/5 border border-white/10 text-zinc-300 backdrop-blur-md">
                <MapPin size={20} className={isGodMode ? 'text-green-500' : 'text-cyan-400'} /> Operational Base: {personalInfo.location}
              </div>
            </VelocityCard>
            
            <VelocityCard className="p-10 md:p-14 bg-gradient-to-br from-green-900/20 to-[#111] border border-green-500/20 rounded-[2rem] flex flex-col justify-between relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/10 rounded-full blur-[80px] pointer-events-none group-hover:bg-green-500/20 transition-colors duration-700"></div>
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-8">
                  <div className="w-16 h-16 rounded-2xl bg-green-500/10 flex items-center justify-center border border-green-500/30 shadow-[0_0_20px_rgba(34,197,94,0.2)]">
                    <Shield size={32} className="text-green-400" />
                  </div>
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-green-500/30 bg-green-500/10 backdrop-blur-md shadow-[0_0_15px_rgba(34,197,94,0.1)]">
                    <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                    <span className="text-green-400 font-mono text-xs uppercase tracking-widest font-bold">Active Protocol</span>
                  </div>
                </div>

                <h3 className="text-4xl font-black text-white tracking-tighter mb-6">Mentorship Protocol.</h3>
                <p className="text-lg text-zinc-400 leading-relaxed font-light mb-8">
                  Elevating the community is mandatory. <strong className="text-white font-medium">I am already mentoring several students</strong>, actively guiding them through focus issues, distractions, and career direction. Need a coding roadmap, hackathon prep, or study strategies? I am here to help you override limitations.
                </p>

                <div className="flex gap-8 mb-10 pb-8 border-b border-green-500/20">
                  <div>
                    <strong className="text-white text-3xl font-black block tracking-tighter">Active</strong>
                    <span className="text-zinc-500 text-xs uppercase font-bold tracking-widest">Students Mentored</span>
                  </div>
                  <div>
                    <strong className="text-white text-3xl font-black block tracking-tighter">1-on-1</strong>
                    <span className="text-zinc-500 text-xs uppercase font-bold tracking-widest">Personal Guidance</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 relative z-10">
                <MagneticButton href={personalInfo.whatsappCommunity} target="_blank" className="flex-1 py-5 bg-green-600 text-white font-bold rounded-full hover:bg-green-500 shadow-[0_0_30px_rgba(22,163,74,0.3)] flex items-center justify-center gap-3">
                  <Users size={20} /> Join Mentorship Group
                </MagneticButton>
                <MagneticButton href={personalInfo.whatsapp} target="_blank" className="flex-1 py-5 bg-[#111] border border-green-500/30 text-green-500 font-bold rounded-full hover:bg-green-500/10 transition-all flex items-center justify-center gap-3">
                  <MessageCircle size={20} /> Direct Message
                </MagneticButton>
              </div>
            </VelocityCard>
          </div>
        </section>

        {/* TERMINAL FOOTER / CONTACT */}
        <section id="contact" className="py-40 text-center relative overflow-hidden border-t border-white/5 mt-32">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-cyan-900/10 pointer-events-none"></div>
          <div className="relative z-10 max-w-4xl mx-auto px-6">
            <h2 className="text-[12vw] sm:text-8xl md:text-9xl font-black text-white tracking-tighter uppercase leading-[0.8] mb-12">
              INITIATE <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">CONTACT.</span>
            </h2>
            <p className="text-2xl text-zinc-400 mb-16 font-light max-w-2xl mx-auto">
              Ready to architect the future? Actively seeking high-impact roles.
            </p>
            <MagneticButton href={`mailto:${personalInfo.email}`} className="px-12 py-6 bg-white text-black font-bold text-xl rounded-full flex items-center justify-center gap-4 mx-auto">
              <Mail size={24} /> Execute Email Protocol
            </MagneticButton>
          </div>
        </section>

      </main>

      <footer className="border-t border-white/5 py-12 text-center text-zinc-600 text-sm bg-[#02010a] relative z-10">
        <div className="flex justify-center gap-8 mb-6">
          <a href={personalInfo.github} target="_blank" rel="noreferrer" className="hover:text-white transition-colors"><Github size={24} /></a>
          <a href={personalInfo.linkedin} target="_blank" rel="noreferrer" className="hover:text-white transition-colors"><Linkedin size={24} /></a>
          <a href={personalInfo.instagram} target="_blank" rel="noreferrer" className="hover:text-white transition-colors"><Instagram size={24} /></a>
        </div>
        <p className="uppercase tracking-widest font-mono text-xs font-bold text-zinc-500">© {new Date().getFullYear()} Koushick Mondal // System Output</p>
      </footer>

      {/* Global CSS required for infinite animations */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        .animate-marquee { animation: marquee 25s linear infinite; width: max-content; }
        .spin-slow { animation: spin 8s linear infinite; }
      `}} />
    </div>
  );
}