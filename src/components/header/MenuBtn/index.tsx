"use client";
import React, { useRef } from "react";
import styles from "./style.module.scss";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

type MenuBtnProps = {
  isOpen: boolean;
  toggleMenu: () => void;
};

const MenuBtn = ({ isOpen, toggleMenu }: MenuBtnProps) => {
  const container = useRef<HTMLDivElement>(null);
  const hamburgerLines = useRef<(HTMLDivElement | null)[]>([]);

  useGSAP(
    () => {
      const tl = gsap.timeline({
        defaults: { duration: 0.6, ease: "power3.inOut" }
      });

      if (isOpen) {
        tl.to(hamburgerLines.current[1], {
          scaleX: 0,
          duration: 0.3
        })
          .to(hamburgerLines.current[0], {
            y: 9,
            rotate: 45,
          }, "-=0.2")
          .to(hamburgerLines.current[2], {
            y: -9,
            rotate: -45,
          }, "<");
      } else {
        tl.to([hamburgerLines.current[0], hamburgerLines.current[2]], {
          rotate: 0,
          y: 0,
        })
          .to(hamburgerLines.current[1], {
            scaleX: 1,
            duration: 0.3
          }, "-=0.2");
      }
    },
    { scope: container, dependencies: [isOpen] }
  );

  return (
    <div ref={container} className={styles.menuToggle} onClick={toggleMenu} aria-label="Toggle menu" aria-expanded={isOpen}>
      <div className={styles.hamburger}>
        {[0, 1, 2].map((index) => (
          <div
            key={index}
            ref={(el) => {
              if (el) {
                hamburgerLines.current[index] = el;
              }
            }}
            className={styles.line}
          />
        ))}
      </div>
    </div>
  );
};

export default MenuBtn;