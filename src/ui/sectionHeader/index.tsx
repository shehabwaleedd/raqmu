'use client'

import React from 'react';
import styles from './style.module.scss';
import AnimatedSubs from '@/animation/animatedSubs';
import AnimatedHeaders from '@/animation/animatedHeader';

interface SectionHeaderProps {
    title: string | null;
    description?: string | null;
    alignment?: 'left' | 'center';
    eyebrow?: string | null;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({ title, description, alignment = 'left', eyebrow }) => {

    if (!title) return null;


    return (
        <div className={`${styles.headerContainer} ${styles[alignment]}`}>
            {eyebrow && <div className={styles.eyebrow}>
                <AnimatedSubs phrase={eyebrow} direction={alignment} once={false} delay={0.5} />
            </div>}
            <div className={styles.titleContainer}>
                <AnimatedHeaders phrase={title} as="h2" once={false} />
            </div>
            {description && (
                <AnimatedSubs phrase={description} direction={alignment} once={false} delay={0.5} />
            )}
        </div>
    );
};

export default SectionHeader;