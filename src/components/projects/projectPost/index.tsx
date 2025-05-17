'use client';

import { Content, isFilled } from '@prismicio/client';
import { PrismicRichText } from '@prismicio/react';
import { PrismicNextImage } from '@prismicio/next';
import Gallery from '@/components/projects/gallery';
import TransitionLink from '@/animation/transitionLink';
import styles from './style.module.scss';

interface ProjectPostProps {
    project: Content.ProjectPostDocument;
}

export default function ProjectPost({ project }: ProjectPostProps) {
    const { data } = project;

    const sectorData = {
        uid: isFilled.contentRelationship(data.sector) ? data.sector.uid || '' : '',
        name: isFilled.contentRelationship(data.sector) ?
            (data.sector.data as { name: string })?.name || '' : ''
    };

    const subsectorData = {
        uid: isFilled.contentRelationship(data.subsector) ? data.subsector.uid || '' : '',
        name: isFilled.contentRelationship(data.subsector) ?
            (data.subsector.data as { name: string })?.name || '' : ''
    };

    return (
        <div className={styles.projectPost}>
            <div className={styles.container}>
                <aside className={styles.sidebar}>
                    <div className={styles.meta}>
                        <div className={styles.metaItem}>
                            <span className={styles.metaLabel}>Year</span>
                            <span className={styles.metaValue}>{data.year}</span>
                        </div>
                        <div className={styles.metaItem}>
                            <span className={styles.metaLabel}>Client</span>
                            <span className={styles.metaValue}>{data.client_name}</span>
                        </div>
                        <div className={styles.metaItem}>
                            <span className={styles.metaLabel}>Role</span>
                            <span className={styles.metaValue}>{data.role}</span>
                        </div>
                        {sectorData.uid && (
                            <div className={styles.metaItem}>
                                <span className={styles.metaLabel}>Sector</span>
                                <span className={styles.metaValue}>
                                    <TransitionLink href={`/sectors/${encodeURIComponent(sectorData.uid)}`}>
                                        {sectorData.name}
                                    </TransitionLink>
                                </span>
                            </div>
                        )}
                        {subsectorData.uid && (
                            <div className={styles.metaItem}>
                                <span className={styles.metaLabel}>Sub Sector</span>
                                <span className={styles.metaValue}>
                                    <TransitionLink href={`/sectors/${encodeURIComponent(sectorData.uid)}/${encodeURIComponent(subsectorData.uid)}`}>
                                        {subsectorData.name}
                                    </TransitionLink>
                                </span>
                            </div>
                        )}
                        <div className={styles.metaItem}>
                            <span className={styles.metaLabel}>Location</span>
                            <span className={styles.metaValue}>{data.location}</span>
                        </div>
                    </div>
                </aside>

                <main className={styles.content}>
                    <div className={styles.mainImage}>
                        <PrismicNextImage
                            field={data.project_main_image}
                            sizes="(max-width: 768px) 100vw, 70vw"
                            priority
                        />
                    </div>

                    <div className={styles.description}>
                        <PrismicRichText field={data.description} />
                    </div>

                    {data.gallery_images && data.gallery_images.length > 0 && (
                        <Gallery images={data.gallery_images} />
                    )}
                </main>
            </div>
        </div>
    );
}