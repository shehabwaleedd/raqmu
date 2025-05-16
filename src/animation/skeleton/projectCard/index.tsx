import React from 'react';
import styles from './style.module.scss';

interface SkeletonCardProps {
    index?: number;
}

const SkeletonCard: React.FC<SkeletonCardProps> = () => {
    return (
        <div className={styles.gridContainer} role="list">
            {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className={styles.skeletonCard} aria-hidden="true">
                    <div className={styles.imageWrapper}>
                        <div className={styles.imagePlaceholder} />
                    </div>
                    <div className={styles.infoWrapper}>
                        <div className={styles.titlePlaceholder} />
                        <div className={styles.servicesPlaceholder} />
                    </div>
                </div>
            ))}
        </div>
    );
};

export default SkeletonCard;