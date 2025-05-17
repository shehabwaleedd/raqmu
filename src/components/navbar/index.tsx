'use client';
import React, { useState, useEffect, useRef } from 'react';
import { SettingsDocument } from '../../../prismicio-types';
import { isFilled, LinkField, ContentRelationshipField } from '@prismicio/client';
import { createClient } from "@/prismicio";
import TransitionLink from '@/animation/transitionLink';
import Image from 'next/image';
import styles from './style.module.scss';
import gsap from 'gsap';
import useEmblaCarousel from 'embla-carousel-react';

interface NavigationProps {
    settings: SettingsDocument;
}

interface SectorWithSubsectors {
    uid: string;
    name: string;
    main_image?: string;
    subsectors: Array<{
        uid: string;
        name: string;
        projects: Array<{
            uid: string;
            name: string;
            main_image?: string;
        }>;
    }>;
}

interface ProjectItem {
    uid: string;
    name: string;
    main_image?: string;
    sectorUid: string;
    subsectorUid: string;
}

interface ProjectDocument {
    uid: string;
    data: {
        client_name?: string;
        main_image?: { url: string };
        sector?: ContentRelationshipField<'sector_post'>;
        subsector?: ContentRelationshipField<'subsector_post'>;
    };
}

function useGSAPNavigation(
    active: string | null,
    activeSector: string | null,
    navbarRef: React.RefObject<HTMLDivElement | null>,
    expandedContentRef: React.RefObject<HTMLDivElement | null>,
    sectorsRef: React.RefObject<HTMLDivElement | null>,
    mobileNavRef: React.RefObject<HTMLDivElement | null>
) {
    const navTimeline = useRef<gsap.core.Timeline | null>(null);
    const contentTimelines = useRef<Record<string, gsap.core.Timeline>>({});
    const exitTimeline = useRef<gsap.core.Timeline | null>(null);
    const isAnimating = useRef(false);
    const prevActive = useRef<string | null>(null);
    const sectorTimeline = useRef<gsap.core.Timeline | null>(null);
    const mobileNavTimeline = useRef<gsap.core.Timeline | null>(null);

    useEffect(() => {
        navTimeline.current = gsap.timeline({ 
            paused: true,
            onComplete: () => {
                isAnimating.current = false;
            }
        });
        
        exitTimeline.current = gsap.timeline({ 
            paused: true,
            onComplete: () => {
                isAnimating.current = false;
            }
        });
        
        mobileNavTimeline.current = gsap.timeline({ paused: true })
            .fromTo(mobileNavRef.current,
                { x: '100%' },
                { 
                    x: '0%', 
                    duration: 0.5, 
                    ease: 'power3.out'
                }
            );

        return () => {
            if (navTimeline.current) navTimeline.current.kill();
            if (exitTimeline.current) exitTimeline.current.kill();
            if (sectorTimeline.current) sectorTimeline.current.kill();
            if (mobileNavTimeline.current) mobileNavTimeline.current.kill();
            Object.values(contentTimelines.current).forEach(timeline => timeline.kill());
        };
    }, []);

    useEffect(() => {
        if (isAnimating.current) return;

        if (active && !prevActive.current) {
            isAnimating.current = true;
            
            // Clear previous animations
            if (navTimeline.current) {
                navTimeline.current.clear();
            }
            
            // Make sure content is visible first for proper measurement
            if (expandedContentRef.current) {
                expandedContentRef.current.style.display = 'block';
                expandedContentRef.current.style.opacity = '0';
                expandedContentRef.current.style.height = 'auto';
                
                // Get the current height
                const contentHeight = expandedContentRef.current.offsetHeight;
                
                // Reset to initial state for animation
                expandedContentRef.current.style.height = '0';
                
                // Create and play animation
                navTimeline.current = gsap.timeline({
                    onComplete: () => {
                        isAnimating.current = false;
                        // Set to auto to handle content changes
                        if (expandedContentRef.current) {
                            expandedContentRef.current.style.height = 'auto';
                        }
                    }
                });
                
                navTimeline.current
                    .to(navbarRef.current, {
                        height: `calc(4.5rem + ${contentHeight}px)`,
                        duration: 0.4,
                        ease: 'power2.inOut'
                    })
                    .to(expandedContentRef.current, {
                        opacity: 1,
                        height: contentHeight,
                        duration: 0.4,
                        ease: 'power2.out'
                    }, '-=0.25');
                
                navTimeline.current.play();
            }
        } else if (!active && prevActive.current) {
            isAnimating.current = true;
            
            // Clear previous animations
            if (exitTimeline.current) {
                exitTimeline.current.clear();
            }
            
            if (expandedContentRef.current) {
                // Get current height before animation
                const contentHeight = expandedContentRef.current.offsetHeight;
                
                // Fix height to current value for smooth animation
                expandedContentRef.current.style.height = `${contentHeight}px`;
                
                exitTimeline.current = gsap.timeline({
                    onComplete: () => {
                        isAnimating.current = false;
                        if (expandedContentRef.current) {
                            expandedContentRef.current.style.display = 'none';
                        }
                    }
                });
                
                exitTimeline.current
                    .to(expandedContentRef.current, {
                        opacity: 0,
                        height: 0,
                        duration: 0.3,
                        ease: 'power2.inOut'
                    })
                    .to(navbarRef.current, {
                        height: '4.5rem',
                        duration: 0.3,
                        ease: 'power2.inOut'
                    }, '-=0.2');
                
                exitTimeline.current.play();
            }
        } else if (active && prevActive.current && active !== prevActive.current) {
            isAnimating.current = true;
            
            const timeline = gsap.timeline({
                onComplete: () => {
                    isAnimating.current = false;
                }
            });
            
            timeline.to(expandedContentRef.current, {
                opacity: 0,
                duration: 0.2,
                ease: 'power2.out',
                onComplete: () => {
                    // Switch content
                    const allSections = document.querySelectorAll(
                        `.${styles.megaMenu}, .${styles.projectsMenu}, .${styles.standardMenu}`
                    );
                    allSections.forEach(section => {
                        if (section.parentElement === expandedContentRef.current) {
                            (section as HTMLElement).style.display = 'none';
                        }
                    });

                    const activeSection = expandedContentRef.current?.querySelector(
                        active === 'Sectors' 
                            ? `.${styles.megaMenu}` 
                            : active === 'Projects' 
                                ? `.${styles.projectsMenu}` 
                                : `.${styles.standardMenu}`
                    );
                    if (activeSection) {
                        (activeSection as HTMLElement).style.display = 'flex';
                    }
                    
                    // Adjust container height for new content
                    if (expandedContentRef.current) {
                        expandedContentRef.current.style.height = 'auto';
                        const newHeight = expandedContentRef.current.offsetHeight;
                        
                        gsap.to(navbarRef.current, {
                            height: `calc(4.5rem + ${newHeight}px)`,
                            duration: 0.3,
                            ease: 'power2.inOut'
                        });
                    }
                }
            })
            .to(expandedContentRef.current, {
                opacity: 1,
                duration: 0.3,
                ease: 'power2.in'
            });
            
            timeline.play();
        }

        prevActive.current = active;
    }, [active]);

    useEffect(() => {
        if (!sectorsRef.current || !activeSector) return;

        const sectorItems = sectorsRef.current.querySelectorAll(`.${styles.sectorItem}`);
        const activeSectorEl = sectorsRef.current.querySelector(`[data-sector="${activeSector}"]`);

        if (sectorTimeline.current) {
            sectorTimeline.current.kill();
        }

        sectorTimeline.current = gsap.timeline()
            .to(sectorItems, {
                opacity: 0.65,
                duration: 0.3,
                ease: 'power2.out'
            });

        if (activeSectorEl) {
            sectorTimeline.current.to(activeSectorEl, {
                opacity: 1,
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
                duration: 0.4,
                ease: 'power2.out'
            }, '-=0.3');
        }

        const subsectorGroups = document.querySelectorAll(`.${styles.subsectorGroup}`);
        if (subsectorGroups.length) {
            gsap.fromTo(subsectorGroups,
                { opacity: 0, y: 10 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.4,
                    stagger: 0.04,
                    ease: 'power2.out'
                }
            );
        }
    }, [activeSector]);

    const initItemAnimations = () => {
        const sectorItems = document.querySelectorAll(`.${styles.sectorItem}`);
        gsap.fromTo(sectorItems,
            { opacity: 0, y: 20 },
            {
                opacity: 1,
                y: 0,
                duration: 0.5,
                stagger: 0.05,
                ease: 'power2.out'
            }
        );
    };

    const toggleMobileNavigation = (isOpen: boolean) => {
        if (isOpen) {
            mobileNavTimeline.current?.play();
        } else {
            mobileNavTimeline.current?.reverse();
        }
    };

    const toggleMobileSector = (element: HTMLElement, isOpen: boolean) => {
        const submenu = element.querySelector(`.${styles.mobileSubmenu}`);
        if (!submenu) return;
        
        gsap.to(submenu, {
            height: isOpen ? 'auto' : 0,
            opacity: isOpen ? 1 : 0,
            duration: 0.4,
            ease: 'power2.inOut',
            onStart: () => {
                if (isOpen) {
                    (submenu as HTMLElement).style.display = 'flex';
                }
            },
            onComplete: () => {
                if (!isOpen) {
                    (submenu as HTMLElement).style.display = 'none';
                }
            }
        });
    };

    return { initItemAnimations, toggleMobileNavigation, toggleMobileSector };
}

