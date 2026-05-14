"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getSharedItem, ExecutionHistory } from "@/lib/api";
import Editor from "@monaco-editor/react";
import { Code2, ArrowLeft, TerminalSquare, Timer, CheckCircle2, AlertCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function SharePage() {
  const { id } = useParams();
  const [item, setItem] = useState<ExecutionHistory | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      getSharedItem(Number(id))
        .then(setItem)
        .catch(err => setError("This snippet could not be found or is no longer public."))
        .finally(() => setLoading(false));
    }
  }, [id]);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#0d0d0d]">
        <div className="animate-pulse text-primary font-mono text-sm">Loading shared code...</div>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-[#0d0d0d] p-6 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h1 className="text-xl font-bold text-white mb-2">Snippet Not Found</h1>
        <p className="text-zinc-500 mb-6">{error || "This link may have expired."}</p>
        <Link href="/">
          <Button variant="outline">Back to PolyLang</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full flex-col bg-[#0d0d0d] overflow-hidden">
      <header className="flex h-12 items-center justify-between border-b border-zinc-800 bg-zinc-900 px-5 shrink-0">
        <div className="flex items-center gap-3">
          <Link href="/playground" className="text-zinc-400 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="flex items-center gap-2 font-semibold text-sm">
            <Code2 className="w-4 h-4 text-primary" />
            <span className="text-white">Shared via PolyLang</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
            <span className="text-xs text-zinc-500 uppercase tracking-widest">{item.targetLanguage}</span>
            <Link href="/playground">
                <Button size="sm" className="h-8 text-xs">Create Your Own</Button>
            </Link>
        </div>
      </header>

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <div className="flex h-9 items-center justify-between px-4 bg-zinc-900/50 border-b border-zinc-800 shrink-0">
          <div className="text-[12px] text-zinc-300 font-medium italic">
            "{item.inputText}"
          </div>
          {item.executionTime > 0 && (
            <div className="flex items-center gap-3 text-[11px] text-zinc-500">
                <div className="flex items-center gap-1">
                    <Timer className="w-3 h-3" /> {item.executionTime}ms
                </div>
                <div className={`flex items-center gap-1 ${item.status === 'SUCCESS' ? 'text-emerald-500' : 'text-red-500'}`}>
                    {item.status === 'SUCCESS' ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                    {item.status}
                </div>
            </div>
          )}
        </div>

        <div className="flex-1 relative">
          <Editor
            height="100%"
            language={item.targetLanguage}
            theme="vs-dark"
            value={item.generatedCode}
            options={{
              readOnly: true,
              minimap: { enabled: false },
              fontSize: 14,
              fontFamily: "'JetBrains Mono', monospace",
              padding: { top: 20 },
              scrollBeyondLastLine: false,
            }}
          />
        </div>

        {item.output && (
          <div className="h-1/3 border-t border-zinc-800 flex flex-col bg-black min-h-0">
            <div className="flex h-8 items-center px-4 border-b border-zinc-800 gap-2 shrink-0">
              <TerminalSquare className="w-3 h-3 text-zinc-500" />
              <span className="text-[11px] font-medium text-zinc-500 uppercase tracking-widest">Execution Output</span>
            </div>
            <div className="p-4 flex-1 overflow-y-auto text-[13px] font-mono text-emerald-400/90 leading-relaxed whitespace-pre-wrap">
              {item.output}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
