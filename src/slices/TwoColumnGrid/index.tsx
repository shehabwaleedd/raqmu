'use client';

import useWindowSize from "@/hooks/useWindowSize";
import { Content } from "@prismicio/client";
import { SliceComponentProps } from "@prismicio/react";
import AnimatedSubs from "@/animation/animatedSubs";
import styles from './style.module.scss';
import RevealImage from "@/animation/revealImage";
import SectionHeader from '@/ui/sectionHeader';
import { PrismicDocumentLink } from '@/types/common';
import DoubleButton from "@/ui/doubleButton";

export type TwoColumnGridProps = SliceComponentProps<Content.TwoColumnGridSlice>;

const TwoColumnGrid = ({ slice }: TwoColumnGridProps) => {
  const { isTablet } = useWindowSize();

  const { descriptions = [], underTitleDescriptions = [], reverse, cta, rightimage, eyebrow, title, subtitle, sectionid } = slice.primary;

  const parsedDescriptions = (descriptions as Array<{ description: string }>).map(item => item.description);
  const parsedUnderTitleDescriptions = underTitleDescriptions.map(item => item.description || '');

  const hasCTA = cta?.link_type === 'Document';
  const hasRightContent = rightimage?.url || parsedDescriptions.length > 0;
  const hasLeftContent = title || subtitle || parsedUnderTitleDescriptions.length > 0;

  const getLinkText = (link: PrismicDocumentLink | undefined): string =>
    !link ? 'Learn More' : link.type === 'products_page' ? 'Explore Our Products' : 'Learn More';

  const sectionId = sectionid?.toString().toLowerCase().replace(/\s+/g, '-');

  const getFlexDirection = () => {
    if (isTablet) return reverse ? 'column-reverse' : 'column';
    return reverse ? 'row-reverse' : 'row';
  };

  const renderLeftSection = () => {
    if (!hasLeftContent) return null;

    return (
      <div className={styles.left} style={{ paddingLeft: reverse && isTablet ? '3rem' : '' }}>
        <SectionHeader eyebrow={eyebrow} title={title} description={subtitle} />
        {parsedUnderTitleDescriptions.length > 0 && (
          <div className={styles.leftContent}>
            <div className={styles.subtitlesUnderTitleContainer}>
              {parsedUnderTitleDescriptions.map((desc, index) => (
                <div key={index} className={styles.subtitles}>
                  <AnimatedSubs phrase={desc} />
                </div>
              ))}
            </div>

            {hasCTA && cta && (
              <DoubleButton field={cta} buttonTitle={getLinkText(cta as unknown as PrismicDocumentLink)} />
            )}
          </div>
        )}
      </div>
    );
  };

  const renderRightSection = () => {
    if (!hasRightContent) return null;

    return (
      <div className={styles.right}>
        {rightimage?.url && <RevealImage imageSrc={rightimage.url} />}

        {parsedDescriptions.length > 0 && (
          <div className={styles.subtitlesContainer}>
            {parsedDescriptions.length === 1 ? (
              <div className={styles.subtitles}>
                <AnimatedSubs phrase={parsedDescriptions[0]} />
              </div>
            ) : (
              parsedDescriptions.map((desc, index) => (
                <div key={index} className={styles.subtitles}>
                  <AnimatedSubs phrase={desc} />
                </div>
              ))
            )}
          </div>
        )}

        {hasCTA && cta && parsedDescriptions.length > 0 && (
          <DoubleButton field={cta} />
        )}
      </div>
    );
  };

  if (!hasLeftContent && !hasRightContent) return null;

  return (
    <section className={styles.twoColumnGrid} data-slice-type={slice.slice_type} id={sectionId}>
      <div className={styles.sectionContainer}>
        <div className={styles.twoGrid} style={{ flexDirection: getFlexDirection() }}>
          {renderLeftSection()}
          {renderRightSection()}
        </div>
      </div>
    </section>
  );
};

export default TwoColumnGrid;