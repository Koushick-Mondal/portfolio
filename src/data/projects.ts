export type ProjectVisual =
  | 'topology'
  | 'ocean'
  | 'storage'
  | 'transactions'
  | 'career'
  | 'knowledge';

export interface Project {
  title: string;
  eyebrow: string;
  description: string;
  status: string;
  visual: ProjectVisual;
  verified: boolean;
  category: string;
  highlights: string[];
  stack?: string[];
  github?: string;
}

export const projects: Project[] = [
  {
    title: 'CyberHiveX',
    eyebrow: 'Co-founder · Sep 2026',
    description:
      'CyberHiveX Technologies is building Rakshak AI for security threat intelligence, OSINT, digital forensics, automation, red teaming, and incident response.',
    status: 'Venture in development',
    visual: 'topology',
    verified: true,
    category: 'Cybersecurity · AI',
    highlights: ['Rakshak AI security threat intelligence', 'OSINT and digital forensics', 'Security automation, red teaming, and incident response'],
    github: 'https://github.com/Koushick-Mondal/CyberHiveX',
  },
  {
    title: 'ORCA Marine',
    eyebrow: 'Agentic AI · Marine intelligence',
    description: 'Agentic marine intelligence connecting satellite, oceanographic, weather, and geospatial information through conversational AI agents, with fishing-zone insights, marine risk, and offline mobile use.',
    status: 'Marine intelligence project',
    visual: 'ocean',
    verified: true,
    category: 'Marine intelligence · Agentic AI',
    highlights: ['Satellite, oceanographic, weather, and geospatial intelligence', 'Conversational AI agents for fishing-zone insights and marine risk', 'Offline mobile use'],
  },
  {
    title: 'Vault',
    eyebrow: 'Concept / project · details coming soon',
    description: 'Concept / project · details coming soon',
    status: 'Details coming soon',
    visual: 'storage',
    verified: false,
    category: 'Details forthcoming',
    highlights: ['Project details forthcoming.'],
  },
  {
    title: 'Fraud AI',
    eyebrow: 'UPI · Fraud intelligence',
    description: 'UPI fraud detection and merchant analytics focused on fraud rings, synthetic identities, and high-risk merchants.',
    status: 'Fraud intelligence project',
    visual: 'transactions',
    verified: true,
    category: 'Fraud detection · Merchant analytics',
    highlights: ['UPI fraud detection', 'Merchant analytics and high-risk merchants', 'Fraud rings and synthetic identities'],
  },
  {
    title: 'GrowBharat',
    eyebrow: 'Founder & CEO · May 2026',
    description:
      'A student web platform bringing together mentorship, career guidance, an AI chatbot, and course recommendations.',
    status: 'Community venture',
    visual: 'career',
    verified: true,
    category: 'Education · Career guidance',
    highlights: ['Student mentorship and career guidance', 'AI chatbot', 'Course recommendations on a student web platform'],
  },
  {
    title: 'Infinity AI',
    eyebrow: 'Personal AI · Companion',
    description: 'A personal AI companion with memory, supporting career development, skills, and projects.',
    status: 'Personal AI project',
    visual: 'knowledge',
    verified: true,
    category: 'Personal AI companion',
    highlights: ['Personal AI companion with memory', 'Career and skills support', 'Project support'],
  },
];
