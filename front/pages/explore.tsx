// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import styles from '../styles/pages/explore.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faGoogle,
    faSpotify,
    faTwitter,
    faDiscord,
    faGithub,
    faFacebook,
    faMicrosoft
}
    from '@fortawesome/free-brands-svg-icons';
import {
    faCloud,
    faEnvelope,
    faGamepad,
    faClock
}
    from '@fortawesome/free-solid-svg-icons';
import TextInput from '../components/TextInput';

const Explore = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isAreaEnabled, setIsAreaEnabled] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [providers, setProviders] = useState([]);

    const providerIcons = {
        google: { icon: faGoogle, style: { backgroundColor: '#db4437' } },
        twitter: { icon: faTwitter, style: { backgroundColor: '#1da1f2' } },
        spotify: { icon: faSpotify, style: { backgroundColor: '#10be12' } },
        discord: { icon: faDiscord, style: { backgroundColor: '#7289da' } },
        github: { icon: faGithub, style: { backgroundColor: '#333' } },
        facebook: { icon: faFacebook, style: { backgroundColor: '#3b5998' } },
        microsoft: { icon: faMicrosoft, style: { backgroundColor: '#f65314' } },
        openweathermap: { icon: faCloud, style: { backgroundColor: '#f9a825' } },
        leagueoflegends: { icon: faGamepad, style: { backgroundColor: '#f9a825' } },
        mailgun: { icon: faEnvelope, style: { backgroundColor: '#EF5858' } },
        timeio: { icon: faClock, style: { backgroundColor: '#333' } },
        airQuality: { icon: faCloud, style: { backgroundColor: '#5aaf18' } },
    };

    useEffect(() => {
        const token = localStorage.getItem('token');
        setIsLoggedIn(!!token);

        const fetchProviders = async () => {
            const response = await fetch(`${process.env.NEXT_PUBLIC_IP_HOSTER}/serviceManager/listActionReactions`);
            const data = await response.json();
            if (Array.isArray(data)) {
                setProviders(data);
                localStorage.setItem('providers', JSON.stringify(data));
            } else {
                console.log('Data is not an array:', data);
            }
        };

        const fetchAccounts = async () => {
            const response = await fetch(`${process.env.NEXT_PUBLIC_IP_HOSTER}/auth/accounts-list`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            if (Array.isArray(data)) {
                localStorage.setItem('linkedAccounts', JSON.stringify(data));
            } else {
                console.log('Data is not an array:', data);
            }
        };

        fetchAccounts();
        fetchProviders();
    }, []);

    // New useEffect hook to save providers in local storage when providers state changes
    useEffect(() => {
        const publicProviders = providers.filter(provider => provider.isPublic);
        localStorage.setItem('publicProviders', JSON.stringify(publicProviders));
    }, [providers]);

    const filteredProviders = searchTerm
        ? providers.filter(provider => provider.provider && provider.provider.toLowerCase().includes(searchTerm.toLowerCase()))
        : providers;

    return (
        <>
            <Head>
                <title>Explore AREA</title>
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <div className={styles.body}>
                <div className={styles['min-h-screen']} className={styles['barba-container']} className={styles['centeredContainer']}>
                    <h1 className={styles['title']}>Explore</h1>
                    {isLoggedIn && (
                        <>
                            <TextInput
                                placeholder="Search..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                fontSize="20px"
                                backgroundColor="#222"
                            />
                            <div className={styles['provider-grid']}>
                                {filteredProviders.map(provider => {
                                    const providerIcon = providerIcons[provider.provider];
                                    if (!providerIcon) {
                                        return null;
                                    }
                                    return (
                                        <button
                                            key={provider.provider} // Add this line
                                            className={styles['button']}
                                            style={{ ...providerIcon.style }}
                                            onClick={() => window.location.href = `${process.env.NEXT_PUBLIC_FRONTEND_URL}/${provider.provider.toLowerCase()}`}
                                        >
                                            <FontAwesomeIcon className={styles['providerIcon']} icon={providerIcon.icon}/> {provider.provider}
                                        </button>
                                    );
                                })}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </>
    );
};

export default Explore;