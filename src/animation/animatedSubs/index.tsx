'use client'

import styles from './style.module.scss';
import { useInView, motion } from 'framer-motion';
import React, { useRef, ElementType } from 'react';
import { translate } from '../animate';
import { KeyTextField } from '@prismicio/client';

interface AnimatedSubsProps<T extends ElementType = 'p'> {
    phrase: string | KeyTextField;
    once?: boolean;
    as?: T;
    className?: string;
    direction?: "left" | "center";
    delay?: number;
}

const AnimatedSubs = <T extends ElementType = 'p'>({ phrase, once = false, as, className, direction = "left", delay = 0, ...rest }: AnimatedSubsProps<T> & Omit<React.ComponentPropsWithoutRef<T>, keyof AnimatedSubsProps<T>>) => {
    const description = useRef<HTMLDivElement>(null);
    const isInView = useInView(description, { margin: "0px 0px -100px 0px", once });
    const Component = as || 'p';
    const isCenter = direction === "center";

    return (
        <div ref={description} className={`${styles.description} ${isCenter && styles.center}`}>
            <div className={styles.body}>
                <Component className={className} {...rest}>
                    {phrase && phrase.split(" ").map((word, index) => (
                        <span key={index} className={styles.mask}>
                            <motion.span variants={translate} custom={index} animate={isInView ? "enter" : "exit"} transition={{ delay: delay + (index * 0.05) }}>
                                {word}
                            </motion.span>
                        </span>
                    ))}
                </Component>
            </div>
        </div>
    );
};

export default AnimatedSubs;