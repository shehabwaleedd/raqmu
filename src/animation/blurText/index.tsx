'use client';

import { useEffect, useRef, ElementType, HTMLAttributes } from 'react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import styles from './style.module.scss';
import { KeyTextField } from '@prismicio/client';

gsap.registerPlugin(ScrollTrigger);

interface BlurTextProps extends HTMLAttributes<HTMLElement> {
    as?: ElementType;
    triggerOnScroll?: boolean;
    text: string | KeyTextField;
    duration?: number;
}

const BlurText = ({
    text,
    as: Component = 'div',
    className = '',
    triggerOnScroll = true,
    duration = 1.5,
    ...props
}: BlurTextProps) => {
    const containerRef = useRef<HTMLElement | null>(null);

    useEffect(() => {
        const element = containerRef.current;
        if (!element) return;

        gsap.set(element, {
            filter: 'blur(3px)',
            opacity: 1
        });

        const animate = () => {
            gsap.to(element, {
                filter: 'blur(0px)',
                duration,
                ease: 'power2.out',
                clearProps: 'filter' 
            });
        };

        let trigger: ScrollTrigger;

        if (triggerOnScroll) {
            trigger = ScrollTrigger.create({
                trigger: element,
                start: 'top bottom-=100',
                onEnter: animate,
                once: true
            });
        } else {
            animate();
        }

        return () => {
            if (trigger) trigger.kill();
        };
    }, [text, triggerOnScroll, duration]);

    return (
        <Component ref={containerRef} className={`${styles.blurText} ${className}`.trim()} {...props}>
            {text}
        </Component>
    );
};

export default BlurText;