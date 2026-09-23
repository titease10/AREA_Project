import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTwitter } from '@fortawesome/free-brands-svg-icons';
import { getProviderActions, getProviderReactions } from '../utils/Area';
import styles from '../styles/pages/provider.pages.module.css';

type Action = {
    name: string;
    description: string;
    extraParams: string[];
};

const Twitter = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [twitterActions, setTwitterActions] = useState<Action[]>([]);
    const [twitterReactions, setTwitterReactions] = useState<Action[]>([]);
    const [isConnected, setIsConnected] = useState(false);
    const [showActionBodyIndex, setShowActionBodyIndex] = useState(null);
    const [showReactionBodyIndex, setShowReactionBodyIndex] = useState(null);

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');
        if (token) {
            localStorage.setItem('twitter_token', token);
            setIsLoggedIn(true);
        }

        const storedToken = localStorage.getItem('twitter_token');
        setIsLoggedIn(!!storedToken);

        setTwitterActions(getProviderActions('twitter'));
        setTwitterReactions(getProviderReactions('twitter'));

        const publicProviders = JSON.parse(localStorage.getItem('publicProviders') || '[]');
        const linkedAccounts = JSON.parse(localStorage.getItem('linkedAccounts') || '[]');
        const isTwitterLinked = linkedAccounts.some(account => account.provider.toLowerCase() === 'twitter');
        const isTwitterPublic = publicProviders.some(provider => provider.provider.toLowerCase() === 'twitter');
        setIsConnected(isTwitterLinked || isTwitterPublic);
    }, []);

    const handleActionButtonClick = (index) => {
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

        const url = `${process.env.NEXT_PUBLIC_IP_HOSTER}/twitter/auth?token=${encodeURIComponent(token)}`;
        const name = 'oauth';
        const specs = 'width=500,height=600';
        window.open(url, name, specs);
    };

    return (
        <div className={styles.body}>
            <div className={styles.container}>
                <div className={`${styles.providerBody} ${styles.twitter}`}>
                    <FontAwesomeIcon icon={faTwitter} size="8x" className={styles.twitterIcon}/>
                    <h1 className={styles.title}>Twitter</h1>
                    <p className={styles.description}>
                        {isConnected ? 'Connected' : 'Connect your Twitter account to get started.'}
                    </p>
                    {!isConnected && <button className={`${styles.connectButton} ${styles.button}`}
                                             onClick={handleLogin}>Connect</button>}
                </div>
                <div className={styles.actionSection}>
                    <h1 className={styles.actionReactionTitle}>Actions</h1>
                    {twitterActions.map((action, index) => (
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
                    {twitterReactions.map((reaction, index) => (
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

export default Twitter;