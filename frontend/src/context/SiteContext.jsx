import React, { createContext, useContext, useState, useEffect } from 'react';
import { getHomePageData } from '../services/storefrontService'; // We can reuse the homepage service

const SiteContext = createContext(null);

export const useSite = () => useContext(SiteContext);

export const SiteProvider = ({ children }) => {
    const [navCategories, setNavCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchNavData = async () => {
            try {
                // We fetch the homepage data which contains our featured categories
                const data = await getHomePageData();
                if (data && data.featuredCategories) {
                    setNavCategories(data.featuredCategories);
                }
            } catch (error) {
                console.error("Failed to fetch site navigation data:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchNavData();
    }, []); // Empty dependency array means this runs only once when the app loads

    const value = {
        navCategories,
        isLoading,
    };

    return (
        <SiteContext.Provider value={value}>
            {children}
        </SiteContext.Provider>
    );
};
