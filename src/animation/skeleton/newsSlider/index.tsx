import React from 'react';
import styles from './style.module.scss';

export const NewsSliderSkeleton: React.FC = () => {
    return (
        <section className={styles.achievementsCarousel}>
            <div className={styles.container}>
                <div className={styles.achievementsCarousel__upper}>
                    <div className={styles.achievementsCarousel__content}>
                        <div className={styles.skeletonTitle} />
                        <div className={styles.skeletonText} />
                    </div>
                </div>
                <div className={styles.achievementsCarousel__lower}>
                    <div className={styles.skeletonSlider}>
                        {[1, 2, 3].map((index) => (
                            <div key={index} className={styles.skeletonCard}>
                                <div className={styles.skeletonImage} />
                                <div className={styles.skeletonContent}>
                                    <div className={styles.skeletonCardTitle} />
                                    <div className={styles.skeletonCardDesc} />
                                    <div className={styles.skeletonCardDesc} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default NewsSliderSkeleton;