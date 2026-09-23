import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';
import styles from '../styles/pages/profile.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {faGoogle, faSpotify, faTwitter, faDiscord, faGithub, faFacebook, faMicrosoft} from '@fortawesome/free-brands-svg-icons';

const Profile = () => {
    const { isLoggedIn } = useAuth();
    const router = useRouter();
    const [userProfile, setUserProfile] = useState(null);
    const [accounts, setAccounts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const providerIcons = {
        google: { icon: faGoogle, style: styles.providerButtonGoogle },
        twitter: { icon: faTwitter, style: styles.providerButtonTwitter },
        spotify: { icon: faSpotify, style: styles.providerButtonSpotify },
        discord: { icon: faDiscord, style: styles.providerButtonDiscord },
        github: { icon: faGithub, style: styles.providerButtonGithub },
        facebook: { icon: faFacebook, style: styles.providerButtonFacebook },
        microsoft: { icon: faMicrosoft, style: styles.providerButtonMicrosoft },
    };

    useEffect(() => {
        if (!isLoggedIn) {
            router.push('/login');
        } else {
            const fetchUserProfile = async () => {
                const token = localStorage.getItem('token');
                const response = await fetch(`${process.env.NEXT_PUBLIC_IP_HOSTER}/auth/profile`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                const data = await response.json();

                setUserProfile(data);
                setIsLoading(false);
            };

            const fetchAccounts = async () => {
                const token = localStorage.getItem('token');
                const response = await fetch(`${process.env.NEXT_PUBLIC_IP_HOSTER}/auth/accounts-list`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                const data = await response.json();
                setAccounts(data);
            };

            fetchUserProfile();
            fetchAccounts();
        }
    }, [isLoggedIn, router]);

    const handleDisconnectClick = async (accountId) => {
        // Call the API to disconnect the account
        // This is just a placeholder, replace with your actual API call
        console.log(`Disconnect account ${accountId}`);
    };

    if (!isLoggedIn || isLoading) {
        return null;
    }

    return (
        <div className={styles['centeredContainer']}>
            <h1 className={styles['title']}>User Profile</h1>
            <div className={styles['profile-body']}>
                <h3 className={styles['subtitle']}>First Name:</h3>
                <p className={styles['text']}>{userProfile.firstName}</p>
                <h3 className={styles['subtitle']}>Last Name:</h3>
                <p className={styles['text']}>{userProfile.lastName}</p>
                <h3 className={styles['subtitle']}>Email:</h3>
                <p className={styles['text']}>{userProfile.email}</p>
            </div>
            <h2 className={styles['title']}>Linked Accounts</h2>
            <div className={styles['accounts-body']}>
                {accounts.map((account, index) => {
                    const providerIcon = providerIcons[account.provider];
                    if (!providerIcon) {
                        console.log(`No icon found for provider: ${account.provider}`);
                        return null;
                    }
                    return (
                        <div key={index} className={`${styles.account} ${styles.providerButton} ${providerIcon.style}`}>
                            <div className={styles['account-info']}>
                                <FontAwesomeIcon icon={providerIcon.icon} style={{width: '40px', height: 'auto'}}/>
                                <h3 className={styles['accounts-subtitle']}>{account.provider}</h3>
                            </div>
                            <button className={styles.button} onClick={() => handleDisconnectClick(account.id)}>
                                Disconnect
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default Profile;