'use client';

import React, { useState, useEffect, useCallback } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { Content } from '@prismicio/client';
import { PrismicNextImage } from '@prismicio/next';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './style.module.scss';

interface GalleryProps {
    images: Content.ProjectPostDocumentDataGalleryImagesItem[];
}

interface ThumbProps {
    selected: boolean;
    image: Content.ProjectPostDocumentDataGalleryImagesItem;
    onClick: () => void;
}

const Thumb: React.FC<ThumbProps> = ({ selected, image, onClick }) => (
    <div className={`${styles.emblaThumb} ${selected ? styles.selected : ''}`}>
        <button onClick={onClick} className={styles.emblaThumbButton} type="button">
            <PrismicNextImage field={image.image} className={styles.emblaThumbImg} sizes="(max-width: 768px) 15vw, 10vw" />
        </button>
    </div>
);

export default function Gallery({ images }: GalleryProps) {
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [modalOpen, setModalOpen] = useState(false);
    const [modalImageIndex, setModalImageIndex] = useState(0);

    const [emblaMainRef, emblaMainApi] = useEmblaCarousel({
        loop: false,
        align: 'center',
    });
    const [emblaThumbsRef, emblaThumbsApi] = useEmblaCarousel({
        containScroll: 'keepSnaps',
        dragFree: true,
        loop: false,
    });

    const onThumbClick = useCallback(
        (index: number) => {
            if (!emblaMainApi || !emblaThumbsApi) return;
            emblaMainApi.scrollTo(index);
        },
        [emblaMainApi, emblaThumbsApi]
    );

    const onSelect = useCallback(() => {
        if (!emblaMainApi || !emblaThumbsApi) return;
        setSelectedIndex(emblaMainApi.selectedScrollSnap());
        emblaThumbsApi.scrollTo(emblaMainApi.selectedScrollSnap());
    }, [emblaMainApi, emblaThumbsApi, setSelectedIndex]);

    const openModal = useCallback((index: number) => {
        setModalImageIndex(index);
        setModalOpen(true);
        document.body.style.overflow = 'hidden';
    }, []);

    const closeModal = useCallback(() => {
        setModalOpen(false);
        document.body.style.overflow = 'unset';
    }, []);

    const goToNext = useCallback(() => {
        if (modalImageIndex < images.length - 1) {
            setModalImageIndex(modalImageIndex + 1);
        }
    }, [modalImageIndex, images.length]);

    const goToPrev = useCallback(() => {
        if (modalImageIndex > 0) {
            setModalImageIndex(modalImageIndex - 1);
        }
    }, [modalImageIndex]);

    useEffect(() => {
        if (!emblaMainApi) return;
        onSelect();
        emblaMainApi.on('select', onSelect).on('reInit', onSelect);
    }, [emblaMainApi, onSelect]);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (!modalOpen) return;

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
    }, [modalOpen, closeModal, goToNext, goToPrev]);

    if (!images || images.length === 0) {
        return null;
    }

    return (
        <>
            <div className={styles.gallery}>
                <h2 className={styles.title}>Gallery</h2>

                <div className={styles.embla}>
                    <div className={styles.emblaViewport} ref={emblaMainRef}>
                        <div className={styles.emblaContainer}>
                            {images.map((item, index) => (
                                <div className={styles.emblaSlide} key={index}>
                                    <div className={styles.emblaSlideInner}onClick={() => openModal(index)}role="button"tabIndex={0}onKeyDown={(e) => {if (e.key === 'Enter' || e.key === ' ') {openModal(index);}}}>
                                        <PrismicNextImage field={item.image}className={styles.emblaSlideImg}sizes="(max-width: 768px) 90vw, 70vw"/>
                                        <div className={styles.emblaSlideOverlay}>
                                            <svg width="48"height="48"viewBox="0 0 24 24"fill="none"className={styles.expandIcon}>
                                                <path d="M15 3H21V9M14 10L21 3M3 9V3H9M3 3L10 10M9 21H3V15M10 14L3 21M21 15V21H15M21 21L14 14"stroke="currentColor"strokeWidth="2"strokeLinecap="round"strokeLinejoin="round"/>
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {images.length > 1 && (
                        <div className={styles.emblaThumbs}>
                            <div className={styles.emblaThumbsViewport} ref={emblaThumbsRef}>
                                <div className={styles.emblaThumbsContainer}>
                                    {images.map((item, index) => (
                                        <Thumb key={index} onClick={() => onThumbClick(index)} selected={index === selectedIndex} image={item} />
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <AnimatePresence>
                {modalOpen && (
                    <motion.div className={styles.modal} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} onClick={closeModal}>
                        <motion.div className={styles.modalContent} initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} transition={{ duration: 0.3, ease: [0.25, 0.8, 0.25, 1] }} onClick={(e) => e.stopPropagation()}>
                            <button className={styles.modalClose} onClick={closeModal} aria-label="Close modal">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                    <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </button>

                            <div className={styles.modalImageWrapper}>
                                <PrismicNextImage field={images[modalImageIndex].image}className={styles.modalImage}sizes="100vw"priority/>
                            </div>

                            {images.length > 1 && (
                                <>
                                    <button className={`${styles.modalNav} ${styles.modalNavPrev}`}onClick={goToPrev}disabled={modalImageIndex === 0}aria-label="Previous image">
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                            <path d="M15 18L9 12L15 6"stroke="currentColor"strokeWidth="2"strokeLinecap="round"strokeLinejoin="round"/>
                                        </svg> 
                                    </button>
                                    <button className={`${styles.modalNav} ${styles.modalNavNext}`}onClick={goToNext}disabled={modalImageIndex === images.length - 1}aria-label="Next image">
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                            <path d="M9 18L15 12L9 6"stroke="currentColor"strokeWidth="2"strokeLinecap="round"strokeLinejoin="round"/>
                                        </svg>
                                    </button>
                                </>
                            )}

                            <div className={styles.modalCounter}>
                                {modalImageIndex + 1} / {images.length}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}