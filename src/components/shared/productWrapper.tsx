"use client";

import { FC, ReactNode } from "react";

type Props = { 
  children: ReactNode;
  className?: string;
  searchParams: Record<string, string | string[]>
};

const ProductWrapper: FC<Props> = ({ children, className, searchParams }) => {
  const grid = searchParams.grid

  const validatedGrid = ["2", "3", "4", "5", "6"].includes(String(grid)) ? String(grid) : "6";
  
  return (
    <div
      data-grid={validatedGrid}
      className={`
        grid gap-3 bg-white transition-all duration-300
        
        grid-cols-2
        min-[480px]:grid-cols-2
        
        sm:gap-4 sm:p-6
        sm:data-[grid="2"]:grid-cols-2
        sm:data-[grid="3"]:grid-cols-2
        sm:data-[grid="4"]:grid-cols-2
        sm:data-[grid="5"]:grid-cols-2
        sm:data-[grid="6"]:grid-cols-2
        
        md:p-10
        md:data-[grid="2"]:grid-cols-2
        md:data-[grid="3"]:grid-cols-3
        md:data-[grid="4"]:grid-cols-3
        md:data-[grid="5"]:grid-cols-3
        md:data-[grid="6"]:grid-cols-3
        
        lg:gap-5
        lg:data-[grid="2"]:grid-cols-2
        lg:data-[grid="3"]:grid-cols-3
        lg:data-[grid="4"]:grid-cols-4
        lg:data-[grid="5"]:grid-cols-4
        lg:data-[grid="6"]:grid-cols-4
        
        xl:gap-6
        xl:data-[grid="2"]:grid-cols-2
        xl:data-[grid="3"]:grid-cols-3
        xl:data-[grid="4"]:grid-cols-4
        xl:data-[grid="5"]:grid-cols-5
        xl:data-[grid="6"]:grid-cols-6
        
        2xl:gap-8
        2xl:data-[grid="2"]:grid-cols-2
        2xl:data-[grid="3"]:grid-cols-3
        2xl:data-[grid="4"]:grid-cols-4
        2xl:data-[grid="5"]:grid-cols-5
        2xl:data-[grid="6"]:grid-cols-6
        
        ${className || ''}
      `}
    >
      {children}
    </div>
  );
};

export default ProductWrapper;