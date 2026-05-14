"use client";

import { cn } from "@/lib/utils";
import {
    CheckCircle,
    Clock,
    Star,
    TrendingUp,
    Video,
    Globe,
    Code2,
    ShieldCheck,
    TerminalSquare
} from "lucide-react";
import React from "react";

export interface BentoItem {
    title: string;
    description: string;
    icon: React.ReactNode;
    status?: string;
    tags?: string[];
    meta?: string;
    cta?: string;
    colSpan?: number;
    hasPersistentHover?: boolean;
}

interface BentoGridProps {
    items: BentoItem[];
}

function BentoGrid({ items }: BentoGridProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6 p-4 max-w-7xl mx-auto">
            {items.map((item, index) => (
                <div
                    key={index}
                    className={cn(
                        "group relative p-6 rounded-2xl overflow-hidden transition-all duration-300",
                        "border border-gray-100/80 dark:border-white/10 bg-white dark:bg-black/80",
                        "hover:shadow-[0_2px_12px_rgba(0,0,0,0.03)] dark:hover:shadow-[0_2px_12px_rgba(255,255,255,0.03)]",
                        "hover:-translate-y-1 will-change-transform",
                        item.colSpan || "col-span-1",
                        item.colSpan === 2 ? "md:col-span-2" : "",
                        item.colSpan === 3 ? "md:col-span-3" : "",
                        {
                            "shadow-[0_2px_12px_rgba(0,0,0,0.03)] -translate-y-1":
                                item.hasPersistentHover,
                            "dark:shadow-[0_2px_12px_rgba(255,255,255,0.03)] dark:border-primary/30":
                                item.hasPersistentHover,
                        }
                    )}
                >
                    <div
                        className={`absolute inset-0 ${
                            item.hasPersistentHover
                                ? "opacity-100"
                                : "opacity-0 group-hover:opacity-100"
                        } transition-opacity duration-300 pointer-events-none`}
                    >
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.02)_1px,transparent_1px)] dark:bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[length:4px_4px]" />
                    </div>

                    <div className="relative flex flex-col space-y-4 h-full">
                        <div className="flex items-center justify-between">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-black/5 dark:bg-white/10 group-hover:bg-primary/20 transition-all duration-300 ring-1 ring-black/5 dark:ring-white/10">
                                {item.icon}
                            </div>
                            {item.status && (
                                <span
                                    className={cn(
                                        "text-xs font-semibold px-2.5 py-1 rounded-full backdrop-blur-sm",
                                        "bg-black/5 dark:bg-white/10 text-gray-700 dark:text-gray-300",
                                        "transition-colors duration-300 group-hover:bg-primary/20 dark:group-hover:text-primary-foreground group-hover:text-primary"
                                    )}
                                >
                                    {item.status}
                                </span>
                            )}
                        </div>

                        <div className="space-y-2 flex-grow mt-4">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 tracking-tight">
                                {item.title}
                                {item.meta && (
                                    <span className="ml-2 text-xs text-gray-500 dark:text-gray-400 font-normal">
                                        {item.meta}
                                    </span>
                                )}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed font-[425]">
                                {item.description}
                            </p>
                        </div>

                        {item.tags && item.tags.length > 0 && (
                            <div className="flex items-center justify-between mt-auto pt-4">
                                <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                                    {item.tags.map((tag, i) => (
                                        <span
                                            key={i}
                                            className="px-2 py-1 rounded-md bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 backdrop-blur-sm transition-all duration-200 hover:bg-black/10 dark:hover:bg-white/20"
                                        >
                                            #{tag}
                                        </span>
                                    ))}
                                </div>
                                {item.cta && (
                                    <span className="text-xs font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity ml-2 whitespace-nowrap">
                                        {item.cta}
                                    </span>
                                )}
                            </div>
                        )}
                    </div>

                    <div
                        className={`absolute inset-0 -z-10 rounded-2xl p-px bg-gradient-to-br from-transparent via-gray-100/50 to-transparent dark:via-white/10 ${
                            item.hasPersistentHover
                                ? "opacity-100"
                                : "opacity-0 group-hover:opacity-100"
                        } transition-opacity duration-300 pointer-events-none`}
                    />
                </div>
            ))}
        </div>
    );
}

export { BentoGrid }
