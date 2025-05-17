'use client';

import { motion } from 'framer-motion';
import TransitionLink from '@/animation/transitionLink';
import styles from './style.module.scss';

interface SectorsListProps {
    sectors: {
        name: string;
        subSectors: string[];
        projectCount: number;
    }[];
}

export default function SectorsList({ sectors }: SectorsListProps) {
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
        <motion.div
            className={styles.sectorsList}
            variants={staggerContainer}
            initial="initial"
            animate="animate"
        >
            {sectors.map((sector, index) => (
                <motion.div
                    key={sector.name}
                    className={styles.sectorCard}
                    variants={fadeInUp}
                    transition={{ delay: index * 0.05 }}
                >
                    <div className={styles.sectorMain}>
                        <h2 className={styles.sectorName}>
                            <TransitionLink href={`/sectors/${encodeURIComponent(sector.name.toLowerCase())}`}>
                                {sector.name}
                            </TransitionLink>
                        </h2>
                        <span className={styles.projectCount}>{sector.projectCount} Projects</span>
                    </div>

                    <div className={styles.subSectorsList}>
                        {sector.subSectors.map(subSector => (
                            <TransitionLink
                                key={subSector}
                                href={`/sectors/${encodeURIComponent(sector.name.toLowerCase())}/${encodeURIComponent(subSector.toLowerCase())}`}
                                className={styles.subSector}
                            >
                                {subSector}
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                    <path d="M5 12h14M12 5l7 7-7 7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </TransitionLink>
                        ))}
                    </div>
                </motion.div>
            ))}
        </motion.div>
    );
}