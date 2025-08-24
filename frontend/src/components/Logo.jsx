import React, { useEffect, useRef, useState } from 'react';

const Logo = ({
  size = 'medium',
  variant = 'full', // 'full' | 'icon' | 'text'
  className = '',
  showText = true,
  textClassName = '',
  as: As = 'span', // allow polymorphic wrapper if needed
}) => {
  const sizeClasses = {
    small: 'w-6 h-6',
    medium: 'w-8 h-8',
    large: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  const textSizeClasses = {
    small: 'text-sm',
    medium: 'text-lg',
    large: 'text-xl',
    xl: 'text-2xl',
  };

  const initialSrc = "https://pub-a0507326095e47999eb50c28c682ef43.r2.dev/buildora-icon.jpg";
  const fallbacks = ["/logo.png", "/assets/images/logo.jpg"]; // note: fixed 'assets' typo

  const handleImgError = (e) => {
    const el = e.currentTarget;
    const idx = Number(el.dataset.fallbackIndex || "0");
    if (idx < fallbacks.length) {
      el.src = fallbacks[idx];
      el.dataset.fallbackIndex = String(idx + 1);
    } else {
      // Hide image if all fallbacks fail
      el.style.display = 'none';
    }
  };

  const buildoraRef = useRef(null);
  const enterpriseRef = useRef(null);
  const [enterpriseSpacing, setEnterpriseSpacing] = useState('');

  useEffect(() => {
    const updateSpacing = () => {
      const build = buildoraRef.current;
      const enter = enterpriseRef.current;
      if (build && enter) {
        const buildWidth = build.offsetWidth;
        const enterWidth = enter.offsetWidth;
        const letters = enter.textContent.length - 1;
        if (letters > 0) {
          const diff = buildWidth - enterWidth;
          const spacing = diff / letters;
          setEnterpriseSpacing(`${spacing}px`);
        }
      }
    };

    updateSpacing();
    window.addEventListener('resize', updateSpacing);
    return () => window.removeEventListener('resize', updateSpacing);
  }, []);

  return (
    <As className={`inline-flex items-center gap-2 align-middle ${className}`}>
      {(variant === 'full' || variant === 'icon') && (
        <img
          src={initialSrc}
          alt="Buildora Logo"
          className={`${sizeClasses[size]} object-contain`}
          onError={handleImgError}
        />
      )}
      {showText && (
        <span
          className={`font-brand font-bold ${textSizeClasses[size]} ${textClassName} leading-none text-center`}
        >
          <span ref={buildoraRef} className="block text-primary">
            BUILDORA
          </span>
          <span
            ref={enterpriseRef}
            className="block text-gray-800"
            style={{ letterSpacing: enterpriseSpacing }}
          >
            ENTERPRISE
          </span>
        </span>
      )}
    </As>
  );
};

export default Logo;
