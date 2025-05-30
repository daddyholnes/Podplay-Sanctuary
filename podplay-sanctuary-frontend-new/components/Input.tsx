
import React, { forwardRef } from 'react';
import Icon, { IconName } from './Icon';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: IconName;
  rightIcon?: IconName;
  onRightIconClick?: () => void;
  inputClassName?: string;
}

const Input: React.FC<InputProps> = ({ label, error, id, leftIcon, rightIcon, onRightIconClick, className, inputClassName, ...props }) => {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className={`w-full ${className || ''}`}>
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-text-secondary mb-1">
          {label}
        </label>
      )}
      <div className="relative rounded-md shadow-sm">
        {leftIcon && (
          <div className="pointer-events-none absolute inset-y-0 left-0 pl-3 flex items-center">
            <Icon name={leftIcon} className="h-5 w-5 text-text-muted" />
          </div>
        )}
        <input
          id={inputId}
          className={`input block w-full px-3 py-2 border border-border rounded-lg bg-primary-bg text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent sm:text-sm
            ${leftIcon ? 'pl-10' : ''}
            ${rightIcon ? 'pr-10' : ''}
            ${error ? 'border-error focus:ring-error focus:border-error' : ''}
            ${inputClassName || ''}
          `}
          {...props}
        />
        {rightIcon && (
           <div className={`absolute inset-y-0 right-0 pr-3 flex items-center ${onRightIconClick ? 'cursor-pointer' : 'pointer-events-none'}`} onClick={onRightIconClick}>
            <Icon name={rightIcon} className="h-5 w-5 text-text-muted hover:text-text-secondary" />
          </div>
        )}
      </div>
      {error && <p className="mt-1 text-xs text-error">{error}</p>}
    </div>
  );
};

export default Input;

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  textareaClassName?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, id, className, textareaClassName, ...props }, ref) => {
    const textareaId = id || label?.toLowerCase().replace(/\s+/g, '-');
    return (
      <div className={`w-full ${className || ''}`}>
        {label && (
          <label htmlFor={textareaId} className="block text-sm font-medium text-text-secondary mb-1">
            {label}
          </label>
        )}
        <textarea
          id={textareaId}
          ref={ref}
          className={`input block w-full px-3 py-2 border border-border rounded-lg bg-primary-bg text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent sm:text-sm
            ${error ? 'border-error focus:ring-error focus:border-error' : ''}
            ${textareaClassName || ''}
          `}
          {...props}
        />
        {error && <p className="mt-1 text-xs text-error">{error}</p>}
      </div>
    );
  }
);
Textarea.displayName = 'Textarea';


interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string | number; label: string }[];
  selectClassName?: string;
  placeholder?: string;
}

const selectDropdownArrowSvg = `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`;

export const Select: React.FC<SelectProps> = ({ label, error, id, options, className, selectClassName, placeholder, ...props }) => {
  const selectId = id || label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className={`w-full ${className || ''}`}>
      {label && (
        <label htmlFor={selectId} className="block text-sm font-medium text-text-secondary mb-1">
          {label}
        </label>
      )}
      <select
        id={selectId}
        className={`input block w-full px-3 py-2 border border-border rounded-lg bg-primary-bg text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent sm:text-sm appearance-none pr-8 bg-no-repeat bg-right
          ${error ? 'border-error focus:ring-error focus:border-error' : ''}
          ${selectClassName || ''}
        `}
        style={{ 
          backgroundImage: selectDropdownArrowSvg,
          backgroundPosition: 'right 0.5rem center', 
          backgroundSize: '1.5em 1.5em'
        }}
        {...props}
      >
        {placeholder && <option value="" disabled>{placeholder}</option>}
        {options.map(option => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
      {error && <p className="mt-1 text-xs text-error">{error}</p>}
    </div>
  );
};