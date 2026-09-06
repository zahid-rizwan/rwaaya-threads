'use client';

import React from 'react';
import styles from '@/app/page.module.css';

interface ProductSkeletonGridProps {
  count?: number;
}

export default function ProductSkeletonGrid({ count = 4 }: ProductSkeletonGridProps) {
  return (
    <div className={styles.productsGrid}>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className={styles.skeletonCard}>
          <div className={styles.skeletonImageWrapper}>
            <div className={styles.skeletonShimmer} />
          </div>
          <div className={styles.skeletonInfo}>
            <div className={styles.skeletonCategory} />
            <div className={styles.skeletonTitle} />
            <div className={styles.skeletonPrice} />
          </div>
        </div>
      ))}
    </div>
  );
}
