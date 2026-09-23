// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import styles from '../styles/pages/providers.module.css';

interface ExtraParam {
    name: string;
    type: string;
    value?: string;
    url?: string;
}

export interface Action {
    name: string;
    description: string;
    extraParams: ExtraParam[];
}

const Actions = () => {
    const router = useRouter();
    const [actions, setActions] = useState<Action[]>([]);
    const [activeButtonIndex, setActiveButtonIndex] = useState<number | null>(null);
    const [selectedExtraParam, setSelectedExtraParam] = useState<Record<string, string>>({});
    const [confirmButtonVisible, setConfirmButtonVisible] = useState(false);
    const [selectOptions, setSelectOptions] = useState<Record<string, string[]>>({});
    const [loadingSelectOptions, setLoadingSelectOptions] = useState<Record<string, boolean>>({});

    useEffect(() => {
        if (activeButtonIndex === null) {
            setConfirmButtonVisible(false);
        } else {
            const selectedAction = actions[activeButtonIndex];
            if (!selectedAction) {
                setConfirmButtonVisible(false);
            } else if (selectedAction.extraParams.length === 0) {
                setConfirmButtonVisible(true);
            } else {
                // Check if all extra parameters are not empty
                const allExtraParamsNotEmpty = selectedAction.extraParams.every(param => selectedExtraParam[param.name] !== undefined && selectedExtraParam[param.name] !== '');
                setConfirmButtonVisible(allExtraParamsNotEmpty);
            }
        }
    }, [activeButtonIndex, selectedExtraParam]);

    useEffect(() => {
        if (!router.isReady) return;

        const { provider } = router.query;

        const storedProviders = localStorage.getItem('providers');

        if (storedProviders) {
            const providers = JSON.parse(storedProviders);
            const selectedProvider = providers.find((p: string) => p.provider === provider);

            if (selectedProvider && Array.isArray(selectedProvider.actions)) {
                setActions(selectedProvider.actions);

                // Fetch options for select fields in the actions
                for (const action of selectedProvider.actions) {
                    for (const field of action.extraParams) {
                        if (field.type === 'select' && field.url) {
                            fetchSelectOptions(field, setSelectOptions);
                        }
                    }
                }
            }
        }
    }, [router.isReady, router.query]);

    const fetchSelectOptions = async (field: ExtraParam) => {
        console.log('Fetching select options for field', field.name, 'from URL', field.url);
        setLoadingSelectOptions(prev => ({ ...prev, [field.name]: true }));
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(field.url, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            console.log('Fetched select options for field', field.name, ':', data);
            setSelectOptions(prevOptions => ({ ...prevOptions, [field.name]: data }));
        } catch (error) {
            console.error('Error fetching select options for field', field.name, ':', error);
        } finally {
            setLoadingSelectOptions(prev => ({ ...prev, [field.name]: false }));
        }
    };

    useEffect(() => {
        console.log('Updated selectOptions:', selectOptions);
    }, [selectOptions]);

    const renderExtraParamsDropdown = (extraParams: ExtraParam[]) => (
        extraParams.map((extraParam, index) => {
            console.log('Options for', extraParam.name, ':', selectOptions[extraParam.name]);
            return (
                <React.Fragment key={index}>
                    <p>{extraParam.name}</p>
                    {extraParam.type === 'select' ? (
                        loadingSelectOptions[extraParam.name] ? (
                            <div>Loading...</div>
                        ) : (
                            <>
                                {console.log('Rendering options for', extraParam.name, ':', selectOptions[extraParam.name])}
                                <select onChange={(e) => setSelectedExtraParam(prev => ({
                                    ...prev,
                                    [extraParam.name]: JSON.parse(e.target.value)
                                }))}>
                                    <option value="">Select a value</option>
                                    {selectOptions[extraParam.name] && Array.isArray(selectOptions[extraParam.name].items) && selectOptions[extraParam.name].items.map((option, optionIndex) => {
                                        console.log('Rendering option for', extraParam.name, ':', option);
                                        return (
                                            <option key={optionIndex} value={JSON.stringify({id: option.id, name: option.name})}>
                                                {option.name}
                                            </option>
                                        );
                                    })}
                                </select>
                            </>
                        )
                    ) : (
                        <input
                            type="text"
                            value={selectedExtraParam[extraParam.name]?.name || ''}
                            onChange={(e) => setSelectedExtraParam(prev => ({
                                ...prev,
                                [extraParam.name]: {id: prev[extraParam.name]?.id, name: e.target.value}
                            }))}
                            style={{color: 'black'}}
                        />
                    )}
                </React.Fragment>
            );
        })
    );


    return (
        <div className={styles.body}>
            <div className={styles.providersContainer}>
                <h1 className={styles.providersTitle}>Actions</h1>
                {actions.map((action: Action, index: number) => (
                    <div key={index}>
                        <button
                            className={activeButtonIndex === index ? styles.providerButtonSelected : styles.providerButton}
                            onClick={() => setActiveButtonIndex(index)}
                        >
                            {action.name}
                        </button>
                        {action.extraParams && action.extraParams.length > 0 && activeButtonIndex === index && renderExtraParamsDropdown(action.extraParams)}
                    </div>
                ))}
                {confirmButtonVisible && (
                    <button
                        className={styles.providerButton}
                        onClick={() => {
                            // Create a new object that includes the selected action and the selected extra parameters
                            const selectedAction = {
                                ...actions[activeButtonIndex],
                                extraParams: actions[activeButtonIndex].extraParams.map(param => ({
                                    ...param,
                                    value: selectedExtraParam[param.name]?.name || param.value,
                                    id: selectedExtraParam[param.name]?.id
                                }))
                            };

                            // Call the function of the parent window with the selected action
                            window.opener.handleSelectedAction(router.query.provider, selectedAction);

                            // Comment out the line that closes the window
                            window.close();
                        }}
                    >
                        Confirm
                    </button>
                )}
            </div>
        </div>
    );
};

export default Actions;