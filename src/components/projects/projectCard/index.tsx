import { Content } from '@prismicio/client';
import { PrismicNextImage } from '@prismicio/next';
import TransitionLink from '@/animation/transitionLink';
import styles from './style.module.scss';

interface ProjectCardProps {
    project: Content.ProjectPostDocument;
}

export default function ProjectCard({ project }: ProjectCardProps) {
    return (
        <article className={styles.card}>
            <TransitionLink href={`/projects/${project.uid}`} className={styles.link}>
                <div className={styles.imageWrapper}>
                    <PrismicNextImage
                        field={project.data.project_main_image}
                        sizes="(max-width: 768px) 100vw, 50vw"
                    />
                </div>
                <div className={styles.content}>
                    <h2 className={styles.title}>{project.data.client_name}</h2>
                    <div className={styles.meta}>
                        <span className={styles.sector}>{project.data.sector}</span>
                        <span className={styles.year}>{project.data.year}</span>
                    </div>
                </div>
            </TransitionLink>
        </article>
    );
}