"use client";

import React, { useState, useRef, useEffect } from 'react';
import styles from './BeforeAfterSlider.module.css';

export default function BeforeAfterSlider() {
    // Slider konumu (% cinsinden). Varsayılan ortada (50%).
    const [sliderPosition, setSliderPosition] = useState(50);
    const [isDragging, setIsDragging] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Fare/parmak hareketini yüzdeye çeviren fonksiyon
    const handleMove = (clientX: number) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
        const percent = (x / rect.width) * 100;
        setSliderPosition(percent);
    };

    const onMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true);
        handleMove(e.clientX);
    };

    const onTouchStart = (e: React.TouchEvent) => {
        setIsDragging(true);
        handleMove(e.touches[0].clientX);
    };

    useEffect(() => {
        if (!isDragging) return;

        const onMouseMove = (e: MouseEvent) => handleMove(e.clientX);
        const onMouseUp = () => setIsDragging(false);

        const onTouchMove = (e: TouchEvent) => handleMove(e.touches[0].clientX);
        const onTouchEnd = () => setIsDragging(false);

        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);
        window.addEventListener('touchmove', onTouchMove);
        window.addEventListener('touchend', onTouchEnd);

        return () => {
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onMouseUp);
            window.removeEventListener('touchmove', onTouchMove);
            window.removeEventListener('touchend', onTouchEnd);
        };
    }, [isDragging]);

    return (
        <div
            className={styles.visualContainer}
            ref={containerRef}
            onMouseDown={onMouseDown}
            onTouchStart={onTouchStart}
        >
            {/* 1. ALTTTAKİ KATMAN: AI Enhanced (Hepsi Tam Boyut) */}
            <div className={styles.aiEnhancedLayer}>
                <span className={styles.imageLabelGreen}>AI ENHANCED</span>
                <img 
                    src="/landing_page_photo_2.png" 
                    alt="AI Enhanced Product"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
            </div>

            {/* 2. ÜSTTEKİ KATMAN: Raw Input (Slider pozisyonuna göre sağdan kırpılıyor) */}
            <div
                className={styles.rawInputLayer}
                style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
            >
                <span className={styles.imageLabel}>RAW INPUT</span>
                <img 
                    src="/landing_page_photo_1.png" 
                    alt="Original Product"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
            </div>

            {/* 3. ORTADAKİ KAYDIRICI ÇİZGİ */}
            <div
                className={styles.sliderHandle}
                style={{ left: `${sliderPosition}%` }}
            >
                <div className={styles.sliderIcon}></div>
            </div>
        </div>
    );
}
