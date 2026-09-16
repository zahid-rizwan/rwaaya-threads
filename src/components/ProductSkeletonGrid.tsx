'use client';

import React from 'react';

interface ProductSkeletonGridProps {
  count?: number;
}

export default function ProductSkeletonGrid({ count = 8 }: ProductSkeletonGridProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 w-full max-w-7xl mx-auto my-4">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="bg-[#fcf9f4] rounded-2xl overflow-hidden border border-[#b8963e]/20 p-3 flex flex-col gap-3 animate-pulse">
          <div className="w-full aspect-[4/5] bg-stone-200/80 rounded-xl relative overflow-hidden" />
          <div className="flex flex-col gap-2 pt-1 px-1">
            <div className="h-2.5 w-1/3 bg-stone-200 rounded" />
            <div className="h-4 w-3/4 bg-stone-200 rounded" />
            <div className="h-4 w-1/2 bg-stone-200 rounded mt-1" />
          </div>
        </div>
      ))}
    </div>
  );
}
