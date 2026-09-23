import dynamic from 'next/dynamic';
import styles from '../styles/Box.module.css';
import { useRouter } from 'next/router';

const Button = dynamic(() => import('./Button'));
const TextInput = dynamic(() => import('./TextInput'));

type TextButtonProps = {
    text: string;
    href: string;
};

type TextProps = {
    content: string;
    className?: string;
};

type ButtonProps = {
    text: string;
    onClick: () => void;
};

type TextInputProps = {
    placeholder: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    hidden?: boolean;
    position?: string;
};

type BoxElement = {
    type: 'text' | 'button' | 'textInput' | 'textButton' | 'title' | 'custom'; // Add 'title' type
    props: TextProps | ButtonProps | TextInputProps | TextButtonProps;
};

interface BoxProps {
    backgroundColor: string;
    opacity: number;
    blur: string;
    borderRadius: string;
    position: string;
    elements: BoxElement[];
    width?: string;
}

const Box: React.FC<BoxProps> = ({ backgroundColor, opacity, blur, borderRadius, position, elements, width }) => {
    const router = useRouter();

    // Set CSS variables dynamically based on props
    const boxStyle = {
        '--backgroundColor': backgroundColor,
        '--opacity': opacity,
        '--blur': blur,
        '--borderRadius': borderRadius,
        width: width,
        position,
    };

    return (
        <div className={`${styles.box} ${styles.boxWrapper}`} style={boxStyle}>
            {
                elements.map((element, index) => {
                    switch (element.type) {
                        case 'text':
                            const textProps = element.props as TextProps;
                            return <p key={index} className={styles.text}>{textProps.content}</p>
                        case 'title': // Add 'title' case
                            const titleProps = element.props as TextProps;
                            return <p key={index} className={styles.title}>{titleProps.content}</p>
                        case 'button':
                            const buttonProps = element.props as ButtonProps;
                            return <Button key={index} {...buttonProps} />;
                        case 'textInput':
                            const textInputProps = element.props as TextInputProps;
                            return <TextInput key={index} {...textInputProps}  />;
                        case 'textButton':
                            const textButtonProps = element.props as TextButtonProps;
                            return (
                                <button
                                    key={index}
                                    className={styles.textButton}
                                    onClick={() => router.push(textButtonProps.href)}
                                >
                                    {textButtonProps.text}
                                </button>
                            );
                        case 'custom': // Handle the custom type
                            return element.props.content;
                        default:
                            return null;
                    }
                })
            }
        </div>
    );
};


export default Box;