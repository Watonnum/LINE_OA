import React from 'react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0A110C] text-white flex flex-col items-center justify-center p-4">
      <h2 className="text-2xl font-black text-[#06C755]">404 - Page Not Found</h2>
      <p className="text-sm text-stone-400 mt-2">The page you are looking for does not exist.</p>
    </div>
  );
}
