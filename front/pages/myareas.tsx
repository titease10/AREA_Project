import React, { useState, useEffect } from 'react';
import styles from '../styles/pages/myareas.module.css';

const MyAreas = () => {
    const [areas, setAreas] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isPaused, setIsPaused] = useState(false);

    useEffect(() => {
        const fetchAreas = async () => {
            const token = localStorage.getItem('token');
            const response = await fetch(`${process.env.NEXT_PUBLIC_IP_HOSTER}/serviceManager/getActionReactionsOfUser`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();

            // Flatten the data into a single array of actions
            const flattenedData = data.reduce((acc, curr) => {
                return [...acc, curr];
            }, []);

            setAreas(flattenedData);
            setIsLoading(false);
        };

        fetchAreas();
    }, []);

    const handlePause = async (area) => {
        // API URL
        const apiUrl = `${process.env.NEXT_PUBLIC_IP_HOSTER}/serviceManager/toggleActionReaction`;

        // Get the token
        const token = localStorage.getItem('token');

        // Call the API to toggle the area
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ actionReactionId: area.id })
        });

        if (response.ok) {
            console.log(`Area ${area.id} has been toggled.`);
        } else {
            console.error(`Failed to toggle area ${area.id}.`);
        }
    };

    const handleDestroy = async (area) => {
        // API URL
        const apiUrl = `${process.env.NEXT_PUBLIC_IP_HOSTER}/serviceManager/deleteActionReaction`;

        // Get the token
        const token = localStorage.getItem('token');

        // Call the API to delete the area
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ actionReactionId: area.id })
        });

        if (response.ok) {
            console.log(`Area ${area.id} has been destroyed.`);
            // Remove the destroyed area from the areas state
            const newAreas = areas.filter(a => a.id !== area.id);
            setAreas(newAreas);
        } else {
            console.error(`Failed to destroy area ${area.id}.`);
        }
    };

    if (isLoading) {
        return <div className={styles.body}>Loading...</div>;
    }

    return (
        <div className={styles['centeredContainer']}>
            <h1 className={styles['title']}>My Areas</h1>
            {areas.map((area, index) => (
                <div key={index} className={styles['area-body']}>
                    <div className={styles['area-section']}>
                        <h3 className={styles['subtitle']}>Action</h3>
                        <p className={styles['text']}>Provider: {area.actionProvider}</p>
                        <p className={styles['text']}>Action: {area.actionEventId}</p>
                        {area.actionParams && Object.keys(area.actionParams).length > 0 && (
                            <p className={styles['text']}>Params: {area.actionParams}</p>
                        )}
                    </div>
                    <div className={styles['area-section']}>
                        <h3 className={styles['subtitle']}>Reaction</h3>
                        <p className={styles['text']}>Provider: {area.reactionProvider}</p>
                        <p className={styles['text']}>Reaction: {area.reactionEventId}</p>
                        {area.reactionParams && Object.keys(area.reactionParams).length > 0 && (
                            <p className={styles['text']}>Params: {area.reactionParams}</p>
                        )}
                    </div>
                    <button className={styles['button']} onClick={() => handlePause(area)}>
                        {isPaused ? 'Resume' : 'Pause'}
                    </button>
                    <button className={styles['button']} onClick={() => handleDestroy(area)}>
                        Destroy
                    </button>
                </div>
            ))}
        </div>
    );
};

export default MyAreas;