import { useId } from 'react';
import type { SkillGroup } from '../data/skills';
import './architecture-constellation.css';

type ArchitectureCategory = 'frontend' | 'backend' | 'ai' | 'database' | 'tools';

type ArchitectureCategoryDefinition = {
  id: ArchitectureCategory;
  label: string;
  description: string;
};

type ArchitectureNode = ArchitectureCategoryDefinition & {
  items: string[];
  sourceIndices: number[];
};

export interface ArchitectureConstellationProps {
  /** The portfolio's existing skill groups. The indexes passed to onSelect refer to this array. */
  skillGroups: SkillGroup[];
  /** The selected SkillGroup index, or null when no group is selected. */
  activeIndex: number | null;
  /** Called with a SkillGroup index when an architecture layer is selected. */
  onSelect: (index: number) => void;
  className?: string;
}

const categoryDefinitions: ArchitectureCategoryDefinition[] = [
  { id: 'frontend', label: 'Frontend', description: 'Interfaces, browser technologies, and user-facing application layers.' },
  { id: 'backend', label: 'Backend', description: 'Application services, APIs, and programming foundations.' },
  { id: 'ai', label: 'AI', description: 'Model and external API integrations that extend an application.' },
  { id: 'database', label: 'Database', description: 'Relational and document data systems.' },
  { id: 'tools', label: 'Tools', description: 'Development, deployment, collaboration, and analysis tooling.' },
];

const frontendItems = new Set(['html5', 'css3', 'react.js', 'next.js', 'javascript', 'typescript']);
const backendItems = new Set(['c', 'c++', 'python', 'java', 'go', 'node.js', 'rest apis']);

function normalized(value: string) {
  return value.trim().toLowerCase();
}

function itemsForCategory(group: SkillGroup, category: ArchitectureCategory) {
  const groupName = normalized(group.name);
  const items = group.items.filter(Boolean);

  if (category === 'ai') return groupName.includes('ai') ? items : [];
  if (category === 'database') return groupName.includes('database') ? items : [];
  if (category === 'tools') return groupName.includes('tool') ? items : [];

  if (groupName.includes('web')) {
    return items.filter((item) => category === 'frontend' ? frontendItems.has(normalized(item)) : backendItems.has(normalized(item)));
  }

  if (groupName.includes('language')) {
    return items.filter((item) => category === 'frontend' ? frontendItems.has(normalized(item)) : backendItems.has(normalized(item)));
  }

  return [];
}

function createArchitectureNodes(skillGroups: SkillGroup[]): ArchitectureNode[] {
  return categoryDefinitions.map((definition) => {
    const itemMap = new Map<string, string>();
    const sourceIndices: number[] = [];

    skillGroups.forEach((group, index) => {
      const items = itemsForCategory(group, definition.id);
      if (!items.length) return;
      sourceIndices.push(index);
      items.forEach((item) => itemMap.set(normalized(item), item));
    });

    return { ...definition, items: [...itemMap.values()], sourceIndices };
  });
}

function selectedGroup(skillGroups: SkillGroup[], activeIndex: number | null) {
  return activeIndex !== null && activeIndex >= 0 && activeIndex < skillGroups.length ? skillGroups[activeIndex] : undefined;
}

export function ArchitectureConstellation({ skillGroups, activeIndex, onSelect, className = '' }: ArchitectureConstellationProps) {
  const titleId = useId();
  const descriptionId = useId();
  const detailId = useId();
  const nodes = createArchitectureNodes(skillGroups);
  const selected = selectedGroup(skillGroups, activeIndex);
  const selectedDescription = selected?.description || 'Select an architecture layer to inspect the related skills.';

  return (
    <section className={`architecture-constellation ${className}`.trim()} aria-labelledby={titleId} aria-describedby={descriptionId}>
      <header className="architecture-constellation__header">
        <p className="architecture-constellation__eyebrow">SYSTEM MAP / SKILLS</p>
        <h2 id={titleId}>Architecture in <em>layers.</em></h2>
        <p id={descriptionId}>Explore the connected technologies behind the work. Select a layer to see its source skill group.</p>
      </header>

      <div className="architecture-constellation__graph" role="group" aria-label="Interactive architecture graph">
        <div className="architecture-constellation__connections" aria-hidden="true">
          {nodes.map((node) => (
            <span
              className="architecture-constellation__connection"
              data-connection={node.id}
              data-active={activeIndex !== null && node.sourceIndices.includes(activeIndex) ? 'true' : 'false'}
              key={node.id}
            />
          ))}
        </div>

        <div className="architecture-constellation__hub" aria-hidden="true">
          <span className="architecture-constellation__hub-mark">◎</span>
          <span>Portfolio<br />system</span>
        </div>

        <div className="architecture-constellation__nodes" role="list" aria-label="Architecture layers">
          {nodes.map((node) => {
            const isRelated = activeIndex !== null && node.sourceIndices.includes(activeIndex);
            const sourceIndex = activeIndex !== null && node.sourceIndices.includes(activeIndex) ? activeIndex : node.sourceIndices[0];
            const nodeDescriptionId = `${titleId}-${node.id}-description`;

            return (
              <article className="architecture-constellation__node" data-node={node.id} data-related={isRelated ? 'true' : 'false'} role="listitem" key={node.id}>
                <button
                  type="button"
                  className="architecture-constellation__node-button"
                  aria-pressed={isRelated}
                  aria-describedby={nodeDescriptionId}
                  disabled={sourceIndex === undefined}
                  onClick={() => { if (sourceIndex === undefined) return; onSelect(sourceIndex); }}
                >
                  <span className="architecture-constellation__node-label">{node.label}</span>
                  <span className="architecture-constellation__node-count">{node.items.length} {node.items.length === 1 ? 'skill' : 'skills'}</span>
                </button>
                <p id={nodeDescriptionId} className="architecture-constellation__node-description">{node.description}</p>
                <ul className="architecture-constellation__items" aria-label={`${node.label} skills`}>
                  {node.items.map((item) => <li key={item}>{item}</li>)}
                </ul>
              </article>
            );
          })}
        </div>
      </div>

      <aside className="architecture-constellation__detail" id={detailId} aria-live="polite">
        <div>
          <p className="architecture-constellation__eyebrow">SELECTED CONTEXT</p>
          <p className="architecture-constellation__detail-title">{selected?.name || 'No layer selected'}</p>
        </div>
        <p>{selectedDescription}</p>
      </aside>
    </section>
  );
}

export default ArchitectureConstellation;
