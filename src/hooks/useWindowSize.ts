import { useState, useEffect } from 'react';

const useWindowSize = () => {

    const [windowWidth, setWindowWidth] = useState<number>(() => {
        if (typeof window !== 'undefined') {
            return window.innerWidth;
        }
        return 1200;
    });

    const [windowHeight, setWindowHeight] = useState<number>(() => {
        if (typeof window !== 'undefined') {
            return window.innerHeight;
        }
        return 1200;
    });

    useEffect(() => {
        const handleResize = () => {
            setWindowWidth(window.innerWidth);
            setWindowHeight(window.innerHeight);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const isMobile = windowWidth < 468;
    const isSmallTablet = windowWidth < 655;
    const isMediumTablet = windowWidth < 788;
    const isLargeTablet = windowWidth < 900;
    const isTablet = windowWidth < 1067;
    const isLaptop = windowWidth <= 1068;
    const isSmallLaptop = windowWidth <= 1208;
    const isMediumLaptop = windowWidth <= 1320;
    const isLargeLaptop = windowWidth <= 1400;
    const isDesktop = windowWidth >= 1401;

    return { windowWidth, windowHeight, isMobile, isSmallTablet, isMediumTablet, isLargeTablet, isTablet, isLaptop, isSmallLaptop, isLargeLaptop, isDesktop, isMediumLaptop };
};
export default useWindowSize;
