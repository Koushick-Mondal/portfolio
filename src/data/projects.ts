export type ProjectVisual = 'ocean' | 'storage' | 'care' | 'solar' | 'knowledge' | 'career';

export interface Project {
  title: string;
  eyebrow: string;
  description: string;
  status: string;
  visual: ProjectVisual;
  category: string;
  highlights: string[];
  stack?: string[];
  live?: string;
  github?: string;
  date?: string;
  linkNote?: string;
  repositoryReference?: string;
}

export const projects: Project[] = [
  {
    title: 'ORCA',
    eyebrow: 'Marine Ecosystem Reasoning with Collaborative Agents',
    description: 'An agentic AI platform that brings together satellite, weather, ocean, and geospatial data to give fishermen, researchers, and coastal authorities clear, explainable insights.',
    status: 'Live · offline mobile app',
    visual: 'ocean',
    category: 'Marine intelligence · Agentic AI',
    date: 'SEP 2026',
    highlights: ['Fishing-zone insights, marine risks, hazard alerts, and safer route planning through a chat interface.', 'Offline mobile use without a SIM card or internet through preloaded marine data.'],
    live: 'https://orcamarinasih.office-11b.workers.dev',
  },
  {
    title: 'Vault',
    eyebrow: 'Distributed Object Storage Platform',
    description: 'A distributed storage system focused on scalable, reliable, and fault-tolerant data through chunking and replication across nodes.',
    status: 'In progress',
    visual: 'storage',
    category: 'Distributed systems · Storage',
    date: 'SEP 2026',
    highlights: ['Go backend with PostgreSQL metadata and Docker storage nodes.', 'Checksum integrity checks, repair and recovery workflows, and a Next.js / TypeScript dashboard for object and node health.'],
    stack: ['Go', 'PostgreSQL', 'Docker', 'Next.js', 'TypeScript'],
    live: 'https://fraud-ai.streamlit.app',
    linkNote: 'The CV lists this Streamlit URL under Vault. It currently redirects to sign-in; the URL names Fraud AI rather than Vault.',
  },
  {
    title: 'CareSync AI',
    eyebrow: 'Right Care · Right Hospital · Right Time',
    description: 'An emergency hospital discovery tool that compares location, travel distance, ETA, known capabilities, operational status, and data reliability.',
    status: 'Live',
    visual: 'care',
    category: 'Healthcare · AI product',
    date: 'AUG 2026',
    highlights: ['CareMatch explains why a hospital is recommended and flags anything unavailable or uncertain.', 'Multilingual chatbot, maps, emergency workflow, JWT authentication, role-based dashboards, and hospital authority management.'],
    stack: ['Next.js', 'TypeScript'],
    live: 'https://care-sync-ai-lyart.vercel.app',
  },
  {
    title: 'N.E.S.T.',
    eyebrow: 'Non-Electrical Solar Tracking System',
    description: 'A solar tracker that follows the sun using a torsion spring and clockwork gear mechanism, without motors, sensors, or external power.',
    status: 'Smart India Hackathon 2024 finalist',
    visual: 'solar',
    category: 'Hardware · Sustainability',
    date: 'SIH 2024',
    highlights: ['Designed to keep panels well-oriented through the day in a low-cost, sustainable way.', 'The team reached the finals of Smart India Hackathon 2024.'],
  },
  {
    title: 'Infinity AI',
    eyebrow: 'AI Memory Agent with Career Intelligence',
    description: 'An AI career guidance tool that keeps memory of the user, gives personalised recommendations, and responds to the user’s emotional tone.',
    status: 'Personal AI project',
    visual: 'knowledge',
    category: 'AI · Career guidance',
    highlights: ['Persistent user memory and personalised career recommendations.', 'Emotion-aware responses for career guidance.'],
    repositoryReference: 'https://github.com/Koushick-Mondal/INFINITY-AI',
    linkNote: 'The repository URL supplied in the CV returned 404 during verification. Use the GitHub profile below to explore available repositories.',
  },
  {
    title: 'Student Career Guidance Platform',
    eyebrow: 'AI-Powered Student Platform',
    description: 'A web app that assesses a student’s skills and suggests learning paths and career options.',
    status: 'Student product',
    visual: 'career',
    category: 'Education · Career guidance',
    highlights: ['Skill assessment for students.', 'Learning-path and career-option suggestions.'],
  },
];
