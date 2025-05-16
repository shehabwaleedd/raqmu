import { Content, isFilled, ContentRelationshipField } from '@prismicio/client';
import { createClient } from '@/prismicio';
import { PrismicNextImage, PrismicNextLink } from '@prismicio/next';
import styles from './style.module.scss';

interface NextProjectProps {
    project: ContentRelationshipField<"project_post", string, unknown>;
}

export default async function NextProject({ project }: NextProjectProps) {
    if (!isFilled.contentRelationship(project)) {
        return null;
    }

    const client = createClient();

    try {
        const nextProject = await client.getByUID<Content.ProjectPostDocument>('project_post', project.uid!);

        return (
            <div className={styles.nextProject}>
                <PrismicNextLink document={nextProject} className={styles.link}>
                    <div className={styles.background}>
                        <PrismicNextImage
                            field={nextProject.data.project_main_image}
                            sizes="100vw"
                            priority
                        />
                        <div className={styles.overlay} />
                    </div>
                    <div className={styles.content}>
                        <span className={styles.label}>Next Project</span>
                        <h2 className={styles.title}>{nextProject.data.client_name}</h2>
                    </div>
                </PrismicNextLink>
            </div>
        );
    } catch (error) {
        console.error('Error fetching next project:', error);
        return null;
    }
}