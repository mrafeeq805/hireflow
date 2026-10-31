import { Link } from 'react-router-dom';

interface LogoProps {
  iconOnly?: boolean;
  size?: 'sm' | 'md' | 'lg';
  clickable?: boolean;
  href?: string;
}

export function Logo({
  iconOnly = false,
  size = 'md',
  clickable = true,
  href = '/dashboard',
}: LogoProps) {
  const iconSizes = {
    sm: 'h-7 w-7',
    md: 'h-8 w-8',
    lg: 'h-10 w-10',
  };

  const textSizes = {
    sm: 'text-base',
    md: 'text-lg',
    lg: 'text-2xl',
  };

  const content = (
    <div className="flex items-center gap-2.5 select-none">
      <div
        className={`${iconSizes[size]} rounded-lg bg-[#142B3B] flex items-center justify-center shadow-xs border border-[#1D3D53] shrink-0`}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Emerald stylized H and Flow wave */}
          <path
            d="M6 4V20M18 4V20M6 12H18"
            stroke="#0F9D78"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <circle cx="12" cy="12" r="2.5" fill="#D9F5EA" />
        </svg>
      </div>

      {!iconOnly && (
        <div className="flex flex-col">
          <span
            className={`${textSizes[size]} font-bold tracking-tight text-[#142B3B] dark:text-white flex items-center gap-0.5 leading-none`}
          >
            Hire<span className="text-[#0F9D78]">Flow</span>
          </span>
          <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-400 leading-none mt-0.5">
            Recruitment ATS
          </span>
        </div>
      )}
    </div>
  );

  if (clickable) {
    return (
      <Link to={href} className="inline-block transition-opacity hover:opacity-90">
        {content}
      </Link>
    );
  }

  return content;
}

