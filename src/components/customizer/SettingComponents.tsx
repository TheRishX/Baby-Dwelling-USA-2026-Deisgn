import React from 'react';
import { HelpCircle } from 'lucide-react';

interface SettingInputProps {
  id: string;
  label: string;
  value: string | number;
  onChange: (val: any) => void;
  type?: 'text' | 'number' | 'password' | 'email';
  placeholder?: string;
  helpText?: string;
  step?: string | number;
  prefix?: string;
}

export function SettingInput({
  id,
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  helpText,
  step,
  prefix,
}: SettingInputProps) {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      <div className="flex items-center gap-1.5 justify-between">
        <label htmlFor={id} className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">
          {label}
        </label>
        {helpText && (
          <div className="relative group">
            <HelpCircle size={12} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 cursor-help" />
            <div className="absolute right-0 bottom-5 hidden group-hover:block bg-gray-900 text-white text-[10px] rounded p-2 shadow-lg w-48 z-50 font-sans leading-relaxed pointer-events-none">
              {helpText}
            </div>
          </div>
        )}
      </div>

      <div className="relative flex items-center">
        {prefix && (
          <span className="absolute left-3 text-xs font-semibold text-gray-400 pointer-events-none">
            {prefix}
          </span>
        )}
        <input
          id={id}
          type={type}
          value={value ?? ''}
          step={step}
          onChange={(e) => {
            const val = e.target.value;
            onChange(type === 'number' ? (parseFloat(val) || 0) : val);
          }}
          placeholder={placeholder}
          className={`w-full border border-gray-200 dark:border-gray-800 rounded-lg p-2.5 text-xs outline-none bg-white dark:bg-black font-semibold text-gray-800 dark:text-gray-200 focus:border-[#008060] focus:ring-1 focus:ring-[#008060]/20 transition-all ${
            prefix ? 'pl-7' : ''
          }`}
        />
      </div>
    </div>
  );
}

interface SettingTextareaProps {
  id: string;
  label: string;
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  rows?: number;
  helpText?: string;
}

export function SettingTextarea({
  id,
  label,
  value,
  onChange,
  placeholder,
  rows = 3,
  helpText,
}: SettingTextareaProps) {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      <div className="flex items-center gap-1.5 justify-between">
        <label htmlFor={id} className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">
          {label}
        </label>
        {helpText && (
          <div className="relative group">
            <HelpCircle size={12} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 cursor-help" />
            <div className="absolute right-0 bottom-5 hidden group-hover:block bg-gray-900 text-white text-[10px] rounded p-2 shadow-lg w-48 z-50 font-sans leading-relaxed pointer-events-none">
              {helpText}
            </div>
          </div>
        )}
      </div>

      <textarea
        id={id}
        rows={rows}
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full border border-gray-200 dark:border-gray-800 rounded-lg p-2.5 text-xs outline-none bg-white dark:bg-black font-semibold text-gray-800 dark:text-gray-200 focus:border-[#008060] focus:ring-1 focus:ring-[#008060]/20 transition-all resize-y leading-relaxed"
      />
    </div>
  );
}

interface CustomSwitchProps {
  id: string;
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  description?: string;
}

export function CustomSwitch({ id, label, checked, onChange, description }: CustomSwitchProps) {
  return (
    <div className="flex flex-col gap-1 bg-white dark:bg-[#1E1E1F] border border-gray-150 dark:border-gray-800 p-3.5 rounded-xl shadow-sm">
      <div className="flex items-center justify-between">
        <label htmlFor={id} className="text-[11px] font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide select-none cursor-pointer">
          {label}
        </label>
        <button
          id={id}
          type="button"
          role="switch"
          aria-checked={checked}
          onClick={() => onChange(!checked)}
          className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-1 focus:ring-[#008060]/40 ${
            checked ? 'bg-[#008060]' : 'bg-gray-200 dark:bg-gray-800'
          }`}
        >
          <span
            aria-hidden="true"
            className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
              checked ? 'translate-x-4' : 'translate-x-0'
            }`}
          />
        </button>
      </div>
      {description && (
        <span className="text-[10px] text-gray-400 dark:text-gray-500 font-sans leading-normal">
          {description}
        </span>
      )}
    </div>
  );
}

interface ColorPickerProps {
  label: string;
  value: string;
  onChange: (color: string) => void;
  presets?: string[];
}

export function ColorPicker({ label, value, onChange, presets = ['#008060', '#C97C5D', '#121212', '#9CA389', '#F5EFE7', '#FFFFFF'] }: ColorPickerProps) {
  return (
    <div className="flex flex-col gap-2 bg-white dark:bg-[#1E1E1F] border border-gray-150 dark:border-gray-800 p-3.5 rounded-xl shadow-sm">
      <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">{label}</label>
      <div className="flex items-center gap-3">
        <div className="relative">
          <input
            type="color"
            value={value || '#008060'}
            onChange={(e) => onChange(e.target.value)}
            className="w-10 h-10 rounded-lg cursor-pointer border border-gray-200 dark:border-gray-800 p-0 overflow-hidden bg-transparent shrink-0"
          />
        </div>
        <div className="flex-1">
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="#HEXCODE"
            className="w-full border border-gray-200 dark:border-gray-800 rounded-lg px-2.5 py-1.5 text-xs font-mono uppercase bg-gray-50 dark:bg-black focus:border-[#008060] focus:ring-1 focus:ring-[#008060]/20 transition-all text-gray-700 dark:text-gray-300"
          />
        </div>
      </div>
      <div className="flex gap-1.5 flex-wrap mt-1">
        {presets.map((preset) => (
          <button
            key={preset}
            type="button"
            onClick={() => onChange(preset)}
            className={`w-5 h-5 rounded-full border border-gray-200 shadow-sm hover:scale-110 active:scale-95 transition-all cursor-pointer ${
              value === preset ? 'ring-2 ring-[#008060] ring-offset-2' : ''
            }`}
            style={{ backgroundColor: preset }}
          />
        ))}
      </div>
    </div>
  );
}

interface SettingGroupProps {
  title: string;
  children: React.ReactNode;
}

export function SettingGroup({ title, children }: SettingGroupProps) {
  return (
    <div className="flex flex-col gap-3.5 border-b border-gray-100 dark:border-gray-800/50 pb-4 mb-2 last:border-0 last:pb-0 last:mb-0 text-left">
      <span className="text-[10px] font-bold text-[#008060] uppercase tracking-wider">{title}</span>
      {children}
    </div>
  );
}
