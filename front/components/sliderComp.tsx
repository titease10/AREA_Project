import Slider from "react-slick";
// Import css files
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import styles from '../styles/Welcome.module.css';
import React, { useRef } from "react";
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import Link from 'next/link';

interface dataProps {
    title: string;
    image: string;
}
interface sliderProps {
    data: dataProps[]
    slideNum: number;
    autoplay: boolean;
    autoplaySpeed: number;
    isLoggedIn: boolean;
}
const SliderComp: React.FC<sliderProps> = ({
                               data,
                               slideNum,
                               autoplay,
                               autoplaySpeed,
                                 isLoggedIn,
                           }) => {
    const sliderRef = useRef();
    const settings = {
        arrows: true,
        dots: true,
        swipeToSlide: true,
        infinite: true,
        autoplay: autoplay,
        autoplaySpeed: autoplaySpeed,
        slidesToShow: slideNum,
        slidesToScroll: slideNum,
    };

    const FullWidthBgImage = ({icon, text}) => {
        const url = isLoggedIn ? "/explore" : "/login";
        return (
            <Link href={url}>
                <div className="icon-container" style={{marginLeft: '10px', marginRight: '10px', alignItems: 'columns'}}>
                    <FontAwesomeIcon icon={icon}/>
                    <div className="text-container">
                        <div className={`${styles.textSlider}`}>{text}</div>
                    </div>
                </div>
            </Link>
        );
    };

    return (
        <div className="container">
            <div className={`${styles.sliderContainer}`}>
                <Slider {...settings} ref={sliderRef}>
                    {data?.length > 0 && data?.map((item, index) => (
                        <FullWidthBgImage
                            icon={item.image}
                            text={item.title}
                        />
                    ))}
                </Slider>
            </div>
        </div>
    );
};

export default SliderComp;