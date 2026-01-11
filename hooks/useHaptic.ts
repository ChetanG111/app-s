"use client";

import { useCallback } from 'react';

export const useHaptic = () => {
    const trigger = useCallback(() => {
        if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
            window.navigator.vibrate(10); // Subtle 10ms vibration
        }
    }, []);

    return { trigger };
};
