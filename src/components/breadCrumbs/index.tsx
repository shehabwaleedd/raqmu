import TransitionLink from '@/animation/transitionLink';
import styles from './style.module.scss';

export interface BreadcrumbItem {
    label: string;
    href: string;
    current?: boolean;
}

interface BreadcrumbsProps {
    items: BreadcrumbItem[];
}

export default function Breadcrumbs({ items }: BreadcrumbsProps) {
    return (
        <nav className={styles.breadcrumbs}>
            {items.map((item, index) => (
                <div key={item.href} className={styles.breadcrumbItem}>
                    {item.current ? (
                        <span className={styles.current}>{item.label}</span>
                    ) : (
                        <TransitionLink href={item.href} className={styles.link}>
                            {item.label}
                        </TransitionLink>
                    )}
                    {index < items.length - 1 && (
                        <span className={styles.separator}>/</span>
                    )}
                </div>
            ))}
        </nav>
    );
}