import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Code2,
  FileCode2,
  Languages,
  Play,
  ShieldCheck,
  Sparkles,
  TerminalSquare,
} from "lucide-react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

const quickStart = [
  {
    title: "Sign in",
    description: "Create an account or continue with Google so PolyLang can save your generated sessions.",
    icon: ShieldCheck,
  },
  {
    title: "Describe the build",
    description: "Write the task in English, Hindi, Marathi, French, or another supported natural language.",
    icon: Languages,
  },
  {
    title: "Review the code",
    description: "PolyLang translates intent into editable code inside the playground editor.",
    icon: FileCode2,
  },
  {
    title: "Run and iterate",
    description: "Execute the program, inspect terminal output, and update saved history when the code changes.",
    icon: Play,
  },
];

const endpoints = [
  ["GET", "/api/health", "Public backend health check."],
  ["POST", "/api/generate", "Generate code from multilingual instructions."],
  ["POST", "/api/execute", "Run code in the selected language runtime."],
  ["GET", "/api/history", "Load authenticated user generation and execution history."],
  ["DELETE", "/api/history/{id}", "Delete a single authenticated history item."],
  ["GET", "/api/share/{id}", "Read a public shared code snippet."],
];

const languages = ["Python", "JavaScript", "Java", "C++", "C"];

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30">
      <Navbar />

      <main>
        <section className="relative overflow-hidden border-b border-border/40 bg-background">
          <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(to_right,#80808018_1px,transparent_1px),linear-gradient(to_bottom,#80808018_1px,transparent_1px)] bg-[size:28px_28px]" />
          <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_0%,rgba(0,230,118,0.16),transparent_34%)]" />

          <div className="container relative mx-auto px-4 md:px-6 py-24 md:py-28">
            <div className="max-w-3xl">
              <div className="mb-6 inline-flex items-center gap-2 rounded border border-primary/25 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-primary">
                <BookOpen className="h-3.5 w-3.5" />
                Documentation
              </div>
              <h1 className="text-4xl md:text-6xl font-semibold tracking-tight text-balance">
                Build software by describing intent.
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
                PolyLang turns multilingual prompts into runnable code, keeps your sessions organized, and gives you a compact playground for generation, execution, and sharing.
              </p>
              <div className="mt-10 flex flex-col sm:flex-row gap-4">
                <Link
                  href="/playground"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded bg-primary px-6 text-sm font-semibold uppercase tracking-widest text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  Open Playground
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/"
                  className="inline-flex h-12 items-center justify-center rounded border border-border bg-background px-6 text-sm font-semibold uppercase tracking-widest text-foreground transition-colors hover:bg-accent"
                >
                  Back Home
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 md:px-6 py-20">
          <div className="grid gap-12 lg:grid-cols-[280px_1fr]">
            <aside className="hidden lg:block">
              <div className="sticky top-24 space-y-2 border-l border-border pl-4 text-sm">
                <Link href="#start" className="block text-muted-foreground transition-colors hover:text-primary">Quick start</Link>
                <Link href="#workflow" className="block text-muted-foreground transition-colors hover:text-primary">Workflow</Link>
                <Link href="#api" className="block text-muted-foreground transition-colors hover:text-primary">API reference</Link>
                <Link href="#languages" className="block text-muted-foreground transition-colors hover:text-primary">Languages</Link>
              </div>
            </aside>

            <div className="space-y-20">
              <section id="start" className="scroll-mt-24">
                <div className="mb-8 flex items-center gap-3">
                  <Sparkles className="h-5 w-5 text-primary" />
                  <h2 className="text-2xl font-semibold tracking-tight">Quick Start</h2>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  {quickStart.map((item) => {
                    const Icon = item.icon;
                    return (
                      <div key={item.title} className="rounded-lg border border-border bg-card p-5">
                        <Icon className="mb-4 h-5 w-5 text-primary" />
                        <h3 className="mb-2 font-semibold">{item.title}</h3>
                        <p className="text-sm leading-relaxed text-muted-foreground">{item.description}</p>
                      </div>
                    );
                  })}
                </div>
              </section>

              <section id="workflow" className="scroll-mt-24">
                <div className="mb-8 flex items-center gap-3">
                  <Code2 className="h-5 w-5 text-primary" />
                  <h2 className="text-2xl font-semibold tracking-tight">Playground Workflow</h2>
                </div>
                <div className="overflow-hidden rounded-lg border border-border">
                  <div className="grid border-b border-border bg-muted/40 px-4 py-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground md:grid-cols-[180px_1fr]">
                    <span>Area</span>
                    <span>What it does</span>
                  </div>
                  {[
                    ["Chat", "Enter natural language instructions and receive generated code."],
                    ["Editor", "Inspect and modify the generated file before running it."],
                    ["Terminal", "View compiler output, runtime output, errors, and elapsed time."],
                    ["History", "Restore, update, delete, or share previous authenticated sessions."],
                  ].map(([area, detail]) => (
                    <div key={area} className="grid gap-2 border-b border-border px-4 py-4 text-sm last:border-b-0 md:grid-cols-[180px_1fr]">
                      <span className="font-medium text-foreground">{area}</span>
                      <span className="text-muted-foreground">{detail}</span>
                    </div>
                  ))}
                </div>
              </section>

              <section id="api" className="scroll-mt-24">
                <div className="mb-8 flex items-center gap-3">
                  <TerminalSquare className="h-5 w-5 text-primary" />
                  <h2 className="text-2xl font-semibold tracking-tight">API Reference</h2>
                </div>
                <div className="overflow-hidden rounded-lg border border-border bg-card">
                  {endpoints.map(([method, path, description]) => (
                    <div key={`${method}-${path}`} className="grid gap-3 border-b border-border px-4 py-4 text-sm last:border-b-0 lg:grid-cols-[90px_220px_1fr]">
                      <span className="font-mono text-xs font-semibold text-primary">{method}</span>
                      <code className="font-mono text-xs text-foreground">{path}</code>
                      <span className="text-muted-foreground">{description}</span>
                    </div>
                  ))}
                </div>
              </section>

              <section id="languages" className="scroll-mt-24">
                <div className="mb-8 flex items-center gap-3">
                  <Languages className="h-5 w-5 text-primary" />
                  <h2 className="text-2xl font-semibold tracking-tight">Supported Output Languages</h2>
                </div>
                <div className="flex flex-wrap gap-3">
                  {languages.map((language) => (
                    <span key={language} className="rounded border border-border bg-muted px-4 py-2 text-sm font-medium text-foreground">
                      {language}
                    </span>
                  ))}
                </div>
              </section>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
