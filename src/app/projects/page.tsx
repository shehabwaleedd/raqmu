import { Metadata } from 'next';
import { createClient } from '@/prismicio';
import { Content } from '@prismicio/client';
import ProjectsClient from '@/components/projects/ProjectsClient';
import styles from './page.module.scss';

export const metadata: Metadata = {
    title: 'Projects | Raqmu',
    description: 'Explore our portfolio of prestigious construction projects across Egypt.',
};

export default async function ProjectsPage() {
    const client = createClient();
    const projects = await client.getAllByType<Content.ProjectPostDocument>('project_post', {
        orderings: [
            { field: 'document.first_publication_date', direction: 'desc' }
        ]
    });

    const sectors = [...new Set(projects.map(p => p.data.sector).filter(Boolean))];
    const subSectors = [...new Set(projects.map(p => p.data.sub_sector).filter(Boolean))];
    const locations = [...new Set(projects.map(p => p.data.location).filter(Boolean))];

    return (
        <div className={styles.projectsPage}>
            <div className={styles.container}>
                <header className={styles.header}>
                    <h1 className={styles.title}>Our Projects</h1>
                    <p className={styles.subtitle}>
                        Explore our portfolio of prestigious construction projects across Egypt
                    </p>
                </header>

                <ProjectsClient
                    projects={projects}
                    sectors={sectors}
                    subSectors={subSectors}
                    locations={locations}
                />
            </div>
        </div>
    );
}