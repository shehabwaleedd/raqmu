'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Content } from '@prismicio/client';
import ProjectCard from '@/components/projects/projectCard';
import styles from './style.module.scss';

interface ProjectsGridProps {
    projects: Content.ProjectPostDocument[];
    locations: string[];
    baseUrl: string;
}

export default function ProjectsGrid({ projects, locations, baseUrl }: ProjectsGridProps) {
    const [selectedLocation, setSelectedLocation] = useState<string>('');
    const [sortBy, setSortBy] = useState<'recent' | 'alphabetical'>('recent');

    const filteredProjects = useMemo(() => {
        const filtered = projects.filter(project => {
            const projectLocation = project.data.location;
            const locationStr = typeof projectLocation === 'string' ? projectLocation : '';
            const matchesLocation = !selectedLocation || locationStr === selectedLocation;
            return matchesLocation;
        });

        if (sortBy === 'alphabetical') {
            filtered.sort((a, b) => {
                const aName = typeof a.data.client_name === 'string' ? a.data.client_name : '';
                const bName = typeof b.data.client_name === 'string' ? b.data.client_name : '';
                return aName.localeCompare(bName);
            });
        } else {
            filtered.sort((a, b) =>
                new Date(b.first_publication_date).getTime() - new Date(a.first_publication_date).getTime()
            );
        }

        return filtered;
    }, [projects, selectedLocation, sortBy]);

    // Create a unique key for the grid to force re-render when filters change
    const gridKey = `${selectedLocation}-${sortBy}`;

    return (
        <div className={styles.projectsContainer}>
            <div className={styles.toolbar}>
                <div className={styles.toolbarLeft}>
                    {locations.length > 0 && (
                        <div className={styles.filterWrapper}>
                            <select
                                className={styles.locationSelect}
                                value={selectedLocation}
                                onChange={(e) => setSelectedLocation(e.target.value)}
                            >
                                <option value="">All Locations</option>
                                {locations.map(location => (
                                    <option key={location} value={location}>{location}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    <div className={styles.results}>
                        <span className={styles.count}>
                            <span className={styles.number}>{filteredProjects.length}</span> projects
                        </span>
                    </div>
                </div>

                <select
                    className={styles.sortSelect}
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as 'recent' | 'alphabetical')}
                >
                    <option value="recent">Most Recent</option>
                    <option value="alphabetical">Alphabetical</option>
                </select>
            </div>

            <motion.div
                key={gridKey}
                className={styles.grid}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
            >
                {filteredProjects.length > 0 ? (
                    filteredProjects.map((project) => (
                        <ProjectCard
                            key={project.uid}
                            project={project}
                            url={`${baseUrl}/${project.uid}`}
                        />
                    ))
                ) : (
                    <div className={styles.emptyState}>
                        <div className={styles.emptyIcon}>🔍</div>
                        <h3 className={styles.emptyTitle}>No projects found</h3>
                        <p className={styles.emptyText}>
                            Try adjusting your filters to find more projects
                        </p>
                    </div>
                )}
            </motion.div>
        </div>
    );
}