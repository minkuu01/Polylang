import { Navbar } from "@/components/navbar";
import { HeroSection } from "@/components/hero-section";
import { FeaturesSection } from "@/components/features-section";
import { CTASection } from "@/components/ui/hero-dithering-card";
import { Footer } from "@/components/footer";
import { MorphPanel } from "@/components/ui/ai-input";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-background selection:bg-primary/30 text-foreground">
      <Navbar />
      
      <main className="flex-1">
        <HeroSection />
        
        {/* We need a nice dark gradient divider here possibly or just relying on the sections */}
        <div className="h-px w-full bg-gradient-to-r from-transparent via-border to-transparent" />
        
        <FeaturesSection />
        
        <div className="h-px w-full bg-gradient-to-r from-transparent via-border to-transparent" />
        
        {/* AI Input Section */}
        <section className="py-24 bg-background flex flex-col items-center justify-center">
          <div className="mb-12 text-center px-4 max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4 text-foreground text-balance">
              Try it yourself
            </h2>
            <p className="text-muted-foreground text-lg text-balance">
              Interact with the PolyLang AI engineer directly. Ask it to build a component or optimize an algorithm.
            </p>
          </div>
          <div className="pointer-events-auto flex items-center justify-center w-full px-4 mb-8">
            <MorphPanel />
          </div>
        </section>

        <div className="h-px w-full bg-gradient-to-r from-transparent via-border to-transparent" />
        
        {/* A container wrapper for the CTA section to match landing page flow */}
        <div id="demo" className="py-24 bg-background">
          <CTASection />
        </div>
      </main>

      <Footer />
    </div>
  );
}
