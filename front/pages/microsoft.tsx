import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMicrosoft } from '@fortawesome/free-brands-svg-icons';
import { getProviderActions, getProviderReactions } from '../utils/Area';
import styles from '../styles/pages/provider.pages.module.css';

type Action = {
    name: string;
    description: string;
    extraParams: string[];
};

const Microsoft = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [microsoftActions, setMicrosoftActions] = useState<Action[]>([]);
    const [microsoftReactions, setMicrosoftReactions] = useState<Action[]>([]);
    const [isConnected, setIsConnected] = useState(false);
    const [showActionBodyIndex, setShowActionBodyIndex] = useState(null);
    const [showReactionBodyIndex, setShowReactionBodyIndex] = useState(null);

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');
        if (token) {
            localStorage.setItem('microsoft_token', token);
            setIsLoggedIn(true);
        }

        const storedToken = localStorage.getItem('microsoft_token');
        setIsLoggedIn(!!storedToken);

        setMicrosoftActions(getProviderActions('microsoft'));
        setMicrosoftReactions(getProviderReactions('microsoft'));

        const publicProviders = JSON.parse(localStorage.getItem('publicProviders') || '[]');
        const linkedAccounts = JSON.parse(localStorage.getItem('linkedAccounts') || '[]');
        const isMicrosoftLinked = linkedAccounts.some(account => account.provider.toLowerCase() === 'microsoft');
        const isMicrosoftPublic = publicProviders.some(provider => provider.provider.toLowerCase() === 'microsoft');
        setIsConnected(isMicrosoftLinked || isMicrosoftPublic);
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

        const url = `${process.env.NEXT_PUBLIC_IP_HOSTER}/microsoft/auth?token=${encodeURIComponent(token)}`;
        const name = 'oauth';
        const specs = 'width=500,height=600';
        window.open(url, name, specs);
    };

    return (
        <div className={styles.body}>
            <div className={styles.container}>
                <div className={`${styles.providerBody} ${styles.microsoft}`}>
                    <FontAwesomeIcon icon={faMicrosoft} size="8x" className={styles.microsoftIcon}/>
                    <h1 className={styles.title}>Microsoft</h1>
                    <p className={styles.description}>
                        {isConnected ? 'Connected' : 'Connect your Microsoft account to get started.'}
                    </p>
                    {!isConnected && <button className={`${styles.connectButton} ${styles.button}`}
                                             onClick={handleLogin}>Connect</button>}
                </div>
                <div className={styles.actionSection}>
                    <h1 className={styles.actionReactionTitle}>Actions</h1>
                    {microsoftActions.map((action, index) => (
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
                    {microsoftReactions.map((reaction, index) => (
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

export default Microsoft;