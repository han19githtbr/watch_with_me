// components/PasswordInput.tsx
'use client';

import { useState, forwardRef } from 'react';
import { EyeIcon, EyeOffIcon } from './icons';

type PasswordInputProps = React.InputHTMLAttributes<HTMLInputElement>;


const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(function PasswordInput(
  { className = '', ...rest },
  ref
) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <input
        {...rest}
        ref={ref}
        type={visible ? 'text' : 'password'}
        className={`w-full p-3 pr-12 bg-neutral-800 border border-white/10 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-netflix-red transition-shadow ${className}`}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? 'Hide password' : 'Show password'}
        aria-pressed={visible}
        className="absolute right-0 top-0 h-full px-3.5 flex items-center text-gray-400 hover:text-white transition-colors"
      >
        {visible ? <EyeOffIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
      </button>
    </div>
  );
});

export default PasswordInput;
