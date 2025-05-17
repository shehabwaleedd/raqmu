import { notFound } from 'next/navigation';
import { createClient } from "@/prismicio";
import { Content, isFilled } from "@prismicio/client";
import SectorsIndex from '@/components/sectors/sectorIndex';
import SectorDetail from '@/components/sectors/sectorDetail';
import SubSectorDetail from '@/components/sectors/subSectorDetail';
import ProjectDetail from '@/components/projects/projectDetail';
import ProjectsIndex from '@/components/projects/projectsIndex';

export default async function Page({ params }: { params: { slug?: string[] } }) {
    const slug = params.slug || [];
    const client = createClient();

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
            let subsectors = [];

            if (sector.data.related_subsectors && Array.isArray(sector.data.related_subsectors)) {
                for (const rel of sector.data.related_subsectors) {
                    if (rel && typeof rel === 'object' && 'subsector' in rel &&
                        isFilled.contentRelationship(rel.subsector)) {
                        try {
                            const subsector = await client.getByUID<Content.SubsectorPostDocument>(
                                'subsector_post',
                                rel.subsector.uid as string
                            );
                            subsectors.push(subsector);
                        } catch (error) {
                            console.error(`Failed to fetch subsector: ${rel.subsector.uid}`, error);
                        }
                    }
                }
            }

            if (subsectors.length === 0) {
                try {
                    const allSubsectors = await client.getAllByType<Content.SubsectorPostDocument>('subsector_post');
                    subsectors = allSubsectors.filter(subsector => {
                        return isFilled.contentRelationship(subsector.data.parent_sector) &&
                            subsector.data.parent_sector.id === sector.id;
                    });
                } catch (error) {
                    console.error(`Failed to fetch all subsectors`, error);
                }
            }

            return <SectorDetail sector={sector} subsectors={subsectors} />;
        }

        // Case 4: /sectors/[sector-uid]/[subsector-uid] - Display subsector's projects
        if (slug.length === 3 && slug[0] === 'sectors') {
            const sectorUid = slug[1];
            const subsectorUid = slug[2];

            try {
                const subsector = await client.getByUID<Content.SubsectorPostDocument>(
                    'subsector_post',
                    subsectorUid
                );

                const sector = await client.getByUID<Content.SectorPostDocument>(
                    'sector_post',
                    sectorUid
                );


                const allProjects = await client.getAllByType<Content.ProjectPostDocument>('project_post');
                console.log(`Total projects: ${allProjects.length}`);

                const projects = allProjects.filter(project => {
                    if (project.data.subsector && typeof project.data.subsector === 'string' && project.data.subsector === subsectorUid) {
                        return true;
                    }

                    if (project.data.subsector && typeof project.data.subsector === 'object') {
                        if ('uid' in project.data.subsector && project.data.subsector.uid === subsectorUid) {
                            return true;
                        }

                        if ('id' in project.data.subsector && project.data.subsector.id === subsector.id) {
                            return true;
                        }
                    }

                    return false;
                });

                console.log(`Found ${projects.length} matching projects for subsector ${subsectorUid}`);

                return <SubSectorDetail sector={sector} subsector={subsector} projects={projects} />;
            } catch (error) {
                console.error(`Failed to handle subsector route:`, error);
                return notFound();
            }
        }

        if (slug.length === 4 && slug[0] === 'sectors') {
            const projectUid = slug[3];
            const project = await client.getByUID<Content.ProjectPostDocument>('project_post', projectUid);
            let subsector = null;
            let sector = null;

            if (isFilled.contentRelationship(project.data.subsector)) {
                subsector = await client.getByID(project.data.subsector.id) as Content.SubsectorPostDocument;
            }

            if (isFilled.contentRelationship(project.data.sector)) {
                sector = await client.getByID(project.data.sector.id) as Content.SectorPostDocument;
            }

            if (!subsector || !sector) {
                return notFound();
            }

            return <ProjectDetail project={project} sector={sector} subsector={subsector} />;
        }

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
        const sectorRel = project.data.sector;
        const subsectorRel = project.data.subsector;

        if (sectorRel && typeof sectorRel === 'object' && 'uid' in sectorRel &&
            subsectorRel && typeof subsectorRel === 'object' && 'uid' in subsectorRel) {
            routes.push({
                slug: ['sectors',
                    sectorRel.uid as string,
                    subsectorRel.uid as string,
                    project.uid]
            });
        }
    }

    return routes;
}