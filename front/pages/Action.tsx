// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import styles from '../styles/Post.module.css';
import Header from '../styles/Header.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGoogle, faSpotify, faTwitter } from '@fortawesome/free-brands-svg-icons';
import { faPlayCircle, faDatabase } from '@fortawesome/free-solid-svg-icons';
//import setErrorMessage from '../utils/setErrorMessage';

const ActionReactionConfig = () => {
    const [providers, setProviders] = useState([]);
    const [selectedActionProvider, setSelectedActionProvider] = useState(null);
    const [selectedReactionProvider, setSelectedReactionProvider] = useState(null);
    const [actions, setActions] = useState([]);
    const [reactions, setReactions] = useState([]);
    const [selectedAction, setSelectedAction] = useState(null);
    const [selectedReaction, setSelectedReaction] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [actionExtraParams, setActionExtraParams] = useState({});
    const [reactionExtraParams, setReactionExtraParams] = useState({});
    const [actionExtraFields, setActionExtraFields] = useState([]);
    const [reactionExtraFields, setReactionExtraFields] = useState([]);
    const [selectOptions, setSelectOptions] = useState({}); // New state to hold fetched options
    const [selectedQuery, setSelectedQuery] = useState(null);
    const [queryExtraParams, setQueryExtraParams] = useState({});
    const [selectedQueryProvider, setSelectedQueryProvider] = useState(null);
    const [actionSelectOptions, setActionSelectOptions] = useState({});
    const [reactionSelectOptions, setReactionSelectOptions] = useState({});
    const [querySelectOptions, setQuerySelectOptions] = useState({});
    //add set error message


    const LogToSpotify = async () => {
        window.location.href = `${process.env.NEXT_PUBLIC_IP_HOSTER}/spotify/auth`;

    }



    useEffect(() => {
        const fetchActionsAndReactions = async () => {
            setIsLoading(true);
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_IP_HOSTER}/serviceManager/listActionReactions`);
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                setProviders(data);
                console.log('Data:', data);
            } catch (error) {
                console.error('Error fetching actions and reactions:', error);
                setError(error);
            } finally {
                setIsLoading(false);
            }
        };
        const token = localStorage.getItem('token');
        if (token) {
            console.log('token', token);
        }


        console.log('Updated Query Extra Params:', queryExtraParams);

        fetchActionsAndReactions();
    }, [queryExtraParams]); // Log the updated queryExtraParams


    const handleActionProviderSelect = (provider) => {
        setSelectedActionProvider(provider);
        setActions(providers.find(p => p.provider === provider)?.actions || []);
    };

    const handleReactionProviderSelect = (provider) => {
        setSelectedReactionProvider(provider);
        setReactions(providers.find(p => p.provider === provider)?.reactions || []);
    };



    const renderExtraFields = (extraFields, extraParams, setExtraParams, includeQueryFields = false, context) => {
        let queryFieldExists = extraFields.some(field => field.type === 'query');
        return (
            <>
                {extraFields.map(field => {
                    switch (field.type) {
                        case 'select':
                            return renderSelectField(field, extraParams, setExtraParams, context);
                        case 'input':
                            return renderInputField(field, extraParams, setExtraParams);
                    }
                })}
                {queryFieldExists && (
                    <>
                        <h2>Select Query Provider</h2>
                        {renderQueryProviderDropdown()}
                        {selectedQueryProvider && renderQueriesDropdown()}

                        {includeQueryFields && selectedQuery && (
                            <>
                                <h3>Query Extra Parameters</h3>
                                {queryExtraParams.map((field, index) => {
                                    switch (field.type) {
                                        case 'select':
                                            return renderSelectField(field, extraParams, setExtraParams, "query"); // Pass "query" as the context to renderSelectField
                                        case 'input':
                                            return renderInputField(field, extraParams, setExtraParams);
                                        default:
                                            return null;
                                    }
                                })}
                            </>
                        )}
                    </>
                )}
            </>
        );
    };

    const renderSelectField = (field, extraParams, setExtraParams, context) => {
        let options;
        switch (context) {
            case 'action':
                options = actionSelectOptions[field.name]?.items || [];
                break;
            case 'reaction':
                options = reactionSelectOptions[field.name]?.items || [];
                break;
            case 'query':
                options = querySelectOptions[field.name]?.items || [];
                break;
            default:
                options = [];
        }
        console.log(`Options for ${context} - ${field.name}:`, options); // Debugging line

        return (
            <div key={field.name}>
                <label>{field.name}: </label>
                <select
                    value={extraParams[field.name] || ''}
                    onChange={(e) => setExtraParams({ ...extraParams, [field.name]: e.target.value })}
                >
                    <option value="">Select a value</option>
                    {options.map((option, index) => (
                        <option key={index} value={option.id}>
                            {option.name}
                        </option>
                    ))}
                </select>
            </div>
        );
    };


    const handleQueryProviderSelect = (provider) => {
        setSelectedQueryProvider(provider);
        const providerObj = providers.find(p => p.provider === provider);
        // Assuming queries are in a similar format as actions and reactions
        const queries = providerObj?.queries || [];
        setQueryExtraParams(queries.length > 0 ? queries[0].extraParams : {});
        setSelectedQuery(queries.length > 0 ? queries[0].name : null);
    };


    const fetchSelectOptions = async (field, setOptions) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(field.url, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            setOptions(prevOptions => ({ ...prevOptions, [field.name]: data }));
        } catch (error) {
            console.error('Error fetching select options for field', field.name, ':', error);
        }
    };

    const handleQuerySelect = async (queryName) => {
        console.log('Query Name:', queryName);
        console.log('Selected Query Provider:', selectedQueryProvider);
        setSelectedQuery(queryName);
        const queryObj = providers
            .find(p => p.provider === selectedQueryProvider)
            .queries.find(q => q.name === queryName);
        console.log('Query Object:', queryObj);

        setQueryExtraParams(queryObj?.extraParams || []);
        console.log('Query Extra Params:', queryExtraParams);
        // Fetch options for select fields in the selected query
        for (const field of queryObj?.extraParams || []) {
            if (field.type === 'select' && field.url) {
                console.log('Fetching select options for field:', field.name);
                await fetchSelectOptions(field, setQuerySelectOptions);
            }
        }
    };

    const handleReactionSelect = async (reactionName) => {
        setSelectedReaction(reactionName);
        const reactionObj = reactions.find(r => r.name === reactionName);
        setReactionExtraFields(reactionObj?.extraParams || []);
        setReactionExtraParams({});

        for (const field of reactionObj?.extraParams || []) {
            if (field.type === 'select' && field.url) {
                await fetchSelectOptions(field, setReactionSelectOptions);
            }
        }

    };


    const handleActionSelect = async (actionName) => {
        setSelectedAction(actionName);
        const actionObj = actions.find(a => a.name === actionName);
        setActionExtraFields(actionObj?.extraParams || []);
        setActionExtraParams({});

        for (const field of actionObj?.extraParams || []) {
            if (field.type === 'select' && field.url) {
                await fetchSelectOptions(field, setActionSelectOptions);
            }
        }
    };


    const renderQueryProviderDropdown = () => (
        <select onChange={(e) => handleQueryProviderSelect(e.target.value)} value={selectedQueryProvider || ''}>
            <option value="">Select a Query Provider</option>
            {providers.filter(p => p.queries && p.queries.length > 0).map((provider, index) => (
                <option key={index} value={provider.provider}>
                    {provider.provider}
                </option>
            ))}
        </select>
    );

    const renderQueriesDropdown = () => {
        const queries = providers.find(p => p.provider === selectedQueryProvider)?.queries || [];
        console.log('Queries:', queries);
        return (
            <select onChange={(e) => handleQuerySelect(e.target.value)} value={selectedQuery || ''}>
                <option value="">Select a Query</option>
                {queries.map((query, index) => (
                    <option key={index} value={query.name}>
                        {query.name}
                    </option>
                ))}
            </select>
        );
    };


    const renderInputField = (field, extraParams, setExtraParams) => {
        return (
            <div key={field.name}>
                <label>{field.name}: </label>
                <input
                    type="text"
                    value={extraParams[field.name] || ''}
                    onChange={(e) => setExtraParams({ ...extraParams, [field.name]: e.target.value })}
                />
            </div>
        );
    };

    const renderProviderDropdown = (handleProviderSelect, selectedProvider) => (
        <select onChange={(e) => handleProviderSelect(e.target.value)} value={selectedProvider || ''}>
            <option value="">Select a Provider</option>
            {providers.map((provider, index) => (
                <option key={index} value={provider.provider}>
                    {provider.provider}
                </option>
            ))}
        </select>
    );

    const renderActionsDropdown = () => (
        <select onChange={(e) => handleActionSelect(e.target.value)} value={selectedAction || ''}>
            <option value="">Select an Action</option>
            {actions.map((action, index) => (
                <option key={index} value={action.name}>
                    {action.name}
                </option>
            ))}
        </select>
    );

    const renderReactionsDropdown = () => (
        <select onChange={(e) => handleReactionSelect(e.target.value)} value={selectedReaction || ''}>
            <option value="">Select a Reaction</option>
            {reactions.map((reaction, index) => (
                <option key={index} value={reaction.name}>
                    {reaction.name}
                </option>
            ))}
        </select>
    );



    const saveConfiguration = async () => {
        // Determine where the 'query' type parameter is (action or reaction)
        const actionHasQuery = actionExtraFields.some(field => field.type === 'query');
        const reactionHasQuery = reactionExtraFields.some(field => field.type === 'query');

        // Prepare the configuration object
        const configuration = {
            actionProvider: selectedActionProvider,
            action: selectedAction,
            actionParams: actionHasQuery ? { ...actionExtraParams, ...queryExtraParams, queryProvider: selectedQueryProvider, queryName: selectedQuery } : actionExtraParams,
            reactionProvider: selectedReactionProvider,
            reaction: selectedReaction,
            reactionParams: reactionHasQuery ? { ...reactionExtraParams, ...queryExtraParams, queryProvider: selectedQueryProvider, queryName: selectedQuery } : reactionExtraParams,
        };

        console.log('Saving Configuration:', configuration);
        const token = localStorage.getItem('token');

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_IP_HOSTER}/serviceManager/save-action-reaction`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` // Add your authorization header
                },
                body: JSON.stringify(configuration)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('Configuration Saved Successfully:', data);

            // Handle successful save (e.g., show a success message or update state)
        } catch (error) {
            console.error('Error saving configuration:', error);
            // Handle errors (e.g., show an error message)
        }
    };

    if (isLoading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;
    return (
        <div>
            <h2>Select Action Provider</h2>
            {renderProviderDropdown(handleActionProviderSelect, selectedActionProvider)}
            {selectedActionProvider && renderActionsDropdown()}
            {selectedAction && renderExtraFields(actionExtraFields, actionExtraParams, setActionExtraParams, true, "action")}

            <h2>Select Reaction Provider</h2>
            {renderProviderDropdown(handleReactionProviderSelect, selectedReactionProvider)}
            {selectedReactionProvider && renderReactionsDropdown()}
            {selectedReaction && renderExtraFields(reactionExtraFields, reactionExtraParams, setReactionExtraParams, true, "reaction")}

            <button onClick={saveConfiguration}>Save Configuration</button>
            <button onClick={LogToSpotify}>Log to Spotify</button>
        </div>
    );

};

export default ActionReactionConfig;
