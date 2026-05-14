"use client";

import { ArrowRight, Download } from "lucide-react";
import { useState, Suspense, lazy, useEffect } from "react";
import Link from "next/link";

const Dithering = lazy(() => 
  import("@paper-design/shaders-react").then((mod) => ({ default: mod.Dithering }))
);

export function HeroSection() {
  const [isHovered, setIsHovered] = useState(false);
  const [displayedText, setDisplayedText] = useState("");
  const typeWriterText = "We write the syntax.";

  useEffect(() => {
    const timeout = setTimeout(() => {
      let i = 0;
      const interval = setInterval(() => {
        setDisplayedText(typeWriterText.slice(0, i + 1));
        i++;
        if (i >= typeWriterText.length) {
          clearInterval(interval);
        }
      }, 70); // Typing speed
      return () => clearInterval(interval);
    }, 600); // Initial delay
    
    return () => clearTimeout(timeout);
  }, []);

  return (
    <section 
      className="relative w-full min-h-[90vh] flex items-center justify-center overflow-hidden bg-background"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Background Shader */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-40 mix-blend-screen">
        <Suspense fallback={<div className="absolute inset-0 bg-background" />}>
          <Dithering
            colorBack="#0a0a0a"
            colorFront="#00E676"
            shape="warp"
            type="4x4"
            speed={isHovered ? 0.45 : 0.25}
            className="size-full"
            minPixelRatio={1}
          />
        </Suspense>
      </div>

      {/* Grid Overlay for texture */}
      <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,#80808022_1px,transparent_1px),linear-gradient(to_bottom,#80808022_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none"></div>

      <div className="container px-4 md:px-6 relative z-10 mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-end">
          
          {/* Left Side: Headline */}
          <div className="flex flex-col">
            <h1 className="font-serif text-5xl md:text-7xl lg:text-[84px] font-medium tracking-tight text-foreground mb-8 text-balance leading-[1.05] min-h-[140px] md:min-h-[200px]">
              Think in logic. <br className="hidden md:block" />
              <span className="text-foreground/70">{displayedText}</span>
            </h1>
          </div>

          {/* Right Side: Description and Buttons */}
          <div className="flex flex-col lg:pl-16 pb-4">
            <p className="text-lg md:text-xl text-foreground font-medium mb-3">
              Understand. Execute. Deliver.
            </p>
            <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mb-12 text-balance leading-relaxed">
              PolyLang is your 10x AI Engineer who can independently build software solutions for you.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/playground"
                className="group relative inline-flex h-14 items-center justify-center gap-3 overflow-hidden rounded bg-primary px-8 text-sm font-semibold text-primary-foreground transition-all duration-300 hover:bg-primary/90"
              >
                <span className="relative z-10 uppercase tracking-widest">PolyLang Web</span>
                <ArrowRight className="h-4 w-4 relative z-10 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
              </Link>
              
              <Link
                href="#docs"
                className="inline-flex h-14 items-center justify-center rounded border border-border bg-transparent px-8 text-sm font-semibold text-foreground transition-colors hover:bg-accent hover:text-accent-foreground uppercase tracking-widest"
              >
                Read Documentation
              </Link>
            </div>
            <div className="mt-6">
              <Link href="#features" className="text-sm text-muted-foreground hover:text-foreground underline underline-offset-4 decoration-muted-foreground/50 flex items-center gap-1 group">
                View all features 
                <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
          
        </div>
      </div>
    </section>
  );
}
