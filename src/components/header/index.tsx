'use client';
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import styles from "./style.module.scss";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { MenuProps } from "@/types/navbar";
import { menuVariants, itemVariants, submenuVariants, submenuItemVariants, footerVariants } from "@/animation/animate";
const Menu = ({ isOpen, closeMenu, links = [], socials = [], contactInfo = [], subMenuItems = {}, productCategories = [] }: MenuProps) => {
    const router = useRouter();
    const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);
    const [isAnimating, setIsAnimating] = useState<boolean>(false);

    useEffect(() => {
        setActiveSubmenu(null);
    }, [router]);

    const handleSubmenuToggle = useCallback((title: string) => {
        if (isAnimating) return;
        setIsAnimating(true);
        setActiveSubmenu(prev => (prev === title ? null : title));
        setTimeout(() => setIsAnimating(false), 400);
    }, [isAnimating]);


    const handleNavigation = useCallback((href: string) => {
        closeMenu();
        if (href.startsWith('/projects/')) {
            setTimeout(() => window.location.href = href, 1000);
            return;
        }
        setTimeout(() => {
            window.location.href = href;
        }, 1000);
    }, [closeMenu]);

    return (
        <div className={styles.menuContainer}>
            <AnimatePresence mode="wait">
                {isOpen && (
                    <motion.nav className={styles.menu} initial="initial" animate="animate" exit="exit" variants={menuVariants}>
                        <div className={styles.menuContent}>
                            <div className={styles.navigation}>
                                <ul className={styles.links}>
                                    {links.map((link, index) => (
                                        <motion.li className={styles.linkWrapper} key={index} variants={itemVariants} custom={index}>
                                            <button className={styles.menuButton} onClick={() => handleSubmenuToggle(link.title)} aria-expanded={activeSubmenu === link.title} >
                                                <motion.h2 className={styles.heading} variants={itemVariants}>
                                                    {link.title}
                                                </motion.h2>
                                                <motion.span className={`${styles.arrow} ${activeSubmenu === link.title ? styles.active : ''}`} animate={{ rotate: activeSubmenu === link.title ? 180 : 0, }} transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1], }} aria-hidden="true">
                                                    ↓
                                                </motion.span>
                                            </button>
                                            <AnimatePresence mode="wait">
                                                {activeSubmenu === link.title && (
                                                    <motion.div className={styles.submenu} variants={submenuVariants} initial="initial" animate="animate" exit="exit">
                                                        <div className={styles.submenuContent}>
                                                            <ul>
                                                                {link.title === "Products" ? productCategories.map((category, idx) => (
                                                                    <motion.li key={idx} className={styles.submenuItem} variants={submenuItemVariants}>
                                                                        <button onClick={() => handleNavigation(category.href)}>
                                                                            {category.title}
                                                                        </button>
                                                                    </motion.li>
                                                                ))
                                                                    : subMenuItems[link.title]?.map((item, idx) => (
                                                                        <motion.li key={idx} className={styles.submenuItem} variants={submenuItemVariants}>
                                                                            <button onClick={() => handleNavigation(`${link.href}#${item.id}`)}>
                                                                                {item.title}
                                                                            </button>
                                                                        </motion.li>
                                                                    ))
                                                                }
                                                            </ul>
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </motion.li>
                                    ))}
                                </ul>
                            </div>

                            <motion.footer className={styles.footerContent} variants={footerVariants}>
                                <address className={styles.addressContent}>
                                    {contactInfo.map((line, index) => (
                                        <motion.p className={styles.contactItem} key={index} variants={itemVariants}>
                                            {line}
                                        </motion.p>
                                    ))}
                                </address>

                                <div className={styles.socialContent}>
                                    <ul className={styles.socialList}>
                                        {socials.map((social, index) => (
                                            <motion.li className={styles.socialItem} key={index} variants={itemVariants}>
                                                <Link href={social.url} target="_blank" rel="noopener noreferrer" aria-label={social.label} aria-hidden="true">
                                                    {social.label}
                                                </Link>
                                            </motion.li>
                                        ))}
                                    </ul>
                                </div>
                            </motion.footer>
                        </div>
                    </motion.nav>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Menu;