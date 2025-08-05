import React, { useState, useEffect } from 'react';
import { Megaphone, X } from 'lucide-react';
import { Link } from 'react-router-dom';

// Helper function to safely get an item from localStorage
const safeGetItem = (key) => {
    try {
        return localStorage.getItem(key);
    } catch (error) {
        console.warn(`Could not access localStorage to get item '${key}':`, error);
        return null;
    }
};

// Helper function to safely set an item in localStorage
const safeSetItem = (key, value) => {
    try {
        localStorage.setItem(key, value);
    } catch (error) {
        console.warn(`Could not access localStorage to set item '${key}':`, error);
    }
};

const AnnouncementBanner = ({ message, linkTo, linkText }) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // FIX: Use the safe getter to check if the banner was dismissed
        const dismissed = safeGetItem('announcementDismissed');
        if (dismissed !== 'true') {
            setIsVisible(true);
        }
    }, []);

    const handleDismiss = () => {
        setIsVisible(false);
        // FIX: Use the safe setter to record the dismissal
        safeSetItem('announcementDismissed', 'true');
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
