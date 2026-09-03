
import React, { useState, useEffect, useRef } from 'react';

interface FadeInOnScrollProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

const useIntersectionObserver = (
  elementRef: React.RefObject<Element>,
  { threshold = 0.1, root = null, rootMargin = '0%', freezeOnceVisible = true }
) => {
  const [entry, setEntry] = useState<IntersectionObserverEntry>();
  const frozen = entry?.isIntersecting && freezeOnceVisible;

  useEffect(() => {
    const node = elementRef?.current;
    if (!node || frozen) return;

    const observer = new IntersectionObserver(
      ([entry]) => setEntry(entry),
      { threshold, root, rootMargin }
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, [elementRef, threshold, root, rootMargin, frozen, freezeOnceVisible]);

  return entry;
};


const FadeInOnScroll: React.FC<FadeInOnScrollProps> = ({ children, className, style }) => {
  const ref = useRef<HTMLDivElement>(null);
  const entry = useIntersectionObserver(ref, { freezeOnceVisible: true, threshold: 0.1 });
  
  const isVisible = !!entry?.isIntersecting;

  return (
    <div
      ref={ref}
      className={`fade-in-section ${isVisible ? 'is-visible' : ''} ${className || ''}`}
      style={style}
    >
      {children}
    </div>
  );
};

export default FadeInOnScroll;
