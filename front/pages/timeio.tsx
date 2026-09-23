import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClock } from '@fortawesome/free-solid-svg-icons'; // Replace with the appropriate icon for TimeIO
import { getProviderActions, getProviderReactions } from '../utils/Area';
import styles from '../styles/pages/provider.pages.module.css';

type Action = {
    name: string;
    description: string;
    extraParams: string[];
};

const TimeIO = () => {
    const [timeIOActions, setTimeIOActions] = useState<Action[]>([]);
    const [timeIOReactions, setTimeIOReactions] = useState<Action[]>([]);
    const [showActionBodyIndex, setShowActionBodyIndex] = useState(null);
    const [showReactionBodyIndex, setShowReactionBodyIndex] = useState(null);

    useEffect(() => {
        setTimeIOActions(getProviderActions('timeio'));
        setTimeIOReactions(getProviderReactions('timeio'));
    }, []);

    const handleActionButtonClick = (index) => {
        setShowActionBodyIndex(showActionBodyIndex === index ? null : index);
    };

    const handleReactionButtonClick = (index) => {
        setShowReactionBodyIndex(showReactionBodyIndex === index ? null : index);
    };

    return (
        <div className={styles.body}>
            <div className={styles.container}>
                <div className={`${styles.providerBody} ${styles.timeio}`}>
                    <FontAwesomeIcon icon={faClock} size="8x" className={styles.timeioIcon}/>
                    <h1 className={styles.title}>TimeIO</h1>
                </div>
                <div className={styles.actionSection}>
                    <h1 className={styles.actionReactionTitle}>Actions</h1>
                    {timeIOActions.map((action, index) => (
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
                    {timeIOReactions.map((reaction, index) => (
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

export default TimeIO;