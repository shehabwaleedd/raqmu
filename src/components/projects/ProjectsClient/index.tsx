'use client';

import { useState, useMemo } from 'react';
import { Content } from '@prismicio/client';
import ProjectCard from '@/components/projects/projectCard';
import styles from './style.module.scss';

interface ProjectsClientProps {
    projects: Content.ProjectPostDocument[];
    sectors: string[];
    subSectors: string[];
    locations: string[];
}

export default function ProjectsClient({
    projects,
    sectors,
    subSectors,
    locations
}: ProjectsClientProps) {
    const [selectedSector, setSelectedSector] = useState<string>('');
    const [selectedSubSector, setSelectedSubSector] = useState<string>('');
    const [selectedLocation, setSelectedLocation] = useState<string>('');

    const filteredProjects = useMemo(() => {
        return projects.filter(project => {
            const matchesSector = !selectedSector || project.data.sector === selectedSector;
            const matchesSubSector = !selectedSubSector || project.data.sub_sector === selectedSubSector;
            const matchesLocation = !selectedLocation || project.data.location === selectedLocation;

            return matchesSector && matchesSubSector && matchesLocation;
        });
    }, [projects, selectedSector, selectedSubSector, selectedLocation]);

    const clearFilters = () => {
        setSelectedSector('');
        setSelectedSubSector('');
        setSelectedLocation('');
    };

    const hasActiveFilters = selectedSector || selectedSubSector || selectedLocation;

    return (
        <>
            <div className={styles.filters}>
                <div className={styles.filterGroup}>
                    <label className={styles.filterLabel}>Sector</label>
                    <select
                        className={styles.select}
                        value={selectedSector}
                        onChange={(e) => setSelectedSector(e.target.value)}
                    >
                        <option value="">All Sectors</option>
                        {sectors.map(sector => (
                            <option key={sector} value={sector}>{sector}</option>
                        ))}
                    </select>
                </div>

                <div className={styles.filterGroup}>
                    <label className={styles.filterLabel}>Sub Sector</label>
                    <select
                        className={styles.select}
                        value={selectedSubSector}
                        onChange={(e) => setSelectedSubSector(e.target.value)}
                    >
                        <option value="">All Sub Sectors</option>
                        {subSectors.map(subSector => (
                            <option key={subSector} value={subSector}>{subSector}</option>
                        ))}
                    </select>
                </div>

                <div className={styles.filterGroup}>
                    <label className={styles.filterLabel}>Location</label>
                    <select
                        className={styles.select}
                        value={selectedLocation}
                        onChange={(e) => setSelectedLocation(e.target.value)}
                    >
                        <option value="">All Locations</option>
                        {locations.map(location => (
                            <option key={location} value={location}>{location}</option>
                        ))}
                    </select>
                </div>

                {hasActiveFilters && (
                    <button className={styles.clearButton} onClick={clearFilters}>
                        Clear Filters
                    </button>
                )}
            </div>

            <div className={styles.results}>
                <span className={styles.count}>
                    {filteredProjects.length} {filteredProjects.length === 1 ? 'project' : 'projects'}
                </span>
            </div>

            <div className={styles.grid}>
                {filteredProjects.map(project => (
                    <ProjectCard key={project.uid} project={project} />
                ))}
            </div>
        </>
    );
}