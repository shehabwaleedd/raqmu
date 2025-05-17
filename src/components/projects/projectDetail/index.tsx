'use client';

import { Content, isFilled } from '@prismicio/client';
import { PrismicRichText } from '@prismicio/react';
import { PrismicNextImage } from '@prismicio/next';
import Gallery from '@/components/projects/gallery';
import TransitionLink from '@/animation/transitionLink';
import Breadcrumbs, { BreadcrumbItem } from '@/components/breadCrumbs';
import { createClient } from '@/prismicio';
import styles from './style.module.scss';

interface ProjectDetailProps {
    project: Content.ProjectPostDocument;
    sector: Content.SectorPostDocument;
    subsector: Content.SubsectorPostDocument;
}

export default function ProjectDetail({ project, sector, subsector }: ProjectDetailProps) {
    const { data } = project;

    const breadcrumbItems: BreadcrumbItem[] = [
        { label: 'Home', href: '/' },
        { label: 'Sectors', href: '/sectors' },
        { label: sector.data.name || '', href: `/sectors/${sector.uid}` },
        { label: subsector.data.name || '', href: `/sectors/${sector.uid}/${subsector.uid}` },
        { label: data.client_name || '', href: `/sectors/${sector.uid}/${subsector.uid}/${project.uid}`, current: true }
    ];

    return (
        <div className={styles.projectPost}>
            <div className={styles.container}>
                <Breadcrumbs items={breadcrumbItems} />

                <div className={styles.projectLayout}>
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
                                <span className={styles.metaValue}>
                                    <TransitionLink href={`/sectors/${sector.uid}`}>
                                        {sector.data.name || ''}
                                    </TransitionLink>
                                </span>
                            </div>
                            <div className={styles.metaItem}>
                                <span className={styles.metaLabel}>Sub Sector</span>
                                <span className={styles.metaValue}>
                                    <TransitionLink href={`/sectors/${sector.uid}/${subsector.uid}`}>
                                        {subsector.data.name || ''}
                                    </TransitionLink>
                                </span>
                            </div>
                            <div className={styles.metaItem}>
                                <span className={styles.metaLabel}>Location</span>
                                <span className={styles.metaValue}>{data.location}</span>
                            </div>
                        </div>
                    </aside>

                    <main className={styles.content}>
                        <div className={styles.mainImage}>
                            {isFilled.image(data.project_main_image) && (
                                <PrismicNextImage
                                    field={data.project_main_image}
                                    sizes="(max-width: 768px) 100vw, 70vw"
                                    priority
                                />
                            )}
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

            {isFilled.contentRelationship(data.next_project) && data.next_project.uid && (
                <NextProjectLink nextProjectUid={data.next_project.uid as string} />
            )}
        </div>
    );
}

interface NextProjectLinkProps {
    nextProjectUid: string;
}
    
async function NextProjectLink({ nextProjectUid }: NextProjectLinkProps) {
    const client = createClient();

    try {
        const nextProject = await client.getByUID<Content.ProjectPostDocument>('project_post', nextProjectUid);
        let sectorUid = '';
        let subsectorUid = '';

        if (isFilled.contentRelationship(nextProject.data.sector)) {
            const sector = await client.getByID(nextProject.data.sector.id) as Content.SectorPostDocument;
            sectorUid = sector.uid;
        }

        if (isFilled.contentRelationship(nextProject.data.subsector)) {
            const subsector = await client.getByID(nextProject.data.subsector.id) as Content.SubsectorPostDocument;
            subsectorUid = subsector.uid;
        }

        const nextProjectUrl = `/sectors/${sectorUid}/${subsectorUid}/${nextProject.uid}`;

        return (
            <div className={styles.nextProject}>
                <TransitionLink href={nextProjectUrl} className={styles.link}>
                    <div className={styles.background}>
                        {isFilled.image(nextProject.data.project_main_image) && (
                            <PrismicNextImage
                                field={nextProject.data.project_main_image}
                                sizes="100vw"
                                priority
                            />
                        )}
                        <div className={styles.overlay} />
                    </div>
                    <div className={styles.nextContent}>
                        <span className={styles.label}>Next Project</span>
                        <h2 className={styles.title}>{nextProject.data.client_name}</h2>
                    </div>
                </TransitionLink>
            </div>
        );
    } catch (error) {
        console.error('Error fetching next project:', error);
        return null;
    }
}