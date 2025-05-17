'use client';

import { motion } from 'framer-motion';
import { Content } from '@prismicio/client';
import { PrismicRichText } from '@prismicio/react';
import { PrismicNextImage } from '@prismicio/next';
import TransitionLink from '@/animation/transitionLink';
import styles from './style.module.scss';

interface SectorsIndexProps {
    sectors: Content.SectorPostDocument[];
}

export default function SectorsIndex({ sectors }: SectorsIndexProps) {
    const fadeInUp = {
        initial: { opacity: 0, y: 30 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.5, ease: [0.25, 0.8, 0.25, 1] }
    };

    const staggerContainer = {
        animate: {
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    return (
        <div className={styles.sectorsPage}>
            <div className={styles.container}>
                <header className={styles.header}>
                    <span className={styles.eyebrow}>Expertise</span>
                    <h1 className={styles.title}>Our Sectors</h1>
                    <p className={styles.subtitle}>
                        Explore our comprehensive range of construction expertise across various sectors,
                        from commercial properties to residential developments and specialized facilities.
                    </p>
                </header>

                <motion.div
                    className={styles.sectorsList}
                    variants={staggerContainer}
                    initial="initial"
                    animate="animate"
                >
                    {sectors.map((sector, index) => (
                        <motion.div
                            key={sector.uid}
                            className={styles.sectorCard}
                            variants={fadeInUp}
                            transition={{ delay: index * 0.05 }}
                        >
                            <TransitionLink href={`/sectors/${sector.uid}`} className={styles.sectorLink}>
                                <div className={styles.sectorImage}>
                                    <PrismicNextImage
                                        field={sector.data.main_image}
                                        sizes="(max-width: 768px) 100vw, 50vw"
                                    />
                                    <div className={styles.overlay}>
                                        <div className={styles.sectorContent}>
                                            <h2 className={styles.sectorName}>{sector.data.name}</h2>
                                            <div className={styles.sectorDescription}>
                                                <PrismicRichText field={sector.data.description} />
                                            </div>
                                            <span className={styles.viewMore}>
                                                Explore Sector
                                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                                    <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </TransitionLink>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </div>
    );
}