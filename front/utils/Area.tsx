// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import Button from '../components/Button.tsx';

function createButtons(actionsOrReactions, onClicks, color) {
    return actionsOrReactions.map((actionOrReaction, index) => (
        <Button
            key={index}
            text={actionOrReaction}
            color={color}
            onClick={onClicks[index]}
        />
    ));
}

export function getProviderActions(providerName) {
    // Fetch providers from local storage
    const providers = JSON.parse(localStorage.getItem('providers'));
    // Check if providers is an array
    if (!Array.isArray(providers)) {
        console.log('Providers is not an array:', providers);
        return [];
    }
    // Find the provider
    const provider = providers.find(provider => provider.provider === providerName);
    console.log('Provider:', provider); // Debugging line
    // Return the actions of the provider
    return provider ? provider.actions.map(action => ({
        name: action.name,
        description: action.description,
        extraParams: action.extraParams
    })) : [];
}

export function getProviderReactions(providerName) {
    // Fetch providers from local storage
    const providers = JSON.parse(localStorage.getItem('providers'));
    // Check if providers is an array
    if (!Array.isArray(providers)) {
        console.log('Providers is not an array:', providers);
        return [];
    }
    // Find the provider
    const provider = providers.find(provider => provider.provider === providerName);
    // Return the reactions of the provider
    return provider ? provider.reactions.map(reaction => ({
        name: reaction.name,
        description: reaction.description,
        extraParams: reaction.extraParams
    })) : [];
}