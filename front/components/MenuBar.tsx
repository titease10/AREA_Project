import styles from '../styles/MenuBar.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../contexts/AuthContext'; // Import the AuthContext
import Link from 'next/link'; // Import Link from next/link
type MenuBarProps = {
    isLoggedIn: boolean;
    buttonsLoggedIn: Array<{ name: string; link: string; special?: boolean }>;
    toggleMenu: () => void;
    isMenuOpen: boolean;
};
const MenuBar = ({ isLoggedIn, buttonsLoggedIn, toggleMenu, isMenuOpen }: MenuBarProps) => {
    const { handleLogout } = useAuth(); // Get handleLogout from the AuthContext

    const menuButtons = [
        { name: 'New Area', action: () => {}, link: '/create' },
        { name: 'My Areas', action: () => {}, link: '/myareas' },
        { name: 'Help', action: () => {}, link: '/help' },
        { name: 'Logout', action: handleLogout, link: '/logout' },
    ];

    return (
        <>
            <div className={`${styles.overlay} ${isMenuOpen ? styles.overlayOpen : ''}`} onClick={toggleMenu}></div>
            <div className={isMenuOpen ? styles.menuOpen : styles.menuClose}>
                <FontAwesomeIcon icon={faTimes} onClick={toggleMenu} className={styles.closeIcon} />
                {menuButtons.map((button, index) => (
                    <Link href={button.link} key={index}>
                        <button onClick={button.action} className={styles.button}>
                            {button.name}
                        </button>
                    </Link>
                ))}
            </div>
        </>
    );
};

export default MenuBar;