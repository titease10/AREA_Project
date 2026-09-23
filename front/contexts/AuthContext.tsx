import { createContext, useState, useContext, useEffect } from 'react';

interface IAuthContext {
    isLoggedIn: boolean;
    setIsLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;
    handleLogout: () => void; // Add this line
}

export const AuthContext = createContext<IAuthContext | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    const handleLogout = () => { // Move the handleLogout function here
        localStorage.removeItem('token');
        setIsLoggedIn(false);
        window.location.href = '/';
    };
    useEffect(() => {
        // Check for the token in localStorage on initial load
        const token = localStorage.getItem('token');
        if (token) {
            setIsLoggedIn(true);
        }
    }, []);

    return (
        <AuthContext.Provider value={{ isLoggedIn, setIsLoggedIn, handleLogout }}> {/* Pass handleLogout through the context */}
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};