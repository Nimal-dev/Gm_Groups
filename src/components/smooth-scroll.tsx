'use client'

import { useEffect, useRef } from 'react'
import Lenis from 'lenis'
import 'lenis/dist/lenis.css'

export default function SmoothScroll() {
    const lenisRef = useRef<Lenis | null>(null)

    useEffect(() => {
        let lenisInstance: Lenis | null = null
        let rafId: number | null = null

        try {


            lenisInstance = new Lenis({
                duration: 1.5,
                easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // https://www.desmos.com/calculator/brs54l4xou
                orientation: 'vertical',
                gestureOrientation: 'vertical',
                smoothWheel: true,
                wheelMultiplier: 0.1,
                touchMultiplier: 2,
            })

            lenisRef.current = lenisInstance;
            (window as any).lenis = lenisInstance;

            function raf(time: number) {
                if (lenisInstance) {
                    lenisInstance.raf(time)
                    rafId = requestAnimationFrame(raf)
                }
            }

            rafId = requestAnimationFrame(raf)
        } catch (error) {
            // Silently fail or use a proper logger
        }

        return () => {
            if (rafId) cancelAnimationFrame(rafId)
            if (lenisInstance) {
                lenisInstance.destroy();
                (window as any).lenis = null;
            }
            lenisRef.current = null
        }
    }, [])

    return null
}
