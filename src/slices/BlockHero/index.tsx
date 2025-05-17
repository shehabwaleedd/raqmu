import { FC } from "react";
import { Content } from "@prismicio/client";
import { SliceComponentProps } from "@prismicio/react";
import styles from "./style.module.scss";
import AnimatedHeader from "@/animation/animatedHeader";

/**
 * Props for `ServiceHero`.
 */
export type ServiceHeroProps = SliceComponentProps<Content.ServiceHeroSlice>;

/**
 * Component for "ServiceHero" Slices.
 */
const ServiceHero: FC<ServiceHeroProps> = ({ slice }) => {
  return (
    <section data-slice-type={slice.slice_type} data-slice-variation={slice.variation} className={styles.serviceHero}>
      <div className={styles.titleContent}>
        <AnimatedHeader delay={1} phrase={slice.primary.service_title || ''} as="h1" />
      </div>
    </section>
  );
};

export default ServiceHero;
