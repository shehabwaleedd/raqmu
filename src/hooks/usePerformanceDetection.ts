import { useState, useEffect, useMemo } from 'react';

interface DeviceCapabilities {
    memory?: number;
    cores?: number;
    isLowEnd: boolean;
}

interface PerformanceDetection {
    shouldReduceMotion: boolean;
    isLowPerformanceDevice: boolean;
    deviceCapabilities: DeviceCapabilities;
}

export const usePerformanceDetection = (): PerformanceDetection => {
    const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

    const deviceCapabilities = useMemo<DeviceCapabilities>(() => {
        if (typeof window === 'undefined') {
            return { isLowEnd: false };
        }

        const navigator = window.navigator as Navigator & {
            deviceMemory?: number;
            hardwareConcurrency?: number;
        };

        const memory = navigator.deviceMemory;
        const cores = navigator.hardwareConcurrency;
        const userAgent = navigator.userAgent;

        const hasLowMemory = memory !== undefined && memory < 8;
        const hasLowCores = cores !== undefined && cores < 8;
        const isOldSafari = /Safari\//.test(userAgent) && !/Chrome/.test(userAgent);
        const isOldDevice = /iPhone [1-9]|iPad[1-6]|iPod/.test(userAgent);
        
        const isLowEnd = hasLowMemory || hasLowCores || isOldSafari || isOldDevice;

        return {
            memory,
            cores,
            isLowEnd
        };
    }, []);

    useEffect(() => {
        if (typeof window === 'undefined') return;

        const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        
        const handleChange = (e: MediaQueryListEvent) => {
            setPrefersReducedMotion(e.matches);
        };

        setPrefersReducedMotion(mediaQuery.matches);
        mediaQuery.addEventListener('change', handleChange);

        return () => {
            mediaQuery.removeEventListener('change', handleChange);
        };
    }, []);

    const shouldReduceMotion = deviceCapabilities.isLowEnd || prefersReducedMotion;

    return {
        shouldReduceMotion,
        isLowPerformanceDevice: deviceCapabilities.isLowEnd,
        deviceCapabilities
    };
};