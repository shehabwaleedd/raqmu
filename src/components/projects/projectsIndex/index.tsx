'use client';

import { Content } from '@prismicio/client';
import ProjectsGrid from '@/components/projects/projectsGrid';
import styles from './style.module.scss';

interface ProjectsIndexProps {
    projects: Content.ProjectPostDocument[];
}

export default function ProjectsIndex({ projects }: ProjectsIndexProps) {
    const locations = [...new Set(
        projects
            .map(p => p.data.location as string)
            .filter(Boolean)
    )];

    return (
        <div className={styles.projectsPage}>
            <div className={styles.container}>
                <header className={styles.header}>
                    <div className={styles.headerContent}>
                        <span className={styles.eyebrow}>Portfolio</span>
                        <h1 className={styles.title}>Our Projects</h1>
                        <p className={styles.subtitle}>
                            Discover our comprehensive portfolio of prestigious construction projects across Egypt,
                            showcasing excellence in every sector from commercial to residential developments.
                        </p>
                    </div>
                </header>

                <ProjectsGrid
                    projects={projects}
                    locations={locations}
                    baseUrl="/projects"
                />
            </div>
        </div>
    );
}