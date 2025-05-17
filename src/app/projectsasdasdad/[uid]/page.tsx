import { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/prismicio";
import { Content, asText, isFilled } from "@prismicio/client";
import ProjectPost from "@/components/projects/projectPost";

type Params = { uid: string };

export default async function Page({ params }: { params: Params }) {
    const client = createClient();
    const page = await client
        .getByUID<Content.ProjectPostDocument>("project_post", params.uid)
        .catch(() => notFound());

    return <ProjectPost project={page} />;
}

export async function generateMetadata({
    params,
}: {
    params: Params;
}): Promise<Metadata> {
    const client = createClient();
    const page = await client
        .getByUID<Content.ProjectPostDocument>("project_post", params.uid)
        .catch(() => notFound());

    const descriptionText = isFilled.richText(page.data.description)
        ? asText(page.data.description)
        : "";

    const truncatedDescription = descriptionText.length > 157
        ? `${descriptionText.slice(0, 157)}...`
        : descriptionText;

    const metaTitle = page.data.meta_title || `${page.data.client_name} | Raqmu`;
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
    const pages = await client.getAllByType("project_post");

    return pages.map((page) => {
        return { uid: page.uid };
    });
}