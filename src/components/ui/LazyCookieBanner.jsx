import { lazy, Suspense } from 'react';

const CookieBanner = lazy(() => import('./CookieBanner'));

export default function LazyCookieBanner() {
  return <Suspense fallback={null}><CookieBanner /></Suspense>;
}
