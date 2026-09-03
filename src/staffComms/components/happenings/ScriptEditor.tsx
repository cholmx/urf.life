import { useRef, useEffect, useState, useCallback } from 'react';
import { C, font } from '../../lib/theme';

interface ScriptEditorProps {
  value: string;
  onChange: (html: string) => void;
  disabled?: boolean;
}

interface ActiveFormats {
  bold: boolean;
  italic: boolean;
  title: boolean;
}

// contentEditable-based editor for the Happenings script. Unlike the plain
// <textarea> it replaces, this gives staff an actual formatter - Bold,
// Italic, and a "Title" style (h3, in the site's heading font) they can
// apply to any selection, on top of the existing paste/typing behavior.
export function ScriptEditor({ value, onChange, disabled }: ScriptEditorProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<ActiveFormats>({ bold: false, italic: false, title: false });

  useEffect(() => {
    if (ref.current && value !== ref.current.innerHTML) {
      ref.current.innerHTML = value || '';
    }
  }, [value]);

  const emitChange = useCallback(() => {
    if (ref.current) onChange(ref.current.innerHTML);
  }, [onChange]);

  const updateActiveState = useCallback(() => {
    try {
      setActive({
        bold: document.queryCommandState('bold'),
        italic: document.queryCommandState('italic'),
        title: document.queryCommandValue('formatBlock').toLowerCase() === 'h3',
      });
    } catch {
      // queryCommandState throws if nothing in the editor is focused/selected
    }
  }, []);

  const focusEditor = () => ref.current?.focus();

  const toggleInline = (command: 'bold' | 'italic') => {
    focusEditor();
    document.execCommand(command);
    updateActiveState();
    emitChange();
  };

  const toggleTitle = () => {
    focusEditor();
    document.execCommand('formatBlock', false, active.title ? 'p' : 'h3');
    updateActiveState();
    emitChange();
  };

  const handleFocus = () => {
    // Ensure Enter creates <p> (not a bare <div>) so .happenings-script's
    // paragraph spacing rules apply consistently to typed content too.
    document.execCommand('defaultParagraphSeparator', false, 'p');
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    document.execCommand('insertText', false, text);
    emitChange();
  };

  const toolbarBtn = (label: string, isActive: boolean, onClick: () => void, title: string, labelStyle: React.CSSProperties = {}) => (
    <button
      type="button"
      disabled={disabled}
      onMouseDown={e => e.preventDefault()}
      onClick={onClick}
      title={title}
      style={{
        border: `1px solid ${isActive ? C.accent : C.borderMed}`,
        background: isActive ? C.accentBg : C.card,
        color: isActive ? C.accent : C.textSec,
        borderRadius: 4,
        padding: '5px 12px',
        fontSize: 12,
        cursor: disabled ? 'default' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        transition: 'background 0.15s, color 0.15s',
        ...labelStyle,
      }}
    >
      {label}
    </button>
  );

  return (
    <div>
      <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
        {toolbarBtn('Bold', active.bold, () => toggleInline('bold'), 'Bold', { fontFamily: font.body, fontWeight: 700 })}
        {toolbarBtn('Italic', active.italic, () => toggleInline('italic'), 'Italic', { fontFamily: font.body, fontStyle: 'italic' })}
        {toolbarBtn('Title', active.title, toggleTitle, 'Title style for a section heading', { fontFamily: font.display, fontWeight: 700 })}
      </div>
      <div
        ref={ref}
        className="happenings-script"
        contentEditable={!disabled}
        suppressContentEditableWarning
        onInput={emitChange}
        onFocus={handleFocus}
        onPaste={handlePaste}
        onKeyUp={updateActiveState}
        onMouseUp={updateActiveState}
        style={{
          minHeight: 360,
          outline: 'none',
          fontFamily: font.body,
          fontSize: 15,
          color: C.text,
        }}
      />
    </div>
  );
}
