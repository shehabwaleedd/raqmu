'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Content } from '@prismicio/client';
import { SliceComponentProps } from '@prismicio/react';
import useEmblaCarousel, { UseEmblaCarouselType } from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import TransitionLink from '@/animation/transitionLink';
import styles from './style.module.scss';
import { usePerformanceDetection } from '@/hooks/usePerformanceDetection';
import type { LinkToMediaField, ImageField } from '@prismicio/client';

export type HeroSectionProps = SliceComponentProps<Content.HeroSectionSlice>;

type MediaField = LinkToMediaField | ImageField | null | undefined;

const TWEEN_FACTOR_BASE = 0.2;

const HeroSection: React.FC<HeroSectionProps> = ({ slice }) => {
  const { shouldReduceMotion } = usePerformanceDetection();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const tweenFactor = useRef(0);
  const tweenNodes = useRef<Map<number, HTMLDivElement>>(new Map());
  const videoRefs = useRef<Map<number, HTMLVideoElement>>(new Map());
  const slideRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const isScrolling = useRef(false);

  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: true,
      duration: shouldReduceMotion ? 0 : 30,
      dragFree: true
    },
    [Autoplay({ delay: 10000, stopOnInteraction: false })]
  );

  const setTweenNodes = useCallback((emblaApi: UseEmblaCarouselType[1] | undefined): void => {
    if (!emblaApi) return;
    tweenNodes.current = new Map(
      emblaApi.slideNodes().map((slideNode: HTMLElement, index: number) => {
        const layer = slideNode.querySelector(`.${styles.parallaxLayer}`) as HTMLDivElement;
        return [index, layer];
      })
    );
  }, []);

  const setTweenFactor = useCallback((emblaApi: UseEmblaCarouselType[1] | undefined) => {
    if (!emblaApi) return;
    tweenFactor.current = TWEEN_FACTOR_BASE * emblaApi.scrollSnapList().length;
  }, []);

  const tweenParallax = useCallback(
    (emblaApi: UseEmblaCarouselType[1] | undefined, eventName?: string) => {
      if (!emblaApi) return;
      const engine = emblaApi.internalEngine();
      const scrollProgress = emblaApi.scrollProgress();
      const slidesInView = emblaApi.slidesInView();
      const isScrollEvent = eventName === 'scroll';

      emblaApi.scrollSnapList().forEach((scrollSnap: number, snapIndex: number) => {
        let diffToTarget = scrollSnap - scrollProgress;
        const slidesInSnap = engine.slideRegistry[snapIndex];

        slidesInSnap.forEach((slideIndex: number) => {
          if (isScrollEvent && !slidesInView.includes(slideIndex)) return;

          if (engine.options.loop) {
            engine.slideLooper.loopPoints.forEach((loopItem: { index: number; target: () => number }) => {
              const target = loopItem.target();

              if (slideIndex === loopItem.index && target !== 0) {
                const sign = Math.sign(target);

                if (sign === -1) {
                  diffToTarget = scrollSnap - (1 + scrollProgress);
                }
                if (sign === 1) {
                  diffToTarget = scrollSnap + (1 - scrollProgress);
                }
              }
            });
          }

          const translate = diffToTarget * (-1 * tweenFactor.current) * 100;
          const tweenNode = tweenNodes.current.get(slideIndex);
          if (tweenNode) {
            tweenNode.style.transform = `translateX(${translate}%)`;
          }
        });
      });
    },
    []
  );

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    const currentIndex = emblaApi.selectedScrollSnap();
    setSelectedIndex(currentIndex);

    // Reset autoplay
    const autoplay = emblaApi.plugins().autoplay;
    if (autoplay) {
      autoplay.stop();
      autoplay.play();
    }
  }, [emblaApi]);

  const scrollTo = useCallback((index: number) => {
    if (!emblaApi) return;
    isScrolling.current = true;
    emblaApi.scrollTo(index);

    // Reset scrolling state after animation
    setTimeout(() => {
      isScrolling.current = false;
    }, 30); // Use fixed duration to match carousel options
  }, [emblaApi]);

  const scrollPrev = useCallback(() => {
    if (!emblaApi || isScrolling.current) return;
    const currentIndex = emblaApi.selectedScrollSnap();
    const totalSlides = emblaApi.scrollSnapList().length;
    const prevIndex = currentIndex === 0 ? totalSlides - 1 : currentIndex - 1;
    scrollTo(prevIndex);
  }, [emblaApi, scrollTo]);

  const scrollNext = useCallback(() => {
    if (!emblaApi || isScrolling.current) return;
    const currentIndex = emblaApi.selectedScrollSnap();
    const totalSlides = emblaApi.scrollSnapList().length;
    const nextIndex = currentIndex === totalSlides - 1 ? 0 : currentIndex + 1;
    scrollTo(nextIndex);
  }, [emblaApi, scrollTo]);

  useEffect(() => {
    if (!emblaApi) return;

    setTweenNodes(emblaApi);
    setTweenFactor(emblaApi);
    tweenParallax(emblaApi);

    emblaApi
      .on('reInit', setTweenNodes)
      .on('reInit', setTweenFactor)
      .on('reInit', tweenParallax)
      .on('scroll', tweenParallax)
      .on('select', onSelect);

    return () => {
      emblaApi
        .off('reInit', setTweenNodes)
        .off('reInit', setTweenFactor)
        .off('reInit', tweenParallax)
        .off('scroll', tweenParallax)
        .off('select', onSelect);
    };
  }, [emblaApi, tweenParallax, onSelect]);

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

  const getMediaUrl = (field: MediaField): string => {
    if (!field) return '';

    if ('link_type' in field && field.link_type === 'Media') {
      return field.url || '';
    }

    if ('url' in field && field.url) {
      return field.url;
    }

    return '';
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
              <div
                className={`${styles.slideContent} ${index === selectedIndex ? styles.active : ''}`}
                ref={setSlideRef(index)}
              >
                <div className={styles.slideBackground}>
                  <div className={styles.parallaxLayer}>
                    {slide.slide_type === 'video' && slide.background_video ? (
                      <video
                        ref={setVideoRef(index)}
                        className={`${styles.backgroundVideo} ${styles.parallaxContent}`}
                        src={getMediaUrl(slide.background_video)}
                        poster={getMediaUrl(slide.video_poster) || getMediaUrl(slide.background_image) || ''}
                        muted
                        loop
                        playsInline
                        preload="metadata"
                      />
                    ) : slide.background_image ? (
                      <Image
                        src={getMediaUrl(slide.background_image)}
                        alt={slide.background_image.alt || slide.heading || ''}
                        fill
                        className={`${styles.backgroundImage} ${styles.parallaxContent}`}
                        priority={index === 0}
                        sizes="100vw"
                        quality={90}
                      />
                    ) : null}
                  </div>

                  <div
                    className={styles.overlay}
                    style={{ opacity: (slide.overlay_opacity || 40) / 100 }}
                  />
                </div>

                <div className={`${styles.slideText} ${styles[`theme-${slide.text_color || 'light'}`]}`}>
                  <div className={styles.textContent}>
                    <AnimatePresence mode="wait">
                      {selectedIndex === index && (
                        <motion.div
                          key={`slide-${index}-${selectedIndex}`}
                          initial={{ opacity: 0, y: 60 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -60 }}
                          transition={{
                            duration: shouldReduceMotion ? 0.1 : 0.8,
                            ease: [0.16, 1, 0.3, 1]
                          }}
                        >
                          {slide.subheading && (
                            <motion.h2
                              className={styles.subheading}
                              initial={{ opacity: 0, y: 40 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{
                                delay: shouldReduceMotion ? 0 : 0.2,
                                duration: shouldReduceMotion ? 0.1 : 0.6
                              }}
                            >
                              {slide.subheading}
                            </motion.h2>
                          )}

                          {slide.heading && (
                            <motion.h1
                              className={styles.heading}
                              initial={{ opacity: 0, y: 40 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{
                                delay: shouldReduceMotion ? 0 : 0.4,
                                duration: shouldReduceMotion ? 0.1 : 0.6
                              }}
                            >
                              {slide.heading}
                            </motion.h1>
                          )}

                          {slide.cta_text && slide.cta_link && (
                            <motion.div
                              initial={{ opacity: 0, y: 40 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{
                                delay: shouldReduceMotion ? 0 : 0.6,
                                duration: shouldReduceMotion ? 0.1 : 0.6
                              }}
                            >
                              <TransitionLink
                                href={slide.cta_link}
                                className={styles.ctaButton}
                              >
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
        </>
      )}
    </section>
  );
};

export default HeroSection;