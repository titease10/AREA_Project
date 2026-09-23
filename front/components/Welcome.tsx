import React, {useState, useEffect, useRef} from 'react';
import styles from '../styles/Welcome.module.css';
import Button from './Button';

interface TextProps {
    content: string;
    fontSize?: string;
    color?: string;
    font?: string;
    bold?: boolean;
    yPos?: string;
    xPos?: string;
}

interface ButtonProps {
    text: string;
    color?: string;
    yPos?: string;
    xPos?: string;
    fontSize?: string;
    onClick?: () => void;
}

interface PostProps {
    backgroundColor: string;
    text: TextProps[];
    buttons?: ButtonProps[];
    buttonOnClick?: () => void;
}

const Post: React.FC<PostProps> = ({backgroundColor, text, buttons, buttonOnClick}) => {
    return (
        <div className={`${styles.post}`} style={{backgroundColor}}>
            <div className={styles.bg_circle}></div>
            <div className={`${styles.textContainer}`} style={{justifyContent: text[0]?.xPos || 'center'}}>
                {text.map((textItem, index) => (
                    <p
                        key={index}
                        style={{
                            fontSize: textItem.fontSize,
                            color: textItem.color || '#fcfcfc',
                            fontFamily: textItem.font || 'Arial',
                            fontWeight: textItem.bold ? 'bold' : 'normal',
                            alignSelf: 'center',
                            marginTop: textItem.yPos || '0px',
                        }}
                    >
                        {textItem.content}
                    </p>
                ))}
            </div>
            <div className={`${styles.buttonContainer}`}
                 style={{justifyContent: buttons && buttons[0]?.xPos || 'center'}}>
                {buttons &&
                    buttons.map((button, index) => (
                        <Button
                            key={index}
                            text={button.text}
                            color={button.color}
                            fontSize={button.fontSize}
                            onClick={buttonOnClick}
                        />
                    ))}
            </div>
        </div>
    );
};

export default Post;