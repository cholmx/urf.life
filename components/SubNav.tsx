import React, { useState, useEffect, useRef } from 'react';

interface SubNavLink {
  label: string;
  id: string;
}

interface SubNavProps {
  links: SubNavLink[];
}

const SubNav: React.FC<SubNavProps> = ({ links }) => {
  const [activeLink, setActiveLink] = useState<string>(links[0]?.id || '');
  const observer = useRef<IntersectionObserver | null>(null);

  const handleScroll = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      // Height of main header (80px) + subnav (64px) + extra space (6px)
      const headerOffset = 150; 
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  useEffect(() => {
    const handleIntersect = (entries: IntersectionObserverEntry[]) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setActiveLink(entry.target.id);
        }
      });
    };
    
    // rootMargin offsets the intersection check to account for the sticky headers.
    observer.current = new IntersectionObserver(handleIntersect, {
      rootMargin: '-150px 0px -50% 0px',
      threshold: 0
    });

    const elements = links.map(link => document.getElementById(link.id)).filter(el => el);
    elements.forEach(el => observer.current?.observe(el!));

    return () => {
        elements.forEach(el => {
            if (observer.current && el) {
                observer.current.unobserve(el);
            }
        });
    };
  }, [links]);

  return (
    <nav className="sticky top-20 bg-brand-light-gray/90 backdrop-blur-lg z-30 shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-center items-center h-16 space-x-4 md:space-x-8 overflow-x-auto whitespace-nowrap">
          {links.map(link => (
            <button
              key={link.id}
              onClick={() => handleScroll(link.id)}
              className={`font-header font-extrabold text-sm uppercase tracking-wider transition-colors duration-300 pb-1 border-b-2
                ${activeLink === link.id
                  ? 'text-brand-primary border-brand-primary'
                  : 'text-gray-500 border-transparent hover:text-brand-text'
                }`}
            >
              {link.label}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default SubNav;
