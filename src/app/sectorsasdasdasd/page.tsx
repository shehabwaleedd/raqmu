import { Metadata } from 'next';
import { createClient } from '@/prismicio';
import { Content } from '@prismicio/client';
import SectorsList from '@/components/sectorsList';
import styles from './page.module.scss';

export const metadata: Metadata = {
    title: 'Sectors | Raqmu',
    description: 'Explore our expertise across various construction sectors in Egypt.',
};

export default async function SectorsPage() {
    const client = createClient();
    const projects = await client.getAllByType<Content.ProjectPostDocument>('project_post');

    // Extract unique sectors with their subsectors
    const sectorsMap = new Map();

    projects.forEach(project => {
        const sector = project.data.sector as string;
        const subSector = project.data.sub_sector as string;

        if (!sector) return;

        if (!sectorsMap.has(sector)) {
            sectorsMap.set(sector, new Set());
        }

        if (subSector) {
            sectorsMap.get(sector).add(subSector);
        }
    });

    // Convert to array format
    const sectors = Array.from(sectorsMap.entries()).map(([sector, subSectorsSet]) => ({
        name: sector,
        subSectors: Array.from(subSectorsSet) as string[],
        projectCount: projects.filter(p => p.data.sector === sector).length
    }));

    return (
        <div className={styles.sectorsPage}>
            <div className={styles.container}>
                <header className={styles.header}>
                    <span className={styles.eyebrow}>Expertise</span>
                    <h1 className={styles.title}>Our Sectors</h1>
                    <p className={styles.subtitle}>
                        Explore our comprehensive range of construction expertise across various sectors,
                        from commercial properties to residential developments and specialized facilities.
                    </p>
                </header>

                <SectorsList sectors={sectors} />
            </div>
        </div>
    );
}