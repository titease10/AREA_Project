import React, { useState, useEffect } from 'react';
import type { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router'; // Import useRouter
import Post from '../components/Welcome';
import SliderComp from '../components/sliderComp';
import styles from '../styles/Welcome.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faGoogle,
    faSpotify,
    faTwitter,
    faDiscord,
    faGithub,
    faFacebook,
    faMicrosoft
}
    from '@fortawesome/free-brands-svg-icons';
import {
    faCloud,
    faEnvelope,
    faGamepad,
    faClock
}
    from '@fortawesome/free-solid-svg-icons';

const index: NextPage = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const router = useRouter(); // Instantiate the router

    useEffect(() => {
        const token = localStorage.getItem('token');
        setIsLoggedIn(!!token);
    }, []);

    const posts = [
        {
            text: [
                { content: 'Welcome to AREA.', fontSize: '35px', yPos: '250px', xPos: 'center', font: 'Roboto', bold: true },
                { content: 'Automation Platform of his Digital Life.', fontSize: '20px', yPos: '5px', xPos: 'center', font: 'Roboto', bold: true },
            ],
            buttons: [
                { text: 'Start Today', color: '#845EC2', yPos: '10px', xPos: 'center', fontSize: '22px' },
            ],
            buttonOnClick: () => router.push(isLoggedIn ? '/explore' : '/register'),

        },
    ];

    const data = [
        {
            title: "Google",
            image:
                faGoogle,
        },
        {
            title: "Spotify",
            image:
                faSpotify,
        },
        {
            title: "Twitter",
            image:
                faTwitter,
        },
        {
            title: "Discord",
            image:
                faDiscord,
        },
        {
            title: "Facebook",
            image:
                faFacebook,
        },
        {
            title: "Github",
            image:
            faGithub,
        },
        {
            title: "Weather",
            image:
            faCloud
        },

        {
            title: "Microsoft",
            image:
            faMicrosoft,
        },
        {
            title: "time",
            image:
            faClock,
        },
        {
            title: "Riot Games",
            image:
            faGamepad,
        },
        {
            title: "Mailgun",
            image:
            faEnvelope,
        },
    ];

    return (
        <>
            <Head>
                <title>AREA Project</title>
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <div className="bg-purple-500 min-h-screen barba-container">
                {posts.map((post, index) => (
                <Post key={index} {...post} />
                ))}
                <div className="slider-container"> {/* Ajoutez une classe ici pour la marge */}
                    <SliderComp
                        autoplay={true}
                        autoplaySpeed={3000}
                        slideNum={3}
                        data={data}
                        isLoggedIn={isLoggedIn}
                    />
                </div>
            </div>
        </>
    );
};

export default index;
