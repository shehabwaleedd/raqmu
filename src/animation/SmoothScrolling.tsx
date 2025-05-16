'use client';

import { useLayoutEffect, useRef, useEffect, useCallback } from 'react';
import Tempus from '@studio-freight/tempus';
import Lenis from '@studio-freight/lenis';
import useWindowSize from '@/hooks/useWindowSize';

const SmoothScroller = () => {
    const lenisRef = useRef<Lenis | null>(null);
    const resizeObserverRef = useRef<ResizeObserver | null>(null);
    const unsubscribeRef = useRef<(() => void) | null>(null);
    const { isTablet } = useWindowSize();

    const initializeLenis = useCallback(() => {
        if (lenisRef.current) return;

        const lenisInstance = new Lenis({
            duration: isTablet ? 1 : 1.2,
            easing: (t: number) => t < .5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
            wheelMultiplier: 0.65,
            orientation: 'vertical',
            gestureOrientation: 'vertical',
            touchMultiplier: isTablet ? 1.2 : 1.5,
            infinite: false,
            smoothWheel: true,
            lerp: 0.085
        });

        lenisRef.current = lenisInstance;

        if (resizeObserverRef.current) {
            resizeObserverRef.current.disconnect();
        }

        resizeObserverRef.current = new ResizeObserver(() => {
            requestAnimationFrame(() => {
                if (lenisRef.current) {
                    lenisRef.current.resize();
                }
            });
        });

        resizeObserverRef.current.observe(document.documentElement);

        if (unsubscribeRef.current) {
            unsubscribeRef.current();
        }

        const onFrame = (time: number) => {
            if (lenisRef.current) {
                lenisRef.current.raf(time);
            }
        };

        unsubscribeRef.current = Tempus.add(onFrame);
    }, [isTablet]);

    const destroyLenis = useCallback(() => {
        if (resizeObserverRef.current) {
            resizeObserverRef.current.disconnect();
            resizeObserverRef.current = null;
        }

        if (unsubscribeRef.current) {
            unsubscribeRef.current();
            unsubscribeRef.current = null;
        }

        if (lenisRef.current) {
            lenisRef.current.destroy();
            lenisRef.current = null;
        }
    }, []);

    useEffect(() => {
        const handleTransitionStart = () => {
            destroyLenis();
        };

        const handleTransitionEnd = () => {
            initializeLenis();
        };

        document.addEventListener('startViewTransition', handleTransitionStart);
        document.addEventListener('finishViewTransition', handleTransitionEnd);

        const observer = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                if (mutation.attributeName === 'style') {
                    const target = mutation.target as HTMLElement;
                    if (target.classList.contains('view-transition-active')) {
                        document.dispatchEvent(new Event('startViewTransition'));
                    } else if (target.classList.contains('view-transition')) {
                        document.dispatchEvent(new Event('finishViewTransition'));
                    }
                }
            }
        });

        observer.observe(document.documentElement, { attributes: true });

        return () => {
            document.removeEventListener('startViewTransition', handleTransitionStart);
            document.removeEventListener('finishViewTransition', handleTransitionEnd);
            observer.disconnect();
            destroyLenis();
        };
    }, [initializeLenis, destroyLenis]);

    useEffect(() => {
        if (lenisRef.current) {
            destroyLenis();
            initializeLenis();
        }
    }, [isTablet, destroyLenis, initializeLenis]);

    useLayoutEffect(() => {
        initializeLenis();
        return destroyLenis;
    }, [initializeLenis, destroyLenis]);

    return null;
};

export default SmoothScroller;