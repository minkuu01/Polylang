"use client";

import { Code2, Globe2, ShieldCheck, TerminalSquare } from "lucide-react";
import { BentoGrid, type BentoItem } from "./ui/bento-grid";

const features: BentoItem[] = [
  {
    title: "Multilingual Input & Detection",
    description: "Write instructions in your native human language. PolyLang automatically detects your language, translates to English, and processes the logic instantly.",
    icon: <Globe2 className="w-5 h-5 text-primary" />,
    status: "Live",
    tags: ["NLP Engine", "Real-time"],
    colSpan: 2,
    hasPersistentHover: true,
  },
  {
    title: "Auto Code Gen",
    description: "Powered by advanced NLP, converts your logic to syntactically correct source code.",
    icon: <Code2 className="w-5 h-5 text-emerald-500" />,
    status: "Core",
    tags: ["Syntax", "Accuracy"],
  },
  {
    title: "Secure Code Sandbox",
    description: "Run generated programs safely within a secure environment. Real-time outputs directly in browser.",
    icon: <ShieldCheck className="w-5 h-5 text-purple-500" />,
    tags: ["Sandbox", "Security"],
  },
  {
    title: "Multi-Language Output",
    meta: "4 Supported",
    description: "Not bound to one language. Generate source code in Python, JavaScript, Java, C++, directly from a single prompt.",
    icon: <TerminalSquare className="w-5 h-5 text-sky-500" />,
    status: "Updated",
    tags: ["Python", "JS", "Java", "C++"],
    colSpan: 2,
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="py-24 bg-background z-10 relative">
      <div className="container mx-auto px-4 md:px-6 max-w-7xl">
        <div className="mb-16 max-w-2xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4 text-foreground text-balance">
            Breaking down language barriers.
          </h2>
          <p className="text-muted-foreground text-lg text-balance">
            Everything you need to formulate, generate, and run code without knowing the syntax.
          </p>
        </div>

        <BentoGrid items={features} />
      </div>
    </section>
  );
}
