import { credentials } from './credentials';

export type Achievement = { year: string; title: string; detail: string };

// Compatibility projection for older, unused components. The vault owns the
// facts; this keeps the legacy shape available without a second dataset.
export const achievements: Achievement[] = credentials
  .filter((record) => record.category === 'hackathon' || record.category === 'achievement')
  .map((record) => ({
    year: record.date || record.year || '—',
    title: record.title || 'Untitled achievement',
    detail: record.achievement || record.type || 'Recognition',
  }));
