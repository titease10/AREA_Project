import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import styles from '../styles/pages/providers.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {faGoogle, faSpotify, faTwitter, faDiscord, faGithub, faFacebook, faMicrosoft} from '@fortawesome/free-brands-svg-icons';
import { faCloud, faEnvelope, faGamepad, faClock } from '@fortawesome/free-solid-svg-icons';

const Providers = () => {
    const [providers, setProviders] = useState([]);
    const router = useRouter();
    const [publicProviders, setPublicProviders] = useState([]);
    const [linkedAccounts, setLinkedAccounts] = useState([]);

    const providerIcons = {
        google: { icon: faGoogle, style: styles.providerButtonGoogle },
        twitter: { icon: faTwitter, style: styles.providerButtonTwitter },
        spotify: { icon: faSpotify, style: styles.providerButtonSpotify },
        discord: { icon: faDiscord, style: styles.providerButtonDiscord },
        github: { icon: faGithub, style: styles.providerButtonGithub },
        facebook: { icon: faFacebook, style: styles.providerButtonFacebook },
        microsoft: { icon: faMicrosoft, style: styles.providerButtonMicrosoft },
        openweathermap: { icon: faCloud, style: styles.providerButtonOpenweathermap },
        leagueoflegends: { icon: faGamepad, style: styles.providerButtonLeagueoflegends },
        mailgun: { icon: faEnvelope, style: styles.providerButtonMailgun },
        timeio: { icon: faClock, style: styles.providerButtonTimeio },
        airQuality: { icon: faCloud, style: styles.providerButtonAirQuality }
    };

    useEffect(() => {
        const storedProviders = localStorage.getItem('providers');

        if (storedProviders) {
            setProviders(JSON.parse(storedProviders));
        } else {
            fetch(`${process.env.NEXT_PUBLIC_IP_HOSTER}/serviceManager/listActionReactions`)
                .then(response => response.json())
                .then(data => {
                    localStorage.setItem('providers', JSON.stringify(data));
                    setProviders(data);
                })
                .catch(error => console.error('Error:', error));
        }

        const publicProvidersFromStorage = JSON.parse(localStorage.getItem('publicProviders') || '[]');
        const linkedAccountsFromStorage = JSON.parse(localStorage.getItem('linkedAccounts') || '[]');

        setPublicProviders(publicProvidersFromStorage);
        setLinkedAccounts(linkedAccountsFromStorage);
    }, []);

    const handleProviderClick = (provider: string) => {
        const queryType = router.query.query;
        router.push(`/${queryType}s?provider=${provider}`);
    };

    return (
        <div className={styles.body}>
            <div className={styles.providersContainer}>
                <h1 className={styles.providersTitle}>Providers</h1>
                {providers.map((provider, index) => {
                    const providerIcon = providerIcons[provider.provider];
                    if (!providerIcon) {
                        console.log(`No icon found for provider: ${provider.provider}`);
                        return null;
                    }
                    if (router.query.query === 'action' && !provider.actions.length) {
                        return null;
                    }
                    if (router.query.query === 'reaction' && !provider.reactions.length) {
                        return null;
                    }
                    const isProviderLinked = linkedAccounts.some(account => account.provider.toLowerCase() === provider.provider);
                    const isProviderPublic = publicProviders.some(publicProvider => publicProvider.provider.toLowerCase() === provider.provider);
                    if (!isProviderLinked && !isProviderPublic) {
                        return null;
                    }
                    return (
                        <button key={index} className={`${styles.providerButton} ${providerIcon.style}`} onClick={() => handleProviderClick(provider.provider)}>
                            <FontAwesomeIcon icon={providerIcon.icon} style={{width: '40px', height: 'auto'}}/> {provider.provider}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default Providers;