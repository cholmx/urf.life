
import React from 'react';
import type { Sermon } from '../types';

interface SermonCardProps {
  sermon: Sermon;
  onSelect: () => void;
  isFeatured?: boolean;
}

const SermonCard: React.FC<SermonCardProps> = ({ sermon, onSelect, isFeatured = false }) => {
    if (isFeatured) {
        return (
             <div className="bg-white rounded-lg shadow-xl overflow-hidden md:flex">
                <div className="md:w-1/2">
                    <img className="h-64 w-full object-cover md:h-full" src={sermon.imageUrl} alt={sermon.title} />
                </div>
                <div className="p-8 md:w-1/2 flex flex-col justify-center">
                    <p className="font-header uppercase tracking-widest text-sm text-brand-primary font-extrabold">{sermon.series}</p>
                    <h3 className="mt-2 font-header font-extrabold text-3xl tracking-tight text-brand-text">{sermon.title}</h3>
                    <p className="mt-2 text-gray-500 font-accent italic text-xl">{sermon.speaker}</p>
                    <p className="mt-1 text-sm text-gray-400">{new Date(sermon.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    <p className="mt-4 text-gray-600 font-body leading-relaxed flex-grow">{sermon.description.substring(0, 120)}...</p>
                    <div className="mt-6">
                         <button onClick={onSelect} className="w-full bg-brand-text text-white font-header font-extrabold uppercase tracking-widest py-3 px-4 rounded-full transition-transform transform hover:scale-105 duration-300 text-sm">
                            View Details & Study Tools
                         </button>
                    </div>
                </div>
            </div>
        );
    }
    
  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden transform hover:-translate-y-2 transition-transform duration-300 flex flex-col">
      <img className="h-48 w-full object-cover" src={sermon.imageUrl} alt={sermon.title} />
      <div className="p-6 flex flex-col flex-grow">
        <p className="font-header uppercase tracking-widest text-xs text-brand-primary font-extrabold">{sermon.series}</p>
        <h3 className="mt-1 font-header font-extrabold text-xl tracking-normal text-brand-text">{sermon.title}</h3>
        <p className="mt-1 text-gray-500 font-accent italic">{sermon.speaker}</p>
        <p className="text-xs text-gray-400 mt-1">{new Date(sermon.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
        <div className="mt-auto pt-4 border-t border-gray-200">
            <button onClick={onSelect} className="w-full bg-gray-200 text-gray-800 font-header font-extrabold uppercase tracking-widest py-2 px-2 rounded-full transition-colors hover:bg-gray-300 text-xs">
                View Details
            </button>
        </div>
      </div>
    </div>
  );
};

export default SermonCard;
