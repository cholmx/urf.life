import React, { useRef, useState, useCallback } from 'react';
import * as FiIcons from 'react-icons/fi';

const { FiPrinter } = FiIcons;
const MIN_COL_WIDTH = 5;
const SAVE_LABELS = { idle: 'Save to Happening', saving: 'Saving...', saved: 'Saved', error: 'Save Failed - Retry' };

const SignupSheetPreview = ({ sheetData, setSheetData, onBack, happening, saveState, onSaveToHappening, onClearHappening }) => {
  const tableRef = useRef(null);
  const resizingRef = useRef(null);
  const [activeHandle, setActiveHandle] = useState(null);

  const handlePrint = () => window.print();
  const isCompact = sheetData.rows > 25;
  const isUltraCompact = sheetData.rows > 40;
  const accent = sheetData.accentColor || '#0D2B23';

  const startResize = useCallback((e, index) => {
    e.preventDefault();
    const tableWidth = tableRef.current?.getBoundingClientRect().width || 1;
    resizingRef.current = { index, startX: e.clientX, tableWidth, startWidths: sheetData.columns.map(c => c.width) };
    setActiveHandle(index);

    const onMove = (moveEvent) => {
      const { index, startX, tableWidth, startWidths } = resizingRef.current;
      const dPct = ((moveEvent.clientX - startX) / tableWidth) * 100;
      let newLeft = startWidths[index] + dPct;
      let newRight = startWidths[index + 1] - dPct;
      if (index + 1 >= startWidths.length) return;
      if (newLeft < MIN_COL_WIDTH) { newRight += newLeft - MIN_COL_WIDTH; newLeft = MIN_COL_WIDTH; }
      if (newRight < MIN_COL_WIDTH) { newLeft += newRight - MIN_COL_WIDTH; newRight = MIN_COL_WIDTH; }
      setSheetData(prev => ({
        ...prev,
        columns: prev.columns.map((col, i) => {
          if (i === index) return { ...col, width: Math.round(newLeft * 10) / 10 };
          if (i === index + 1) return { ...col, width: Math.round(newRight * 10) / 10 };
          return col;
        }),
      }));
    };

    const onUp = () => {
      resizingRef.current = null;
      setActiveHandle(null);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  }, [sheetData.columns, setSheetData]);

  return (
    <div className="min-h-screen print:bg-white" style={{ backgroundColor: '#F7F7F7' }}>

      {/* Header (Hidden when printing) */}
      <header className="bg-white border-b border-[#E2E2E2] px-8 print:hidden">
        <div className="flex justify-between items-center max-w-5xl mx-auto w-full">
          <div className="flex gap-8">
            <button
              onClick={onBack}
              className="py-3 text-sm font-bold uppercase tracking-wider border-b-4 border-transparent text-[#9A9A9A] hover:text-[#1E1E21] transition-colors"
            >
              Manage
            </button>
            <button className="py-3 text-sm font-bold uppercase tracking-wider border-b-4 border-[#1E1E21] text-[#1E1E21]">
              Preview
            </button>
          </div>
          <div className="flex items-center gap-3">
            {happening && (
              <button
                onClick={onSaveToHappening}
                disabled={saveState === 'saving'}
                className="bg-white border border-[#1E1E21] text-[#1E1E21] px-4 py-2 rounded text-xs font-bold uppercase tracking-wider hover:bg-[#F5F5F5] transition-colors disabled:opacity-50"
              >
                {SAVE_LABELS[saveState] || SAVE_LABELS.idle}
              </button>
            )}
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 bg-[#1E1E21] text-white px-5 py-2 rounded text-xs font-bold uppercase tracking-wider hover:bg-[#3A3A3D] transition-colors"
            >
              <FiPrinter className="text-sm" />
              Print Sheet
            </button>
          </div>
        </div>
        {happening && (
          <div className="max-w-5xl mx-auto w-full pb-2 flex items-center justify-between print:hidden">
            <span className="text-[11px] text-[#6E6E6E] italic">
              Editing the sign-up sheet for <b>{happening.title}</b>
            </span>
            {onClearHappening && (
              <button
                onClick={onClearHappening}
                className="text-[11px] text-[#9A9A9A] hover:text-[#1E1E21] uppercase tracking-wider font-bold"
              >
                Done
              </button>
            )}
          </div>
        )}
      </header>

      {/* Page Container */}
      <div className="flex justify-center px-4 py-8 print:py-0 print:px-0">
        <div className="signup-sheet-container">
          <div className="signup-sheet-content">

            {/* Header */}
            <div className={`text-center ${isUltraCompact ? 'mb-2' : isCompact ? 'mb-4' : 'mb-6'}`}>
              <h1
                className={`${isUltraCompact ? 'text-2xl' : isCompact ? 'text-3xl' : 'text-4xl'} sheet-title`}
                style={{ color: '#1E1E21' }}
              >
                {sheetData.title || 'Sign-up Sheet'}
              </h1>

              {sheetData.showDateTime && sheetData.dateTimeLabel && (
                <div
                  className={`${isUltraCompact ? 'text-base' : 'text-xl'} font-bold mt-1`}
                  style={{ color: '#4A4A4D' }}
                >
                  {sheetData.dateTimeLabel}
                </div>
              )}

              {sheetData.instructions && (
                <div
                  className={`max-w-3xl mx-auto mt-2 ${isUltraCompact ? 'text-[10px]' : 'text-sm'} whitespace-pre-wrap leading-tight`}
                  style={{ color: '#4A4A4D' }}
                >
                  {sheetData.instructions}
                </div>
              )}

              {!isUltraCompact && (
                <div
                  className={`w-24 h-1 mx-auto ${isCompact ? 'mt-3' : 'mt-5'}`}
                  style={{ backgroundColor: accent }}
                />
              )}
            </div>

            {/* Table */}
            <div className="sheet-table" ref={tableRef}>
              {/* Header Row */}
              <div className="sheet-header-row" style={{ backgroundColor: '#F5F5F5' }}>
                {sheetData.columns.map((column, index) => (
                  <div
                    key={index}
                    className="relative flex items-center justify-center px-2 py-1.5 text-center border-r-2 border-black last:border-r-0"
                    style={{ width: `${column.width}%` }}
                  >
                    <span className="column-header text-[11px] leading-tight select-none" style={{ color: '#1E1E21' }}>
                      {column.name}
                    </span>
                    {index < sheetData.columns.length - 1 && (
                      <div
                        className={`resize-handle print:hidden ${activeHandle === index ? 'resizing' : ''}`}
                        onMouseDown={(e) => startResize(e, index)}
                        title="Drag to resize"
                        style={{ '--resize-color': accent }}
                      />
                    )}
                  </div>
                ))}
              </div>

              {/* Data Rows */}
              <div className="flex-1 flex flex-col" style={{ minHeight: 0 }}>
                {Array.from({ length: sheetData.rows }).map((_, rowIndex) => (
                  <div key={rowIndex} className="sheet-row last:border-b-0">
                    {sheetData.columns.map((column, colIndex) => (
                      <div
                        key={colIndex}
                        className="border-r border-gray-400 last:border-r-0"
                        style={{ width: `${column.width}%` }}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            {!isUltraCompact && (
              <div className="mt-2 flex justify-end items-end">
                <p className="text-[10px]" style={{ color: '#4A4A4D' }}>
                  Please print clearly. Thank you!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupSheetPreview;