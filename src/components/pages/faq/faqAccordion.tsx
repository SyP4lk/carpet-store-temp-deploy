"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";


import {
    ShoppingBag,
    User,
    CreditCard,
    FileText,
    Truck,
    RotateCcw,
    Package,
    Brush,
    ShieldCheck,
    FileSignature,
} from "lucide-react";
import { useDictionary } from "@/hooks/useDictionary";



const FaqAccordion = () => {
    const [openIndex, setOpenIndex] = useState<number | null>(null);
    const { dictionary } = useDictionary();

    const toggle = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    const iconMap = {
        ShoppingBag: ShoppingBag,
        User: User,
        CreditCard: CreditCard,
        FileText: FileText,
        Truck: Truck,
        RotateCcw: RotateCcw,
        Package: Package,
        Brush: Brush,
        ShieldCheck: ShieldCheck,
        FileSignature: FileSignature,
    };


    return (
        <div className="px-6 md:px-24 py-12 bg-white text-gray-900">
            <div className="max-w-3xl mx-auto divide-y divide-gray-200">
                {dictionary?.faq.items.map((item, index) => {
                    const isOpen = openIndex === index;
                    const IconComponent = iconMap[item.icon as keyof typeof iconMap];
                    return (
                        <div key={index}>
                            <button
                                onClick={() => toggle(index)}
                                className="w-full flex items-center justify-between py-4 focus:outline-none cursor-pointer"
                            >
                                <div className="flex items-center gap-4">
                                    <IconComponent className="size-5 md:size-8 text-black" />
                                    <span className="font-semibold uppercase">{item.title}</span>
                                </div>
                                <ChevronDown
                                    className={`w-5 h-5 text-gray-500 transition-transform duration-300 ${isOpen ? "rotate-180" : ""
                                        }`}
                                />
                            </button>

                            <div
                                className={`overflow-hidden transition-all duration-500 ease-in-out ${isOpen ? "max-h-[1500px] opacity-100" : "max-h-0 opacity-0"
                                    }`}
                            >
                                <div className="pb-6 pl-8 space-y-6">
                                    {item.sections.map((sec, i) => (
                                        <div key={i} className="space-y-2">
                                            {sec.title && (
                                                <h3 className="text-sm font-semibold" >{sec.title}</h3>
                                            )}
                                            <ul className="space-y-1">
                                                {sec.texts.map((txt, j) => (
                                                    <li
                                                        key={j}
                                                        className="text-sm text-gray-700 leading-relaxed"
                                                    >
                                                        {txt}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default FaqAccordion;
