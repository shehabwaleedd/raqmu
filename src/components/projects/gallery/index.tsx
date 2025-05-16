'use client';

import { useState, useEffect, useCallback } from 'react';
import { Content } from '@prismicio/client';
import { PrismicNextImage } from '@prismicio/next';
import styles from './style.module.scss';

interface GalleryProps {
    images: Content.ProjectPostDocumentDataGalleryImagesItem[];
}

export default function Gallery({ images }: GalleryProps) {
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

    const openModal = useCallback((index: number) => {
        setSelectedIndex(index);
        document.body.style.overflow = 'hidden';
    }, []);

    const closeModal = useCallback(() => {
        setSelectedIndex(null);
        document.body.style.overflow = 'unset';
    }, []);

    const goToNext = useCallback(() => {
        if (selectedIndex !== null && selectedIndex < images.length - 1) {
            setSelectedIndex(selectedIndex + 1);
        }
    }, [selectedIndex, images.length]);

    const goToPrev = useCallback(() => {
        if (selectedIndex !== null && selectedIndex > 0) {
            setSelectedIndex(selectedIndex - 1);
        }
    }, [selectedIndex]);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (selectedIndex === null) return;

            switch (event.key) {
                case 'Escape':
                    closeModal();
                    break;
                case 'ArrowRight':
                    goToNext();
                    break;
                case 'ArrowLeft':
                    goToPrev();
                    break;
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [selectedIndex, closeModal, goToNext, goToPrev]);

    return (
        <>
            <div className={styles.gallery}>
                <h2 className={styles.title}>Gallery</h2>
                <div className={styles.grid}>
                    {images.map((item, index) => (
                        <div
                            key={index}
                            className={styles.item}
                            onClick={() => openModal(index)}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                    openModal(index);
                                }
                            }}
                        >
                            <PrismicNextImage
                                field={item.image}
                                sizes="(max-width: 768px) 50vw, 25vw"
                            />
                        </div>
                    ))}
                </div>
            </div>

            {selectedIndex !== null && (
                <div className={styles.modal} onClick={closeModal}>
                    <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                        <button className={styles.close} onClick={closeModal}>
                            <svg width="24" height="24" viewBox="0 0 24 24">
                                <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </button>

                        <div className={styles.modalImage}>
                            <PrismicNextImage
                                field={images[selectedIndex].image}
                                sizes="100vw"
                                priority
                            />
                        </div>

                        {images.length > 1 && (
                            <>
                                <button
                                    className={`${styles.nav} ${styles.navPrev}`}
                                    onClick={goToPrev}
                                    disabled={selectedIndex === 0}
                                >
                                    <svg width="24" height="24" viewBox="0 0 24 24">
                                        <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </button>
                                <button
                                    className={`${styles.nav} ${styles.navNext}`}
                                    onClick={goToNext}
                                    disabled={selectedIndex === images.length - 1}
                                >
                                    <svg width="24" height="24" viewBox="0 0 24 24">
                                        <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </button>
                            </>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}