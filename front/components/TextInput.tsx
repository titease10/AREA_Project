// front/components/TextInput.tsx
import styles from '../styles/TextInput.module.css'; // Adjust the path as necessary

interface TextInputProps {
    placeholder: string;
    value: string;
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    hidden?: boolean;
    fontSize?: string; // Add this line
    backgroundColor?: string; // Add this line
}

const TextInput: React.FC<TextInputProps> = ({ placeholder, value, onChange, hidden, fontSize, backgroundColor }) => {
    return (
        <input
            type={hidden ? "password" : "text"}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            className={styles.textInput}
            style={{ fontSize: fontSize, backgroundColor: backgroundColor }} // Add this line
        />
    );
};

export default TextInput;
