import React from 'react';

interface ThermometerLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const ThermometerLogo: React.FC<ThermometerLogoProps> = ({ size = 'md', className = '' }) => {
  const sizeMap = {
    sm: { size: 20 },
    md: { size: 26 },
    lg: { size: 32 },
    xl: { size: 40 }
  };

  const current = sizeMap[size] || sizeMap.md;

  return (
    <div
      className={`inline-flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105 ${className}`}
      title="TaapRaksha"
    >
      <svg
        width={current.size}
        height={current.size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="shrink-0"
      >
        {/* Sun behind cloud - subtle warm tint that belongs with thermal biometeorology */}
        <path d="M12 2v2" stroke="#f59e0b" strokeOpacity="0.9" />
        <path d="m4.93 4.93 1.41 1.41" stroke="#f59e0b" strokeOpacity="0.9" />
        <path d="M20 12h2" stroke="#f59e0b" strokeOpacity="0.9" />
        <path d="m19.07 4.93-1.41 1.41" stroke="#f59e0b" strokeOpacity="0.9" />
        <path d="M15.5 8.5a4 4 0 0 0-5.8 2.2" stroke="#f59e0b" strokeOpacity="0.9" />
        
        {/* Cloud - matches the website's crisp cool typography */}
        <path
          d="M17.5 19H9a5 5 0 1 1 2.85-9.13A4 4 0 0 1 18 13.5a3.5 3.5 0 0 1-.5 5.5Z"
          stroke="#cbd5e1"
          className="group-hover:stroke-white transition-colors"
        />
      </svg>
    </div>
  );
};

// Export semantic alias
export const WeatherLogo = ThermometerLogo;
