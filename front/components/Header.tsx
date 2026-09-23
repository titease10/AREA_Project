import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import styles from '../styles/Header.module.css';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars } from '@fortawesome/free-solid-svg-icons';
import MenuBar from './MenuBar'; // Import the MenuBar component

const Header = () => {
    const { isLoggedIn, setIsLoggedIn } = useAuth();
    const [isMenuOpen, setIsMenuOpen] = useState(false); // Add this line

    const toggleMenu = () => { // Define the toggleMenu function
        setIsMenuOpen(!isMenuOpen);
    };

    const buttonsLoggedOut = [
        { name: 'Plans', link: '/plans' },
        { name: 'Log In', link: '/login' },
        { name: 'Get Started', link: '/register', special: true },
    ];

    const buttonsLoggedIn = [
        { name: 'Explore', link: '/explore' },
        { name: 'Plans', link: '/plans' },
        { name: 'Profile', link: '/profile', special: true },
    ];

    const buttons = isLoggedIn ? buttonsLoggedIn : buttonsLoggedOut;

    return (
        <header className={styles.header}>
            <Link href="/">
                <img src="/logo-no-bg.png" alt="Logo" className={styles.logo} />
            </Link>

            <div className={`${styles.navContainer}`}>
                {buttons.map((button, index) => (
                    <Link href={button.link} key={index}>
                        <span
                            className={`${styles.button} ${button.special ? styles.buttonSpecial : styles.buttonRegular}`}
                        >
                            {button.name}
                        </span>
                    </Link>
                ))}
                {isLoggedIn && (
                    <FontAwesomeIcon icon={faBars} onClick={toggleMenu} className={styles.menuIcon} />
                )}
            </div>

            <MenuBar isLoggedIn={isLoggedIn} buttonsLoggedIn={buttonsLoggedIn} toggleMenu={toggleMenu} isMenuOpen={isMenuOpen} /> {}
        </header>
    );
};

export default Header;