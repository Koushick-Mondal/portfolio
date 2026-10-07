import { useState, type CSSProperties } from 'react';
import ImageReveal from './ImageReveal';
import ParallaxImage from './ParallaxImage';

export type PersonalPhotoVariant = 'portrait' | 'square' | 'circle' | 'rounded' | (string & {});

export interface PersonalPhotoProps {
  src?: string | null;
  alt: string;
  variant?: PersonalPhotoVariant;
  aspectRatio?: string | number;
  objectPosition?: string;
  hover?: boolean;
  parallax?: boolean;
  reveal?: boolean;
  glow?: boolean;
  grain?: boolean;
  border?: boolean;
  depth?: boolean;
  loading?: 'eager' | 'lazy';
  width?: number | string;
  height?: number | string;
  className?: string;
}

function initials(value: string) {
  const words = value.trim().split(/\s+/).filter(Boolean);
  return (words.slice(0, 2).map((word) => word[0]).join('') || '•').toUpperCase();
}

export function PersonalPhoto({
  src,
  alt,
  variant = 'portrait',
  aspectRatio = '4 / 5',
  objectPosition = 'center',
  hover = true,
  parallax = false,
  reveal = false,
  glow = false,
  grain = false,
  border = false,
  depth = false,
  loading = 'lazy',
  width,
  height,
  className = '',
}: PersonalPhotoProps) {
  const [failed, setFailed] = useState(false);
  const frameStyle = {
    aspectRatio,
    width,
    height,
  } as CSSProperties;
  const media = src && !failed ? (
    <img src={src} alt={alt} loading={loading} decoding="async" width={typeof width === 'number' ? width : undefined} height={typeof height === 'number' ? height : undefined} style={{ objectPosition }} onError={() => setFailed(true)} />
  ) : (
    <span className="personal-photo__fallback" role={alt ? 'img' : undefined} aria-label={alt || undefined} aria-hidden={alt ? undefined : true}>
      {initials(alt)}
    </span>
  );
  const visual = parallax ? <ParallaxImage className="personal-photo__parallax" maxOffset={10}>{media}</ParallaxImage> : media;
  const frame = (
    <div
      className={`personal-photo personal-photo--${variant} ${hover ? 'personal-photo--hover' : ''} ${glow ? 'personal-photo--glow' : ''} ${grain ? 'personal-photo--grain' : ''} ${border ? 'personal-photo--border' : ''} ${depth ? 'personal-photo--depth' : ''} ${failed ? 'personal-photo--fallback' : ''} ${className}`.trim()}
      data-image-state={failed || !src ? 'fallback' : 'loaded'}
      data-photo-variant={variant}
      style={frameStyle}
    >
      {visual}
    </div>
  );

  return reveal ? <ImageReveal className="personal-photo__reveal">{frame}</ImageReveal> : frame;
}

export default PersonalPhoto;
