import React, { useState, useEffect } from 'react';
import SignupSheetBuilder from './SignupSheetBuilder';
import SignupSheetPreview from './SignupSheetPreview';
import supabase from '../../lib/supabase';
import './signupSheet.css';

const defaultColumns = () => {
  const names = ['Name', 'Email', 'Phone'];
  const w = Math.floor(100 / names.length);
  const rem = 100 - w * names.length;
  return names.map((name, i) => ({ name, width: w + (i === 0 ? rem : 0) }));
};

const defaultSheetData = () => ({
  title: '',
  showDateTime: true,
  dateTimeLabel: 'Date & Time:',
  instructions: '',
  columns: defaultColumns(),
  rows: 20,
  accentColor: '#0D2B23',
});

// Ported from Sign-Up-Sheet-App-Design-6580. The standalone app used
// react-router routes (/ and /preview) to switch views; here it's local
// state instead, since this is mounted as one tab inside /admin rather
// than owning its own URL.
//
// `happening`, when set, is a { id, title, event_date } handed over by the
// Communication Organizer's "Sign-up" section. It's used to load/save this
// sheet's config onto that happening's `signup_sheet_config` column instead
// of just living in local state.
export default function SignupSheetMaker({ happening, onClearHappening }) {
  const [view, setView] = useState('builder');
  const [sheetData, setSheetData] = useState(defaultSheetData);
  const [saveState, setSaveState] = useState('idle');
  const [loadedForId, setLoadedForId] = useState(null);

  useEffect(() => {
    if (!happening || loadedForId === happening.id) return;
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
        .from('staff_announcements_portal123')
        .select('signup_sheet_config')
        .eq('id', happening.id)
        .single();
      if (cancelled) return;
      const existing = !error ? data?.signup_sheet_config : null;
      if (existing) {
        setSheetData(existing);
      } else {
        setSheetData({
          ...defaultSheetData(),
          title: happening.title || '',
          dateTimeLabel: happening.event_date
            ? new Date(happening.event_date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
            : 'Date & Time:',
        });
      }
      setLoadedForId(happening.id);
      setSaveState('idle');
    })();
    return () => { cancelled = true; };
  }, [happening, loadedForId]);

  const handleSaveToHappening = async () => {
    if (!happening) return;
    setSaveState('saving');
    const { error } = await supabase
      .from('staff_announcements_portal123')
      .update({ signup_sheet_config: sheetData })
      .eq('id', happening.id);
    setSaveState(error ? 'error' : 'saved');
  };

  return (
    <div className="signup-sheet-tool">
      {view === 'builder' ? (
        <SignupSheetBuilder
          sheetData={sheetData}
          setSheetData={setSheetData}
          onPreview={() => setView('preview')}
          happening={happening}
          saveState={saveState}
          onSaveToHappening={handleSaveToHappening}
          onClearHappening={onClearHappening}
        />
      ) : (
        <SignupSheetPreview
          sheetData={sheetData}
          setSheetData={setSheetData}
          onBack={() => setView('builder')}
          happening={happening}
          saveState={saveState}
          onSaveToHappening={handleSaveToHappening}
          onClearHappening={onClearHappening}
        />
      )}
    </div>
  );
}
