export type SkillGroup = { name: string; items: string[]; description: string };

export const skillGroups: SkillGroup[] = [
  { name: 'LANGUAGES', items: ['C', 'C++', 'Python', 'Java', 'Go', 'JavaScript', 'TypeScript'], description: 'Programming foundations and application development across systems, web, and AI work.' },
  { name: 'WEB', items: ['HTML5', 'CSS3', 'React.js', 'Next.js', 'Node.js', 'REST APIs'], description: 'Building responsive interfaces, full-stack applications, and connected services.' },
  { name: 'AI / APIS', items: ['OpenAI API', 'Google Maps API'], description: 'Practical AI and API integrations used to turn product ideas into working tools.' },
  { name: 'DATABASES', items: ['MySQL', 'PostgreSQL', 'MongoDB'], description: 'Working with relational and document data for application systems.' },
  { name: 'TOOLS', items: ['Git', 'GitHub', 'Docker', 'Linux', 'VS Code', 'Oracle Cloud Infrastructure (OCI)', 'Power BI'], description: 'Development, deployment, collaboration, and analysis tools from the CV.' },
  { name: 'WORKING STYLE', items: ['Problem solving', 'Communication', 'Teamwork', 'Leadership'], description: 'The human skills that support engineering, product building, and team work.' },
  { name: 'SPOKEN LANGUAGES', items: ['English · Full professional', 'Hindi · Full professional', 'Bengali · Native'], description: 'Languages listed in the CV.' },
];
