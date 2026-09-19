'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { pushTelemetry } from '@/utils/telemetry';

export default function GlobalActivityTracker() {
  const pathname = usePathname();

  // Track Route / Navigation changes
  useEffect(() => {
    if (pathname) {
      pushTelemetry('NAV', `Route accessed: ${pathname}`);
    }
  }, [pathname]);

  // Track Global Clicks on Interactive Elements
  useEffect(() => {
    function handleGlobalClick(e: MouseEvent) {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      // Find closest interactive parent (button, link, or custom clickable card)
      const interactiveEl = target.closest('button, a, [role="button"], input[type="submit"]');

      if (interactiveEl) {
        const label = 
          interactiveEl.getAttribute('aria-label') ?? 
          interactiveEl.textContent?.trim().slice(0, 30) ?? 
          interactiveEl.id ?? 
          interactiveEl.tagName.toLowerCase();

        pushTelemetry('CLICK', `Clicked [${interactiveEl.tagName}] -> "${label}"`);
      }
    }

    window.addEventListener('click', handleGlobalClick, { capture: true });
    return () => {
      window.removeEventListener('click', handleGlobalClick, { capture: true });
    };
  }, []);

  return null; // Invisible tracker component
}