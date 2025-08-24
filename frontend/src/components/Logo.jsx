// Logo.jsx (or .tsx if you prefer)
import React, { useEffect, useRef, useState } from 'react';

const Logo = ({
  size = 'medium',
  variant = 'full', // 'full' | 'icon' | 'text'
  className = '',
  showText = true,
  textClassName = '',
  as: As = 'span', // allow polymorphic wrapper if needed
}) => {
  const iconSizeClasses = {
    small: 'text-xl',
    medium: 'text-2xl',
    large: 'text-3xl',
    xl: 'text-4xl',
  };

  const textSizeClasses = {
    small: 'text-sm',
    medium: 'text-lg',
    large: 'text-xl',
    xl: 'text-2xl',
  };

  const buildoraRef = useRef(null);
  const enterpriseRef = useRef(null);
  const [spacing, setSpacing] = useState('0px');

  useEffect(() => {
    const updateSpacing = () => {
      if (buildoraRef.current && enterpriseRef.current) {
        const buildoraWidth = buildoraRef.current.offsetWidth;
        enterpriseRef.current.style.letterSpacing = '0px';
        const enterpriseWidth = enterpriseRef.current.offsetWidth;
        const charCount =
          (enterpriseRef.current.textContent || '').trim().length - 1;

        if (charCount > 0) {
          const newSpacing = (buildoraWidth - enterpriseWidth) / charCount;
          setSpacing(`${newSpacing}px`);
        }
      }
    };

    updateSpacing();
    window.addEventListener('resize', updateSpacing);
    return () => window.removeEventListener('resize', updateSpacing);
  }, []);

  return (
    <As
      className={`inline-flex items-center gap-2 align-middle ${className}`}
      aria-label="Buildora Enterprise"
    >
      {(variant === 'full' || variant === 'icon') && (
        <span
          className={`font-brand font-bold text-primary ${iconSizeClasses[size]}`}
          aria-hidden="true"
        >
          B
        </span>
      )}
      {showText && (
        <span
          className={`font-brand font-bold ${textSizeClasses[size]} ${textClassName} leading-none text-center`}
          aria-hidden="true"
        >
          <span ref={buildoraRef} className="block text-primary">
            BUILDORA
          </span>
          <span
            ref={enterpriseRef}
            className="block text-gray-800"
            style={{ letterSpacing: spacing }}
          >
            ENTERPRISE
          </span>
        </span>
      )}
    </As>
  );
};

export default Logo;
