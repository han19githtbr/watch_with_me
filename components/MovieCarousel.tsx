// components/MovieCarousel.tsx
'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import MovieCard from './MovieCard';
import type { Movie } from '@/lib/types';

interface MovieCarouselProps {
  title: string;
  movies: Movie[];
}

export default function MovieCarousel({ title, movies }: MovieCarouselProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateArrows = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    updateArrows();
    const el = scrollerRef.current;
    if (!el) return;
    el.addEventListener('scroll', updateArrows, { passive: true });
    window.addEventListener('resize', updateArrows);
    return () => {
      el.removeEventListener('scroll', updateArrows);
      window.removeEventListener('resize', updateArrows);
    };
  }, [updateArrows, movies]);

  const scrollBy = (direction: 1 | -1) => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({ left: direction * el.clientWidth * 0.85, behavior: 'smooth' });
  };

  if (!movies || movies.length === 0) return null;

  return (
    <div className="mb-10">
      <h2 className="text-xl sm:text-2xl font-bold text-white mb-3 px-4 sm:px-6">{title}</h2>
      <div className="relative group/carousel">
        {canScrollLeft && (
          <button
            onClick={() => scrollBy(-1)}
            aria-label="Scroll left"
            className="hidden sm:flex absolute left-0 top-0 bottom-0 z-20 w-12 items-center justify-center bg-gradient-to-r from-netflix-dark/90 to-transparent text-white opacity-0 group-hover/carousel:opacity-100 transition-opacity"
          >
            <span className="text-3xl">‹</span>
          </button>
        )}

        <div
          ref={scrollerRef}
          className="flex gap-3 overflow-x-auto scroll-smooth snap-x snap-mandatory px-4 sm:px-6 pb-2 no-scrollbar"
        >
          {movies.map((movie) => (
            <div
              key={movie.imdbID}
              className="snap-start shrink-0 w-[38vw] xs:w-[30vw] sm:w-[22vw] md:w-[16vw] lg:w-[13vw] xl:w-[160px]"
            >
              <MovieCard movie={movie} />
            </div>
          ))}
        </div>

        {canScrollRight && (
          <button
            onClick={() => scrollBy(1)}
            aria-label="Scroll right"
            className="hidden sm:flex absolute right-0 top-0 bottom-0 z-20 w-12 items-center justify-center bg-gradient-to-l from-netflix-dark/90 to-transparent text-white opacity-0 group-hover/carousel:opacity-100 transition-opacity"
          >
            <span className="text-3xl">›</span>
          </button>
        )}
      </div>
    </div>
  );
}