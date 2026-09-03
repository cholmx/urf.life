import React,{useState,useEffect} from 'react';
import {extractFirstAmazonImage,getBookFallbackImage,testImageUrls,testImageUrl} from '../utils/amazonImageExtractor';

const BookCard=({resource})=> {
const [imageUrl,setImageUrl]=useState(null);
const [imageLoading,setImageLoading]=useState(true);
const [imageError,setImageError]=useState(false);

useEffect(()=> {
const loadImage=async ()=> {
setImageLoading(true);
setImageError(false);
let finalImageUrl=null;

// Priority 1: Use manually uploaded image if available
if (resource.image_url) {
const isValid=await testImageUrl(resource.image_url);
if (isValid) {
finalImageUrl=resource.image_url;
}
}

// Priority 2: Extract from Amazon link if no manual image or manual image failed
if (!finalImageUrl && resource.amazon_link) {
const amazonImageUrls=extractFirstAmazonImage(resource.amazon_link);
if (amazonImageUrls && Array.isArray(amazonImageUrls)) {
finalImageUrl=await testImageUrls(amazonImageUrls);
}
}

// Priority 3: Use fallback image
if (!finalImageUrl) {
finalImageUrl=getBookFallbackImage();
}

setImageUrl(finalImageUrl);
setImageLoading(false);
};

loadImage();
},[resource.image_url,resource.amazon_link]);

const handleImageError=()=> {
setImageError(true);
setImageUrl(getBookFallbackImage());
};

// Clean the description - remove "Available from multiple sources" text
const getCleanDescription=()=> {
if (!resource.description) return '';

const description = resource.description.trim();

// Remove various forms of the "Available from multiple sources" text
const textToRemove = [
'Available from multiple sources',
'Available from multiple sources.',
'available from multiple sources',
'available from multiple sources.',
'AVAILABLE FROM MULTIPLE SOURCES',
'AVAILABLE FROM MULTIPLE SOURCES.'
];

let cleanDescription = description;
textToRemove.forEach(text => {
cleanDescription = cleanDescription.replace(text, '').trim();
});

// If the description is now empty or just punctuation, return empty string
if (!cleanDescription || cleanDescription.match(/^[.,!?;:\s]*$/)) {
return '';
}

return cleanDescription;
};

// Get the first Amazon link from the amazon_link field
const getAmazonUrl = () => {
if (!resource.amazon_link) return null;

// Split by newlines and find first Amazon link
const links = resource.amazon_link.split('\n').filter(link => link.trim());
const amazonLink = links.find(link => 
link.includes('amazon.com') || 
link.includes('amazon.co.uk') || 
link.includes('amazon.ca') || 
link.includes('amzn.to')
);

return amazonLink ? amazonLink.trim() : null;
};

const cleanDescription = getCleanDescription();
const amazonUrl = getAmazonUrl();

return (
<div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow h-full flex flex-col">
{/* Book Cover Image - Clickable if Amazon link exists */}
<div
className="relative w-full h-48 flex items-center justify-center p-2 cursor-pointer"
style={{backgroundColor: '#fcfbf7'}}
onClick={() => {
if (amazonUrl) {
window.open(amazonUrl, '_blank');
}
}}
>
{imageLoading ? (
<div className="w-full h-full flex items-center justify-center">
<div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
</div>
) : (
<img
src={imageUrl}
alt={resource.title}
className="max-w-full max-h-full object-contain hover:scale-105 transition-transform duration-200"
onError={handleImageError}
style={{
imageRendering: 'crisp-edges',
WebkitImageRendering: 'crisp-edges'
}}
/>
)}
{/* Overlay indicator for clickable image */}
{amazonUrl && (
<div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-10 transition-all duration-200 flex items-center justify-center">
<div className="opacity-0 hover:opacity-100 transition-opacity duration-200 bg-white bg-opacity-90 rounded-full p-2">
<span className="text-xs text-primary font-semibold">View on Amazon</span>
</div>
</div>
)}
</div>

{/* Book Details */}
<div className="p-3 flex-1 flex flex-col">
{/* Title - Clickable if Amazon link exists */}
{amazonUrl ? (
<a
href={amazonUrl}
target="_blank"
rel="noopener noreferrer"
className="text-sm font-semibold text-text-primary mb-1 font-inter line-clamp-2 leading-tight hover:text-primary transition-colors cursor-pointer"
>
{resource.title}
</a>
) : (
<h3 className="text-sm font-semibold text-text-primary mb-1 font-inter line-clamp-2 leading-tight">
{resource.title}
</h3>
)}

{resource.author && (
<p className="text-xs text-primary font-medium mb-2 font-inter line-clamp-1">
by {resource.author}
</p>
)}

{/* Only show description if it's not empty after cleaning */}
{cleanDescription && (
<p className="text-xs text-text-primary mb-3 font-inter line-clamp-2 leading-relaxed flex-1">
{cleanDescription}
</p>
)}
</div>
</div>
);
};

export default BookCard;