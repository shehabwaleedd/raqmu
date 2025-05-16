
'use client'

import { SubMenuContainerProps, ProductCategory, SubmenuItem } from '@/types/navbar';
import { memo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { menuAnimations } from '@/animation/animate';
import styles from './style.module.scss';

const SubMenuContainer = memo(({ activeSubmenu, onNavigate, mousePos, onMouseEnter, onMouseLeave, settings }: SubMenuContainerProps) => {
    const isProducts = activeSubmenu?.toLowerCase() === 'products';
    const items = isProducts
        ? settings.productCategories.sort((a, b) => a.order - b.order)
        : settings.submenuSections.find(section => section.parent_nav === activeSubmenu)?.items.sort((a, b) => a.order - b.order);

    return (
        <AnimatePresence mode="wait">
            {activeSubmenu && items && (
                <motion.div
                    className={styles.submenu}
                    variants={menuAnimations.container}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    onMouseEnter={onMouseEnter}
                    onMouseLeave={onMouseLeave}
                    style={{
                        top: `${mousePos.y + 5}px`,
                        left: `${mousePos.x - 80}px`,
                    }}
                >
                    <motion.div className={styles.submenuBackground} variants={menuAnimations.container} initial="initial" animate="animate" exit="exit" />
                    <motion.ul
                        variants={menuAnimations.list} initial="initial" animate="animate" exit="exit" >
                        {items.map((item, idx) => (
                            <motion.li key={`${item.title}-${idx}`} variants={menuAnimations.item} layout >
                                <motion.button
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => {
                                        if (isProducts) {
                                            onNavigate((item as ProductCategory).href);
                                        } else {
                                            const parentNav = settings.mainNavigation.find(nav => nav.title === activeSubmenu);
                                            onNavigate(`${parentNav?.href}#${(item as SubmenuItem).id}`);
                                        }
                                    }}
                                    className={styles.navButton}
                                >
                                    {item.title}
                                    <motion.div className={styles.buttonHighlight} />
                                </motion.button>
                            </motion.li>
                        ))}
                    </motion.ul>
                </motion.div>
            )}
        </AnimatePresence>
    );
});

export default SubMenuContainer;

