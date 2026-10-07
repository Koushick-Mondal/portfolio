export type ExperienceItem = {
  date: string;
  company: string;
  role: string;
  location?: string;
  text: string;
  details: string[];
  tags: string[];
};

export const experience: ExperienceItem[] = [
  {
    date: 'JUL 2026 — PRESENT',
    company: 'Handshake AI',
    role: 'Software Engineer · Project Dynamo',
    text: 'Selected for Handshake AI’s Project Dynamo, helping evaluate and improve AI systems through real software engineering work.',
    details: ['Debug code, analyse problems, and check AI-generated solutions for correctness and quality.', 'Work in GitHub and terminal-based workflows.'],
    tags: ['AI evaluation', 'Debugging', 'GitHub', 'Terminal workflows'],
  },
  {
    date: 'MAY 2026 — PRESENT',
    company: 'GrowBharat',
    role: 'Founder & CEO',
    text: 'Founded an EdTech and mentorship platform that helps students explore career paths, find mentors, and discover opportunities.',
    details: ['Run community, collaboration, and guidance initiatives to support students as they grow.'],
    tags: ['EdTech', 'Mentorship', 'Product building'],
  },
  {
    date: 'SEP 2026 — PRESENT',
    company: 'CyberHiveX',
    role: 'Co-Founder',
    text: 'Co-founded CyberHiveX and lead the team across direction, operations, and delivery.',
    details: ['Manage work end to end, from planning and day-to-day operations to getting things delivered.', 'CyberHiveX builds cybersecurity solutions around threat intelligence, OSINT, digital forensics, red teaming, and incident response.'],
    tags: ['Cybersecurity', 'Operations', 'Rakshak AI'],
  },
  {
    date: 'MAY — AUG 2026',
    company: 'Prashant Kumar LTD',
    role: 'Full Stack Engineer / Intern',
    location: 'Remote, London',
    text: 'Built responsive web pages and applications with HTML, CSS, and JavaScript.',
    details: ['Improved site content and UI to make the website easier and nicer to use.', 'Spotted and reported performance and security issues to make the system more reliable.', 'Built a responsive event management website.'],
    tags: ['HTML', 'CSS', 'JavaScript', 'Performance', 'Security'],
  },
];
