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
    extraParams?: ExtraParam[];
}

interface Reaction {
    name: string;
    extraParams: ExtraParam[];
}

const Reactions = () => {
    const router = useRouter();
    const [reactions, setReactions] = useState<Reaction[]>([]);
    const [activeButtonIndex, setActiveButtonIndex] = useState<number | null>(null);
    const [selectedExtraParam, setSelectedExtraParam] = useState<Record<string, string>>({});
    const [confirmButtonVisible, setConfirmButtonVisible] = useState(false);
    const [selectOptions, setSelectOptions] = useState({});
    const [queryProviders, setQueryProviders] = useState([]);
    const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
    const [selectedQuery, setSelectedQuery] = useState<Record<string, string>>({});
    const [selectedQueryId, setSelectedQueryId] = useState<string | null>(null);
    const [queryExtraParams, setQueryExtraParams] = useState({});
    const [selectedQueryProvider, setSelectedQueryProvider] = useState(null);
    const [querySelectOptions, setQuerySelectOptions] = useState({});
    const [selectedQueryExtraParams, setSelectedQueryExtraParams] = useState<ExtraParam[]>([]); // New state to hold the extra parameters of the selected query
    const [loadingSelectOptions, setLoadingSelectOptions] = useState<Record<string, boolean>>({});

    useEffect(() => {
        if (activeButtonIndex === null) {
            setConfirmButtonVisible(false);
            return;
        }

        const selectedReaction = reactions[activeButtonIndex];
        if (!selectedReaction) {
            setConfirmButtonVisible(false);
            return;
        }

        const allExtraParamsNotEmpty = selectedReaction.extraParams.every(param => {
            // For non-query types, check if they are not empty
            if (param.type !== 'query') {
                return selectedExtraParam[param.name] !== undefined && selectedExtraParam[param.name] !== '';
            }
            // For query types, only check if a query is selected
            return selectedQuery && selectedQuery.name !== undefined && selectedQuery.name !== '';
        });

        setConfirmButtonVisible(allExtraParamsNotEmpty);
    }, [activeButtonIndex, selectedExtraParam, selectedQuery, reactions]);


    useEffect(() => {
        if (!router.isReady) return;

        const { provider } = router.query;

        const storedProviders = localStorage.getItem('providers');

        if (storedProviders) {
            const providers = JSON.parse(storedProviders);
            const selectedProvider = providers.find((p: Provider) => p.provider === provider);


            if (selectedProvider && Array.isArray(selectedProvider.reactions)) {
                setReactions(selectedProvider.reactions);

                for (const reaction of selectedProvider.reactions) {
                    for (const field of reaction.extraParams) {
                        if (field.type === 'select' && field.url) {
                            fetchSelectOptions(field, setSelectOptions);
                        }
                    }
                }
            }
            const providersWithQueries = providers.filter((p: Provider) => p.queries && p.queries.length > 0);
            setQueryProviders(providersWithQueries);
        }
    }, [router.isReady, router.query]);

    useEffect(() => {
        if (selectedQuery && selectedQuery.extraParams) {
            const updatedExtraParams = selectedQuery.extraParams.map(param => {
                if (param.type === 'select' || param.type === 'input') {
                    return {
                        ...param,
                        value: selectedExtraParam[param.name]?.name || param.value,
                        id: selectedExtraParam[param.name]?.id
                    };
                } else if (param.type === 'query') {
                    const selectedQueryExtraParam = selectedQueryExtraParams.find(queryParam => queryParam.name === param.name);
                    return {
                        ...param,
                        name: selectedQueryExtraParam?.name || param.name,
                        value: selectedQuery?.name || selectedQueryExtraParam?.value,
                        id: selectedQueryExtraParam?.id,
                        extraParams: selectedQueryExtraParam?.extraParams
                    };
                }
                return param;
            });
            setSelectedQuery(prevQuery => ({ ...prevQuery, extraParams: updatedExtraParams }));
        }
    }, [selectedExtraParam, selectedQueryExtraParams]);

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

    const renderInputField = (extraParam: ExtraParam, index: number) => (
        <React.Fragment key={index}>
            <p>{extraParam.name}</p>
            <input
                type="text"
                value={selectedExtraParam && selectedExtraParam[extraParam.name] ? selectedExtraParam[extraParam.name].name : ''}
                onChange={(e) => setSelectedExtraParam(prev => ({...prev, [extraParam.name]: {name: e.target.value, id: null}}))}
                style={{color: 'black'}}
            />
        </React.Fragment>
    );

    const renderSelectField = (extraParam: ExtraParam, index: number, queryParam?: ExtraParam) => (
        <React.Fragment key={index}>
            <p>{extraParam.name}</p>
            {loadingSelectOptions[extraParam.name] ? (
                <div>Loading...</div>
            ) : (
                <select
                    onChange={(e) => {
                        const selectedValue = JSON.parse(e.target.value);
                        if (queryParam) {
                            // Update for query parameters
                            setSelectedExtraParam(prev => ({
                                ...prev,
                                [queryParam.name]: selectedValue
                            }));
                        } else {
                            // Update for normal parameters
                            setSelectedExtraParam(prev => ({
                                ...prev,
                                [extraParam.name]: selectedValue
                            }));
                        }
                    }}
                >
                    <option value="">Select a value</option>
                    {selectOptions[extraParam.name]?.items?.map((option, optionIndex) => (
                        <option key={optionIndex} value={JSON.stringify(option)}>
                            {option.name}
                        </option>
                    ))}
                </select>
            )}
        </React.Fragment>
    );

    const handleQueryProviderSelect = (provider) => {
        console.log('Selected Query Provider:', provider);
        setSelectedQueryProvider(provider);
        const providerObj = queryProviders.find(p => p.provider === provider);
        const queries = providerObj?.queries || [];
        console.log('Queries for selected provider:', queries); // Added console log
        setQueryExtraParams(queries.length > 0 ? queries[0].extraParams : {});
        setSelectedQuery(queries.length > 0 ? queries[0].name : null);
    };

    const handleQuerySelect = async (queryName: string) => {
        console.log('Selected Query Name:', queryName);
        const queryObj = queryProviders
            .find(p => p.provider === selectedQueryProvider)
            .queries.find(q => q.name === queryName);
        console.log('Selected Query Object:', queryObj);
        setSelectedQuery(queryObj);
        setQueryExtraParams(queryObj?.extraParams || []);
        setSelectedQueryExtraParams(queryObj?.extraParams || []); // Set the extra parameters of the selected query
        for (const field of queryObj?.extraParams || []) {
            if (field.type === 'select' && field.url) {
                console.log('Fetching select options for field:', field.name);
                await fetchSelectOptions(field, setQuerySelectOptions);
            }
        }
    };

    const renderQueryProviderDropdown = () => (
        <>
            <p>Select a Query Provider</p>
            <select onChange={(e) => handleQueryProviderSelect(e.target.value)} value={selectedQueryProvider || ''}>
                <option value="">Select a Query Provider</option>
                {queryProviders.filter(p => p.queries && p.queries.length > 0).map((provider, index) => (
                    <option key={index} value={provider.provider}>
                        {provider.provider}
                    </option>
                ))}
            </select>
        </>
    );

    const renderQueriesDropdown = () => {
        const queries = queryProviders.find(p => p.provider === selectedQueryProvider)?.queries || [];
        return (
            <>
                <p>Select a Query</p>
                <select onChange={(e) => handleQuerySelect(e.target.value)} value={selectedQuery?.name || ''}>
                    <option value="">Select a Query</option>
                    {queries.map((query, index) => (
                        <option key={index} value={query.name}>
                            {query.name}
                        </option>
                    ))}
                </select>
            </>
        );
    };

    const renderQueryExtraParams = () => (
        selectedQueryExtraParams.map((extraParam, index) => {
            switch (extraParam.type) {
                case 'select':
                    return <React.Fragment key={`queryExtraParam-select-${index}`}>{renderSelectField(extraParam, index, extraParam)}</React.Fragment>;
                default:
                    return <React.Fragment key={`queryExtraParam-default-${index}`}>{renderInputField(extraParam, index)}</React.Fragment>;
            }
        })
    );


    const renderExtraParams = (extraParams: ExtraParam[]) => (
        extraParams.map((extraParam, index) => {
            switch (extraParam.type) {
                case 'select':
                    return <React.Fragment key={`extraParam-select-${index}`}>{renderSelectField(extraParam, index)}</React.Fragment>;
                case 'query':
                    return (
                        <React.Fragment key={`extraParam-query-${index}`}>
                            {renderQueryProviderDropdown()}
                            {selectedQueryProvider && renderQueriesDropdown()}
                            {selectedQueryExtraParams.length > 0 && renderQueryExtraParams()} {/* Render the extra parameters of the selected query */}
                        </React.Fragment>
                    );
                default:
                    return <React.Fragment key={`extraParam-default-${index}`}>{renderInputField(extraParam, index)}</React.Fragment>;
            }
        })
    );

    return (
        <div className={styles.body}>
            <div className={styles.providersContainer}>
                <h1 className={styles.providersTitle}>Reactions</h1>
                {reactions.map((reaction: Reaction, index: number) => (
                    <div key={`reaction-${index}`}>
                        <button
                            className={activeButtonIndex === index ? styles.providerButtonSelected : styles.providerButton}
                            onClick={() => setActiveButtonIndex(index)}
                        >
                            {reaction.name}
                        </button>
                        {reaction.extraParams && reaction.extraParams.length > 0 && activeButtonIndex === index && renderExtraParams(reaction.extraParams)}
                    </div>
                ))}
                {confirmButtonVisible && (
                    <button
                        className={styles.providerButton}
                        onClick={() => {
                            // Aggregate the data from different states here
                            // Make sure all the necessary data from selectedExtraParam and selectedQuery is included

                            const selectedReaction = {
                                ...reactions[activeButtonIndex],
                                extraParams: reactions[activeButtonIndex].extraParams.map(param => {
                                    if (param.type === 'query') {
                                        const selectedQueryExtraParam = selectedQueryExtraParams.find(queryParam => queryParam.name === param.name);
                                        return {
                                            ...param,
                                            name: selectedQueryExtraParam?.name || param.name,
                                            value: selectedQuery?.name,
                                            id: selectedQueryExtraParam?.id,
                                            extraParams: selectedQuery?.extraParams
                                        };
                                    }
                                    return {
                                        ...param,
                                        value: selectedExtraParam[param.name]?.name || param.value,
                                        id: selectedExtraParam[param.name]?.id
                                    };
                                })
                            };

                            window.opener.handleSelectedReaction(router.query.provider, selectedReaction);

                            console.log('Selected Reaction:', selectedReaction);
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

export default Reactions;