"use client";

import React, { useRef, ReactNode } from "react";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(SplitText, ScrollTrigger);

export interface AnimatedHeaderProps {
    children: ReactNode;
    animateOnScroll?: boolean;
    delay?: number;
}

const AnimatedHeader: React.FC<AnimatedHeaderProps> = ({ children, animateOnScroll = true, delay = 0 }) => {
    const wrapperRef = useRef<HTMLDivElement>(null);

    useGSAP(
        () => {
            if (!wrapperRef.current) return;

            const elementRefs: HTMLElement[] = [];
            const splitRefs: SplitText[] = [];
            let lines: HTMLElement[] = [];

            let elements: HTMLElement[] = [];
            if (wrapperRef.current.hasAttribute("data-copy-wrapper")) {
                elements = Array.from(
                    wrapperRef.current.children
                ).filter((el): el is HTMLElement => el instanceof HTMLElement);
            } else {
                elements = [wrapperRef.current];
            }

            elements.forEach((element) => {
                elementRefs.push(element);

                const split = new SplitText(element, {
                    type: "lines",
                    linesClass: "line++",
                    lineThreshold: 0.1,
                });

                splitRefs.push(split);

                const computedStyle = window.getComputedStyle(element);
                const textIndent = computedStyle.textIndent;

                if (textIndent && textIndent !== "0px") {
                    if (split.lines.length > 0) {
                        const firstLine = split.lines[0];
                        if (firstLine instanceof HTMLElement) {
                            firstLine.style.paddingLeft = textIndent;
                        }
                    }
                    element.style.textIndent = "0";
                }

                const lineElements = split.lines.filter(
                    (line): line is HTMLElement => line instanceof HTMLElement
                );
                lines = [...lines, ...lineElements];
            });

            gsap.set(lines, { y: "200%" });

            const animationProps = {
                y: "0%",
                duration: 1,
                stagger: 0.1,
                ease: "power4.out",
                delay,
            };

            if (animateOnScroll) {
                gsap.to(lines, {
                    ...animationProps,
                    scrollTrigger: {
                        trigger: wrapperRef.current,
                        start: "top 75%",
                        once: true,
                    },
                });
            } else {
                gsap.to(lines, animationProps);
            }

            return () => {
                splitRefs.forEach((split) => {
                    if (split) {
                        split.revert();
                    }
                });
            };
        },
        { scope: wrapperRef, dependencies: [animateOnScroll, delay] }
    );

    const isSingleChild = React.Children.count(children) === 1;
    const singleChild = isSingleChild ? React.Children.only(children) : null;
    const isValidSingleElement = isSingleChild && React.isValidElement(singleChild);

    if (isValidSingleElement) {
        return (
            <div ref={wrapperRef} style={{ display: "contents" }}>
                {singleChild}
            </div>
        );
    }

    return (
        <div ref={wrapperRef} data-copy-wrapper="true">
            {children}
        </div>
    );
};

export default AnimatedHeader;