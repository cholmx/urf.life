// Utility to extract Amazon book cover images from Amazon URLs

export const extractAmazonBookImage = (amazonUrl) => {
  if (!amazonUrl || typeof amazonUrl !== 'string') {
    return null;
  }

  try {
    // Extract ASIN (Amazon Standard Identification Number) from various Amazon URL formats
    const asinPatterns = [
      /\/dp\/([A-Z0-9]{10})/i,           // /dp/ASIN
      /\/gp\/product\/([A-Z0-9]{10})/i,  // /gp/product/ASIN
      /\/product\/([A-Z0-9]{10})/i,      // /product/ASIN
      /asin=([A-Z0-9]{10})/i,            // asin=ASIN
      /\/([A-Z0-9]{10})\//i,             // /ASIN/
      /\/([A-Z0-9]{10})$/i,              // /ASIN at end
      /\/([A-Z0-9]{10})\?/i              // /ASIN?
    ];

    let asin = null;
    
    for (const pattern of asinPatterns) {
      const match = amazonUrl.match(pattern);
      if (match && match[1]) {
        asin = match[1];
        break;
      }
    }

    if (!asin) {
      return null;
    }

    // Try multiple high-quality Amazon image URLs in order of preference
    // Using _SL1500_ for highest quality, with fallbacks
    const imageUrls = [
      `https://images-na.ssl-images-amazon.com/images/P/${asin}.01._SL1500_.jpg`,  // Highest quality
      `https://images-na.ssl-images-amazon.com/images/P/${asin}.01._SL800_.jpg`,   // High quality
      `https://images-na.ssl-images-amazon.com/images/P/${asin}.01._SL500_.jpg`,   // Medium-high quality
      `https://m.media-amazon.com/images/P/${asin}.01._SL1500_.jpg`,               // Alternative domain
      `https://images.amazon.com/images/P/${asin}.01._SL1500_.jpg`                 // Another alternative
    ];
    
    return imageUrls;

  } catch (error) {
    console.error('Error extracting ASIN from Amazon URL:', error);
    return null;
  }
};

export const extractFirstAmazonImage = (amazonLinksString) => {
  if (!amazonLinksString) return null;
  
  // Split by newlines and find first Amazon link
  const links = amazonLinksString.split('\n').filter(link => link.trim());
  const amazonLink = links.find(link => 
    link.includes('amazon.com') || 
    link.includes('amazon.co.uk') || 
    link.includes('amazon.ca') ||
    link.includes('amzn.to')
  );
  
  if (amazonLink) {
    return extractAmazonBookImage(amazonLink.trim());
  }
  
  return null;
};

// Fallback image if Amazon image fails to load
export const getBookFallbackImage = () => {
  return 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=600&fit=crop&crop=center';
};

// Test multiple image URLs and return the first working one
export const testImageUrls = async (urls) => {
  if (!urls || !Array.isArray(urls)) return null;
  
  for (const url of urls) {
    const isValid = await testImageUrl(url);
    if (isValid) {
      return url;
    }
  }
  
  return null;
};

// Test if an image URL is valid by attempting to load it
export const testImageUrl = (url) => {
  return new Promise((resolve) => {
    if (!url) {
      resolve(false);
      return;
    }

    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = url;
    
    // Timeout after 5 seconds for high-res images
    setTimeout(() => resolve(false), 5000);
  });
};