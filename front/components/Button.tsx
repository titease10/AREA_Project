// Button.tsx
import React from 'react';
import styles from '../styles/Button.module.css';

interface ButtonProps {
    text: string;
    color?: string;
    yPos?: string;
    xPos?: string;
    bgImage?: string;
    size?: string;
    onClick?: () => void;
    fontSize?: string;
    width?: string;
}

const Button: React.FC<ButtonProps> = ({ text, color, yPos, xPos, bgImage, size, onClick, fontSize, width }) => {
    const buttonStyle = bgImage ? `${styles.button} ${styles.buttonWithImage}` : styles.button;
    // @ts-ignore
    return (
        <button
            className={buttonStyle}
            onClick={onClick}
        >
            <span className={styles.buttonText} style={{ color, fontSize, width }}>{text}</span>
        </button>
    );
};

export default Button;