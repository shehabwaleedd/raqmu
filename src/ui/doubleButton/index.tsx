'use client'

import React, { useState } from 'react';
import styles from "./style.module.scss";
import { PrismicNextLink } from "@prismicio/next";
import { LinkField } from '@prismicio/client';
import { motion } from 'framer-motion';
import TransitionLink from '@/animation/transitionLink';
import SlideTextEffect from '@/animation/slideTextEffect';

const R_TITLE_COLOR = "#1e1e1e";
const R_WHITE_COLOR = "#fff";
const fmTransition = { duration: 0.35, ease: [0.4, 0, 0.2, 1] };

type ButtonFieldType = LinkField | {
    link_label?: string | null;
    uid?: LinkField;
};

interface DoubleButtonProps {
    buttonTitle?: string | null;
    field?: ButtonFieldType;
    className?: string;
    color?: string;
    backgroundColor?: string;
    href?: string;
    type?: 'link' | 'button' | 'submit';
    onClick?: () => void;
}

const DoubleButton: React.FC<DoubleButtonProps> = ({
    buttonTitle,
    field,
    className = '',
    color = R_TITLE_COLOR,
    backgroundColor = R_WHITE_COLOR,
    href = "/",
    type = 'link',
    onClick,
}) => {
    const [hoverState, setHoverState] = useState<"rest" | "hover">("rest");

    const buttonVariants = {
        rest: {
            backgroundColor: backgroundColor,
            transition: fmTransition,
        },
        hover: {
            backgroundColor: R_TITLE_COLOR,
            transition: fmTransition,
        },
    };

    const textVariants = {
        rest: {
            color: color,
            transition: fmTransition,
        },
        hover: {
            color: R_WHITE_COLOR,
            transition: fmTransition,
        },
    };

    const buttonInnerContent = (
        <motion.div className={styles.buttonContainer} variants={buttonVariants} initial="rest" animate={hoverState}>
            <motion.span variants={textVariants} initial="rest" animate={hoverState}>
                <SlideTextEffect text={buttonTitle || "Let's Talk"} />
            </motion.span>
        </motion.div>
    );

    const isStandardLinkField = (fieldToCheck: ButtonFieldType | undefined): fieldToCheck is LinkField => {
        return fieldToCheck ? 'link_type' in fieldToCheck : false;
    };

    const isNestedLinkField = (fieldToCheck: ButtonFieldType | undefined): fieldToCheck is NestedLinkField => {
        return fieldToCheck ? 'uid' in fieldToCheck && (fieldToCheck as NestedLinkField).uid !== undefined : false;
    };

    const motionEventHandlers = {
        onHoverStart: () => setHoverState("hover"),
        onHoverEnd: () => setHoverState("rest"),
    };

    const linkClassName = `${styles.doubleButton} ${className}`;

    if (field) {
        if (isStandardLinkField(field)) {
            if ('url' in field && field.url) {
                return (
                    <motion.div {...motionEventHandlers} className={linkClassName}>
                        <TransitionLink href={field.url} className={styles.linkWrapper}>
                            {buttonInnerContent}
                        </TransitionLink>
                    </motion.div>
                );
            }
            return (
                <motion.div {...motionEventHandlers} className={linkClassName}>
                    <PrismicNextLink field={field} className={styles.linkWrapper}>
                        {buttonInnerContent}
                    </PrismicNextLink>
                </motion.div>
            );
        }
        if (isNestedLinkField(field) && field.uid) {
            return (
                <DoubleButton
                    field={field.uid}
                    buttonTitle={buttonTitle}
                    className={className}
                    color={color}
                    backgroundColor={backgroundColor}
                />
            );
        }
    }

    if (type === 'link') {
        return (
            <motion.div {...motionEventHandlers} className={linkClassName}>
                <TransitionLink href={href} className={styles.linkWrapper}>
                    {buttonInnerContent}
                </TransitionLink>
            </motion.div>
        );
    }

    if (type === 'submit' || type === 'button') {
        return (
            <motion.button
                type={type === 'submit' ? 'submit' : 'button'}
                onClick={onClick}
                {...motionEventHandlers}
                className={`${styles.doubleButton} ${styles.buttonElement} ${className}`}
            >
                {buttonInnerContent}
            </motion.button>
        );
    }

    return (
        <motion.div {...motionEventHandlers} className={linkClassName}>
            <TransitionLink href={href || "/"} className={styles.linkWrapper}>
                {buttonInnerContent}
            </TransitionLink>
        </motion.div>
    );
};

interface NestedLinkField {
    link_label?: string | null;
    uid?: LinkField;
}

export default DoubleButton;