import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';

export default function NavigationTracker() {
    const location = useLocation();
    const { isAuthenticated } = useAuth();

    // Log user activity when navigating to a page
    useEffect(() => {
        const pathname = location.pathname;
        
        // TODO: Implement your own navigation tracking if needed
        if (isAuthenticated) {
            // Navigation tracking can be implemented here
            console.log('User navigated to:', pathname);
        }
    }, [location, isAuthenticated]);

    return null;
}