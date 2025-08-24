import React from 'react';

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
          <span className="block text-primary">BUILDORA</span>
          <span className="block tracking-[0.3em] text-gray-800">ENTERPRISE</span>
        </span>
      )}
    </As>
  );
};

export default Logo