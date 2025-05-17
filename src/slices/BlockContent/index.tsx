import { FC } from "react";
import { Content } from "@prismicio/client";
import { SliceComponentProps } from "@prismicio/react";
import styles from "./style.module.scss"
import DoubleButton from "@/ui/doubleButton";
import AnimatedSubs from "@/animation/animatedSubs";

export type BlockContentProps = SliceComponentProps<Content.BlockContentSlice>;

const BlockContent: FC<BlockContentProps> = ({ slice }) => {

  return (
    <section data-slice-type={slice.slice_type} data-slice-variation={slice.variation} className={styles.blockContent}>
  
      <div className={styles.wrapper}>
        <div className={styles.grid}>
          <div className={styles.left}>
            <AnimatedSubs phrase={slice.primary.left_paragraph} as="h5" />
            {slice.primary.show_cta && (<div className={styles.gridOnly}><DoubleButton field={slice.primary.cta} /></div>)}
          </div>
          <div className={styles.right}>
            <div className={styles.paragraphWrapper}>
              {slice.primary.right_paragraphes.map((item, index) => (
                <AnimatedSubs phrase={item.paragraph} as="p" key={index} />
              ))}
            </div>
          </div>
          {slice.primary.show_cta && (<div className={styles.columnOnly}><DoubleButton field={slice.primary.cta} /></div>)}
        </div>
      </div>
    </section>
  );
};

export default BlockContent;