import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

const root = join(fileURLToPath(new URL('.', import.meta.url)), '..');
const source = readFileSync(join(root, 'src', 'data', 'credentials.ts'), 'utf8');
const assetRoot = join(root, 'public', 'images', 'certificates');
const credentialRoot = join(root, 'public', 'credentials');
const imageRefs = [...source.matchAll(/imageAsset\('([^']+)'\)/g)].map((match) => match[1]);
const credentialRefs = [...source.matchAll(/asset\('([^']+)'\)/g)].map((match) => match[1]);

test('every canonical credential image has a matching public asset', () => {
  assert.equal(new Set(imageRefs).size, 47);
  for (const ref of imageRefs) assert.equal(existsSync(join(assetRoot, ref)), true, ref);
});

test('every linked credential document has a matching public asset', () => {
  assert.equal(new Set(credentialRefs).size, 24);
  for (const ref of credentialRefs) assert.equal(existsSync(join(credentialRoot, ref)), true, ref);
});

test('curated assets are all owned by the canonical dataset', () => {
  const curated = ['certifications', 'achievements', 'ai-data', 'workshops', 'developer-programs', 'leadership']
    .flatMap((category) => readdirSync(join(assetRoot, category)).map((name) => `${category}/${name}`));
  assert.deepEqual(curated.sort(), [...new Set(imageRefs)].sort());
});
