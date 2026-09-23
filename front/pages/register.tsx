// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { useState } from 'react';
import axios from 'axios';
import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import Box from '../components/Box';
import { useAuth } from '../contexts/AuthContext';
import styles from '../styles/pages/login.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGoogle } from '@fortawesome/free-brands-svg-icons';

const Register: NextPage = () => {
    const { setIsLoggedIn } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const router = useRouter();
    const handleGoogleSignUp = () => {
        const url = `${process.env.NEXT_PUBLIC_IP_HOSTER}/googleauth/auth`;
        window.location.href = url;
    };
    const handleSignUp = async () => {
        if (password !== confirmPassword) {
            alert("Passwords don't match");
            return;
        }

        if (!email || !password || !firstName || !lastName) {
            alert("All fields are required");
            return;
        }

        try {
            console.log("url hoster: ", process.env.NEXT_PUBLIC_IP_HOSTER);

            const response = await axios.post(`${process.env.NEXT_PUBLIC_IP_HOSTER}/auth/signUp`, {
                email,
                password,
                firstName,
                lastName,
            });
            console.log(response.data);
            console.log('User successfully registered');
            router.push('/login');
        } catch (error) {
            console.error(error);
        }
    };
    const changeToLogin = () => {
        router.push('/login');
    }

    const googleButtonElement = {
        type: 'custom',

        props: {
            content: (
                <button onClick={handleGoogleSignUp} className={styles.googleButton}>
                    <FontAwesomeIcon icon={faGoogle} />
                    <span> Sign up with Google</span>
                </button>
            )
        }
    };

    return (
        <div className={styles.loginBackground}>
            <Box
                elements={[
                    {type: 'title', props: {content: 'Register'}},
                    {type: 'text', props: {content: 'First Name:'}},
                    {
                        type: 'textInput',
                        props: {placeholder: 'Henry', value: firstName, onChange: (e) => setFirstName(e.target.value)}
                    },
                    {type: 'text', props: {content: 'Last Name:'}},
                    {
                        type: 'textInput',
                        props: {placeholder: 'Dupont', value: lastName, onChange: (e) => setLastName(e.target.value)}
                    },
                    {type: 'text', props: {content: 'email:'}},
                    {
                        type: 'textInput',
                        props: {
                            placeholder: 'email@example.com',
                            value: email,
                            onChange: (e) => setEmail(e.target.value)
                        }
                    },
                    {type: 'text', props: {content: 'password:'}},
                    {
                        type: 'textInput',
                        props: {
                            placeholder: '********',
                            value: password,
                            onChange: (e) => setPassword(e.target.value),
                            hidden: true
                        }
                    },
                    {type: 'text', props: {content: 'confirm password:'}},
                    {
                        type: 'textInput',
                        props: {
                            placeholder: '********',
                            value: confirmPassword,
                            onChange: (e) => setConfirmPassword(e.target.value),
                            hidden: true
                        }
                    },
                    {type: 'button', props: {text: 'Sign Up', onClick: handleSignUp}},
                    googleButtonElement,
                    {type: 'button', props: {text: 'Already got an account? Log in here!', onClick: changeToLogin}}
                ]}
            />

        </div>
    );
};

export default Register;