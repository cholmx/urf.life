import React from 'react';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { downloadIcsEvent } from '../utils/generateIcs';

const { FiCalendar } = FiIcons;

// Only render this where `date` is actually set - see generateIcs.js.
const AddToCalendarButton = ({ title, description, date, startTime, endTime, location, className }) => {
  if (!date) return null;

  return (
    <button
      onClick={() => downloadIcsEvent({ title, description, date, startTime, endTime, location })}
      className={
        className ||
        'inline-flex items-center space-x-1 text-primary hover:text-primary-dark text-sm underline'
      }
    >
      <SafeIcon icon={FiCalendar} className="h-3.5 w-3.5" />
      <span>Add to Calendar</span>
    </button>
  );
};

export default AddToCalendarButton;
