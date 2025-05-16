'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SettingsDocument } from '../../../prismicio-types';
import styles from './style.module.scss';
import Image from 'next/image';

interface NavigationProps {
    settings: SettingsDocument;
}

const transition = {
    type: "spring",
    mass: 0.5,
    damping: 11.5,
    stiffness: 100,
    restDelta: 0.001,
    restSpeed: 0.001,
};

const Navigation: React.FC<NavigationProps> = ({ settings }) => {
    const [active, setActive] = useState<string | null>(null);
    const [isScrolled, setIsScrolled] = useState(false);

    React.useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

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
            .filter((item) => item.title && item.section_id)
            .sort((a, b) => (a.order || 0) - (b.order || 0));
    };

    const mainNav = settings.data.main_navigation || [];

    return (
        <div className={`${styles.navbarWrapper} ${isScrolled ? styles.scrolled : ''}`}>
            <motion.nav className={styles.navbar}onMouseLeave={() => setActive(null)}initial={{ y: -100 }}animate={{ y: 0 }}transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}>
                <div className={styles.container}>
                    <motion.div className={styles.logo} whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
                        {settings.data.site_logo?.url && (
                            <Image src={settings.data.site_logo.url} alt={settings.data.site_title || 'Logo'} width={150} height={55} priority />
                        )}
                    </motion.div>

                    <div className={styles.menuContainer}>
                        {mainNav.map((item, index) => {
                            if (!item.title) return null;

                            return (
                                <div key={`nav-${item.title}-${index}`} className={styles.menuItem} onMouseEnter={() => setActive(item.title)}>
                                    <motion.button className={styles.menuLink} onClick={() => !item.has_submenu && handleNavigation(item.href || '/')} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1, duration: 0.3 }} whileHover={{ opacity: 0.9 }}>
                                        {item.title}
                                    </motion.button>

                                    <AnimatePresence>
                                        {active === item.title && item.has_submenu && (
                                            <motion.div className={styles.submenuWrapper} initial={{ opacity: 0, scale: 0.85, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.85, y: 10 }} transition={transition}>
                                                <motion.div className={styles.submenu} layoutId="active" transition={transition}>
                                                    <motion.div className={styles.submenuContent} layout>
                                                        {getSubmenuForNav(item.title).map((subItem, subIndex) => (
                                                            <motion.button key={`submenu-${subItem.section_id}-${subIndex}`} className={styles.submenuLink} onClick={() => handleNavigation('/', subItem.section_id || '')} whileHover={{ color: 'var(--accent-color)' }} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: subIndex * 0.05 }}>
                                                                {subItem.title}
                                                            </motion.button>
                                                        ))}
                                                    </motion.div>
                                                </motion.div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </motion.nav>
        </div>
    );
};

export default Navigation;