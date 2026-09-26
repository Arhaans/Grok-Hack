import { useEffect } from 'react';

/**
 * Wires up IntersectionObserver to add `.visible` to any element
 * that has one of the reveal classes: reveal, reveal-left, reveal-right, reveal-scale
 */
export const useScrollReveal = () => {
  useEffect(() => {
    const selector = '.reveal, .reveal-left, .reveal-right, .reveal-scale';
    const elements = document.querySelectorAll(selector);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -48px 0px' }
    );

    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  });
};
