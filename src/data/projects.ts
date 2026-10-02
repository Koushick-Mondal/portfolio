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
}

export const projects: Project[] = [
  {
    title: 'CyberHiveX',
    eyebrow: 'Co-founder · Sep 2026',
    description:
      'A cybersecurity venture building the Rakshak AI suite across AI threat intelligence, OSINT, and digital forensics.',
    status: 'Venture in development',
    visual: 'topology',
    verified: true,
  },
  {
    title: 'ORCA Marine',
    eyebrow: 'Concept / project · details coming soon',
    description: 'Concept / project · details coming soon',
    status: 'Details coming soon',
    visual: 'ocean',
    verified: false,
  },
  {
    title: 'Vault',
    eyebrow: 'Concept / project · details coming soon',
    description: 'Concept / project · details coming soon',
    status: 'Details coming soon',
    visual: 'storage',
    verified: false,
  },
  {
    title: 'Fraud AI',
    eyebrow: 'Concept / project · details coming soon',
    description: 'Concept / project · details coming soon',
    status: 'Details coming soon',
    visual: 'transactions',
    verified: false,
  },
  {
    title: 'GrowBharat',
    eyebrow: 'Founder & CEO · May 2026',
    description:
      'A student mentorship community helping young people navigate career paths and discover opportunities.',
    status: 'Community venture',
    visual: 'career',
    verified: true,
  },
  {
    title: 'Infinity AI',
    eyebrow: 'Concept / project · details coming soon',
    description: 'Concept / project · details coming soon',
    status: 'Details coming soon',
    visual: 'knowledge',
    verified: false,
  },
];
