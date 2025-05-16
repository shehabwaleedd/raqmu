'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SettingsDocumentData } from '../../../prismicio-types';
import styles from './style.module.scss';
import Image from 'next/image';

interface NavigationProps {
    settings: SettingsDocumentData;
}

const Navigation: React.FC<NavigationProps> = ({ settings }) => {
    const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleMouseEnter = (navTitle: string) => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        setActiveSubmenu(navTitle);
    };

    const handleMouseLeave = () => {
        timeoutRef.current = setTimeout(() => {
            setActiveSubmenu(null);
        }, 150);
    };

    const handleMobileToggle = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    const handleNavigation = (href: string, sectionId?: string) => {
        if (sectionId && window.location.pathname === '/') {
            const element = document.getElementById(sectionId);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
                setIsMobileMenuOpen(false);
                return;
            }
        }

        if (href && (href.startsWith('http') || href.startsWith('/'))) {
            window.location.href = href;
        }
    };

    const getSubmenuForNav = (navTitle: string) => {
        const submenuSection = settings.submenu_sections?.find(
            (section) => section.parent_nav === navTitle
        );

        if (!submenuSection?.items) return [];

        return submenuSection.items
            .filter((item) => item.title && item.section_id)
            .sort((a, b) => (a.order || 0) - (b.order || 0));
    };

    const mainNav = settings.main_navigation || [];

    return (
        <>
            <motion.nav className={`${styles.navbar} ${isScrolled ? styles.scrolled : ''}`} initial={{ y: -100 }} animate={{ y: 0 }} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}>
                <div className={styles.container}>
                    <motion.div className={styles.logo} whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
                        {settings.site_logo?.url && (
                            <Image src={settings.site_logo.url} alt={settings.site_title || 'Logo'} width={200} height={100} priority />
                        )}
                    </motion.div>

                    <div className={styles.desktopNav}>
                        <ul className={styles.navList}>
                            {mainNav.map((item, index) => {
                                if (!item.title) return null;

                                return (
                                    <li key={`nav-${item.title}-${index}`} className={styles.navItem} onMouseEnter={() => item.has_submenu && handleMouseEnter(item.title || '')} onMouseLeave={() => item.has_submenu && handleMouseLeave()}>
                                        <motion.button className={styles.navLink} onClick={() => handleNavigation(item.href || '/')} whileHover={{ y: -2 }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1, duration: 0.2 }}>
                                            {item.title}
                                        </motion.button>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>

                    <motion.button className={styles.mobileToggle} onClick={handleMobileToggle} whileTap={{ scale: 0.95 }}>
                        <span className={`${styles.hamburger} ${isMobileMenuOpen ? styles.active : ''}`}>
                            <span></span>
                            <span></span>
                            <span></span>
                        </span>
                    </motion.button>
                </div>

                <AnimatePresence mode="wait">
                    {activeSubmenu && (
                        <motion.div className={styles.submenu} initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }} onMouseEnter={() => { if (timeoutRef.current) { clearTimeout(timeoutRef.current); } }} onMouseLeave={handleMouseLeave}>
                            <div className={styles.submenuContent}>
                                {getSubmenuForNav(activeSubmenu).map((item, index) => (
                                    <motion.button key={`submenu-${item.section_id}-${index}`} className={styles.submenuItem} onClick={() => handleNavigation('/', item.section_id || '')} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.05 }} whileHover={{ x: 5 }}>
                                        {item.title}
                                    </motion.button>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.nav>

            <AnimatePresence>
                {isMobileMenuOpen && (
                    <>
                        <motion.div className={styles.overlay} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsMobileMenuOpen(false)} />
                        <motion.div className={styles.mobileMenu} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}>
                            <div className={styles.mobileMenuContent}>
                                {mainNav.map((item, index) => {
                                    if (!item.title) return null;

                                    return (
                                        <motion.div key={`mobile-nav-${item.title}-${index}`}className={styles.mobileNavItem}initial={{ opacity: 0, x: 50 }}animate={{ opacity: 1, x: 0 }}transition={{ delay: index * 0.1 }}>
                                            <button className={styles.mobileNavLink}onClick={() => handleNavigation(item.href || '/')}>
                                                {item.title}
                                            </button>
                                            {item.has_submenu && (
                                                <div className={styles.mobileSubmenu}>
                                                    {getSubmenuForNav(item.title).map((subItem) => (
                                                        <button key={`mobile-submenu-${subItem.section_id}`} className={styles.mobileSubmenuItem} onClick={() => handleNavigation('/', subItem.section_id || '')}>
                                                            {subItem.title}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
};

export default Navigation;