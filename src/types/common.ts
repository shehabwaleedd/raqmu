import type { KeyTextField, ImageField } from "@prismicio/client";
import { Content } from "@prismicio/client";



export interface Subsection {
    subsection_title: KeyTextField;
    subsection_content: KeyTextField;
}

export interface Section {
    section_title: KeyTextField;
    section_content: KeyTextField;
    has_subsections: boolean;
    subsections: Subsection[];
}

export interface CommitmentSliceType {
    slice_type: "commitment";
    slice_label: string | null;
    primary: {
        title: KeyTextField;
        subtitle: KeyTextField;
        key_points: KeyPoint[];
        sections: Section[];
    };
    slice_variant: string;
    id: string;
}
export interface KeyPoint {
    point: KeyTextField;
}

export interface Location {
    location_name: KeyTextField;
    location_image: ImageField;
    image_alt: KeyTextField;
}
export interface FactoriesSliceType {
    slice_type: "factories";
    slice_label: string | null;
    primary: {
        title: KeyTextField;
        description: KeyTextField;
        locations: Location[];
        sectionid: KeyTextField;
    };
    slice_variant: string;
    id: string;
}


type MediaPageDocumentData = Content.MediaPageDocument["data"];


export interface PageProps {
    data: MediaPageDocumentData;
}

export interface FilterState {
    search: string;
    type: string;
    language: string;
}


export interface Social {
    label: string;
    url: string;
}



export interface PrismicDocumentLink {
    id: string;
    type: string;
    tags: string[];
    lang: string;
    slug: string;
    first_publication_date: string;
    last_publication_date: string;
    uid?: string;
    link_type: 'Document';
    key: string;
    isBroken: boolean;
    sectionId: string;
    showArrow: boolean;

}



export interface FooterProps {
    settings: {
        footer_logo: {
            url: string;
            alt: string;
        };
        footer_tagline: string;
        footer_map: {
            url: string;
            alt: string;
        };
        footer_legal_links: {
            label: string;
            url: string;
        }[];
        contact_information: {
            type: string;
            value: string;
            order: number;
        }[];
        social_links: {
            label: string;
            url: {
                link_type: string;
                url: string;
                target?: string;
            };
        }[];
    };
}
