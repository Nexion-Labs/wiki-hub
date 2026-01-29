import { forwardRef, useState, type InputHTMLAttributes } from 'react';
import { EyeIcon, EyeOffIcon } from '../icons';

export interface PasswordInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  error?: string;
  helperText?: string;
  showStrengthIndicator?: boolean;
}

const getPasswordStrength = (password: string): { strength: number; label: string; color: string } => {
  if (!password) return { strength: 0, label: '', color: '' };
  
  let strength = 0;
  
  // Length check
  if (password.length >= 8) strength += 25;
  if (password.length >= 12) strength += 10;
  
  // Character variety checks
  if (/[a-z]/.test(password)) strength += 15;
  if (/[A-Z]/.test(password)) strength += 15;
  if (/[0-9]/.test(password)) strength += 15;
  if (/[^a-zA-Z0-9]/.test(password)) strength += 20;
  
  let label = '';
  let color = '';
  
  if (strength < 30) {
    label = 'Yếu';
    color = 'bg-red-500';
  } else if (strength < 60) {
    label = 'Trung bình';
    color = 'bg-yellow-500';
  } else if (strength < 80) {
    label = 'Tốt';
    color = 'bg-blue-500';
  } else {
    label = 'Mạnh';
    color = 'bg-emerald-500';
  }
  
  return { strength, label, color };
};

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ label, error, helperText, showStrengthIndicator = false, className = '', id, value, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
    
    const passwordStrength = showStrengthIndicator && value 
      ? getPasswordStrength(String(value)) 
      : null;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-slate-700 mb-1"
          >
            {label}
          </label>
        )}
        <div className="relative">
          <input
            ref={ref}
            id={inputId}
            type={showPassword ? 'text' : 'password'}
            value={value}
            className={`
              w-full px-4 py-2 pr-10
              border rounded-lg
              transition-colors duration-200
              focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500
              disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed
              ${error 
                ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                : 'border-slate-300'
              }
              ${className}
            `}
            {...props}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
            tabIndex={-1}
          >
            {showPassword ? (
              <EyeOffIcon className="w-5 h-5" />
            ) : (
              <EyeIcon className="w-5 h-5" />
            )}
          </button>
        </div>
        
        {/* Password Strength Indicator */}
        {showStrengthIndicator && value && passwordStrength && (
          <div className="mt-2">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-slate-600">Độ mạnh mật khẩu:</span>
              <span className={`text-xs font-medium ${
                passwordStrength.strength < 30 ? 'text-red-600' :
                passwordStrength.strength < 60 ? 'text-yellow-600' :
                passwordStrength.strength < 80 ? 'text-blue-600' :
                'text-emerald-600'
              }`}>
                {passwordStrength.label}
              </span>
            </div>
            <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${passwordStrength.color}`}
                style={{ width: `${passwordStrength.strength}%` }}
              />
            </div>
          </div>
        )}
        
        {error && (
          <p className="mt-1 text-sm text-red-600">{error}</p>
        )}
        {helperText && !error && (
          <p className="mt-1 text-sm text-slate-500">{helperText}</p>
        )}
      </div>
    );
  }
);

PasswordInput.displayName = 'PasswordInput';
