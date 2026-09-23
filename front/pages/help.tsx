import type { NextPage } from 'next';

import styles from '../styles/pages/help.module.css'; // Import the CSS module for the help page

const Help: NextPage = () => {
    return (
        <div className={styles.helpBackground}>
            <p className={styles.text}>Welcome to the Help page. In case you encounter a problem on the website, do not hesitate to refresh the page !</p>
        </div>
    );
};

export default Help;