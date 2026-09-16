'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function MyOrdersPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/profile');
  }, [router]);

  return (
    <div className="min-h-screen bg-[#f7efe3] flex items-center justify-center">
      <p className="text-xs font-bold text-stone-500 uppercase tracking-widest animate-pulse">Loading Order History...</p>
    </div>
  );
}
