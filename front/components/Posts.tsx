// front/components/Post.tsx
import styles from '../styles/Post.module.css';
import Button from './Button';
import { TextProps, ButtonProps } from './Text';

interface PostProps {
    background?: string;
    backgroundColor: string;
    images?: string[];
    text: TextProps[];
    buttons?: ButtonProps[];
    borderRadius?: string;
    minHeight?: string;
    maxWidth?: string;
    buttonOnClick?: () => void;
}

const Post: React.FC<PostProps> = ({ background, backgroundColor, images, text, buttons, borderRadius, minHeight, maxWidth, buttonOnClick }) => {
    const backgroundStyle = {
        backgroundColor: backgroundColor || 'white',
        backgroundImage: background ? `url(${background})` : 'none',
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'auto',
        backgroundPosition: 'center',
        borderRadius: borderRadius || '0px',
        maxWidth: maxWidth || '100%',
        width: '100%', // Add this line
    };
    const postStyle = { minHeight: minHeight || (images && images.length === 0 ? '645px' : undefined) };

    return (
        <div className={styles.post} style={{ ...backgroundStyle, ...postStyle }}>
            <div className={styles.imageContainer}>
                {images && images.map((image, index) => (
                    <img key={index} src={image} alt="Post" className={styles.image} />
                ))}
            </div>
            <div className={styles.textContainer} style={{ justifyContent: text[0]?.xPos || 'center' }}>
                {text.map((textItem, index) => (
                    <p key={index} style={{ fontSize: textItem.fontSize, color: textItem.color || 'black', fontFamily: textItem.font || 'Arial', fontWeight: textItem.bold ? 'bold' : 'normal', alignSelf: 'center', marginTop: textItem.yPos || '0px' }}>{textItem.content}</p>
                ))}
            </div>
            <div className={styles.buttonContainer} style={{ justifyContent: buttons && buttons[0]?.xPos || 'center' }}>
                {buttons && buttons.map((button, index) => (
                    <Button key={index} {...button} onClick={buttonOnClick} />
                ))}
            </div>
        </div>
    );
};

export default Post;