import type { NextPage } from 'next';

import styles from '../styles/pages/plans.module.css'; // Import the CSS module for the plans page

const Plans: NextPage = () => {
    return (
        <div className={styles.plansBackground}>
            <p className={styles.text}>Welcome to the Plans page. Due to the application not being accessible to the public, this page is not yet available.</p>
        </div>
    );
};

export default Plans;