import React, { useState, useEffect } from 'react';
import { Megaphone, X } from 'lucide-react';
import { Link } from 'react-router-dom';

const AnnouncementBanner = ({ message, linkTo, linkText }) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Check localStorage to see if the user has previously dismissed the banner
        const dismissed = localStorage.getItem('announcementDismissed');
        if (dismissed !== 'true') {
            setIsVisible(true);
        }
    }, []);

    const handleDismiss = () => {
        // Hide the banner and set a value in localStorage
        setIsVisible(false);
        localStorage.setItem('announcementDismissed', 'true');
    };

    if (!isVisible) {
        return null;
    }

    return (
        <div className="relative bg-indigo-600">
            <div className="container px-4 py-3 mx-auto text-white">
                <div className="flex items-center justify-center text-center">
                    <Megaphone size={20} className="hidden sm:inline-block mr-3 flex-shrink-0" />
                    <p className="text-sm font-medium">
                        {message}
                        {linkTo && linkText && (
                            <Link to={linkTo} className="ml-2 font-bold underline hover:text-indigo-200">
                                {linkText} &rarr;
                            </Link>
                        )}
                    </p>
                    <button 
                        onClick={handleDismiss} 
                        className="absolute p-1 transition-colors rounded-full top-1/2 right-4 -translate-y-1/2 hover:bg-white/20"
                        aria-label="Dismiss announcement"
                    >
                        <X size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AnnouncementBanner;
