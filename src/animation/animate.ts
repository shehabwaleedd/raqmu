export const textVariants = {
    hidden: { filter: 'blur(4px)' },
    visible: (i: number) => ({
        filter: 'blur(0px)',
        transition: {
            delay: i * 0.1,
            duration: 0.5,
            ease: "easeOut"
        }
    })
};

export const slideUp = {
    initial: {
        y: "200%"
    },
    open: (i: number) => ({
        y: "0%",
        transition: { duration: 0.5, delay: 0.01 * i }
    }),
    closed: {
        y: "200%",
        transition: { duration: 0.5 }
    }
}


export const translate = {
    initial: {
        y: "100%",
    },
    enter: (i: number[]) => ({
        y: 0,
        transition: { duration: 1, ease: [0.76, 0, 0.24, 1], delay: i[0] }
    }),
    exit: (i: number[]) => ({
        y: "100%",
        transition: { duration: 0.7, ease: [0.76, 0, 0.24, 1], delay: i[1] }
    })
}

export const menuVariants = {
    initial: {
        clipPath: "polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)",
        pointerEvents: "none" as const,
    },
    animate: {
        clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
        pointerEvents: "all" as const,
        transition: {
            duration: 1.2,
            ease: [0.16, 1, 0.3, 1],
            delayChildren: 0.3,
            staggerChildren: 0.06,
        },
    },
    exit: {
        clipPath: "polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)",
        pointerEvents: "none" as const,
        transition: {
            duration: 0.8,
            ease: [0.4, 0, 0.2, 1],
            staggerChildren: 0.04,
            staggerDirection: -1,
            when: "afterChildren",
        },
    },
};

export const itemVariants = {
    initial: {
        y: 60,
        opacity: 0,
    },
    animate: {
        y: 0,
        opacity: 1,
        transition: {
            duration: 0.8,
            ease: [0.33, 1, 0.68, 1],
        },
    },
    exit: {
        y: 60,
        opacity: 0,
        transition: {
            duration: 0.6,
            ease: [0.33, 0, 0.67, 1],
        },
    },
};

export const submenuVariants = {
    initial: {
        height: 0,
        opacity: 0,
        transition: {
            height: { duration: 0 }
        }
    },
    animate: {
        height: "auto",
        opacity: 1,
        transition: {
            height: { duration: 0.4, ease: [0.16, 1, 0.3, 1] },
            opacity: { duration: 0.4, ease: [0.16, 1, 0.3, 1] }
        }
    },
    exit: {
        height: 0,
        opacity: 0,
        transition: {
            height: { duration: 0.4, ease: [0.4, 0, 0.2, 1] },
            opacity: { duration: 0.3, ease: [0.4, 0, 0.2, 1] }
        }
    }
};

export const submenuItemVariants = {
    initial: {
        opacity: 0,
        y: 15,
    },
    animate: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.4,
            ease: [0.16, 1, 0.3, 1]
        }
    },
    exit: {
        y: 0,
        opacity: 0,
        transition: {
            duration: 0.6,
            ease: [0.33, 0, 0.67, 1],
        },
    },
}; 

export const footerVariants = {
    initial: {
        y: 40,
        opacity: 0,
    },
    animate: {
        y: 0,
        opacity: 1,
        transition: {
            duration: 0.8,
            ease: [0.16, 1, 0.3, 1],
            delay: 0.4,
        },
    },
    exit: {
        y: -20,
        opacity: 0,
        transition: {
            duration: 0.6,
            ease: [0.4, 0, 0.2, 1],
        },
    },
};