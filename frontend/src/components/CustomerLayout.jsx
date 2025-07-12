import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import AnnouncementBanner from './AnnouncementBanner';

const CustomerLayout = () => {
    return (
        <div>
            <AnnouncementBanner 
                message="Grand Opening Sale!" 
                linkText="Shop Now" 
                linkTo="/products"
            />
            <Navbar />
            <main>
                {/* The Outlet component renders the matched child route's component */}
                <Outlet />
            </main>
            {/* You can also add a shared Footer component here */}
        </div>
    );
};

export default CustomerLayout;
