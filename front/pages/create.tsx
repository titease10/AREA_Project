// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import React, { useState, useEffect } from 'react';
import styles from '../styles/pages/create.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {faGoogle, faSpotify, faTwitter, faDiscord, faGithub, faFacebook, faMicrosoft} from '@fortawesome/free-brands-svg-icons';
import {faGamepad, faCloud, faEnvelope, faClock} from "@fortawesome/free-solid-svg-icons";
import { Action } from './actions';

const Create = () => {
    const [selectedActionProvider, setSelectedActionProvider] = useState<string | null>(null);
    const [selectedReactionProvider, setSelectedReactionProvider] = useState<string | null>(null);
    const [selectedAction, setSelectedAction] = useState<Action | null>(null);
    const [selectedReaction, setSelectedReaction] = useState<Action | null>(null);
    const [isActionSelected, setIsActionSelected] = useState(false);
    const [isReactionSelected, setIsReactionSelected] = useState(false);
    const [actionExtraParams, setActionExtraParams] = useState({});
    const [reactionExtraParams, setReactionExtraParams] = useState({});

    const openProviders = (queryType: string) => {
        window.open(`/providers?query=${queryType}`, 'Providers', 'width=850,height=900');
    };

    useEffect(() => {
        if (typeof window !== 'undefined') {
            window.handleSelectedAction = (provider: string, action: Action) => {
                console.log('Selected Action:', action); // Log the selected action
                setSelectedActionProvider(provider);
                setSelectedAction(action);
                setIsActionSelected(true);
                setActionExtraParams(action.extraParams); // Set the action extra parameters
            };
            window.handleSelectedReaction = (provider: string, reaction: Action) => {
                setSelectedReactionProvider(provider);
                setSelectedReaction(reaction);
                setIsReactionSelected(true);
                setReactionExtraParams(reaction.extraParams); // Set the reaction extra parameters
            };
        }
    }, []);

    const getProviderIcon = (provider: string) => {
        switch (provider) {
            case 'google':
                return faGoogle;
            case 'twitter':
                return faTwitter;
            case 'spotify':
                return faSpotify;
            case 'discord':
                return faDiscord;
            case 'github':
                return faGithub;
            case 'facebook':
                return faFacebook;
            case 'microsoft':
                return faMicrosoft;
            case 'openweathermap':
                return faCloud;
            case 'leagueoflegends':
                return faGamepad;
            case 'mailgun':
                return faEnvelope;
            case 'timeio':
                return faClock;
            case 'airQuality':
                return faCloud;
            default:
                return null;
        }
    };

    const processNestedExtraParams = (params) => {
        return params.reduce((acc, param) => {
            // Check if there are nested extraParams
            if (param.extraParams && Array.isArray(param.extraParams)) {
                // Create a new object with the param name as key and an object with extraParams
                acc[param.name] = {
                    [param.id || param.value]: processNestedExtraParams(param.extraParams)
                };
                console.log('Param:', param);
            } else {

                // For parameters without nested extraParams
                acc[param.name] = param.id || param.value;
            }
            console.log('Acc:', acc);
            return acc;
        }, {});
    };

    const createArea = async () => {
        const transformedActionExtraParams = processNestedExtraParams(actionExtraParams);
        const transformedReactionExtraParams = processNestedExtraParams(reactionExtraParams);

        const configuration = {
            actionProvider: selectedActionProvider,
            action: selectedAction?.name,
            actionParams: transformedActionExtraParams,
            reactionProvider: selectedReactionProvider,
            reaction: selectedReaction?.name,
            reactionParams: transformedReactionExtraParams,
        };

        console.log('Configuration:', configuration); // Log the entire configuration

        const token = localStorage.getItem('token');

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_IP_HOSTER}/serviceManager/save-action-reaction`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(configuration)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('Area Created Successfully:', data);
            alert('New area created');
        } catch (error) {
            console.error('Error creating area:', error);
            alert('Error creating area');
        }
    };

    return (
    <div className={styles.body}>
        <div className={styles.container}>
                <h1 className={styles.title}>Create</h1>
                <button className={styles.largeButton} onClick={() => openProviders('action')}>
                    {selectedActionProvider &&
                        <FontAwesomeIcon className="icon" icon={getProviderIcon(selectedActionProvider)} style={{width: '40px', height: 'auto'}}/>}
                    {selectedAction ? selectedAction.name : 'Action'}
                </button>
            {selectedAction && selectedAction.extraParams.length > 0 && (
                <div className={styles.extraParams}>
                    {selectedAction.extraParams.map((param, index) => (
                        <div key={index}>
                            <strong>{param.name}: </strong>{param.value}
                        </div>
                    ))}
                </div>
            )}
            <button className={styles.largeButton} onClick={() => openProviders('reaction')}>
                {selectedReactionProvider &&
                    <FontAwesomeIcon className="icon" icon={getProviderIcon(selectedReactionProvider)} style={{width: '40px', height: 'auto'}}/>}
                {selectedReaction ? selectedReaction.name : 'Reaction'}
            </button>
            {selectedReaction && selectedReaction.extraParams.length > 0 && (
                <div className={styles.extraParams}>
                    {selectedReaction.extraParams.map((param, index) => (
                        <div key={index}>
                            <strong>{param.name}: </strong>{param.value}
                            {param.extraParams && param.extraParams.length > 0 && (
                                <div style={{marginLeft: '20px'}}>
                                    {param.extraParams.map((extraParam, extraParamIndex) => (
                                        <div key={extraParamIndex}>
                                            <strong>{extraParam.name}: </strong>{extraParam.value}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
                {isActionSelected && isReactionSelected && (
                    <>
                        <button
                            className={`${styles.largeButton}`}
                            onClick={createArea}
                        >
                            Confirm
                        </button>
                </>
            )}
        </div>
    </div>
    );
};

export default Create;