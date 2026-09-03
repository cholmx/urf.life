import { useEffect } from 'react'

// Utility to clean up inline styles from HTML content
export const cleanupInlineStyles = (htmlString) => {
  if (!htmlString) return htmlString
  
  // Create a temporary DOM element
  const tempDiv = document.createElement('div')
  tempDiv.innerHTML = htmlString
  
  // Remove all style attributes from all elements
  const elements = tempDiv.querySelectorAll('*')
  elements.forEach(element => {
    element.removeAttribute('style')
  })
  
  return tempDiv.innerHTML
}

// Clean up styles from a DOM element
export const cleanupElementStyles = (element) => {
  if (!element) return
  
  const elements = element.querySelectorAll('*')
  elements.forEach(el => {
    if (el.style) {
      el.removeAttribute('style')
    }
  })
}

// React hook to clean up content after render
export const useStyleCleanup = (ref) => {
  useEffect(() => {
    if (ref.current) {
      cleanupElementStyles(ref.current)
    }
  }, [ref])
}