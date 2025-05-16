'use client'

import React, { useState, useRef, useEffect } from 'react';
import styles from './style.module.scss';

interface SlideTextEffectProps {
    text: string;
    className?: string;
}

const SlideTextEffect: React.FC<SlideTextEffectProps> = ({ text, className = '' }) => {
    const [isHovered, setIsHovered] = useState(false);
    const textRef = useRef<HTMLSpanElement>(null);
    const [textWidth, setTextWidth] = useState(0);

    useEffect(() => {
        if (textRef.current) {
            const width = textRef.current.offsetWidth;
            setTextWidth(width);
        }
    }, [text]);

    return (
        <span className={`${styles.mask} ${className}`}onMouseEnter={() => setIsHovered(true)}onMouseLeave={() => setIsHovered(false)}style={{ width: textWidth ? `${textWidth}px` : 'auto' }}>
            <div className={`${styles.linkContainer} ${isHovered ? styles.hovered : ''}`}>
                <span ref={textRef}className={`${styles.linkTitle1} ${styles.title} ${isHovered ? styles.hovered : ''}`}>
                    {text}
                </span>
                <span className={`${styles.linkTitle2} ${styles.title} ${isHovered ? styles.hovered : ''}`}>
                    {text}
                </span>
            </div>
        </span>
    );
};

export default SlideTextEffect;