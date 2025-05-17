'use client'

import styles from './style.module.scss';
import { useInView, motion } from 'framer-motion';
import React, { useRef, ElementType, useMemo } from 'react';
import { translate } from '../animate';

interface AnimatedHeadersProps<T extends ElementType = 'h2'> {
    phrase: string;
    once?: boolean;
    as?: T;
    className?: string;
    direction?: "left" | "center";
    delay?: number;
    wordDelay?: number;
}

const AnimatedHeaders = <T extends ElementType = 'h2'>({
    phrase,
    once = true,
    as,
    className = '',
    direction = "left",
    delay = 0,
    wordDelay = 0.05,
    ...rest
}: AnimatedHeadersProps<T> & Omit<React.ComponentPropsWithoutRef<T>, keyof AnimatedHeadersProps<T>>) => {
    const titleRef = useRef<HTMLDivElement>(null);
    const isInView = useInView(titleRef, {
        margin: "0px 0px -100px 0px",
        once
    });

    const Component = as || 'h2';
    const isCenter = direction === "center";

    const words = useMemo(() => {
        if (!phrase) return [];
        return phrase.split(" ").filter(word => word.trim().length > 0);
    }, [phrase]);

    if (!phrase?.trim()) {
        return null;
    }

    return (
        <div ref={titleRef} className={`${styles.title} ${isCenter ? styles.center : ''} ${className}`.trim()}>
            <div className={styles.content}>
                <Component {...rest}>
                    {words.map((word, index) => (
                        <div key={`${word}-${index}`} className={styles.mask}>
                            <motion.span variants={translate} custom={index} animate={isInView ? "enter" : "exit"} transition={{ delay: delay + (index * wordDelay), duration: 0.5, ease: [0.76, 0, 0.24, 1] }}>
                                {word}
                            </motion.span>
                            {index < words.length - 1 && <span className={styles.space}> </span>}
                        </div>
                    ))}
                </Component>
            </div>
        </div>
    );
};

export default AnimatedHeaders;