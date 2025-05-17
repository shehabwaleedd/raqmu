import { notFound } from 'next/navigation';
import { createClient } from "@/prismicio";
import { Content, isFilled, predicate } from "@prismicio/client"; // Import predicate properly
import SectorsIndex from '@/components/sectors/sectorIndex';
import SectorDetail from '@/components/sectors/sectorDetail';
import SubSectorDetail from '@/components/sectors/subSectorDetail';
import ProjectDetail from '@/components/projects/projectDetail';
import ProjectsIndex from '@/components/projects/projectsIndex';

export default async function Page({ params }: { params: { slug?: string[] } }) {
    const client = createClient();
    const slug = params.slug || [];

    try {
        // Case 1: /projects - Display all projects
        if (slug.length === 1 && slug[0] === 'projects') {
            const projects = await client.getAllByType<Content.ProjectPostDocument>('project_post', {
                orderings: [{ field: 'document.first_publication_date', direction: 'desc' }]
            });
            return <ProjectsIndex projects={projects} />;
        }

        // Case 2: /sectors - Display all sectors
        if (slug.length === 1 && slug[0] === 'sectors') {
            const sectors = await client.getAllByType<Content.SectorPostDocument>('sector_post');
            return <SectorsIndex sectors={sectors} />;
        }

        // Case 3: /sectors/[sector-uid] - Display a specific sector
        if (slug.length === 2 && slug[0] === 'sectors') {
            const sectorUid = slug[1];
            const sector = await client.getByUID<Content.SectorPostDocument>('sector_post', sectorUid);

            // Fetch all subsectors related to this sector
            const subsectors = [];

            if (sector.data.related_subsectors) {
                for (const rel of sector.data.related_subsectors) {
                    if (isFilled.contentRelationship(rel.subsector)) {
                        const subsector = await client.getByUID<Content.SubsectorPostDocument>(
                            'subsector_post',
                            rel.subsector.uid as string
                        );
                        subsectors.push(subsector);
                    }
                }
            }

            return <SectorDetail sector={sector} subsectors={subsectors} />;
        }

        // Case 4: /sectors/[sector-uid]/[subsector-uid] - Display subsector's projects
        if (slug.length === 3 && slug[0] === 'sectors') {
            const sectorUid = slug[1];
            const subsectorUid = slug[2];

            const subsector = await client.getByUID<Content.SubsectorPostDocument>('subsector_post', subsectorUid);
            const sector = await client.getByUID<Content.SectorPostDocument>('sector_post', sectorUid);

            // Fetch projects related to this subsector using predicate correctly
            const projects = await client.getAllByType<Content.ProjectPostDocument>('project_post', {
                predicates: [
                    // Use predicate instead of client.predicates
                    predicate.at('my.project_post.subsector', subsector.id)
                ],
                orderings: [{ field: 'document.first_publication_date', direction: 'desc' }]
            });

            return <SubSectorDetail sector={sector} subsector={subsector} projects={projects} />;
        }

        // Case 5: /sectors/[sector-uid]/[subsector-uid]/[project-uid] - Display a project
        if (slug.length === 4 && slug[0] === 'sectors') {
            const projectUid = slug[3];
            const project = await client.getByUID<Content.ProjectPostDocument>('project_post', projectUid);

            // Fetch related sector and subsector (safely)
            let subsector = null;
            let sector = null;

            if (isFilled.contentRelationship(project.data.subsector)) {
                subsector = await client.getByID<Content.SubsectorPostDocument>(project.data.subsector.id);
            }

            if (isFilled.contentRelationship(project.data.sector)) {
                sector = await client.getByID<Content.SectorPostDocument>(project.data.sector.id);
            }

            if (!subsector || !sector) {
                return notFound();
            }

            return <ProjectDetail project={project} sector={sector} subsector={subsector} />;
        }

        // If no matching route, throw to 404
        return notFound();
    } catch (error) {
        console.error('Error fetching data:', error);
        return notFound();
    }
}

export async function generateStaticParams() {
    const client = createClient();
    const sectors = await client.getAllByType('sector_post');
    const subsectors = await client.getAllByType('subsector_post');
    const projects = await client.getAllByType('project_post');

    const routes = [
        { slug: ['projects'] },
        { slug: ['sectors'] },
    ];


    sectors.forEach(sector => {
        routes.push({ slug: ['sectors', sector.uid] });
    });

    for (const subsector of subsectors) {
        if (isFilled.contentRelationship(subsector.data.parent_sector)) {
            routes.push({
                slug: ['sectors', subsector.data.parent_sector.uid as string, subsector.uid]
            });
        }
    }

    for (const project of projects) {
        const sector = project.data.sector;
        const subsector = project.data.subsector;

        if (sector && typeof sector === 'object' && 'uid' in sector &&
            subsector && typeof subsector === 'object' && 'uid' in subsector) {
            routes.push({
                slug: ['sectors',
                    sector.uid as string,
                    subsector.uid as string,
                    project.uid]
            });
        }
    }

    return routes;
}