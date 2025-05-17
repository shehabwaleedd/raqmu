import React from 'react';
import { motion } from 'framer-motion';
import styles from '../../button/style.module.scss';
import SlideTextEffect from '@/animation/slideTextEffect';
const R_TITLE_COLOR = "#1e1e1e";
const R_WHITE_COLOR = "#fff";
const fmTransition = { duration: 0.35, ease: [0.4, 0, 0.2, 1] };

interface DoubleButtonPropsDrilled {
    buttonTitle?: string | null;
    field?: { text?: string | null };
    color?: string;
    backgroundColor?: string;
}

interface MotionDoubleButtonButtonProps extends DoubleButtonPropsDrilled {
    animateState: "rest" | "hover";
}

const DoubleButtonButton: React.FC<MotionDoubleButtonButtonProps> = ({ buttonTitle, field, color = R_TITLE_COLOR, backgroundColor = R_WHITE_COLOR, animateState }) => {
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

    return (
        <motion.div className={styles.body} variants={buttonVariants} initial="rest" animate={animateState}>
            <motion.span variants={textVariants} initial="rest" animate={animateState}>
                <SlideTextEffect text={buttonTitle || (field?.text || "Let's Talk")} />
            </motion.span>
        </motion.div>
    );
};

export default DoubleButtonButton;