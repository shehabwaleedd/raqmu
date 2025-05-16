'use client';

import React, { useCallback, useEffect, useRef } from 'react';
import { Content } from '@prismicio/client';
import { SliceComponentProps } from '@prismicio/react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import TransitionLink from '@/animation/transitionLink';
import styles from './heroSection.module.scss';
import { usePerformanceDetection } from '@/hooks/usePerformanceDetection';

export type HeroSectionProps = SliceComponentProps<Content.HeroSectionSlice>;

const HeroSection: React.FC<HeroSectionProps> = ({ slice }) => {
  const { shouldReduceMotion } = usePerformanceDetection();
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const [scrollSnaps, setScrollSnaps] = React.useState<number[]>([]);
  const [isTransitioning, setIsTransitioning] = React.useState(false);
  const videoRefs = useRef<Map<number, HTMLVideoElement>>(new Map());
  const slideRefs = useRef<Map<number, HTMLDivElement>>(new Map());

  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: true,
      duration: shouldReduceMotion ? 0 : 30
    },
    [Autoplay({ delay: 10000, stopOnInteraction: false })]
  );

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    const currentIndex = emblaApi.selectedScrollSnap();
    setIsTransitioning(true);

    setTimeout(() => {
      setSelectedIndex(currentIndex);
      setIsTransitioning(false);
    }, 300);
  }, [emblaApi]);

  const scrollTo = useCallback(
    (index: number) => emblaApi && emblaApi.scrollTo(index),
    [emblaApi]
  );

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;

    onSelect();
    setScrollSnaps(emblaApi.scrollSnapList());
    emblaApi.on('select', onSelect);

    return () => {
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi, onSelect]);

  useEffect(() => {
    videoRefs.current.forEach((video, index) => {
      if (index === selectedIndex) {
        video.play().catch(console.error);
      } else {
        video.pause();
      }
    });
  }, [selectedIndex]);

  const setVideoRef = (index: number) => (el: HTMLVideoElement | null) => {
    if (el) {
      videoRefs.current.set(index, el);
    } else {
      videoRefs.current.delete(index);
    }
  };

  const setSlideRef = (index: number) => (el: HTMLDivElement | null) => {
    if (el) {
      slideRefs.current.set(index, el);
    } else {
      slideRefs.current.delete(index);
    }
  };

  const slides = slice.primary.slides || [];

  if (slides.length === 0) {
    return null;
  }

  return (
    <section className={styles.heroSection} data-slice-type={slice.slice_type}>
      <div className={styles.embla} ref={emblaRef}>
        <div className={styles.emblaContainer}>
          {slides.map((slide, index) => (
            <div key={index} className={styles.emblaSlide}>
              <div className={`${styles.slideContent} ${index === selectedIndex ? styles.active : ''} ${isTransitioning ? styles.transitioning : ''}`} ref={setSlideRef(index)}>
                <div className={styles.slideBackground}>
                  {slide.slide_type === 'video' && slide.background_video?.url ? (
                    <video ref={setVideoRef(index)} className={styles.backgroundVideo} src={slide.background_video.url} poster={String(slide.video_poster?.url || slide.background_image?.url) || ''} muted loop playsInline preload="metadata" />
                  ) : slide.background_image?.url ? (
                    <Image src={slide.background_image.url} alt={slide.background_image.alt || slide.heading || ''} fill className={styles.backgroundImage} priority={index === 0} sizes="100vw" quality={90} />
                  ) : null}

                  <div className={styles.overlay} style={{ opacity: (slide.overlay_opacity || 40) / 100 }} />
                </div>

                <div className={`${styles.slideText} ${styles[`theme-${slide.text_color || 'light'}`]}`}>
                  <div className={styles.textContent}>
                    <AnimatePresence mode="wait">
                      {selectedIndex === index && !isTransitioning && (
                        <motion.div initial={{ opacity: 0, y: 60 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -60 }} transition={{ duration: shouldReduceMotion ? 0.1 : 0.8, ease: [0.16, 1, 0.3, 1] }}>
                          {slide.subheading && (
                            <motion.h2 className={styles.subheading} initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: shouldReduceMotion ? 0 : 0.2, duration: shouldReduceMotion ? 0.1 : 0.6 }}>
                              {slide.subheading}
                            </motion.h2>
                          )}

                          {slide.heading && (
                            <motion.h1 className={styles.heading} initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: shouldReduceMotion ? 0 : 0.4, duration: shouldReduceMotion ? 0.1 : 0.6 }}>
                              {slide.heading}
                            </motion.h1>
                          )}

                          {slide.cta_text && slide.cta_link && (
                            <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: shouldReduceMotion ? 0 : 0.6, duration: shouldReduceMotion ? 0.1 : 0.6 }}>
                              <TransitionLink href={slide.cta_link} className={styles.ctaButton}>
                                {slide.cta_text}
                              </TransitionLink>
                            </motion.div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {slides.length > 1 && (
        <>
          <button className={`${styles.navigationButton} ${styles.prevButton}`} onClick={scrollPrev} aria-label="Previous slide">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M15 18l-6-6 6-6" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          <button className={`${styles.navigationButton} ${styles.nextButton}`} onClick={scrollNext} aria-label="Next slide">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M9 18l6-6-6-6" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          <div className={styles.pagination}>
            {scrollSnaps.map((_, index) => (
              <button key={index} className={`${styles.paginationDot} ${index === selectedIndex ? styles.active : ''}`} onClick={() => scrollTo(index)} aria-label={`Go to slide ${index + 1}`} />
            ))}
          </div>
        </>
      )}
    </section>
  );
};

export default HeroSection;