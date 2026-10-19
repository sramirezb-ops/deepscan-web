'use client';

import { useEffect } from 'react';
import { initSite } from '@/lib/site';

declare global {
  interface Window { __dsInit?: boolean }
}

export default function SiteScripts() {
  useEffect(() => {
    if (window.__dsInit) return;
    window.__dsInit = true;
    import('lenis').then(({ default: Lenis }) => initSite(Lenis));
  }, []);
  return null;
}
