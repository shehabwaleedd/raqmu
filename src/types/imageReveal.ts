export interface ImageTextRevealProps {
    imageSrc: string;
    text: string;
}

export interface TextOpacityProps {
    phrase: string;
    color?: string;
    parentRef?: React.RefObject<HTMLElement>;
    imageProgress?: any;
}

export interface CharProps {
    char: string;
    progress: any;
    start: number;
    end: number;
    isFirstChar?: boolean;
}

export interface UseHeightCalculatorProps {
    isMobile: boolean;
    isTablet: boolean;
    isMediumTablet: boolean;
    isLargeTablet: boolean;
    isLaptop: boolean;
    windowHeight: number;
}