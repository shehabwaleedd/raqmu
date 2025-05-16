'use client';

import { Content } from '@prismicio/client';
import { PrismicRichText } from '@prismicio/react';
import { PrismicNextImage } from '@prismicio/next';
import Breadcrumbs from '@/components/projects/breadCrumbs';
import Gallery from '@/components/projects/gallery';
import NextProject from '@/components/projects/nextProject';
import styles from './style.module.scss';

interface ProjectPostProps {
    project: Content.ProjectPostDocument;
}

export default function ProjectPost({ project }: ProjectPostProps) {
    const { data } = project;

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
                        <div className={styles.metaItem}>
                            <span className={styles.metaLabel}>Sector</span>
                            <span className={styles.metaValue}>{data.sector}</span>
                        </div>
                        {data.sub_sector && (
                            <div className={styles.metaItem}>
                                <span className={styles.metaLabel}>Sub Sector</span>
                                <span className={styles.metaValue}>{data.sub_sector}</span>
                            </div>
                        )}
                        <div className={styles.metaItem}>
                            <span className={styles.metaLabel}>Location</span>
                            <span className={styles.metaValue}>{data.location}</span>
                        </div>
                    </div>
                </aside>

                <main className={styles.content}>
                    <Breadcrumbs clientName={data.client_name as string} />

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

            {data.next_project && data.next_project.uid && (
                <NextProject projectUid={data.next_project.uid} />
            )}
        </div>
    );
}