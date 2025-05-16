'use client';

import React, { forwardRef, useCallback } from 'react';
import { useTransitionRouter } from "next-view-transitions";
import { usePathname } from "next/navigation";
import Link from 'next/link';
import { LinkField } from '@prismicio/client';

const getLinkUrl = (link: string | LinkField | undefined): string => {
    if (!link) return '';
    if (typeof link === 'string') return link;
    if ('link_type' in link) {
        if (link.link_type === 'Web') return link.url || '';
        else if (link.link_type === 'Document') return link.uid ? `/${link.uid}` : '/';
        else if (link.link_type === 'Media') return link.url || '';
    }
    return '';
};

type AnchorPropsWithoutHref = Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href'>;

interface TransitionLinkProps extends AnchorPropsWithoutHref {
    href: string | LinkField;
    children: React.ReactNode;
    className?: string;
    target?: string;
    rel?: string;
    scroll?: boolean;
}

const pageAnimation = () => {
    document.dispatchEvent(new Event('startViewTransition'));

    const oldAnimation = document.documentElement.animate(
        [
            { opacity: 1, transform: "scale(1)" },
            { opacity: 0.4, transform: "scale(0.5)" },
        ],
        {
            duration: 1500,
            easing: "cubic-bezier(0.87, 0, 0.13, 1)",
            fill: "forwards",
            pseudoElement: "::view-transition-old(root)",
        }
    );

    const newAnimation = document.documentElement.animate(
        [
            { transform: "translateY(100%)" },
            { transform: "translateY(0)" },
        ],
        {
            duration: 1500,
            easing: "cubic-bezier(0.87, 0, 0.13, 1)",
            fill: "forwards",
            pseudoElement: "::view-transition-new(root)",
        }
    );

    return Promise.all([
        oldAnimation.finished,
        newAnimation.finished
    ]).finally(() => {
        document.dispatchEvent(new Event('finishViewTransition'));
    });
};

const TransitionLink = forwardRef<HTMLAnchorElement, TransitionLinkProps>(
    ({ href, children, className, onClick, ...props }, ref) => {
        const router = useTransitionRouter();
        const pathname = usePathname();
        const hrefString = getLinkUrl(href);

        const handleClick = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
            if (
                props.target === '_blank' ||
                hrefString.startsWith('http') ||
                hrefString.startsWith('mailto:') ||
                hrefString.startsWith('tel:') ||
                !hrefString ||
                hrefString === pathname
            ) {
                if (onClick) onClick(e);
                return;
            }

            e.preventDefault();
            if (onClick) onClick(e);

            if (!document.startViewTransition) {
                router.push(hrefString);
                return;
            }

            try {
                router.push(hrefString, {
                    onTransitionReady: pageAnimation
                });
            } catch (error) {
                console.error("Transition error:", error);
                router.push(hrefString);
            }
        }, [router, hrefString, onClick, props.target, pathname]);

        if (!hrefString) {
            return <span>{children}</span>;
        }

        return (
            <Link ref={ref} href={hrefString} className={className} onClick={handleClick}{...props}>
                {children}
            </Link>
        );
    }
);

TransitionLink.displayName = 'TransitionLink';

export default TransitionLink;