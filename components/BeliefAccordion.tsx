
import React, { useState } from 'react';

interface BeliefAccordionProps {
  title: string;
  children: React.ReactNode;
}

const BeliefAccordion: React.FC<BeliefAccordionProps> = ({ title, children }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-gray-200 last:border-b-0">
      <h3>
        <button
          type="button"
          className="flex justify-between items-center w-full py-5 font-header font-extrabold text-xl text-left text-brand-text hover:bg-gray-50 rounded-md"
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
          aria-controls={`accordion-content-${title.replace(/\s+/g, '-')}`}
        >
          <span className="px-2">{title}</span>
          <svg
            className={`w-6 h-6 transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
          </svg>
        </button>
      </h3>
      <div
        id={`accordion-content-${title.replace(/\s+/g, '-')}`}
        role="region"
        className={`overflow-hidden transition-all duration-500 ease-in-out ${isOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}
      >
        <div className="pt-2 pb-5 px-4 text-gray-700 font-body space-y-4 leading-relaxed">
          {children}
        </div>
      </div>
    </div>
  );
};

export default BeliefAccordion;
