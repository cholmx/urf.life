import { useEffect } from 'react'

export const useCleanContent = () => {
  useEffect(() => {
    const cleanInlineStyles = () => {
      // Target all content areas that might have inline styles
      const contentAreas = document.querySelectorAll('.rendered-content, .announcement-content')
      
      contentAreas.forEach(area => {
        // Find all elements with style attributes
        const styledElements = area.querySelectorAll('[style]')
        
        styledElements.forEach(element => {
          // Remove problematic style properties while keeping the element
          const style = element.getAttribute('style') || ''
          
          // Remove font-family, font-size, color, font-weight, letter-spacing
          const cleanedStyle = style
            .replace(/font-family[^;]*;?/gi, '')
            .replace(/font-size[^;]*;?/gi, '')
            .replace(/color[^;]*;?/gi, '')
            .replace(/font-weight[^;]*;?/gi, '')
            .replace(/letter-spacing[^;]*;?/gi, '')
            .replace(/font-style[^;]*;?/gi, '')
            .replace(/font-variant[^;]*;?/gi, '')
            .replace(/text-decoration[^;]*;?/gi, '')
            .replace(/orphans[^;]*;?/gi, '')
            .replace(/text-align[^;]*;?/gi, '')
            .replace(/text-indent[^;]*;?/gi, '')
            .replace(/text-transform[^;]*;?/gi, '')
            .replace(/widows[^;]*;?/gi, '')
            .replace(/word-spacing[^;]*;?/gi, '')
            .replace(/-webkit-text-stroke-width[^;]*;?/gi, '')
            .replace(/white-space[^;]*;?/gi, '')
            .replace(/background-color[^;]*;?/gi, '')
            .replace(/display[^;]*;?/gi, '')
            .replace(/float[^;]*;?/gi, '')
            .trim()
          
          if (cleanedStyle) {
            element.setAttribute('style', cleanedStyle)
          } else {
            element.removeAttribute('style')
          }
          
          // If it's a span with no remaining styles or useful attributes, unwrap it
          if (element.tagName === 'SPAN' && !element.getAttribute('style') && !element.className) {
            const parent = element.parentNode
            while (element.firstChild) {
              parent.insertBefore(element.firstChild, element)
            }
            parent.removeChild(element)
          }
        })
      })
    }

    // Clean on initial load
    cleanInlineStyles()

    // Clean whenever content changes (using MutationObserver)
    const observer = new MutationObserver(() => {
      cleanInlineStyles()
    })

    // Observe changes to content areas
    const contentAreas = document.querySelectorAll('.rendered-content, .announcement-content')
    contentAreas.forEach(area => {
      observer.observe(area, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['style']
      })
    })

    // Cleanup
    return () => {
      observer.disconnect()
    }
  }, [])
}