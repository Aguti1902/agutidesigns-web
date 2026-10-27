import { lazy, Suspense, useEffect, useState } from 'react';

const AIChatbot = lazy(() => import('./AIChatbot'));

/** Carga el chat cuando el navegador está libre para no frenar la primera carga. */
export default function LazyChatbot(props) {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const go = () => setReady(true);
    const id = 'requestIdleCallback' in window ? window.requestIdleCallback(go, { timeout: 2500 }) : setTimeout(go, 1500);
    return () => ('cancelIdleCallback' in window ? window.cancelIdleCallback(id) : clearTimeout(id));
  }, []);
  return ready ? <Suspense fallback={null}><AIChatbot {...props} /></Suspense> : null;
}
