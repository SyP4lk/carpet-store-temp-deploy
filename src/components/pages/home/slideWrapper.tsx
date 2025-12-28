"use client";

import { ChevronDown } from "lucide-react";
import React, { Children, FC, ReactNode, useCallback, useEffect, useRef, useState } from "react";

interface SlideWrapperProps {
  children: ReactNode[];
  elem: ReactNode; // oxirgi element, masalan Footer
}

const SlideWrapper: FC<SlideWrapperProps> = ({ children, elem }) => {
  const sectionRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const isScrolling = useRef(false);
  const touchStartY = useRef<number | null>(null);

  const scrollToSection = useCallback((index: number) => {
    if (index < 0 || index > children.length) return; 
    isScrolling.current = true;
    setActiveIndex(index);
    sectionRefs.current[index]?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
    setTimeout(() => {
      isScrolling.current = false;
    }, 700);
  }, [children.length]);

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (isScrolling.current) return;
      e.preventDefault();
      const threshold = 30;
      if (e.deltaY > threshold) scrollToSection(activeIndex + 1);
      else if (e.deltaY < -threshold) scrollToSection(activeIndex - 1);
    };

    const handleTouchStart = (e: TouchEvent) => { touchStartY.current = e.touches[0].clientY; };
    const handleTouchMove = (e: TouchEvent) => e.preventDefault();
    const handleTouchEnd = (e: TouchEvent) => {
      if (touchStartY.current === null || isScrolling.current) return;
      const deltaY = touchStartY.current - e.changedTouches[0].clientY;
      const threshold = 40;
      if (deltaY > threshold) scrollToSection(activeIndex + 1);
      else if (deltaY < -threshold) scrollToSection(activeIndex - 1);
      touchStartY.current = null;
    };

    window.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("touchstart", handleTouchStart, { passive: false });
    window.addEventListener("touchmove", handleTouchMove, { passive: false });
    window.addEventListener("touchend", handleTouchEnd, { passive: false });

    return () => {
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [activeIndex, scrollToSection]);

  return (
    <>
      {Children.map(children, (child, i) => (
        <div key={i} ref={(el) => { sectionRefs.current[i] = el; }} className="relative h-screen">
          {child}
          <button
            onClick={() => scrollToSection(i + 1)}
            className="absolute bottom-5 left-1/2 transform -translate-x-1/2 cursor-pointer"
          >
            <ChevronDown className="size-16 text-white" />
          </button>
        </div>
      ))}
      <div ref={(el) => { sectionRefs.current[children.length] = el; }} className="relative h-screen w-full bg-amber-50">
        {elem}
      </div>
    </>
  );
};

export default SlideWrapper;
