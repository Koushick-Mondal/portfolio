import { credentials } from './credentials';

export type Certification = { name: string; provider: string; date?: string };

// Compatibility projection for older, unused components. Credential records are
// the single source of truth so old consumers cannot drift from the vault.
export const certifications: Certification[] = credentials
  .filter((record) => record.category === 'certification')
  .map((record) => ({
    name: record.title || 'Untitled certification',
    provider: record.issuer || 'Issuer not specified',
    date: record.date || record.year || '—',
  }));
