'use client';

import { useState, useMemo } from 'react';
import { Content, isFilled } from '@prismicio/client';
import { motion, AnimatePresence } from 'framer-motion';
import ProjectCard from '@/components/projects/projectCard';
import styles from './style.module.scss';

interface ProjectsClientProps {
    projects: Content.ProjectPostDocument[];
    sectors: string[];
    subSectors: string[];
    locations: string[];
}

interface ActiveFilters {
    sectors: string[];
    subSectors: string[];
    locations: string[];
}

const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.3, ease: [0.25, 0.8, 0.25, 1] }
};

const staggerContainer = {
    animate: {
        transition: {
            staggerChildren: 0.1
        }
    }
};

export default function ProjectsClient({
    projects,
    sectors,
    subSectors,
    locations
}: ProjectsClientProps) {
    const [activeFilters, setActiveFilters] = useState<ActiveFilters>({
        sectors: [],
        subSectors: [],
        locations: []
    });
    const [sortBy, setSortBy] = useState<'recent' | 'alphabetical'>('recent');
    const [showFilters, setShowFilters] = useState(false);

    const filteredProjects = useMemo(() => {
        const filtered = projects.filter(project => {
            let projectSector = '';

            if (isFilled.contentRelationship(project.data.sector)) {
                projectSector = project.data.sector.uid || '';
            }

            let projectSubSector = '';
            if (isFilled.contentRelationship(project.data.subsector)) {
                projectSubSector = project.data.subsector.uid || '';
            }

            const projectLocation = project.data.location || '';

            const matchesSector = activeFilters.sectors.length === 0 || activeFilters.sectors.includes(projectSector);
            const matchesSubSector = activeFilters.subSectors.length === 0 || activeFilters.subSectors.includes(projectSubSector);
            const matchesLocation = activeFilters.locations.length === 0 || activeFilters.locations.includes(projectLocation);

            return matchesSector && matchesSubSector && matchesLocation;
        });

        if (sortBy === 'alphabetical') {
            filtered.sort((a, b) => {
                const aName = a.data.client_name || '';
                const bName = b.data.client_name || '';
                return aName.toString().localeCompare(bName.toString());
            });
        } else {
            filtered.sort((a, b) =>
                new Date(b.first_publication_date).getTime() - new Date(a.first_publication_date).getTime()
            );
        }

        return filtered;
    }, [projects, activeFilters, sortBy]);

    const addFilter = (type: keyof ActiveFilters, value: string) => {
        setActiveFilters(prev => ({
            ...prev,
            [type]: [...prev[type], value]
        }));
    };

    const removeFilter = (type: keyof ActiveFilters, value: string) => {
        setActiveFilters(prev => ({
            ...prev,
            [type]: prev[type].filter(item => item !== value)
        }));
    };

    const clearAllFilters = () => {
        setActiveFilters({ sectors: [], subSectors: [], locations: [] });
    };

    const totalActiveFilters = activeFilters.sectors.length + activeFilters.subSectors.length + activeFilters.locations.length;

    // Create a unique key for the grid to force re-render when filters change
    const gridKey = `${activeFilters.sectors.join(',')}-${activeFilters.subSectors.join(',')}-${activeFilters.locations.join(',')}-${sortBy}`;

    return (
        <>
            <motion.div
                className={styles.toolbar}
                {...fadeInUp}
            >
                <div className={styles.toolbarLeft}>
                    <div className={styles.filtersContainer}>
                        <motion.button
                            className={`${styles.filterToggle} ${showFilters ? styles.active : ''}`}
                            onClick={() => setShowFilters(!showFilters)}
                            whileHover={{ y: -2 }}
                            whileTap={{ y: 0 }}
                            transition={{ duration: 0.2, ease: [0.25, 0.8, 0.25, 1] }}
                        >
                            <motion.svg
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="none"
                                animate={{ rotate: showFilters ? 180 : 0 }}
                                transition={{ duration: 0.3, ease: [0.25, 0.8, 0.25, 1] }}
                            >
                                <path d="M4 6H20M7 12H17M10 18H14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                            </motion.svg>
                            Filters
                            <AnimatePresence>
                                {totalActiveFilters > 0 && (
                                    <motion.span
                                        className={styles.filterCount}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        {totalActiveFilters}
                                    </motion.span>
                                )}
                            </AnimatePresence>
                        </motion.button>

                        <AnimatePresence>
                            {showFilters && (
                                <motion.div
                                    className={styles.filtersPanel}
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.2, ease: [0.25, 0.8, 0.25, 1] }}
                                >
                                    <motion.div {...staggerContainer} initial="initial" animate="animate">
                                        <motion.div className={styles.filterSection} {...fadeInUp}>
                                            <h3 className={styles.filterTitle}>Sectors</h3>
                                            <div className={styles.filterTags}>
                                                {sectors.map((sector, index) => (
                                                    <motion.button
                                                        key={sector}
                                                        className={`${styles.filterTag} ${activeFilters.sectors.includes(sector) ? styles.active : ''
                                                            }`}
                                                        onClick={() =>
                                                            activeFilters.sectors.includes(sector)
                                                                ? removeFilter('sectors', sector)
                                                                : addFilter('sectors', sector)
                                                        }
                                                        initial={{ opacity: 0, y: 10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ delay: index * 0.05, duration: 0.2 }}
                                                        whileHover={{ y: -2 }}
                                                        whileTap={{ y: 0 }}
                                                    >
                                                        {sector}
                                                        <AnimatePresence>
                                                            {activeFilters.sectors.includes(sector) && (
                                                                <motion.svg
                                                                    width="14"
                                                                    height="14"
                                                                    viewBox="0 0 24 24"
                                                                    fill="none"
                                                                    initial={{ opacity: 0, rotate: -90 }}
                                                                    animate={{ opacity: 1, rotate: 0 }}
                                                                    exit={{ opacity: 0, rotate: 90 }}
                                                                    transition={{ duration: 0.2 }}
                                                                >
                                                                    <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                                                </motion.svg>
                                                            )}
                                                        </AnimatePresence>
                                                    </motion.button>
                                                ))}
                                            </div>
                                        </motion.div>

                                        <motion.div className={styles.filterSection} {...fadeInUp}>
                                            <h3 className={styles.filterTitle}>Sub Sectors</h3>
                                            <div className={styles.filterTags}>
                                                {subSectors.map((subSector, index) => (
                                                    <motion.button
                                                        key={subSector}
                                                        className={`${styles.filterTag} ${activeFilters.subSectors.includes(subSector) ? styles.active : ''
                                                            }`}
                                                        onClick={() =>
                                                            activeFilters.subSectors.includes(subSector)
                                                                ? removeFilter('subSectors', subSector)
                                                                : addFilter('subSectors', subSector)
                                                        }
                                                        initial={{ opacity: 0, y: 10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ delay: index * 0.05, duration: 0.2 }}
                                                        whileHover={{ y: -2 }}
                                                        whileTap={{ y: 0 }}
                                                    >
                                                        {subSector}
                                                        <AnimatePresence>
                                                            {activeFilters.subSectors.includes(subSector) && (
                                                                <motion.svg
                                                                    width="14"
                                                                    height="14"
                                                                    viewBox="0 0 24 24"
                                                                    fill="none"
                                                                    initial={{ opacity: 0, rotate: -90 }}
                                                                    animate={{ opacity: 1, rotate: 0 }}
                                                                    exit={{ opacity: 0, rotate: 90 }}
                                                                    transition={{ duration: 0.2 }}
                                                                >
                                                                    <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                                                </motion.svg>
                                                            )}
                                                        </AnimatePresence>
                                                    </motion.button>
                                                ))}
                                            </div>
                                        </motion.div>

                                        <motion.div className={styles.filterSection} {...fadeInUp}>
                                            <h3 className={styles.filterTitle}>Locations</h3>
                                            <div className={styles.filterTags}>
                                                {locations.map((location, index) => (
                                                    <motion.button
                                                        key={location}
                                                        className={`${styles.filterTag} ${activeFilters.locations.includes(location) ? styles.active : ''
                                                            }`}
                                                        onClick={() =>
                                                            activeFilters.locations.includes(location)
                                                                ? removeFilter('locations', location)
                                                                : addFilter('locations', location)
                                                        }
                                                        initial={{ opacity: 0, y: 10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ delay: index * 0.05, duration: 0.2 }}
                                                        whileHover={{ y: -2 }}
                                                        whileTap={{ y: 0 }}
                                                    >
                                                        {location}
                                                        <AnimatePresence>
                                                            {activeFilters.locations.includes(location) && (
                                                                <motion.svg
                                                                    width="14"
                                                                    height="14"
                                                                    viewBox="0 0 24 24"
                                                                    fill="none"
                                                                    initial={{ opacity: 0, rotate: -90 }}
                                                                    animate={{ opacity: 1, rotate: 0 }}
                                                                    exit={{ opacity: 0, rotate: 90 }}
                                                                    transition={{ duration: 0.2 }}
                                                                >
                                                                    <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                                                </motion.svg>
                                                            )}
                                                        </AnimatePresence>
                                                    </motion.button>
                                                ))}
                                            </div>
                                        </motion.div>

                                        <AnimatePresence>
                                            {totalActiveFilters > 0 && (
                                                <motion.div
                                                    className={styles.filterActions}
                                                    {...fadeInUp}
                                                    layout
                                                >
                                                    <motion.button
                                                        className={styles.clearButton}
                                                        onClick={clearAllFilters}
                                                        whileHover={{ y: -2 }}
                                                        whileTap={{ y: 0 }}
                                                    >
                                                        Clear All Filters
                                                    </motion.button>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </motion.div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <motion.div className={styles.results} {...fadeInUp}>
                        <span className={styles.count}>
                            <span className={styles.number}>{filteredProjects.length}</span> projects
                        </span>
                    </motion.div>
                </div>

                <motion.select
                    className={styles.sortSelect}
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as 'recent' | 'alphabetical')}
                    {...fadeInUp}
                >
                    <option value="recent">Most Recent</option>
                    <option value="alphabetical">Alphabetical</option>
                </motion.select>
            </motion.div>

            <motion.div
                key={gridKey}
                className={styles.grid}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
            >
                {filteredProjects.length > 0 ? (
                    filteredProjects.map((project) => {
                        // Safely extract UIDs for the project card URL
                        let sectorUid = '';
                        let subsectorUid = '';

                        if (isFilled.contentRelationship(project.data.sector)) {
                            sectorUid = project.data.sector.uid || '';
                        }

                        if (isFilled.contentRelationship(project.data.subsector)) {
                            subsectorUid = project.data.subsector.uid || '';
                        }

                        return (
                            <ProjectCard
                                key={project.uid}
                                project={project}
                                url={`/sectors/${sectorUid}/${subsectorUid}/${project.uid}`}
                            />
                        );
                    })
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
        </>
    );
}