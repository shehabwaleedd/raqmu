'use client';
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SettingsDocument } from '../../../prismicio-types';
import { isFilled, LinkField, ContentRelationshipField } from '@prismicio/client';
import { createClient } from "@/prismicio";
import TransitionLink from '@/animation/transitionLink';
import Image from 'next/image';
import styles from './style.module.scss';

interface NavigationProps {
    settings: SettingsDocument;
}

interface SectorWithSubsectors {
    uid: string;
    name: string;
    subsectors: Array<{
        uid: string;
        name: string;
        projects: Array<{
            uid: string;
            name: string;
        }>;
    }>;
}

interface ProjectItem {
    uid: string;
    name: string;
    sectorUid: string;
    subsectorUid: string;
}

interface ProjectDocument {
    uid: string;
    data: {
        client_name?: string;
        sector?: ContentRelationshipField<'sector_post'>;
        subsector?: ContentRelationshipField<'subsector_post'>;
    };
}

const fadeInVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 }
};

const slideVariants = {
    hidden: { x: 10, opacity: 0 },
    visible: { x: 0, opacity: 1 },
    exit: { x: 10, opacity: 0 }
};

const transition = {
    type: "spring",
    mass: 0.3,
    damping: 25,
    stiffness: 200,
    restDelta: 0.001,
    restSpeed: 0.001,
};

