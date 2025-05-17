import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { createClient } from '@/prismicio';
import { Content } from '@prismicio/client';
import SubSectorsList from '@/components/subSectorList';
import Breadcrumbs from '@/components/breadCrumbs';
import styles from './page.module.scss';

type Params = { sector: string };

export async function generateMetadata({
    params,
}: {
    params: Params;
}): Promise<Metadata> {
    const sector = decodeURIComponent(params.sector);

    return {
        title: `${sector} | Sectors | Raqmu`,
        description: `Explore our ${sector} construction projects and expertise across Egypt.`,
    };
}

export default async function SectorPage({ params }: { params: Params }) {
    const sector = decodeURIComponent(params.sector);
    const formattedSector = sector.charAt(0).toUpperCase() + sector.slice(1);

    const client = createClient();
    const projects = await client.getAllByType<Content.ProjectPostDocument>('project_post', {
        filters: {
            'sector': formattedSector
        }
    });

    if (projects.length === 0) {
        notFound();
    }

    // Extract unique subsectors
    const subSectorsMap = new Map();

    projects.forEach(project => {
        const subSector = project.data.sub_sector as string;

        if (!subSector) return;

        if (!subSectorsMap.has(subSector)) {
            subSectorsMap.set(subSector, {
                name: subSector,
                projectCount: 0,
                projects: []
            });
        }

        const subSectorData = subSectorsMap.get(subSector);
        subSectorData.projectCount += 1;
        subSectorData.projects.push(project);
    });

    const subSectors = Array.from(subSectorsMap.values());

    return (
        <div className={styles.sectorPage}>
            <div className={styles.container}>
                <Breadcrumbs sector={formattedSector} />

                <header className={styles.header}>
                    <span className={styles.eyebrow}>Sector</span>
                    <h1 className={styles.title}>{formattedSector}</h1>
                    <p className={styles.subtitle}>
                        Explore our {formattedSector} projects across various specialized subsectors.
                    </p>
                    <div className={styles.stats}>
                        <div className={styles.statItem}>
                            <span className={styles.statValue}>{projects.length}</span>
                            <span className={styles.statLabel}>Projects</span>
                        </div>
                        <div className={styles.statItem}>
                            <span className={styles.statValue}>{subSectors.length}</span>
                            <span className={styles.statLabel}>Sub Sectors</span>
                        </div>
                    </div>
                </header>

                <SubSectorsList
                    subSectors={subSectors}
                    sector={formattedSector}
                />
            </div>
        </div>
    );
}

export async function generateStaticParams() {
    const client = createClient();
    const projects = await client.getAllByType('project_post');

    const sectors = new Set();
    projects.forEach(project => {
        if (project.data.sector) {
            sectors.add((project.data.sector as string).toLowerCase());
        }
    });

    return Array.from(sectors).map((sector) => ({
        sector: encodeURIComponent(sector as string),
    }));
}