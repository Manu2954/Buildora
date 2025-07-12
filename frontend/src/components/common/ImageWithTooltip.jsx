import React, { useState } from 'react';
import { Image as ImageIcon } from 'lucide-react';

const ImageWithTooltip = ({ src, alt, smallSize = 'h-10 w-10' }) => {
    const [isHovering, setIsHovering] = useState(false);
    const [hasError, setHasError] = useState(false);

    // Render placeholder if no src or if there was an error loading the image
    if (!src || hasError) {
        return (
            <div className={`flex-shrink-0 ${smallSize} bg-gray-100 rounded-md flex items-center justify-center`}>
                <ImageIcon className="h-6 w-6 text-gray-400" />
            </div>
        );
    }
    
    return (
        <div 
            className="relative flex-shrink-0"
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
        >
            {/* The small image visible in the table */}
            <div className={`${smallSize} bg-gray-100 rounded-md flex items-center justify-center overflow-hidden cursor-pointer`}>
                <img 
                    className="w-full h-full object-cover" 
                    src={src} 
                    alt={alt}
                    onError={() => setHasError(true)}
                />
            </div>

            {/* The larger, floating image that appears on hover */}
            {isHovering && (
                <div 
                    className={`
                        absolute z-50 top-0 left-full ml-2 w-56 h-auto
                        p-2 bg-white rounded-lg shadow-2xl border border-gray-200
                        transform transition-all duration-200 ease-in-out
                        animate-fade-in
                    `}
                    style={{
                        // Prevents the tooltip from triggering mouseleave on the parent
                        pointerEvents: 'none' 
                    }}
                >
                    <img 
                        src={src} 
                        alt={`${alt} larger preview`} 
                        className="w-full h-full object-contain rounded-md" 
                    />
                </div>
            )}
        </div>
    );
};

// Add this to your main CSS file (e.g., index.css) for the fade-in animation
/*
@keyframes fade-in {
    from { opacity: 0; transform: scale(0.95); }
    to { opacity: 1; transform: scale(1); }
}
.animate-fade-in {
    animation: fade-in 0.2s ease-in-out;
}
*/

export default ImageWithTooltip;