const Navigation: React.FC<NavigationProps> = ({ settings }) => {
    const [active, setActive] = useState<string | null>(null);
    const [isScrolled, setIsScrolled] = useState(false);
    const [sectors, setSectors] = useState<SectorWithSubsectors[]>([]);
    const [featuredProjects, setFeaturedProjects] = useState<ProjectItem[]>([]);
    const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);

    const navRef = useRef<HTMLDivElement>(null);
    const sectorMenuRef = useRef<HTMLDivElement>(null);
    const sectorsMap = useRef<Map<string, HTMLDivElement>>(new Map());

    useEffect(() => {
        async function fetchSectorsAndProjects() {
            try {
                const client = createClient();
                const sectorsResponse = await client.getAllByType('sector_post');
                const allSubsectors = await client.getAllByType('subsector_post');
                const allProjects = await client.getAllByType('project_post');

                const processedSectors = sectorsResponse.map((sector) => {
                    const sectorSubsectors = allSubsectors.filter(subsector =>
                        isFilled.contentRelationship(subsector.data.parent_sector) &&
                        subsector.data.parent_sector.id === sector.id
                    );

                    return {
                        uid: sector.uid,
                        name: sector.data.name || sector.uid,
                        subsectors: sectorSubsectors.map(s => ({
                            uid: s.uid,
                            name: s.data.name || s.uid,
                            projects: allProjects.filter(project =>
                                isFilled.contentRelationship(project.data.subsector) &&
                                project.data.subsector.id === s.id
                            ).map(p => ({
                                uid: p.uid,
                                name: p.data.client_name || p.uid
                            }))
                        }))
                    };
                });

                setSectors(processedSectors);

                if (settings.data.product_categories && Array.isArray(settings.data.product_categories)) {
                    const projectPromises = settings.data.product_categories
                        .filter(category => isFilled.contentRelationship(category.project))
                        .map(async (category) => {
                            try {
                                if (!isFilled.contentRelationship(category.project)) {
                                    return null;
                                }

                                const projectDoc = await client.getByID(category.project.id) as unknown as ProjectDocument;
                                let sectorUid = '';
                                let subsectorUid = '';

                                if (projectDoc.data.sector && isFilled.contentRelationship(projectDoc.data.sector)) {
                                    sectorUid = projectDoc.data.sector.uid || '';

                                    if (projectDoc.data.subsector && isFilled.contentRelationship(projectDoc.data.subsector)) {
                                        subsectorUid = projectDoc.data.subsector.uid || '';
                                    }
                                }

                                return {
                                    uid: projectDoc.uid,
                                    name: projectDoc.data.client_name || projectDoc.uid,
                                    sectorUid,
                                    subsectorUid
                                };
                            } catch (error) {
                                console.error(`Error fetching project:`, error);
                                return null;
                            }
                        });

                    const fetchedProjects = (await Promise.all(projectPromises)).filter(
                        (project): project is ProjectItem => project !== null
                    );

                    setFeaturedProjects(fetchedProjects);
                }
            } catch (error) {
                console.error('Error fetching navigation data:', error);
            }
        }

        fetchSectorsAndProjects();
    }, [settings]);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        if (!active) return;

        const adjustSubsectorMenuPositions = () => {
            const viewportWidth = window.innerWidth;

            sectorsMap.current.forEach((sectorEl) => {
                if (!sectorEl) return;

                const sectorRect = sectorEl.getBoundingClientRect();
                const subsectorMenu = sectorEl.querySelector(`.${styles.subsectorMenu}`);

                if (subsectorMenu) {
                    const subsectorMenuRect = subsectorMenu.getBoundingClientRect();
                    const wouldOverflowRight = sectorRect.right + subsectorMenuRect.width > viewportWidth;

                    if (wouldOverflowRight) {
                        subsectorMenu.classList.add(styles.leftAligned);
                    } else {
                        subsectorMenu.classList.remove(styles.leftAligned);
                    }
                }
            });
        };

        const adjustMainSubmenuPositions = () => {
            const mainSubmenus = document.querySelectorAll(`.${styles.submenuWrapper}`);
            const viewportWidth = window.innerWidth;

            mainSubmenus.forEach(menu => {
                const menuRect = menu.getBoundingClientRect();

                if (menuRect.right > viewportWidth) {
                    menu.classList.add(styles.rightAligned);
                } else if (menuRect.left < 0) {
                    menu.classList.add(styles.leftAligned);
                } else {
                    menu.classList.remove(styles.rightAligned);
                    menu.classList.remove(styles.leftAligned);
                }
            });
        };

        requestAnimationFrame(() => {
            adjustMainSubmenuPositions();
            adjustSubsectorMenuPositions();
        });

        window.addEventListener('resize', adjustSubsectorMenuPositions);
        window.addEventListener('resize', adjustMainSubmenuPositions);

        return () => {
            window.removeEventListener('resize', adjustSubsectorMenuPositions);
            window.removeEventListener('resize', adjustMainSubmenuPositions);
        };
    }, [active, activeSubmenu]);

    const handleNavigation = (href: string, sectionId?: string) => {
        if (sectionId && window.location.pathname === '/') {
            const element = document.getElementById(sectionId);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                setActive(null);
                return;
            }
        }

        if (href && (href.startsWith('http') || href.startsWith('/'))) {
            window.location.href = href;
        }
    };

    const getSubmenuForNav = (navTitle: string) => {
        const submenuSection = settings.data.submenu_sections?.find(
            (section) => section.parent_nav === navTitle
        );

        if (!submenuSection?.items) return [];

        return submenuSection.items
            .filter((item) => item.title && item.section_id);
    };

    const getLinkUrl = (link: LinkField | null | undefined): string => {
        if (!link || !isFilled.link(link)) return '/';

        if (link.link_type === 'Web') {
            return link.url || '/';
        } else if (link.link_type === 'Document') {
            if (link.type === 'page') {
                return `/${link.uid}`;
            } else if (link.type === 'sector_post') {
                return `/sectors/${link.uid}`;
            } else if (link.type === 'project_post') {
                return `/projects/${link.uid}`;
            }
        }

        return '/';
    };

    const handleSectorMouseEnter = (sectorUid: string) => {
        setActiveSubmenu(sectorUid);
    };

    const handleSectorMouseLeave = () => {
        setActiveSubmenu(null);
    };

    const setSectorRef = (uid: string, el: HTMLDivElement | null) => {
        if (el) {
            sectorsMap.current.set(uid, el);
        } else {
            sectorsMap.current.delete(uid);
        }
    };

    const mainNav = settings.data.main_navigation || [];

    return (
        <div
            className={`${styles.navbarWrapper} ${isScrolled ? styles.scrolled : ''}`}
            ref={navRef}
        >
            <motion.nav
                className={styles.navbar}
                onMouseLeave={() => {
                    setActive(null);
                    setActiveSubmenu(null);
                }}
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
                <div className={styles.container}>
                    <motion.div
                        className={styles.logo}
                        whileHover={{ scale: 1.02 }}
                        transition={{ duration: 0.2 }}
                    >
                        {settings.data.site_logo?.url && (
                            <TransitionLink href="/">
                                <Image
                                    src={settings.data.site_logo.url}
                                    alt={settings.data.site_title || 'Logo'}
                                    width={150}
                                    height={55}
                                    priority
                                />
                            </TransitionLink>
                        )}
                    </motion.div>

                    <div className={styles.menuContainer}>
                        {mainNav.map((item, index) => {
                            if (!item.title) return null;
                            if (item.title.toLowerCase() === 'sectors' || item.title.toLowerCase() === 'projects') {
                                return null;
                            }

                            return (
                                <div
                                    key={`nav-${item.title}-${index}`}
                                    className={styles.menuItem}
                                    onMouseEnter={() => {
                                        setActive(item.title);
                                        setActiveSubmenu(null);
                                    }}
                                >
                                    {item.has_submenu ? (
                                        <span className={styles.menuLink}>
                                            {item.title}
                                        </span>
                                    ) : (
                                        <TransitionLink
                                            href={getLinkUrl(item.link)}
                                            className={styles.menuLink}
                                        >
                                            {item.title}
                                        </TransitionLink>
                                    )}

                                    <AnimatePresence mode="wait">
                                        {active === item.title && item.has_submenu && (
                                            <motion.div
                                                className={styles.submenuWrapper}
                                                variants={fadeInVariants}
                                                initial="hidden"
                                                animate="visible"
                                                exit="exit"
                                                transition={transition}
                                            >
                                                <div className={styles.submenu}>
                                                    <div className={styles.submenuContent}>
                                                        {getSubmenuForNav(item.title).map((subItem, subIndex) => (
                                                            <motion.button
                                                                key={`submenu-${subItem.section_id}-${subIndex}`}
                                                                className={styles.submenuLink}
                                                                onClick={() => handleNavigation('/', subItem.section_id || '')}
                                                                whileHover={{ color: 'var(--accent-color)' }}
                                                                variants={fadeInVariants}
                                                                initial="hidden"
                                                                animate="visible"
                                                                custom={subIndex}
                                                                transition={{
                                                                    ...transition,
                                                                    delay: subIndex * 0.03 // Faster staggered animation
                                                                }}
                                                            >
                                                                {subItem.title}
                                                            </motion.button>
                                                        ))}
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            );
                        })}

                        <div
                            className={styles.menuItem}
                            onMouseEnter={() => {
                                setActive('Sectors');
                            }}
                            ref={sectorMenuRef}
                        >
                            <TransitionLink href="/sectors" className={styles.menuLink}>
                                Sectors
                            </TransitionLink>

                            <AnimatePresence mode="wait">
                                {active === 'Sectors' && (
                                    <motion.div
                                        className={styles.submenuWrapper}
                                        variants={fadeInVariants}
                                        initial="hidden"
                                        animate="visible"
                                        exit="exit"
                                        transition={transition}
                                    >
                                        <div className={`${styles.submenu} ${styles.sectorsSubmenu}`}>
                                            <div className={styles.submenuContent}>
                                                <div className={styles.sectorLinks}>
                                                    {sectors.length > 0 ? sectors.map((sector) => (
                                                        <div
                                                            key={`sector-${sector.uid}`}
                                                            className={styles.sectorItem}
                                                            ref={(el) => setSectorRef(sector.uid, el)}
                                                            onMouseEnter={() => handleSectorMouseEnter(sector.uid)}
                                                        >
                                                            <TransitionLink
                                                                href={`/sectors/${sector.uid}`}
                                                                className={`${styles.sectorLink} ${activeSubmenu === sector.uid ? styles.active : ''}`}
                                                            >
                                                                {sector.name}
                                                                {sector.subsectors.length > 0 && (
                                                                    <svg
                                                                        width="12"
                                                                        height="12"
                                                                        viewBox="0 0 24 24"
                                                                        fill="none"
                                                                        className={styles.chevron}
                                                                    >
                                                                        <path d="M10 6L16 12L10 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                                                    </svg>
                                                                )}
                                                            </TransitionLink>

                                                            {sector.subsectors.length > 0 && (
                                                                <motion.div
                                                                    className={`${styles.subsectorMenu} ${activeSubmenu === sector.uid ? styles.visible : ''}`}
                                                                    variants={slideVariants}
                                                                    initial="hidden"
                                                                    animate={activeSubmenu === sector.uid ? "visible" : "hidden"}
                                                                    transition={transition}
                                                                >
                                                                    {sector.subsectors.map((subsector, idx) => (
                                                                        <motion.div
                                                                            key={`subsector-${subsector.uid}`}
                                                                            variants={fadeInVariants}
                                                                            initial="hidden"
                                                                            animate="visible"
                                                                            transition={{
                                                                                ...transition,
                                                                                delay: idx * 0.02
                                                                            }}
                                                                        >
                                                                            <TransitionLink
                                                                                href={`/sectors/${sector.uid}/${subsector.uid}`}
                                                                                className={styles.subsectorLink}
                                                                            >
                                                                                {subsector.name}
                                                                            </TransitionLink>
                                                                            {subsector.projects && subsector.projects.length > 0 && (
                                                                                <div className={styles.projectCategory}>
                                                                                    <h3 className={styles.categoryTitle}>Projects</h3>
                                                                                    <div className={styles.projectList}>
                                                                                        {subsector.projects.map((project, pIdx) => (
                                                                                            <motion.div
                                                                                                key={project.uid}
                                                                                                variants={fadeInVariants}
                                                                                                initial="hidden"
                                                                                                animate="visible"
                                                                                                transition={{
                                                                                                    ...transition,
                                                                                                    delay: (idx * 0.02) + (pIdx * 0.01)
                                                                                                }}
                                                                                            >
                                                                                                <TransitionLink
                                                                                                    href={`/sectors/${sector.uid}/${subsector.uid}/${project.uid}`}
                                                                                                    className={styles.projectLink}
                                                                                                >
                                                                                                    {project.name}
                                                                                                </TransitionLink>
                                                                                            </motion.div>
                                                                                        ))}
                                                                                    </div>
                                                                                </div>
                                                                            )}
                                                                        </motion.div>
                                                                    ))}
                                                                </motion.div>
                                                            )}
                                                        </div>
                                                    )) : (
                                                        <>
                                                            <TransitionLink href="/sectors/commerical" className={styles.sectorLink}>
                                                                Commercial
                                                            </TransitionLink>
                                                            <TransitionLink href="/sectors/residential" className={styles.sectorLink}>
                                                                Residential
                                                            </TransitionLink>
                                                        </>
                                                    )}
                                                    <TransitionLink href="/sectors" className={styles.viewAllLink}>
                                                        View All Sectors
                                                    </TransitionLink>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        <div
                            className={styles.menuItem}
                            onMouseEnter={() => {
                                setActive('Projects');
                                setActiveSubmenu(null);
                            }}
                        >
                            <TransitionLink href="/projects" className={styles.menuLink}>
                                Projects
                            </TransitionLink>

                            <AnimatePresence mode="wait">
                                {active === 'Projects' && (
                                    <motion.div
                                        className={styles.submenuWrapper}
                                        variants={fadeInVariants}
                                        initial="hidden"
                                        animate="visible"
                                        exit="exit"
                                        transition={transition}
                                    >
                                        <div className={styles.submenu}>
                                            <div className={styles.submenuContent}>
                                                <div className={styles.projectCategory}>
                                                    <h3 className={styles.categoryTitle}>Featured Projects</h3>
                                                    <div className={styles.projectList}>
                                                        {featuredProjects.length > 0 ? featuredProjects.map((project, idx) => (
                                                            <motion.div
                                                                key={project.uid}
                                                                variants={fadeInVariants}
                                                                initial="hidden"
                                                                animate="visible"
                                                                transition={{
                                                                    ...transition,
                                                                    delay: idx * 0.03
                                                                }}
                                                            >
                                                                <TransitionLink
                                                                    href={project.sectorUid && project.subsectorUid ?
                                                                        `/sectors/${project.sectorUid}/${project.subsectorUid}/${project.uid}` :
                                                                        `/projects/${project.uid}`
                                                                    }
                                                                    className={styles.projectLink}
                                                                >
                                                                    {project.name}
                                                                </TransitionLink>
                                                            </motion.div>
                                                        )) : (
                                                            <span className={styles.projectLink}>No featured projects</span>
                                                        )}
                                                    </div>
                                                </div>
                                                <TransitionLink href="/projects" className={styles.viewAllLink}>
                                                    View All Projects
                                                </TransitionLink>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </motion.nav>
        </div>
    );
};

export default Navigation;