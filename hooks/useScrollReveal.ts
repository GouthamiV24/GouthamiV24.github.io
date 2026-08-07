import { useInView } from 'framer-motion';
import { useRef } from 'react';

export function useScrollReveal(options?: { threshold?: number; once?: boolean }) {
  const ref = useRef(null);
  const isInView = useInView(ref, {
    amount: options?.threshold ?? 0.3,
    once: options?.once ?? true,
  });
  return { ref, isInView };
}
