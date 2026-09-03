import React, { useRef, useEffect } from 'react'

const RichTextEditor = ({ value, onChange, placeholder, rows = 12, className = '' }) => {
  const editorRef = useRef(null)

  useEffect(() => {
    if (editorRef.current && value !== editorRef.current.innerHTML) {
      editorRef.current.innerHTML = value || ''
      // Clean up inline styles after content is set
      cleanupInlineStyles()
    }
  }, [value])

  const cleanupInlineStyles = () => {
    if (!editorRef.current) return
    
    // Remove problematic inline styles from all elements
    const elements = editorRef.current.querySelectorAll('*')
    elements.forEach(element => {
      if (element.style) {
        // Keep only essential styles, remove font-related ones
        const display = element.style.display
        const float = element.style.float
        
        // Clear all styles
        element.removeAttribute('style')
        
        // Restore only essential layout styles if needed
        if (display === 'inline' || display === 'block') {
          element.style.display = display
        }
        if (float && float !== 'none') {
          element.style.float = float
        }
      }
    })
  }

  const handleInput = () => {
    if (editorRef.current && onChange) {
      // Clean up styles before saving
      cleanupInlineStyles()
      onChange({ target: { value: editorRef.current.innerHTML } })
    }
  }

  const handlePaste = (e) => {
    e.preventDefault()
    const paste = (e.clipboardData || window.clipboardData).getData('text/html') ||
                  (e.clipboardData || window.clipboardData).getData('text/plain')

    if (paste) {
      const selection = window.getSelection()
      if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0)
        range.deleteContents()

        const tempDiv = document.createElement('div')
        tempDiv.innerHTML = paste

        // Step 1: Convert <b> to <strong> and <i> to <em>
        tempDiv.querySelectorAll('b').forEach(b => {
          const strong = document.createElement('strong')
          strong.innerHTML = b.innerHTML
          b.replaceWith(strong)
        })
        tempDiv.querySelectorAll('i').forEach(i => {
          const em = document.createElement('em')
          em.innerHTML = i.innerHTML
          i.replaceWith(em)
        })

        // Step 2: Find elements with inline styling and wrap content
        tempDiv.querySelectorAll('*').forEach(element => {
          const style = element.style
          if (!style) return

          const fontWeight = style.fontWeight
          const fontStyle = style.fontStyle
          const textDecoration = style.textDecoration

          const isBold = fontWeight === 'bold' || fontWeight === '700' || parseInt(fontWeight) >= 600
          const isItalic = fontStyle === 'italic'
          const isUnderline = textDecoration?.includes('underline')

          // Only process if not already a semantic tag
          const tagName = element.tagName.toLowerCase()
          if (!['strong', 'em', 'u', 'b', 'i'].includes(tagName) && (isBold || isItalic || isUnderline)) {
            let html = element.innerHTML

            if (isBold) html = `<strong>${html}</strong>`
            if (isItalic) html = `<em>${html}</em>`
            if (isUnderline) html = `<u>${html}</u>`

            element.innerHTML = html
          }
        })

        // Step 3: Remove all inline styles and classes
        tempDiv.querySelectorAll('*').forEach(element => {
          element.removeAttribute('style')
          element.removeAttribute('class')
        })

        const fragment = document.createRange().createContextualFragment(tempDiv.innerHTML)
        range.insertNode(fragment)
        range.collapse(false)
        selection.removeAllRanges()
        selection.addRange(range)
      }
      handleInput()
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      const selection = window.getSelection()
      const range = selection.getRangeAt(0)
      
      if (e.shiftKey) {
        // Shift+Enter: Insert line break
        const br = document.createElement('br')
        range.deleteContents()
        range.insertNode(br)
        range.setStartAfter(br)
      } else {
        // Enter: Create new paragraph
        const p = document.createElement('p')
        p.innerHTML = '<br>'
        range.deleteContents()
        range.insertNode(p)
        range.setStart(p, 0)
      }
      
      range.collapse(true)
      selection.removeAllRanges()
      selection.addRange(range)
      handleInput()
    }
  }

  const minHeight = rows * 1.5

  return (
    <div className={`border border-accent-dark rounded-lg overflow-hidden bg-white ${className}`}>
      <div className="bg-gray-50 border-b border-accent-dark p-3 text-sm text-text-light">
        💡 <strong>Tip:</strong> Paste formatted text directly! Bold, italics, lists, and paragraphs will be preserved. 
        Press <kbd>Enter</kbd> for new paragraph, <kbd>Shift+Enter</kbd> for line break.
      </div>
      <div
        ref={editorRef}
        contentEditable={true}
        onInput={handleInput}
        onPaste={handlePaste}
        onKeyDown={handleKeyDown}
        className="rich-text-editor"
        style={{
          minHeight: `${minHeight}rem`,
          padding: '1rem',
          outline: 'none',
          lineHeight: '1.6'
        }}
        suppressContentEditableWarning={true}
        data-placeholder={placeholder}
      />
    </div>
  )
}

export default RichTextEditor