const Navigation: React.FC<NavigationProps> = ({ settings }) => {
    const [active, setActive] = useState<string | null>(null);
    const [isScrolled, setIsScrolled] = useState(false);
    const [sectors, setSectors] = useState<SectorWithSubsectors[]>([]);
    const [featuredProjects, setFeaturedProjects] = useState<ProjectItem[]>([]);
    const [activeSector, setActiveSector] = useState<string | null>(null);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [activeMobileSector, setActiveMobileSector] = useState<string | null>(null);

    const navRef = useRef<HTMLDivElement>(null);
    const navbarRef = useRef<HTMLDivElement>(null);
    const expandedContentRef = useRef<HTMLDivElement>(null);
    const sectorsRef = useRef<HTMLDivElement>(null);
    const mobileNavRef = useRef<HTMLDivElement>(null);

    const [emblaRef] = useEmblaCarousel({
        loop: false,
        dragFree: true,
        align: 'start',
        containScroll: 'trimSnaps'
    });

    const { initItemAnimations, toggleMobileNavigation, toggleMobileSector } = useGSAPNavigation(
        active,
        activeSector,
        navbarRef,
        expandedContentRef,
        sectorsRef,
        mobileNavRef
    );

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
                        main_image: sector.data.main_image?.url || '',
                        subsectors: sectorSubsectors.map(s => ({
                            uid: s.uid,
                            name: s.data.name || s.uid,
                            projects: allProjects.filter(project =>
                                isFilled.contentRelationship(project.data.subsector) &&
                                project.data.subsector.id === s.id
                            ).map(p => ({
                                uid: p.uid,
                                name: p.data.client_name || p.uid,
                                main_image: p.data.project_main_image?.url || ''
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
                                    main_image: projectDoc.data.main_image?.url || '',
                                    sectorUid,
                                    subsectorUid
                                };
                            } catch (error) {
                                console.error(`Error fetching project:`, error);
                                return null;
                            }
                        });

                    const fetchedProjects = (await Promise.all(projectPromises))
                        .filter((project): project is NonNullable<typeof project> => project !== null)
                        .map(project => ({
                            uid: project.uid,
                            name: project.name,
                            main_image: project.main_image,
                            sectorUid: project.sectorUid,
                            subsectorUid: project.subsectorUid
                        }));

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
        if (active === 'Sectors') {
            setTimeout(() => {
                initItemAnimations();
            }, 100);
        }
    }, [active]);

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

    const handleSectorHover = (sectorUid: string) => {
        setActiveSector(sectorUid);
    };

    const toggleMobileMenu = () => {
        const newState = !isMobileMenuOpen;
        setIsMobileMenuOpen(newState);
        toggleMobileNavigation(newState);
    };

    const toggleMobileSectorSubmenu = (sectorUid: string) => {
        const newActiveSector = activeMobileSector === sectorUid ? null : sectorUid;
        
        if (activeMobileSector && activeMobileSector !== sectorUid) {
            const prevElement = document.querySelector(`[data-mobile-sector="${activeMobileSector}"]`);
            if (prevElement) {
                toggleMobileSector(prevElement as HTMLElement, false);
            }
        }
        
        const currentElement = document.querySelector(`[data-mobile-sector="${sectorUid}"]`);
        if (currentElement) {
            toggleMobileSector(currentElement as HTMLElement, newActiveSector !== null);
        }
        
        setActiveMobileSector(newActiveSector);
    };

    const mainNav = settings.data.main_navigation || [];

    return (
        <div className={`${styles.navbarWrapper} ${isScrolled ? styles.scrolled : ''}`} ref={navRef}>
            <div className={styles.navbar} ref={navbarRef} onMouseLeave={() => { setActive(null); setActiveSector(null); }}>
                <div className={styles.container}>
                    <div className={styles.logo}>
                        {settings.data.site_logo?.url && (
                            <TransitionLink href="/">
                                <Image src={settings.data.site_logo.url} alt={settings.data.site_title || 'Logo'} width={150} height={55} priority />
                            </TransitionLink>
                        )}
                    </div>
                    <div className={styles.menuContainer}>
                        {mainNav.map((item, index) => {
                            if (!item.title) return null;
                            if (item.title.toLowerCase() === 'sectors' || item.title.toLowerCase() === 'projects') {
                                return null;
                            }
                            return (
                                <div key={`nav-${item.title}-${index}`} className={styles.menuItem} onMouseEnter={() => { setActive(item.title); setActiveSector(null); }}>
                                    {item.has_submenu ? (
                                        <span className={`${styles.menuLink} ${active === item.title ? styles.active : ''}`}>
                                            {item.title}
                                        </span>
                                    ) : (
                                        <TransitionLink href={getLinkUrl(item.link)} className={styles.menuLink}>
                                            {item.title}
                                        </TransitionLink>
                                    )}
                                </div>
                            );
                        })}
                        <div className={styles.menuItem} onMouseEnter={() => { setActive('Sectors'); setActiveSector(sectors.length > 0 ? sectors[0].uid : null); }}>
                            <span className={`${styles.menuLink} ${active === 'Sectors' ? styles.active : ''}`}>
                                Sectors
                            </span>
                        </div>
                        <div className={styles.menuItem} onMouseEnter={() => { setActive('Projects'); setActiveSector(null); }}>
                            <span className={`${styles.menuLink} ${active === 'Projects' ? styles.active : ''}`}>
                                Projects
                            </span>
                        </div>
                    </div>
                    <button className={styles.mobileMenuToggle} onClick={toggleMobileMenu}>
                        <span className={styles.hamburgerIcon}></span>
                    </button>
                </div>
                <div className={styles.expandedContent} ref={expandedContentRef}>
                    {active === 'Sectors' && (
                        <div className={styles.megaMenu}>
                            <div className={styles.embla} ref={emblaRef}>
                                <div className={styles.emblaContainer} ref={sectorsRef}>
                                    {sectors.length > 0 ? sectors.map((sector) => (
                                        <div key={`sector-${sector.uid}`} className={`${styles.sectorItem} ${styles.emblaSlide} ${activeSector === sector.uid ? styles.active : ''}`} data-sector={sector.uid} onMouseEnter={() => handleSectorHover(sector.uid)}>
                                            <div className={styles.sectorImageContainer}>
                                                {sector.main_image ? (
                                                    <Image src={sector.main_image} alt={sector.name} width={260} height={180} className={styles.sectorImage} />
                                                ) : (
                                                    <div className={styles.sectorPlaceholder}></div>
                                                )}
                                                <div className={styles.sectorOverlay}>
                                                    <span>{sector.name}</span>
                                                </div>
                                            </div>
                                        </div>
                                    )) : (
                                        <>
                                            <div className={`${styles.sectorItem} ${styles.emblaSlide}`}>
                                                <div className={styles.sectorImageContainer}>
                                                    <div className={styles.sectorPlaceholder}></div>
                                                    <div className={styles.sectorOverlay}>
                                                        <span>Commercial</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className={`${styles.sectorItem} ${styles.emblaSlide}`}>
                                                <div className={styles.sectorImageContainer}>
                                                    <div className={styles.sectorPlaceholder}></div>
                                                    <div className={styles.sectorOverlay}>
                                                        <span>Residential</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                            <div className={styles.subsectorDisplay}>
                                {activeSector && (
                                    <>
                                        <h3 className={styles.sectorTitle}>
                                            <TransitionLink href={`/sectors/${activeSector}`}>
                                                {sectors.find(s => s.uid === activeSector)?.name}
                                            </TransitionLink>
                                        </h3>
                                        <div className={styles.subsectorRow}>
                                            {sectors.find(s => s.uid === activeSector)?.subsectors.map((subsector) => (
                                                <div key={`subsector-${subsector.uid}`} className={styles.subsectorGroup}>
                                                    <TransitionLink href={`/sectors/${activeSector}/${subsector.uid}`} className={styles.subsectorName}>
                                                        {subsector.name}
                                                    </TransitionLink>
                                                    {subsector.projects && subsector.projects.length > 0 && (
                                                        <div className={styles.projectsBadge}>
                                                            {subsector.projects.length}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                        <div className={styles.featuredProjectsRow}>
                                            {sectors.find(s => s.uid === activeSector)?.subsectors.flatMap(subsector =>
                                                subsector.projects.slice(0, 2).map(project => (
                                                    <TransitionLink key={`featured-${project.uid}`} href={`/sectors/${activeSector}/${subsector.uid}/${project.uid}`} className={styles.featuredProjectLink}>
                                                        {project.name}
                                                    </TransitionLink>
                                                ))
                                            ).slice(0, 5)}
                                        </div>
                                        <div className={styles.viewAllContainer}>
                                            <TransitionLink href={`/sectors/${activeSector}`} className={styles.viewAllLink}>
                                                View All in {sectors.find(s => s.uid === activeSector)?.name}
                                            </TransitionLink>
                                            <TransitionLink href="/sectors" className={styles.viewAllLink}>
                                                Browse All Sectors
                                            </TransitionLink>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    )}
                    {active === 'Projects' && (
                        <div className={styles.projectsMenu}>
                            <h3 className={styles.menuTitle}>Featured Projects</h3>
                            <div className={styles.featuredProjectsGrid}>
                                {featuredProjects.length > 0 ? featuredProjects.map((project) => (
                                    <TransitionLink key={`project-${project.uid}`} href={project.sectorUid && project.subsectorUid ? `/sectors/${project.sectorUid}/${project.subsectorUid}/${project.uid}` : `/projects/${project.uid}`} className={styles.projectCard}>
                                        <div className={styles.projectImageWrapper}>
                                            {project.main_image ? (
                                                <Image src={project.main_image} alt={project.name} width={280} height={160} className={styles.projectImage} />
                                            ) : (
                                                <div className={styles.projectPlaceholder}></div>
                                            )}
                                        </div>
                                        <div className={styles.projectInfo}>
                                            <span className={styles.projectName}>{project.name}</span>
                                            <div className={styles.projectArrow}>→</div>
                                        </div>
                                    </TransitionLink>
                                )) : (
                                    <div className={styles.noProjects}>No featured projects</div>
                                )}
                            </div>
                            <div className={styles.viewAllProjects}>
                                <TransitionLink href="/projects" className={styles.viewAllProjectsLink}>
                                    View All Projects
                                </TransitionLink>
                            </div>
                        </div>
                    )}
                    {active !== 'Sectors' && active !== 'Projects' && (
                        <div className={styles.standardMenu}>
                            {getSubmenuForNav(active || '').map((subItem, subIndex) => (
                                <button key={`submenu-${subItem.section_id}-${subIndex}`} className={styles.submenuLink} onClick={() => handleNavigation('/', subItem.section_id || '')}>
                                    {subItem.title}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
            <div className={styles.mobileNavigation} ref={mobileNavRef}>
                <div className={styles.mobileNavContent}>
                    <div className={styles.mobileNavHeader}>
                        <div className={styles.mobileLogo}>
                            {settings.data.site_logo?.url && (
                                <Image src={settings.data.site_logo.url} alt={settings.data.site_title || 'Logo'} width={120} height={40} />
                            )}
                        </div>
                        <button className={styles.mobileCloseButton} onClick={toggleMobileMenu}>
                            <span className={styles.closeIcon}></span>
                        </button>
                    </div>
                    <div className={styles.mobileNavLinks}>
                        {mainNav.map((item, index) => (
                            <div key={`mobile-${index}`} className={styles.mobileNavItem}>
                                {item.has_submenu ? (
                                    <div className={styles.mobileNavItemWithSubmenu}>
                                        <span className={styles.mobileNavLink}>
                                            {item.title}
                                        </span>
                                        <div className={styles.mobileSubmenu}>
                                            {getSubmenuForNav(item.title || '').map((subItem, subIndex) => (
                                                <button key={`mobile-submenu-${subIndex}`} className={styles.mobileSubmenuLink} onClick={() => { handleNavigation('/', subItem.section_id || ''); setIsMobileMenuOpen(false); }}>
                                                    {subItem.title}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <TransitionLink href={getLinkUrl(item.link)} className={styles.mobileNavLink} onClick={() => setIsMobileMenuOpen(false)}>
                                        {item.title}
                                    </TransitionLink>
                                )}
                            </div>
                        ))}
                        <div className={styles.mobileNavItem} data-mobile-sector="sectors">
                            <div className={styles.mobileNavItemWithSubmenu}>
                                <span className={styles.mobileNavLink} onClick={() => toggleMobileSectorSubmenu('sectors')}>
                                    Sectors
                                    <span className={styles.mobileNavToggle}>
                                        {activeMobileSector === 'sectors' ? '−' : '+'}
                                    </span>
                                </span>
                                <div className={styles.mobileSubmenu}>
                                    {sectors.map(sector => (
                                        <div key={`mobile-sector-${sector.uid}`} data-mobile-sector={sector.uid} className={styles.mobileSubsector}>
                                            <div className={styles.mobileNavItemWithSubmenu}>
                                                <span className={styles.mobileSubmenuLink} onClick={() => toggleMobileSectorSubmenu(sector.uid)}>
                                                    {sector.name}
                                                    <span className={styles.mobileNavToggle}>
                                                        {activeMobileSector === sector.uid ? '−' : '+'}
                                                    </span>
                                                </span>
                                                <div className={styles.mobileSubmenu}>
                                                    {sector.subsectors.map(subsector => (
                                                        <TransitionLink key={`mobile-subsector-${subsector.uid}`} href={`/sectors/${sector.uid}/${subsector.uid}`} className={styles.mobileSubmenuLink} onClick={() => setIsMobileMenuOpen(false)}>
                                                            {subsector.name}
                                                        </TransitionLink>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    <TransitionLink href="/sectors" className={styles.mobileViewAllLink} onClick={() => setIsMobileMenuOpen(false)}>
                                        View All Sectors
                                    </TransitionLink>
                                </div>
                            </div>
                        </div>
                        <div className={styles.mobileNavItem}>
                            <TransitionLink href="/projects" className={styles.mobileNavLink} onClick={() => setIsMobileMenuOpen(false)}>
                                Projects
                            </TransitionLink>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Navigation;