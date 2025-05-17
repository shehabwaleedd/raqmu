import { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/prismicio";
import { Content, asText, isFilled } from "@prismicio/client";
import ProjectPost from "@/components/projects/projectPost";
import SectorBreadcrumbs from "@/components/sectorBreadCrumb";

type Params = {
    sector: string;
    subsector: string;
    project: string
};

export default async function Page({ params }: { params: Params }) {
    const client = createClient();
    const page = await client
        .getByUID<Content.ProjectPostDocument>("project_post", params.project)
        .catch(() => notFound());

    // Check if project belongs to the specified sector and subsector
    const sectorMatch = page.data.sector === decodeURIComponent(params.sector);
    const subsectorMatch = page.data.subsector === decodeURIComponent(params.subsector);

    if (!sectorMatch || !subsectorMatch) {
        notFound();
    }

    return (
        <>
            <SectorBreadcrumbs
                sector={page.data.sector as string}
                subsector={page.data.subsector as string}
                project={page.data.client_name as string}
            />
            <ProjectPost project={page} />
        </>
    );
}

export async function generateMetadata({
    params,
}: {
    params: Params;
}): Promise<Metadata> {
    const client = createClient();
    const page = await client
        .getByUID<Content.ProjectPostDocument>("project_post", params.project)
        .catch(() => notFound());

    const descriptionText = isFilled.richText(page.data.description)
        ? asText(page.data.description)
        : "";

    const truncatedDescription = descriptionText.length > 157
        ? `${descriptionText.slice(0, 157)}...`
        : descriptionText;

    const metaTitle = page.data.meta_title || `${page.data.client_name} | ${page.data.sub_sector} | ${page.data.sector} | Raqmu`;
    const metaDescription = page.data.meta_description || truncatedDescription;
    const imageUrl = page.data.meta_image?.url || page.data.project_main_image?.url || "";

    return {
        title: metaTitle,
        description: metaDescription,
        openGraph: {
            title: metaTitle,
            description: metaDescription,
            images: imageUrl ? [{ url: imageUrl }] : [],
            type: "article",
        },
        twitter: {
            card: "summary_large_image",
            title: metaTitle,
            description: metaDescription,
            images: imageUrl ? [{ url: imageUrl }] : [],
        }
    };
}

export async function generateStaticParams() {
    const client = createClient();
    const pages = await client.getAllByType<Content.ProjectPostDocument>("project_post");

    return pages.map((page) => {
        const sector = (page.data.sector as string).toLowerCase();
        const subsector = (page.data.sub_sector as string).toLowerCase();

        return {
            sector: encodeURIComponent(sector),
            subsector: encodeURIComponent(subsector),
            project: page.uid
        };
    });
}