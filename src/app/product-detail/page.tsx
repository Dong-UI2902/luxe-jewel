'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ProductDetailRedirect() {
  const router = useRouter();
  useEffect(() => {
    router?.replace('/product-listing');
  }, [router]);
  return null;
}