// components/PosterImage.tsx
'use client';

import { useState } from 'react';
import Image from 'next/image';

interface PosterImageBaseProps {
  src?: string | null;
  alt: string;
  /** Text shown inside the placeholder when there's no usable poster. */
  fallbackLabel?: string;
  className?: string;
  priority?: boolean;
}

interface FillProps extends PosterImageBaseProps {
  fill: true;
  sizes?: string;
  width?: never;
  height?: never;
}

interface FixedProps extends PosterImageBaseProps {
  fill?: false;
  sizes?: never;
  width: number;
  height: number;
}

type PosterImageProps = FillProps | FixedProps;

function FilmIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      className="w-7 h-7 sm:w-8 sm:h-8 text-zinc-500"
      aria-hidden="true"
    >
      <rect x="3" y="4" width="18" height="16" rx="1.5" />
      <path d="M7 4v16M17 4v16M3 9h4M3 15h4M17 9h4M17 15h4" />
    </svg>
  );
}

// OMDb doesn't have a poster for every title (returns "N/A"), and some
// poster URLs 404 or live on a host we haven't allow-listed in
// next.config.ts. Either way, this renders a tidy placeholder instead of a
// broken image icon.
export default function PosterImage({
  src,
  alt,
  fallbackLabel,
  className = '',
  priority,
  ...rest
}: PosterImageProps) {
  const [errored, setErrored] = useState(false);
  const isUsable = !!src && src !== 'N/A' && !errored;

  if (!isUsable) {
    const fillClass = rest.fill ? 'absolute inset-0' : 'w-full h-full';
    return (
      <div
        className={`${fillClass} flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-zinc-800 to-zinc-900 p-3 text-center ${className}`}
      >
        <FilmIcon />
        <span className="text-zinc-400 text-[11px] sm:text-xs leading-snug line-clamp-3">
          {fallbackLabel ?? alt}
        </span>
      </div>
    );
  }

  if (rest.fill) {
    return (
      <Image
        src={src as string}
        alt={alt}
        fill
        sizes={rest.sizes}
        priority={priority}
        className={className}
        onError={() => setErrored(true)}
      />
    );
  }

  return (
    <Image
      src={src as string}
      alt={alt}
      width={rest.width}
      height={rest.height}
      priority={priority}
      className={className}
      onError={() => setErrored(true)}
    />
  );
}
