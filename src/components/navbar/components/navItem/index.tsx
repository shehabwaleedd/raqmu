'use client'
import { memo } from 'react';
import { motion } from 'framer-motion';
import styles from './style.module.scss';
import { usePathname } from 'next/navigation';
import { useRef, useCallback } from 'react';

const NavItem = memo(({ link, onMouseEnter, onMouseLeave, activeSubmenu, onNavigate }: any) => {
    const pathname = usePathname();
    const itemRef = useRef<HTMLLIElement>(null);

    const handleMouseEnter = (e: React.MouseEvent) => {
        const rect = itemRef.current?.getBoundingClientRect();
        if (rect) {
            onMouseEnter(link.title, rect.left + rect.width / 2, rect.bottom);
        }
    };

    const isActivePage = useCallback((href: string) => {
        const [path] = href.split('#');
        return pathname === path || (path === '/' && pathname === path);
    }, [pathname]);

    return (
        <motion.li ref={itemRef} className={styles.navItem} onMouseEnter={handleMouseEnter} onMouseLeave={onMouseLeave}>
            <motion.button onClick={() => onNavigate(link.href)} className={`${styles.navButton} ${isActivePage(link.href) ? styles.active : ''}`} aria-expanded={activeSubmenu === link.title}>
                {link.title}
                {isActivePage(link.href) && (
                    <motion.div className={styles.activeIndicator} layoutId="activeIndicator" />
                )}
            </motion.button>
        </motion.li>
    );
});

export default NavItem;

NavItem.displayName = 'NavItem';