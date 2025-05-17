'use client';

import { motion } from 'framer-motion';
import { Content } from '@prismicio/client';
import { PrismicNextImage } from '@prismicio/next';
import TransitionLink from '@/animation/transitionLink';
import styles from './style.module.scss';

interface SubSectorsListProps {
    subSectors: {
        name: string;
        projectCount: number;
        projects: Content.ProjectPostDocument[];
    }[];
    sector: string;
}

export default function SubSectorsList({ subSectors, sector }: SubSectorsListProps) {
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
            className={styles.subSectorsList}
            variants={staggerContainer}
            initial="initial"
            animate="animate"
        >
            {subSectors.map((subSector, index) => (
                <motion.div
                    key={subSector.name}
                    className={styles.subSectorCard}
                    variants={fadeInUp}
                    transition={{ delay: index * 0.05 }}
                >
                    <div className={styles.subSectorHeader}>
                        <div className={styles.subSectorInfo}>
                            <h2 className={styles.subSectorName}>
                                <TransitionLink href={`/sectors/${encodeURIComponent(sector.toLowerCase())}/${encodeURIComponent(subSector.name.toLowerCase())}`}>
                                    {subSector.name}
                                </TransitionLink>
                            </h2>
                            <span className={styles.projectCount}>{subSector.projectCount} Projects</span>
                        </div>
                        <TransitionLink
                            href={`/sectors/${encodeURIComponent(sector.toLowerCase())}/${encodeURIComponent(subSector.name.toLowerCase())}`}
                            className={styles.viewAllLink}
                        >
                            View All
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path d="M5 12h14M12 5l7 7-7 7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </TransitionLink>
                    </div>

                    <div className={styles.featuredProjects}>
                        {subSector.projects.slice(0, 3).map(project => (
                            <TransitionLink
                                key={project.uid}
                                href={`/sectors/${encodeURIComponent(sector.toLowerCase())}/${encodeURIComponent(subSector.name.toLowerCase())}/${project.uid}`}
                                className={styles.projectPreview}
                            >
                                <div className={styles.projectImage}>
                                    <PrismicNextImage
                                        field={project.data.project_main_image}
                                        sizes="(max-width: 768px) 33vw, 20vw"
                                    />
                                </div>
                                <div className={styles.projectInfo}>
                                    <h3 className={styles.projectName}>{project.data.client_name}</h3>
                                    <span className={styles.projectYear}>{project.data.year}</span>
                                </div>
                            </TransitionLink>
                        ))}
                    </div>
                </motion.div>
            ))}
        </motion.div>
    );
}