import React, { useRef, useState, useEffect } from "react";
import { motion, useScroll, useMotionValue, useAnimationFrame, useMotionValueEvent } from "framer-motion";
import styles from "./style.module.scss";
import { LinkField } from "@prismicio/client";
import TransitionLink from "../transitionLink";
import { getCorrectHref } from "@/utils/pathMapping";
const ANIMATION_DURATION_SECONDS = 15;

interface MarqueeProps {
    text: string;
    link?: LinkField;
}

const Marquee: React.FC<MarqueeProps> = ({ text, link }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const textRef = useRef<HTMLHeadingElement>(null);
    const [textWidth, setTextWidth] = useState<number>(0);
    const [containerWidth, setContainerWidth] = useState<number>(0);
    const [itemCount, setItemCount] = useState<number>(4);
    const [isReady, setIsReady] = useState<boolean>(false);

    const x = useMotionValue<number>(0);
    const direction = useRef<number>(-1);
    const lastScrollY = useRef<number>(0);

    const { scrollY } = useScroll();


    useEffect(() => {
        const setupMarquee = () => {
            if (!containerRef.current || !textRef.current) return;

            const containerWidth = containerRef.current.offsetWidth;
            const textItemWidth = textRef.current.offsetWidth;

            if (containerWidth > 0 && textItemWidth > 0) {
                setContainerWidth(containerWidth);
                setTextWidth(textItemWidth);

                const required = Math.ceil((containerWidth * 2) / textItemWidth) + 2;
                setItemCount(Math.max(required, 4));
                x.set(-textItemWidth);

                setIsReady(true);
            }
        };

        setupMarquee();

        window.addEventListener('resize', setupMarquee);
        return () => window.removeEventListener('resize', setupMarquee);
    }, [text, x]);

    useMotionValueEvent(scrollY, "change", (latest) => {
        const currentScrollY = latest < 0 ? 0 : latest;
        const newDirection = currentScrollY > lastScrollY.current ? -1 : 1;

        if (newDirection !== direction.current) {
            direction.current = newDirection;
        }

        lastScrollY.current = currentScrollY;
    });

    useAnimationFrame((_, delta) => {
        if (!isReady || textWidth === 0 || containerWidth === 0) return;

        const secondsDelta = delta / 1000;
        const speed = textWidth / ANIMATION_DURATION_SECONDS;
        const moveBy = direction.current * speed * secondsDelta;

        const currentX = x.get();
        let nextX = currentX + moveBy;

        if (direction.current === -1) {
            if (nextX <= -textWidth * 2) {
                nextX += textWidth;
            }
        } else {
            if (nextX >= 0) {
                nextX -= textWidth;
            }
        }

        x.set(nextX);
    });

    const renderTextItem = (index: number) => {
        const textElement = (
            <p key={index}ref={index === 0 ? textRef : null}className={styles.marqueeText}>
                {text}
            </p>
        );

        return link ? (
            <TransitionLink key={index}href={getCorrectHref(link)}className={styles.marqueeLink}>
                {textElement}
            </TransitionLink>
        ) : textElement;
    };

    return (
        <div className={styles.marquee} ref={containerRef}>
            <motion.div className={styles.marqueeWrapper} style={{ x }}>
                {Array.from({ length: itemCount }).map((_, i) => renderTextItem(i))}
            </motion.div>
        </div>
    );
};

export default Marquee;