import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { createClient } from '@/prismicio';
import { Content } from '@prismicio/client';
import ProjectsClient from '@/components/projects/ProjectsClient';
import Breadcrumbs from '@/components/breadCrumbs';
import styles from './page.module.scss';

type Params = { sector: string; subsector: string };

export async function generateMetadata({
    params,
}: {
    params: Params;
}): Promise<Metadata> {
    const sector = decodeURIComponent(params.sector);
    const subsector = decodeURIComponent(params.subsector);

    return {
        title: `${subsector} | ${sector} | Sectors | Raqmu`,
        description: `Explore our ${subsector} projects in the ${sector} sector across Egypt.`,
    };
}

export default async function SubSectorPage({ params }: { params: Params }) {
    const sector = decodeURIComponent(params.sector);
    const subsector = decodeURIComponent(params.subsector);

    const formattedSector = sector.charAt(0).toUpperCase() + sector.slice(1);
    const formattedSubSector = subsector.charAt(0).toUpperCase() + subsector.slice(1);

    const client = createClient();
    const projects = await client.getAllByType<Content.ProjectPostDocument>('project_post', {
        filters: {
            sector: formattedSector,
            sub_sector: formattedSubSector
        },
        orderings: [
            { field: 'document.first_publication_date', direction: 'desc' }
        ]
    });

    if (projects.length === 0) {
        notFound();
    }

    const locations = [...new Set(
        projects
            .map(p => p.data.location as string)
            .filter((location): location is string => typeof location === 'string')
    )];

    return (
        <div className={styles.subsectorPage}>
            <div className={styles.container}>
                <Breadcrumbs
                    sector={formattedSector}
                    subsector={formattedSubSector}
                />

                <header className={styles.header}>
                    <div className={styles.headerContent}>
                        <span className={styles.eyebrow}>{formattedSector}</span>
                        <h1 className={styles.title}>{formattedSubSector}</h1>
                        <p className={styles.subtitle}>
                            Explore our portfolio of {formattedSubSector} projects, showcasing excellence
                            in {formattedSector.toLowerCase()} construction.
                        </p>
                    </div>
                </header>

                <ProjectsClient
                    projects={projects}
                    sectors={[]}
                    subSectors={[]}
                    locations={locations}
                />
            </div>
        </div>
    );
}

export async function generateStaticParams() {
    const client = createClient();
    const projects = await client.getAllByType('project_post');

    const params: { sector: string; subsector: string }[] = [];

    projects.forEach(project => {
        const sector = project.data.sector as string;
        const subSector = project.data.sub_sector as string;

        if (sector && subSector) {
            params.push({
                sector: encodeURIComponent(sector.toLowerCase()),
                subsector: encodeURIComponent(subSector.toLowerCase())
            });
        }
    });

    return params;
}