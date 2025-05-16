import TransitionLink from '@/animation/transitionLink';
import styles from './style.module.scss';

interface BreadcrumbsProps {
    clientName: string;
}

export default function Breadcrumbs({ clientName }: BreadcrumbsProps) {
    return (
        <nav className={styles.breadcrumbs}>
            <TransitionLink href="/" className={styles.link}>Home</TransitionLink>
            <span className={styles.separator}>/</span>
            <TransitionLink href="/projects" className={styles.link}>Projects</TransitionLink>
            <span className={styles.separator}>/</span>
            <span className={styles.current}>{clientName}</span>
        </nav>
    );
}