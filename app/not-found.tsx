// app/not-found.tsx
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-netflix-dark flex flex-col items-center justify-center px-4 text-center">
      <h1 className="text-5xl sm:text-7xl font-bold text-netflix-red mb-4">404</h1>
      <p className="text-white text-lg sm:text-xl mb-2">Lost your way?</p>
      <p className="text-gray-400 mb-8 max-w-sm">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Link href="/" className="netflix-button">
        Back to home
      </Link>
    </div>
  );
}
