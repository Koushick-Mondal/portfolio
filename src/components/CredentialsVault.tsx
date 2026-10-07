import { useEffect, useId, useRef, useState, type KeyboardEvent, type PointerEvent, type TouchEvent } from 'react';
import type { CredentialCategory, CredentialRecord } from '../data/credentials';
import './credentials-vault.css';

type Category = 'all' | 'certification' | 'achievement' | 'ai-data' | 'workshop' | 'developer-program' | 'leadership';
type ImageState = 'loading' | 'loaded' | 'error';

const categories: Array<{ id: Category; label: string }> = [
  { id: 'all', label: 'All' },
  { id: 'certification', label: 'Certifications' },
  { id: 'achievement', label: 'Achievements' },
  { id: 'ai-data', label: 'AI & Data' },
  { id: 'workshop', label: 'Workshops' },
  { id: 'developer-program', label: 'Developer Programs' },
  { id: 'leadership', label: 'Leadership' },
];

const categoryLabels: Record<Exclude<Category, 'all'>, string> = {
  certification: 'Certification',
  achievement: 'Achievement',
  'ai-data': 'AI & Data',
  workshop: 'Workshop',
  'developer-program': 'Developer Program',
  leadership: 'Leadership',
};

function normalizeCategory(category?: CredentialCategory): Exclude<Category, 'all'> {
  if (category === 'hackathon') return 'achievement';
  return category || 'achievement';
}

function initials(value: string) {
  const words = value.trim().split(/\s+/).filter(Boolean);
  return (words.slice(0, 2).map((word) => word[0]).join('') || 'CV').toUpperCase();
}

function recordKey(record: CredentialRecord, index: number) {
  return `${record.id || record.title || 'credential'}-${index}`;
}

function AbstractVisual({ record, index }: { record: CredentialRecord; index: number }) {
  const label = record.title || record.issuer || 'Credential';
  return (
    <div
      className={`credentials-vault__abstract credentials-vault__abstract--${index % 5}`}
      role="img"
      aria-label={`Abstract visual for ${label}`}
    >
      <span>{initials(label)}</span>
      <i aria-hidden="true" />
      <b aria-hidden="true" />
      <em aria-hidden="true" />
    </div>
  );
}

