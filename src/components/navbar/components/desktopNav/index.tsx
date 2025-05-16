// import { DesktopNavProps, NavItemProps } from '@/types/navbar';
import { memo } from 'react';
import styles from './style.module.scss';
import Link from 'next/link';
import Image from 'next/image';
import NavItem from '../navItem';
import MenuButton from '../../../header/MenuBtn';

const DesktopNav = memo(({ leftLinks, rightLinks, handleMouseEnter, handleMouseLeave, activeSubmenu, handleNavigation, mousePos, settings, isOpen, toggleMenu }: any) => (

    <header className={styles.header}>
        <nav className={styles.nav}>
            <div className={styles.nav__left}>
                <ul>
                    {leftLinks.map((link, index) => (
                        <NavItem key={`${link.title}-${index}`} link={link} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} activeSubmenu={activeSubmenu} onNavigate={handleNavigation} mousePos={mousePos} />
                    ))}
                </ul>
            </div>

            <Link href="/" aria-label="Logo" className={styles.nav__logo}>
                <Image src={settings.logo.url} alt={settings.logo.alt} width={200} height={200} priority />
            </Link>

            <div className={styles.nav__right}>
                <ul>
                    {rightLinks.map((link, index) => (
                        <NavItem key={`${link.title}-${index}`} link={link} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} activeSubmenu={activeSubmenu} onNavigate={handleNavigation} mousePos={mousePos} />
                    ))}
                </ul>
            </div>
            <MenuButton isOpen={isOpen} toggleMenu={toggleMenu} />  
        </nav>
    </header>
));


export default DesktopNav;

DesktopNav.displayName = 'DesktopNav';