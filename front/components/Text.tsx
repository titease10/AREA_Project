// Text.tsx
import styles from '../styles/Text.module.css'; // Adjust the path as necessary

export interface TextProps {
    content: string;
    fontSize: string;
    color?: string;
    font?: string;
    bold?: boolean;
    yPos?: string;
    xPos?: string;
}

export interface ButtonProps {
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

const Text: React.FC<TextProps> = ({ content, fontSize, color, font, bold, yPos, xPos }) => {
    const textStyle = {
        fontSize,
        color,
        fontFamily: font,
        fontWeight: bold ? 'bold' : 'normal',
        alignSelf: xPos,
        marginTop: yPos,
    };

    return <p className={styles.text} style={textStyle}>{content}</p>;
};

export default Text;
