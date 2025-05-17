'use client';

import { motion } from 'framer-motion';
import { Content, isFilled } from '@prismicio/client';
import { PrismicRichText } from '@prismicio/react';
import { PrismicNextImage } from '@prismicio/next';
import TransitionLink from '@/animation/transitionLink';
import Breadcrumbs, { BreadcrumbItem } from '@/components/breadCrumbs';
import styles from './style.module.scss';

interface SectorDetailProps {
    sector: Content.SectorPostDocument;
    subsectors: Content.SubsectorPostDocument[];
}

export default function SectorDetail({ sector, subsectors }: SectorDetailProps) {
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

    const breadcrumbItems: BreadcrumbItem[] = [
        { label: 'Home', href: '/' },
        { label: 'Sectors', href: '/sectors' },
        { label: sector.data.name || '', href: `/sectors/${sector.uid}`, current: true }
    ];

    return (
        <div className={styles.sectorPage}>
            <div className={styles.container}>
                <Breadcrumbs items={breadcrumbItems} />

                <header className={styles.header}>
                    <div className={styles.headerImage}>
                        {isFilled.image(sector.data.main_image) && (
                            <PrismicNextImage
                                field={sector.data.main_image}
                                sizes="100vw"
                                priority
                                fill
                            />
                        )}
                        <div className={styles.headerOverlay} />
                    </div>

                    <div className={styles.headerContent}>
                        <h1 className={styles.title}>{sector.data.name}</h1>
                        <div className={styles.description}>
                            <PrismicRichText field={sector.data.description} />
                        </div>
                    </div>
                </header>

                <section className={styles.subsectorsSection}>
                    <h2 className={styles.subsectorsTitle}>Specialized Areas</h2>

                    <motion.div
                        className={styles.subsectorsList}
                        variants={staggerContainer}
                        initial="initial"
                        animate="animate"
                    >
                        {subsectors.map((subsector, index) => (
                            <motion.div
                                key={subsector.uid}
                                className={styles.subsectorCard}
                                variants={fadeInUp}
                                transition={{ delay: index * 0.05 }}
                            >
                                <TransitionLink href={`/sectors/${sector.uid}/${subsector.uid}`} className={styles.subsectorLink}>
                                    <div className={styles.subsectorImage}>
                                        {isFilled.image(subsector.data.main_image) && (
                                            <PrismicNextImage
                                                field={subsector.data.main_image}
                                                sizes="(max-width: 768px) 100vw, 33vw"
                                            />
                                        )}
                                        <div className={styles.subsectorOverlay} />
                                    </div>
                                    <div className={styles.subsectorContent}>
                                        <h3 className={styles.subsectorName}>{subsector.data.name}</h3>
                                        <span className={styles.viewProjects}>
                                            View Projects
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                                <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        </span>
                                    </div>
                                </TransitionLink>
                            </motion.div>
                        ))}
                    </motion.div>
                </section>
            </div>
        </div>
    );
}