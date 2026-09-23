export interface ExtraParam {
    name: string; // Name of the parameter
    type: 'select' | 'text' | 'input' | 'query'; // Type of the parameter
    url?: string; // Optional URL for fetching data (used for select type)
    // You can add more fields as needed (e.g., validation rules, placeholder text)
}