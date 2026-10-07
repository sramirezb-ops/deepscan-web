'use client';

import { useEffect } from 'react';
import { initSite } from '@/lib/site';
import { initJourney } from '@/lib/journey';

declare global {
  interface Window { __dsInit?: boolean }
}

export default function SiteScripts() {
  useEffect(() => {
    if (window.__dsInit) return;
    window.__dsInit = true;
    import('lenis').then(({ default: Lenis }) => initSite(Lenis));
    import('three').then((THREE) => initJourney(THREE));
  }, []);
  return null;
}
