import React from 'react';
import SafeIcon from '../common/SafeIcon';

const StandardButton = ({
  children,
  icon,
  onClick,
  type = 'button',
  disabled = false,
  className = '',
  fullWidth = false
}) => {
  const baseClasses = "inline-flex items-center justify-center space-x-2 px-6 py-3 rounded-lg font-semibold font-heading uppercase tracking-wide transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed";
  const colorClasses = "bg-brand-yellow text-gray-700 hover:bg-brand-blue hover:text-white";
  const widthClasses = fullWidth ? "w-full" : "";

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${colorClasses} ${widthClasses} ${className}`}
    >
      {icon && <SafeIcon icon={icon} className="h-5 w-5" />}
      <span>{children}</span>
    </button>
  );
};

export default StandardButton;
