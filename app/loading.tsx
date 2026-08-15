// app/loading.tsx
export default function Loading() {
  return (
    <div className="min-h-screen bg-netflix-dark flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-gray-700 border-t-netflix-red rounded-full animate-spin" />
    </div>
  );
}
