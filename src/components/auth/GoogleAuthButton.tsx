import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';

interface GoogleAuthButtonProps {
  onClick: () => Promise<void> | void;
  text?: string;
  className?: string;
  disabled?: boolean;
}

export const GoogleAuthButton: React.FC<GoogleAuthButtonProps> = ({
  onClick,
  text = 'Continue with Google',
  className = '',
  disabled = false
}) => {
  const [loading, setLoading] = useState(false);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (loading || disabled) return;
    setLoading(true);
    try {
      await onClick();
    } catch (err) {
      console.error('Google login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled || loading}
      className={`w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-amber-500/40 rounded-xl font-semibold text-xs text-slate-200 transition-all flex items-center justify-center gap-3 shadow-md hover:shadow-amber-500/10 active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed ${className}`}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 text-amber-400 animate-spin" />
      ) : (
        <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
          <path
            fill="#EA4335"
            d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.3 9 5 12 5z"
          />
          <path
            fill="#4285F4"
            d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
          />
          <path
            fill="#FBBC05"
            d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.4 0 15.3c0 2.9.7 5.6 1.9 8l3.7-2.9z"
          />
          <path
            fill="#34A853"
            d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.3-6.4-5.2L1.9 16c1.8 3.7 5.6 7 10.1 7z"
          />
        </svg>
      )}
      <span>{loading ? 'Connecting to Google...' : text}</span>
    </button>
  );
};
