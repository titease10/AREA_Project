import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpotify } from '@fortawesome/free-brands-svg-icons';
import { getProviderActions, getProviderReactions } from '../utils/Area'; // Import the functions
import styles from '../styles/pages/provider.pages.module.css';

type Action = {
    name: string;
    description: string;
    extraParams: string[];
};

const Spotify = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [spotifyActions, setSpotifyActions] = useState<Action[]>([]);
    const [spotifyReactions, setSpotifyReactions] = useState<Action[]>([]);
    const [isConnected, setIsConnected] = useState(false);
    const [showActionBodyIndex, setShowActionBodyIndex] = useState(null);
    const [showReactionBodyIndex, setShowReactionBodyIndex] = useState(null);

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');
        if (token) {
            localStorage.setItem('spotify_token', token);
            setIsLoggedIn(true);
        }

        // Additional check for existing token
        const storedToken = localStorage.getItem('spotify_token');
        setIsLoggedIn(!!storedToken);

        // Fetch Spotify actions and reactions from local storage using the imported functions
        setSpotifyActions(getProviderActions('spotify'));
        setSpotifyReactions(getProviderReactions('spotify'));
        // Check if Spotify is in the array of publicProviders or linkedAccounts
        const publicProviders = JSON.parse(localStorage.getItem('publicProviders') || '[]');
        const linkedAccounts = JSON.parse(localStorage.getItem('linkedAccounts') || '[]');
        const isSpotifyLinked = linkedAccounts.some(account => account.provider.toLowerCase() === 'spotify');
        const isSpotifyPublic = publicProviders.some(provider => provider.provider.toLowerCase() === 'spotify');
        setIsConnected(isSpotifyLinked || isSpotifyPublic);
    }, []);

    const handleActionButtonClick = (index) => {
        console.log('Spotify actions:', spotifyActions); // Debugging line
        console.log('Spotify reactions:', spotifyReactions); // Debugging line
        setShowActionBodyIndex(showActionBodyIndex === index ? null : index);
    };

    const handleReactionButtonClick = (index) => {
        setShowReactionBodyIndex(showReactionBodyIndex === index ? null : index);
    };

    const handleLogin = () => {
        const token = localStorage.getItem('token');
        if (!token) {
            console.log('No token found. Please login first.');
            return;
        }

        const url = `${process.env.NEXT_PUBLIC_IP_HOSTER}/spotify/auth?token=${encodeURIComponent(token)}`
        const name = 'oauth';
        const specs = 'width=500,height=600';
        window.open(url, name, specs);
    };

    return (
        <div className={styles.body}>
            <div className={styles.container}>
                <div className={`${styles.providerBody} ${styles.spotify}`}>
                    <FontAwesomeIcon icon={faSpotify} size="8x" className={styles.spotifyIcon}/>
                    <h1 className={styles.title}>Spotify</h1>
                    <p className={styles.description}>
                        {isConnected ? 'Connected' : 'Connect your Spotify account to get started.'}
                    </p>
                    {!isConnected && <button className={`${styles.connectButton} ${styles.button}`}
                                             onClick={handleLogin}>Connect</button>}
                </div>
                <div className={styles.actionSection}>
                    <h1 className={styles.actionReactionTitle}>Actions</h1>
                    {spotifyActions.map((action, index) => (
                        <div style={{textAlign: 'center'}} key={index}>
                            <button className={`${styles.button}`}
                                    onClick={() => handleActionButtonClick(index)}>{action.name}</button>
                            {showActionBodyIndex === index &&
                                <div className={styles.descriptionBody}>{action.description}</div>}
                        </div>
                    ))}
                </div>
                <div className={styles.reactionSection}>
                    <h1 className={styles.actionReactionTitle}>Reactions</h1>
                    {spotifyReactions.map((reaction, index) => (
                        <div style={{textAlign: 'center'}} key={index}>
                            <button className={`${styles.button}`}
                                    onClick={() => handleReactionButtonClick(index)}>{reaction.name}</button>
                            {showReactionBodyIndex === index &&
                                <div className={styles.descriptionBody}>{reaction.description}</div>}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Spotify;