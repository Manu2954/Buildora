import React from 'react';

const Logo = ({ 
    size = 'medium', 
    variant = 'full', 
    className = '',
    showText = true,
    textClassName = ''
}) => {
    const sizeClasses = {
        small: 'w-6 h-6',
        medium: 'w-8 h-8',
        large: 'w-12 h-12',
        xl: 'w-16 h-16'
    };

    const textSizeClasses = {
        small: 'text-sm',
        medium: 'text-lg',
        large: 'text-xl',
        xl: 'text-2xl'
    };

    return (
        <div className={`flex items-center gap-2 ${className}`}>
            {variant === 'full' || variant === 'icon' ? (
                <img
                    src="/buildora-icon.png"
                    alt="Buildora Logo"
                    className={`${sizeClasses[size]} object-contain`}
                    onError={(e) => {
                        // Fallback to alternative paths if the primary fails
                        if (e.target.src.includes('/buildora-icon.png')) {
                            e.target.src = '/logo.png';
                        } else if (e.target.src.includes('/logo.png')) {
                            e.target.src = '/asssets/images/logo.jpg';
                        } else {
                            // Hide image if all fail
                            e.target.style.display = 'none';
                        }
                    }}
                />
            ) : null}
            
            {(variant === 'full' || variant === 'text') && showText ? (
                <span className={`font-bold text-primary tracking-wide ${textSizeClasses[size]} ${textClassName}`}>
                    BUILDORA
                </span>
            ) : null}
        </div>
    );
};

export default Logo;
