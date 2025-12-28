"use client";

import { useLocale } from "@/hooks/useLocale";
import Image from "next/image";
import Link from "next/link";
import { FC } from "react";

interface CategoryProps {
  category: {
    title: string;
    description: string;
    image: string;
    path: string
  }
}

const Category: FC<CategoryProps> = ({ category }) => {
  const [locale] = useLocale()
  const path = `/${locale}/${category.path}`
  return (
    <div className="h-full w-full flex flex-col items-center justify-center relative">
      <Image src={category.image} alt={category.title} width={1470} height={730} priority className="w-full h-full absolute object-cover" />
      <div className="absolute inset-0 bg-black/20"></div>
      <div className="relative z-10 text-center text-white px-4">
        <Link
          href={path}
          className="text-5xl md:text-7xl font-semibold drop-shadow-lg"
        >
          {category.title}
        </Link>
        <p className="text-lg md:text-3xl mt-3 font-light italic uppercase drop-shadow">
          {category.description}
        </p>
      </div>
    </div>
  );
};

export default Category;