function CredentialCard({
  record,
  index,
  onImageOpen,
  imageState,
  onImageLoad,
  onImageError,
}: {
  record: CredentialRecord;
  index: number;
  onImageOpen: (index: number, trigger: HTMLButtonElement) => void;
  imageState: ImageState;
  onImageLoad: (index: number) => void;
  onImageError: (index: number) => void;
}) {
  const cardRef = useRef<HTMLElement>(null);
  const category = normalizeCategory(record.category);
  const label = categoryLabels[category];
  const hasImage = Boolean(record.image);
  const imageFallback = !hasImage || imageState === 'error';

  const onPointerMove = (event: PointerEvent<HTMLElement>) => {
    if (event.pointerType === 'touch' || window.matchMedia('(pointer: coarse)').matches || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const card = cardRef.current;
    if (!card) return;
    const bounds = card.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width;
    const y = (event.clientY - bounds.top) / bounds.height;
    card.style.setProperty('--credentials-vault__rotate-x', `${Math.max(-2, Math.min(2, (0.5 - y) * 4))}deg`);
    card.style.setProperty('--credentials-vault__rotate-y', `${Math.max(-2, Math.min(2, (x - 0.5) * 4))}deg`);
    card.style.setProperty('--credentials-vault__light-x', `${Math.round(x * 100)}%`);
    card.style.setProperty('--credentials-vault__light-y', `${Math.round(y * 100)}%`);
  };

  const resetPointer = () => {
    const card = cardRef.current;
    if (!card) return;
    card.style.setProperty('--credentials-vault__rotate-x', '0deg');
    card.style.setProperty('--credentials-vault__rotate-y', '0deg');
    card.style.setProperty('--credentials-vault__light-x', '50%');
    card.style.setProperty('--credentials-vault__light-y', '50%');
  };

  return (
    <article
      ref={cardRef}
      className={`credentials-vault__card credentials-vault__card--${category}`}
      data-category={category}
      onPointerMove={onPointerMove}
      onPointerLeave={resetPointer}
      onPointerCancel={resetPointer}
    >
      <div className="credentials-vault__card-visual">
        {imageFallback ? (
          <AbstractVisual record={record} index={index} />
        ) : (
          <button
            type="button"
            className="credentials-vault__image-button"
            onClick={(event) => onImageOpen(index, event.currentTarget)}
            disabled={imageState !== 'loaded'}
            aria-label={`Preview image for ${record.title || record.issuer || 'credential'}`}
            aria-haspopup="dialog"
          >
            <img
              src={record.image}
              alt={record.title || record.issuer || 'Credential artwork'}
              loading="lazy"
              onLoad={() => onImageLoad(index)}
              onError={() => onImageError(index)}
            />
            <span className="credentials-vault__image-hint" aria-hidden="true">Preview ↗</span>
          </button>
        )}
        <span className="credentials-vault__card-index" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
      </div>
      <div className="credentials-vault__card-body">
        <div className="credentials-vault__card-meta">
          <span className="credentials-vault__category">{label}</span>
          {record.date || record.year ? <span className="credentials-vault__year">{record.date || record.year}</span> : null}
        </div>
        {record.issuer ? <p className="credentials-vault__issuer">{record.issuer}</p> : null}
        {record.title ? <h3>{record.title}</h3> : null}
        {record.type ? <p className="credentials-vault__type">{record.type}</p> : null}
        {record.achievement ? (
          <div className="credentials-vault__achievement">
            <span className="credentials-vault__verified"><i aria-hidden="true">↳</i> Recorded result</span>
            <strong>{record.achievement}</strong>
          </div>
        ) : null}
        {record.description ? <p className="credentials-vault__description">{record.description}</p> : null}
        {record.tags?.length ? (
          <ul className="credentials-vault__tags" aria-label="Credential tags">
            {record.tags.map((tag) => <li key={tag}>{tag}</li>)}
          </ul>
        ) : null}
        {record.credentialId ? <p className="credentials-vault__credential-id"><span>Credential ID</span>{record.credentialId}</p> : null}
        {record.credentialUrl ? (
          <a className="credentials-vault__link" href={record.credentialUrl} target="_blank" rel="noreferrer">
            View Credential <span aria-hidden="true">↗</span>
          </a>
        ) : null}
        {record.verificationUrl ? (
          <a className="credentials-vault__verify" href={record.verificationUrl} target="_blank" rel="noreferrer">
            Verify credential <span aria-hidden="true">↗</span>
          </a>
        ) : null}
      </div>
    </article>
  );
}

function FeaturedCard({ record, index }: { record: CredentialRecord; index: number }) {
  const category = normalizeCategory(record.category);
  return (
    <article className={`credentials-vault__featured-card credentials-vault__featured-card--${category}`}>
      <div className="credentials-vault__featured-mark" aria-hidden="true">{String(index + 1).padStart(2, '0')}</div>
      <div>
        <span className="credentials-vault__featured-category">{categoryLabels[category]}</span>
        {record.title ? <h3>{record.title}</h3> : null}
        {record.issuer ? <p>{record.issuer}</p> : null}
      </div>
      {record.achievement ? <strong>{record.achievement}</strong> : <span className="credentials-vault__featured-arrow" aria-hidden="true">↗</span>}
    </article>
  );
}

export default function CredentialsVault({ credentials }: { credentials: CredentialRecord[] }) {
  const headingId = useId();
  const searchId = useId();
  const tabPanelId = useId();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const touchStartX = useRef<number | null>(null);
  const [activeCategory, setActiveCategory] = useState<Category>('all');
  const [search, setSearch] = useState('');
  const [imageStates, setImageStates] = useState<Record<number, ImageState>>({});
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [lightboxZoom, setLightboxZoom] = useState(1);

  const featured = credentials.filter((record) => record.featured);
  const metrics = credentials.filter((record) => record.metric && record.metricLabel);
  const normalizedSearch = search.trim().toLowerCase();
  const searchableEntries = credentials.map((record, index) => ({ record, index })).filter(({ record }) => {
    const searchable = [record.title, record.issuer, record.type, record.achievement, ...(record.tags || [])]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();
    return !normalizedSearch || searchable.includes(normalizedSearch);
  });
  const filteredEntries = searchableEntries.filter(({ record }) => activeCategory === 'all' || normalizeCategory(record.category) === activeCategory);
  const filteredCredentials = filteredEntries.map(({ record }) => record);
  const imageIndices = filteredEntries
    .filter(({ record, index }) => Boolean(record.image) && imageStates[index] !== 'error')
    .map(({ index }) => index);
  const counts = categories.reduce<Record<Category, number>>((result, category) => {
    result[category.id] = category.id === 'all'
      ? searchableEntries.length
      : searchableEntries.filter(({ record }) => normalizeCategory(record.category) === category.id).length;
    return result;
  }, {} as Record<Category, number>);

  const selected = lightboxIndex === null ? null : credentials[lightboxIndex];
  const lightboxPosition = lightboxIndex === null ? -1 : imageIndices.indexOf(lightboxIndex);

  const closeLightbox = () => {
    const trigger = triggerRef.current;
    const dialog = dialogRef.current;
    if (dialog?.open) dialog.close();
    setLightboxIndex(null);
    setLightboxZoom(1);
    triggerRef.current = null;
    window.requestAnimationFrame(() => {
      if (trigger?.isConnected) trigger.focus({ preventScroll: true });
    });
  };

  const openImage = (index: number, trigger: HTMLButtonElement) => {
    triggerRef.current = trigger;
    setLightboxIndex(index);
    setLightboxZoom(1);
  };

  const moveLightbox = (direction: -1 | 1) => {
    if (lightboxPosition < 0) return;
    const nextPosition = lightboxPosition + direction;
    if (nextPosition < 0 || nextPosition >= imageIndices.length) return;
    setLightboxIndex(imageIndices[nextPosition]);
    setLightboxZoom(1);
  };

  const onLightboxTouchStart = (event: TouchEvent<HTMLDivElement>) => {
    touchStartX.current = event.changedTouches[0]?.clientX ?? null;
  };

  const onLightboxTouchEnd = (event: TouchEvent<HTMLDivElement>) => {
    const start = touchStartX.current;
    touchStartX.current = null;
    const end = event.changedTouches[0]?.clientX;
    if (start === null || end === undefined || Math.abs(end - start) < 48) return;
    moveLightbox(end < start ? 1 : -1);
  };

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog || lightboxIndex === null || !selected?.image) return;
    if (!dialog.open) {
      try {
        if (typeof dialog.showModal === 'function') dialog.showModal();
        else dialog.setAttribute('open', '');
      } catch {
        dialog.setAttribute('open', '');
      }
    }
    window.requestAnimationFrame(() => closeButtonRef.current?.focus({ preventScroll: true }));
  }, [lightboxIndex, selected?.image]);

  useEffect(() => () => {
    if (dialogRef.current?.open) dialogRef.current.close();
  }, []);

  const onTabKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    if (!['ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? categories.length - 1 : (index + (event.key === 'ArrowRight' ? 1 : -1) + categories.length) % categories.length;
    setActiveCategory(categories[next].id);
    tabRefs.current[next]?.focus();
  };

  return (
    <section className="credentials-vault" aria-labelledby={headingId}>
      <div className="credentials-vault__atmosphere" aria-hidden="true"><i /><i /><i /><b /><b /></div>
      <header className="credentials-vault__header">
        <div className="credentials-vault__section-label"><span>06 / CREDENTIALS</span><span>PROOF OF PRACTICE · RECRUITER VIEW</span></div>
        <div className="credentials-vault__heading-row">
          <div>
            <h2 id={headingId}>Evidence, <em>curated.</em></h2>
            <p className="credentials-vault__intro">A searchable record of certifications, competitive builds, and learning milestones — selected for signal, context, and the work behind the line item.</p>
          </div>
          <p className="credentials-vault__count-note"><strong>{credentials.length}</strong><span>records indexed</span></p>
        </div>
      </header>

      {metrics.length ? (
        <div className="credentials-vault__metrics" aria-label="Credential highlights">
          {metrics.map((record, index) => (
            <article className="credentials-vault__metric" key={recordKey(record, index)}>
              <span>{record.metricLabel}</span>
              <strong>{record.metric}</strong>
              {record.title ? <p>{record.title}</p> : null}
            </article>
          ))}
        </div>
      ) : null}

      {featured.length ? (
        <section className="credentials-vault__featured" aria-labelledby={`${headingId}-featured`}>
          <div className="credentials-vault__subheading">
            <div><span className="credentials-vault__eyebrow">SHORTLISTED SIGNAL</span><h3 id={`${headingId}-featured`}>Featured credentials</h3></div>
            <span aria-hidden="true">Scroll to explore →</span>
          </div>
          <div className="credentials-vault__featured-rail">
            {featured.map((record, index) => <FeaturedCard key={recordKey(record, index)} record={record} index={index} />)}
          </div>
        </section>
      ) : null}

      <div className="credentials-vault__toolbar">
        <div className="credentials-vault__tabs" role="tablist" aria-label="Filter credentials by category">
          {categories.map((category, index) => {
            const selectedTab = activeCategory === category.id;
            return (
              <button
                key={category.id}
                ref={(element) => { tabRefs.current[index] = element; }}
                id={`${headingId}-tab-${category.id}`}
                className={selectedTab ? 'is-active' : ''}
                type="button"
                role="tab"
                aria-selected={selectedTab}
                aria-controls={tabPanelId}
                tabIndex={selectedTab ? 0 : -1}
                onClick={() => setActiveCategory(category.id)}
                onKeyDown={(event) => onTabKeyDown(event, index)}
              >
                <span>{category.label}</span>
                <small aria-label={`${counts[category.id]} credentials`}>{counts[category.id]}</small>
              </button>
            );
          })}
        </div>
        <label className="credentials-vault__search" htmlFor={searchId}>
          <span aria-hidden="true">⌕</span>
          <input id={searchId} type="search" placeholder="Search credentials..." value={search} onChange={(event) => setSearch(event.target.value)} />
        </label>
      </div>

      <div className="credentials-vault__results-line">
        <p id={`${tabPanelId}-status`} aria-live="polite">Showing <strong>{filteredCredentials.length}</strong> of {credentials.length} credentials</p>
        {search || activeCategory !== 'all' ? <button type="button" onClick={() => { setSearch(''); setActiveCategory('all'); }}>Clear filters <span aria-hidden="true">×</span></button> : null}
      </div>

      <div id={tabPanelId} className="credentials-vault__grid" role="tabpanel" aria-labelledby={`${headingId}-tab-${activeCategory}`} tabIndex={0} aria-describedby={`${tabPanelId}-status`}>
        {filteredCredentials.length ? filteredEntries.map(({ record, index: originalIndex }) => {
          return (
            <CredentialCard
              key={recordKey(record, originalIndex)}
              record={record}
              index={originalIndex}
              onImageOpen={openImage}
              imageState={imageStates[originalIndex] || 'loading'}
              onImageLoad={(cardIndex) => setImageStates((current) => ({ ...current, [cardIndex]: 'loaded' }))}
              onImageError={(cardIndex) => setImageStates((current) => ({ ...current, [cardIndex]: 'error' }))}
            />
          );
        }) : (
          <div className="credentials-vault__empty"><span aria-hidden="true">/</span><h3>No matching credentials</h3><p>Try a broader search or clear the current filters.</p></div>
        )}
      </div>

      <dialog
        ref={dialogRef}
        className="credentials-vault__dialog"
        aria-modal="true"
        aria-label={selected?.title ? `${selected.title} image preview` : 'Credential image preview'}
        onCancel={(event) => { event.preventDefault(); closeLightbox(); }}
        onClose={() => { setLightboxIndex(null); }}
        onKeyDown={(event) => {
          if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
            event.preventDefault();
            moveLightbox(event.key === 'ArrowLeft' ? -1 : 1);
          } else if (event.key === '+' || event.key === '=') {
            event.preventDefault();
            setLightboxZoom((value) => Math.min(2.5, Number((value + .25).toFixed(2))));
          } else if (event.key === '-') {
            event.preventDefault();
            setLightboxZoom((value) => Math.max(1, Number((value - .25).toFixed(2))));
          } else if (event.key === 'Escape') {
            event.preventDefault();
            closeLightbox();
          }
        }}
      >
        <div className="credentials-vault__dialog-toolbar">
          <span aria-hidden="true">CREDENTIAL IMAGE / FULLSCREEN PREVIEW</span>
          <div className="credentials-vault__dialog-zoom" aria-label="Image zoom controls">
            <button type="button" onClick={() => setLightboxZoom((value) => Math.max(1, Number((value - .25).toFixed(2))))} disabled={lightboxZoom <= 1} aria-label="Zoom out">−</button>
            <span aria-live="polite">{Math.round(lightboxZoom * 100)}%</span>
            <button type="button" onClick={() => setLightboxZoom((value) => Math.min(2.5, Number((value + .25).toFixed(2))))} disabled={lightboxZoom >= 2.5} aria-label="Zoom in">+</button>
            <button type="button" onClick={() => setLightboxZoom(1)} disabled={lightboxZoom === 1} aria-label="Reset zoom">RESET</button>
          </div>
          <button ref={closeButtonRef} type="button" className="credentials-vault__dialog-close" onClick={closeLightbox} aria-label="Close image preview">×</button>
        </div>
        <div className="credentials-vault__dialog-media" onTouchStart={onLightboxTouchStart} onTouchEnd={onLightboxTouchEnd}>
          {selected?.image ? <img src={selected.image} alt={selected.title || selected.issuer || 'Credential artwork'} style={{ transform: `scale(${lightboxZoom})` }} onError={() => { if (lightboxIndex !== null) setImageStates((current) => ({ ...current, [lightboxIndex]: 'error' })); closeLightbox(); }} /> : null}
        </div>
        <button type="button" className="credentials-vault__dialog-nav credentials-vault__dialog-nav--previous" onClick={() => moveLightbox(-1)} disabled={lightboxPosition <= 0} aria-label="Previous credential image">←</button>
        <button type="button" className="credentials-vault__dialog-nav credentials-vault__dialog-nav--next" onClick={() => moveLightbox(1)} disabled={lightboxPosition < 0 || lightboxPosition >= imageIndices.length - 1} aria-label="Next credential image">→</button>
        <div className="credentials-vault__dialog-footer">
          {selected?.title ? <p>{selected.title}</p> : null}
          <span aria-live="polite">{lightboxPosition >= 0 ? `${lightboxPosition + 1} / ${imageIndices.length}` : ''}</span>
        </div>
      </dialog>
    </section>
  );
}
