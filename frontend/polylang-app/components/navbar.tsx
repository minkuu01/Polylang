import Link from "next/link";
import { ChevronDown, Sparkles, MonitorPlay, BookOpen, Users } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { UserNav } from "@/components/user-nav";

export async function Navbar() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8 md:gap-10">
          <Link href="/" className="flex items-center space-x-2">
            <span className="font-bold text-xl uppercase tracking-wider text-foreground">
              PolyLang
            </span>
          </Link>
          <nav className="hidden md:flex gap-6 items-center">
            <Link
              href="#features"
              className="group flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              <Sparkles className="w-4 h-4 text-primary group-hover:animate-pulse" />
              Product
              <ChevronDown className="w-3 h-3 opacity-50 relative top-[1px]" />
            </Link>
            <Link
              href="#demo"
              className="group flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              <MonitorPlay className="w-4 h-4" />
              Demo
            </Link>
            <Link
              href="/docs"
              className="group flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              <BookOpen className="w-4 h-4" />
              Docs
            </Link>
             <Link
              href="#community"
              className="group flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              <Users className="w-4 h-4" />
              Community
              <ChevronDown className="w-3 h-3 opacity-50 relative top-[1px]" />
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          {user ? (
            <UserNav user={user} />
          ) : (
            <Link
              href="/login"
              className="text-sm font-semibold text-foreground hover:text-primary transition-colors hidden sm:block bg-muted/50 px-4 py-2 rounded"
            >
              Log in
            </Link>
          )}
          <Link
            href="/playground"
            className="inline-flex h-9 items-center justify-center rounded bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
          >
            Open Playground
          </Link>
        </div>
      </div>
    </header>
  );
}
