'use client';

import { Content, isFilled } from '@prismicio/client';
import { PrismicRichText } from '@prismicio/react';
import { PrismicNextImage } from '@prismicio/next';
import Breadcrumbs, { BreadcrumbItem } from '@/components/breadCrumbs';
import ProjectsGrid from '@/components/projects/projectsGrid';
import styles from './style.module.scss';

interface SubSectorDetailProps {
    sector: Content.SectorPostDocument;
    subsector: Content.SubsectorPostDocument;
    projects: Content.ProjectPostDocument[];
}

export default function SubSectorDetail({ sector, subsector, projects }: SubSectorDetailProps) {

    const locations = [...new Set(
        projects
            .map(p => p.data.location as string)
            .filter(Boolean)
    )];

    const breadcrumbItems: BreadcrumbItem[] = [
        { label: 'Home', href: '/' },
        { label: 'Sectors', href: '/sectors' },
        { label: sector.data.name || '', href: `/sectors/${sector.uid}` },
        { label: subsector.data.name || '', href: `/sectors/${sector.uid}/${subsector.uid}`, current: true }
    ];

    return (
        <div className={styles.subsectorPage}>
            <div className={styles.container}>
                <Breadcrumbs items={breadcrumbItems} />

                <header className={styles.header}>
                    <div className={styles.headerImage}>
                        {isFilled.image(subsector.data.main_image) && (
                            <PrismicNextImage
                                field={subsector.data.main_image}
                                sizes="100vw"
                                priority
                                fill
                            />
                        )}
                        <div className={styles.headerOverlay} />
                    </div>

                    <div className={styles.headerContent}>
                        <span className={styles.sectorName}>{sector.data.name}</span>
                        <h1 className={styles.title}>{subsector.data.name}</h1>
                        <div className={styles.description}>
                            <PrismicRichText field={subsector.data.description} />
                        </div>
                        <div className={styles.projectCount}>
                            {projects.length} {projects.length === 1 ? 'Project' : 'Projects'}
                        </div>
                    </div>
                </header>

                <section className={styles.projectsSection}>
                    <h2 className={styles.projectsTitle}>Our {subsector.data.name} Projects</h2>

                    <ProjectsGrid
                        projects={projects}
                        locations={locations}
                        baseUrl={`/sectors/${sector.uid}/${subsector.uid}`}
                    />
                </section>
            </div>
        </div>
    );
}