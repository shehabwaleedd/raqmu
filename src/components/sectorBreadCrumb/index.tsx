import TransitionLink from '@/animation/transitionLink';
import styles from './style.module.scss';

interface BreadcrumbsProps {
    sector: string;
    subsector?: string;
    project?: string;
}

export default function SectorBreadcrumbs({ sector, subsector, project }: BreadcrumbsProps) {
    return (
        <nav className={styles.breadcrumbs}>
            <TransitionLink href="/" className={styles.link}>Home</TransitionLink>
            <span className={styles.separator}>/</span>
            <TransitionLink href="/sectors" className={styles.link}>Sectors</TransitionLink>
            <span className={styles.separator}>/</span>

            {subsector ? (
                <>
                    <TransitionLink href={`/sectors/${encodeURIComponent(sector.toLowerCase())}`} className={styles.link}>
                        {sector}
                    </TransitionLink>
                    <span className={styles.separator}>/</span>

                    {project ? (
                        <>
                            <TransitionLink
                                href={`/sectors/${encodeURIComponent(sector.toLowerCase())}/${encodeURIComponent(subsector.toLowerCase())}`}
                                className={styles.link}
                            >
                                {subsector}
                            </TransitionLink>
                            <span className={styles.separator}>/</span>
                            <span className={styles.current}>{project}</span>
                        </>
                    ) : (
                        <span className={styles.current}>{subsector}</span>
                    )}
                </>
            ) : (
                <span className={styles.current}>{sector}</span>
            )}
        </nav>
    );
}