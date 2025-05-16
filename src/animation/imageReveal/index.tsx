'use client';

import { useLayoutEffect, useRef, useState, memo } from 'react';
import { PrismicNextImage, PrismicNextImageProps } from '@prismicio/next';
import { ImageField } from '@prismicio/client';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import styles from './style.module.scss';

interface AnimationOptions {
    direction?: 'bottom' | 'top' | 'left' | 'right';
    duration?: number;
    ease?: string;
    scrollTriggerStart?: string;
    once?: boolean;
    wrapperClassName?: string;
    onAnimationComplete?: () => void;
}

type PrismicImageProps = Omit<PrismicNextImageProps, 'field' | 'onLoad'>;

export interface ClipPathRevealPrismicImageProps extends Omit<PrismicImageProps, 'fallbackAlt'>, AnimationOptions {
    field: ImageField;
    fallbackAlt?: "" | string;
}

export const ClipPathRevealPrismicImage = memo(({
    field,
    fallbackAlt = '',
    direction = 'bottom',
    duration = 1.5,
    ease = 'power3.inOut',
    scrollTriggerStart = 'top 90%',
    once = true,
    wrapperClassName = '',
    onAnimationComplete,
    ...props
}: ClipPathRevealPrismicImageProps) => {
    const imageRef = useRef<HTMLDivElement>(null);
    const [isLoaded, setIsLoaded] = useState(false);

    useLayoutEffect(() => {
        if (!imageRef.current || !isLoaded) return;

        gsap.registerPlugin(ScrollTrigger);

        const getClipPathValues = () => {
            switch (direction) {
                case 'top': return { from: 'inset(100% 0 0 0)', to: 'inset(0% 0 0 0)' };
                case 'left': return { from: 'inset(0 100% 0 0)', to: 'inset(0 0% 0 0)' };
                case 'right': return { from: 'inset(0 0 0 100%)', to: 'inset(0 0 0 0%)' };
                case 'bottom':
                default: return { from: 'inset(0 0 100% 0)', to: 'inset(0 0 0% 0)' };
            }
        };

        const { from, to } = getClipPathValues();

        const animation = gsap.fromTo(
            imageRef.current,
            { clipPath: from, willChange: 'clip-path' },
            {
                clipPath: to,
                ease,
                duration,
                scrollTrigger: {
                    trigger: imageRef.current,
                    start: scrollTriggerStart,
                    toggleActions: 'play none none none',
                    once,
                },
                onComplete: onAnimationComplete
            }
        );

        return () => {
            animation.kill();
        };
    }, [direction, duration, ease, isLoaded, once, onAnimationComplete, scrollTriggerStart]);

    return (
        <div ref={imageRef} className={`${styles.imageWrapper} ${wrapperClassName}`} data-animation-direction={direction}>
            <PrismicNextImage field={field} alt={String(field.alt || fallbackAlt) as ''} onLoad={() => setIsLoaded(true)} className={styles.image} {...props} />
        </div>
    );
});

ClipPathRevealPrismicImage.displayName = 'ClipPathRevealPrismicImage';