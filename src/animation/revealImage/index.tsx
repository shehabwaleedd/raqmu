'use client'
import React, { useRef, useState, useCallback } from 'react';
import Image from 'next/image';
import { motion, useScroll, useTransform } from 'framer-motion';
import styles from "./style.module.scss";

interface RevealImageProps {
    imageSrc: string | null;
    className?: string;
    imageWidth?: number;
    imageHeight?: number;
    quality?: number;
    blurDataURL?: string;
    priority?: boolean;
    alt?: string;
}

const RevealImage: React.FC<RevealImageProps> = ({
    imageSrc,
    className = '',
    imageWidth = 1000,
    imageHeight = 1000,
    quality = 100,
    blurDataURL,
    priority = true,
    alt = 'Reveal image',
}) => {
    const [imageState, setImageState] = useState({ isLoaded: false, hasError: false, hasAnimated: false, showPlaceholder: true });

    const imageRef = useRef<HTMLDivElement>(null);

    const { scrollYProgress } = useScroll({
        target: imageRef,
        offset: ['start end', 'end start']
    });

    const clipPathTransform = useTransform(
        scrollYProgress,
        [0, 1],
        [
            imageState.isLoaded && !imageState.hasAnimated
                ? "inset(0 0 100% 0)"
                : "inset(0 0 0% 0)",
            "inset(0 0 0% 0)"
        ]
    );

    const handleImageLoad = useCallback(() => {
        requestAnimationFrame(() => {
            setImageState(prev => ({
                ...prev,
                isLoaded: true
            }));
        });

        setTimeout(() => {
            setImageState(prev => ({
                ...prev,
                showPlaceholder: false
            }));
        }, 500);

        const unsubscribe = scrollYProgress.on("change", (value) => {
            if (value > 0 && !imageState.hasAnimated) {
                setImageState(prev => ({
                    ...prev,
                    hasAnimated: true
                }));
                unsubscribe();
            }
        });
    }, [scrollYProgress, imageState.hasAnimated]);

    const handleImageError = useCallback(() => {
        setImageState(prev => ({
            ...prev,
            hasError: true,
            showPlaceholder: false
        }));
    }, []);

    if (!imageSrc || imageState.hasError) {
        return null;
    }

    return (
        <motion.div ref={imageRef} className={`${styles.centerImage} ${className}`.trim()} style={{ clipPath: clipPathTransform, willChange: "clip-path", transition: "clip-path 1.3s cubic-bezier(0.8, 0, 0.2, 1)" }}>
            {imageState.showPlaceholder && (<div className={styles.placeholder} aria-hidden="true" />)}
            <Image src={imageSrc} alt={alt} width={imageWidth} height={imageHeight} quality={quality} priority={priority} placeholder={blurDataURL ? 'blur' : 'empty'} blurDataURL={blurDataURL} className={styles.image} style={{ opacity: imageState.isLoaded ? 1 : 0 }} onLoad={handleImageLoad} onError={handleImageError} />
        </motion.div>
    );
};

export default RevealImage;