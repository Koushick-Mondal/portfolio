import ProjectVisual from './ProjectVisual';

export interface ExperienceCardProps {
  organization: string;
  role: string;
  date: string;
  location?: string;
  text: string;
  details?: string[];
  tags?: string[];
  image?: string | null;
  className?: string;
}

function getInitials(value: string) {
  const words = value.trim().split(/\s+/).filter(Boolean);
  return (words.slice(0, 2).map((word) => word[0]).join('') || '•').toUpperCase();
}

export function ExperienceCard({
  organization,
  role,
  date,
  location,
  text,
  details = [],
  tags = [],
  image,
  className = '',
}: ExperienceCardProps) {
  return (
    <article className={`experience-card ${className}`.trim()}>
      <ProjectVisual className="experience-card__visual" src={image} alt={`${organization} mark`}>
        <span className="experience-card__initials" aria-label={`${organization} abstract mark`} role="img">{getInitials(organization)}</span>
      </ProjectVisual>
      <div className="experience-card__content">
        <header className="experience-card__header">
          <div>
            <p className="experience-card__organization">{organization}</p>
            <h3 className="experience-card__role">{role}</h3>
          </div>
          <time className="experience-card__date">{date}</time>
        </header>
        {location ? <p className="experience-card__location">{location}</p> : null}
        <p className="experience-card__summary">{text}</p>
        {details.length ? (
          <ul className="experience-card__details">
            {details.map((detail) => <li key={detail}>{detail}</li>)}
          </ul>
        ) : null}
        {tags.length ? (
          <ul className="experience-card__tags" aria-label="Skills and focus areas">
            {tags.map((tag) => <li key={tag}>{tag}</li>)}
          </ul>
        ) : null}
      </div>
    </article>
  );
}

export default ExperienceCard;
