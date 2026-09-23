// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { useState } from 'react';
import axios from 'axios';
import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import Box from '../components/Box';
import { useAuth } from '../contexts/AuthContext';

import styles from '../styles/pages/login.module.css';


const Login: NextPage = () => {
    const { setIsLoggedIn } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const router = useRouter();

    const handleLogin = async () => {
        try {
            const response = await axios.post(`${process.env.NEXT_PUBLIC_IP_HOSTER}/auth/signIn`, {
                email,
                password,
            });
            localStorage.setItem('token', response.data.access_token);
            setIsLoggedIn(true);
            router.push('/explore');
        } catch (error) {
            if (axios.isAxiosError(error) && error.response) {
                setError(error.response.data.message || 'Login failed');
            } else {
                console.error(error);
            }
        }
    };
    const changeToRegister = () => {
        router.push('/register');
    }

    return (
        <div className={styles.loginBackground}>
            <Box
                elements={[
                    { type: 'title', props: { content: 'Login', className: styles.bigText } },
                    { type: 'text', props: { content: 'email:' } },
                    { type: 'textInput', props: { placeholder: 'email@example.com', value: email, onChange: (e) => setEmail(e.target.value) } },
                    { type: 'text', props: { content: 'password:' } },
                    { type: 'textInput', props: { placeholder: '********', value: password, onChange: (e) => setPassword(e.target.value), hidden: true } },
                    { type: 'button', props: { text: 'Connect', onClick: handleLogin } },
                    { type: 'button', props: { text: 'New here? Create an account!', onClick: changeToRegister } },
                ]}
                width='300px'
            />
        </div>
    );
};

export default Login;