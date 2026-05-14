"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import {
  ArrowLeft, Play, TerminalSquare, MessageSquare, Code2, Loader2,
  Save, Files, Search, Settings, FileCode2, User, X,
  PanelRightClose, PanelLeftClose, FolderOpen, Download, CheckCircle2,
  Clock, ChevronRight, Timer, AlertCircle, Trash2, Share2
} from "lucide-react";
import Editor, { loader } from "@monaco-editor/react";
import { Button } from "@/components/ui/button";
import { UserNav } from "@/components/user-nav";
import { supabase } from "@/lib/supabase";

loader.config({ paths: { vs: "/monaco-editor/vs" } });

import {
  generateCode,
  executeCode,
  getHistory,
  clearHistory,
  deleteHistoryItem,
  updateHistoryItem,
  checkHealth,
  ApiError,
  CodeResponse,
  ExecutionHistory
} from "@/lib/api";

interface Message {
  id: string;
  role: "user" | "ai";
  content: string;
  detectedLanguage?: string;
  isError?: boolean;
}

const LANG_FILENAME: Record<string, string> = {
  python: "main.py", javascript: "main.js",
  java: "Main.java", cpp: "main.cpp", c: "main.c",
};
const LANG_LABEL: Record<string, string> = {
  python: "Python 3.12", javascript: "Node.js 20",
  java: "Java 21", cpp: "C++ 20", c: "C 11",
};
const LANG_NAMES: Record<string, string> = {
  en: "English", hi: "Hindi", mr: "Marathi", fr: "French",
  de: "German", es: "Spanish", zh: "Chinese", ar: "Arabic",
  ja: "Japanese", ko: "Korean", pt: "Portuguese", ru: "Russian",
};

// ── Skeleton shimmer for editor loading state ──────────────────────────────
function EditorSkeleton() {
  return (
    <div className="absolute inset-0 bg-[#1e1e1e] p-4 overflow-hidden">
      {[80, 60, 90, 45, 70, 55, 85, 40, 65, 75].map((w, i) => (
        <div key={i} className="flex items-center gap-3 mb-3">
          <div className="w-6 text-right text-[11px] text-zinc-700 shrink-0 select-none">{i + 1}</div>
          <div
            className="h-3 rounded bg-zinc-700/60 animate-pulse"
            style={{ width: `${w}%`, animationDelay: `${i * 60}ms` }}
          />
        </div>
      ))}
    </div>
  );
}

export default function Playground() {
  const [messages, setMessages] = useState<Message[]>([
    { id: "1", role: "ai", content: "Welcome to PolyLang Playground. Describe what you want to build — in any language." }
  ]);
  const [inputVal, setInputVal] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [editorValue, setEditorValue] = useState("");
  const [terminalOutput, setTerminalOutput] = useState("$ ready");
  const [isLoadingCode, setIsLoadingCode] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("python");
  const [isBackendUp, setIsBackendUp] = useState<boolean | null>(null);
  const [explorerTab, setExplorerTab] = useState<"files" | "history">("files");
  const [history, setHistory] = useState<ExecutionHistory[]>([]);
  const [hasCode, setHasCode] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [currentHistoryId, setCurrentHistoryId] = useState<number | null>(null);
  const [showExplorer, setShowExplorer] = useState(true);
  const [showChat, setShowChat] = useState(true);
  const [user, setUser] = useState<any>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Health check
  useEffect(() => {
    const check = async () => setIsBackendUp(await checkHealth());
    check();
    const t = setInterval(check, 10000);
    return () => clearInterval(t);
  }, []);

  // Fetch history
  useEffect(() => {
    getHistory().then(setHistory).catch(() => {});
  }, []);

  // Fetch user session
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });
  }, []);

  // Session storage init (from homepage)
  useEffect(() => {
    const saved = sessionStorage.getItem("polylang_init");
    if (saved) {
      try {
        const data: CodeResponse = JSON.parse(saved);
        sessionStorage.removeItem("polylang_init");
        setSelectedLanguage(data.targetLanguage || "python");
        loadCode(data.generatedCode, undefined, () => {
          addMessage("ai", "Generated from your homepage prompt.", data.detectedLanguage);
        });
      } catch {}
    }
  }, []);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus search input when shown
  useEffect(() => {
    if (showSearch) searchInputRef.current?.focus();
  }, [showSearch]);

  // ── Helpers ──────────────────────────────────────────────────────────────

  function addMessage(role: "user" | "ai", content: string, detectedLanguage?: string, isError?: boolean) {
    setMessages(prev => [...prev, {
      id: Date.now().toString() + Math.random(),
      role, content, detectedLanguage, isError
    }]);
  }

  function loadCode(code: string, id?: number, onDone?: () => void) {
    setIsLoadingCode(true);
    setHasCode(false);
    setEditorValue(code);
    if (id) setCurrentHistoryId(id);
    setTimeout(() => {
      setIsLoadingCode(false);
      setHasCode(true);
      onDone?.();
    }, 500);
  }

  // ── Save session as .txt file ─────────────────────────────────────────────
  const handleSave = useCallback(() => {
    if (!hasCode || !editorValue.trim()) return;
    setSaveStatus("saving");
    const filename = LANG_FILENAME[selectedLanguage] ?? "code.txt";
    const blob = new Blob([editorValue], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    setTimeout(() => setSaveStatus("saved"), 300);
    setTimeout(() => setSaveStatus("idle"), 2500);
  }, [hasCode, editorValue, selectedLanguage]);

  // ── Generate ──────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim() || isGenerating) return;

    const userMsg = inputVal.trim();
    addMessage("user", userMsg);
    setInputVal("");
    setIsGenerating(true);
    setIsLoadingCode(true);
    setHasCode(false);
    setEditorValue("");

    try {
      const response = await generateCode(userMsg, selectedLanguage);

      const langName = LANG_NAMES[response.detectedLanguage] ?? response.detectedLanguage?.toUpperCase();
      const detectedLabel = response.detectedLanguage && response.detectedLanguage !== "en"
        ? response.detectedLanguage
        : undefined;

      addMessage("ai",
        `Generating ${LANG_LABEL[response.targetLanguage] ?? response.targetLanguage} code…`,
        detectedLabel
      );

      loadCode(response.generatedCode, undefined, () => {
        setIsGenerating(false);
        addMessage("ai", "Done. You can edit the code and click Run Code.");
        getHistory().then(setHistory).catch(() => {});
      });

    } catch (e) {
      setIsLoadingCode(false);
      setIsGenerating(false);
      const err = e as ApiError;
      let msg = err.message ?? "Unknown error";
      if (err.statusCode === 429) msg = "Rate limit reached — wait a moment and try again.";
      else if (msg.includes("offline")) msg = "Cannot reach backend. Make sure Spring Boot is running on port 8080.";
      addMessage("ai", "⚠ " + msg, undefined, true);
    }
  };

  // ── Run ───────────────────────────────────────────────────────────────────
  const handleRun = async () => {
    if (!hasCode || !editorValue.trim() || isRunning) return;
    setIsRunning(true);
    setTerminalOutput("$ Compiling…\n$ Running…");

    const slowTimer = setTimeout(() => {
      setTerminalOutput(p => p + "\n\n$ Still running… (first compile can take up to 60s)");
    }, 35000);

    const start = Date.now();
    try {
      const res = await executeCode(editorValue, selectedLanguage);
      clearTimeout(slowTimer);
      const ms = Date.now() - start;
      const footer = res.exitCode === 0
        ? `\n\n[Exited with code 0]  —  ${ms}ms`
        : `\n\n[Exited with code ${res.exitCode}]  —  ${ms}ms`;
      setTerminalOutput((res.output || res.error || "(no output)") + footer);
    } catch (e) {
      clearTimeout(slowTimer);
      setTerminalOutput("$ Error: " + (e as Error).message);
    } finally {
      setIsRunning(false);
    }
  };

  // ── History Actions ───────────────────────────────────────────────────────
  const handleDeleteItem = async (id: number) => {
    try {
      await deleteHistoryItem(id);
      setHistory(prev => prev.filter(h => h.id !== id));
      if (currentHistoryId === id) setCurrentHistoryId(null);
    } catch (e) {
      console.error("Delete failed", e);
    }
  };

  const handleUpdateItem = async () => {
    if (!currentHistoryId) return;
    setSaveStatus("saving");
    try {
      await updateHistoryItem(currentHistoryId, { code: editorValue });
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 2000);
    } catch (e) {
      console.error("Update failed", e);
      setSaveStatus("idle");
    }
  };

  const handleShare = () => {
    if (!currentHistoryId) return;
    const url = `${window.location.origin}/share/${currentHistoryId}`;
    navigator.clipboard.writeText(url);
    addMessage("ai", "Shareable link copied to clipboard! Anyone with this link can view your code.");
  };

  // ── Search in editor ──────────────────────────────────────────────────────
  const filteredHistory = history.filter(h =>
    h.inputText?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    h.targetLanguage?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const currentFilename = LANG_FILENAME[selectedLanguage] ?? "untitled";
  const isWorking = isGenerating || isRunning;

  return (
    <div className="flex h-screen w-full flex-col bg-background text-foreground overflow-hidden">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header className="flex h-12 items-center justify-between border-b border-border bg-card px-3 md:px-5 shrink-0">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="flex items-center gap-2 font-semibold text-sm">
            <Code2 className="w-4 h-4 text-primary" />
            <span className="hidden sm:inline">PolyLang</span>
          </div>
          {/* Backend status */}
          <div className="flex items-center gap-1.5">
            <div className={`w-1.5 h-1.5 rounded-full ${
              isBackendUp === null ? "bg-muted-foreground animate-pulse"
              : isBackendUp ? "bg-emerald-500 shadow-[0_0_6px_#10b981]"
              : "bg-red-500 shadow-[0_0_6px_#ef4444]"
            }`} />
            <span className="text-[11px] text-muted-foreground hidden md:inline">
              {isBackendUp === null ? "Connecting…" : isBackendUp ? "Connected" : "Offline"}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!showChat && (
            <Button variant="ghost" size="sm" onClick={() => setShowChat(true)} className="h-8 px-2 text-xs">
              <MessageSquare className="w-3.5 h-3.5 mr-1.5" /> Chat
            </Button>
          )}
          {/* Language selector */}
          <select
            value={selectedLanguage}
            onChange={e => setSelectedLanguage(e.target.value)}
            className="bg-muted border border-border rounded px-2 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary h-8 hidden sm:block"
          >
            <option value="python">Python</option>
            <option value="javascript">JavaScript</option>
            <option value="java">Java</option>
            <option value="cpp">C++</option>
          </select>

          {/* Share */}
          <Button
            variant="ghost" size="sm"
            onClick={handleShare}
            disabled={!currentHistoryId}
            className="h-8 px-2 text-xs hidden sm:flex gap-1.5 text-muted-foreground hover:text-foreground"
          >
            <Share2 className="w-3.5 h-3.5" />
          </Button>

          {/* Save/Update Project */}
          <Button
            variant="outline" size="sm"
            onClick={currentHistoryId ? handleUpdateItem : handleSave}
            disabled={!hasCode || saveStatus === "saving"}
            className={`h-8 px-3 text-xs hidden sm:flex gap-1.5 transition-all ${
              currentHistoryId ? "border-primary/30 bg-primary/5 hover:bg-primary/10" : ""
            }`}
          >
            {saveStatus === "saved"
              ? <><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Saved</>
              : saveStatus === "saving"
              ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> {currentHistoryId ? "Updating…" : "Saving…"}</>
              : <><Save className={`w-3.5 h-3.5 ${currentHistoryId ? "text-primary" : ""}`} /> {currentHistoryId ? "Update" : "Save"}</>
            }
          </Button>

          {/* Run */}
          <Button
            size="sm"
            onClick={handleRun}
            disabled={isWorking || !hasCode}
            className="h-8 px-3 text-xs bg-primary text-primary-foreground hover:bg-primary/90 gap-1.5"
          >
            {isRunning
              ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Running…</>
              : <><Play className="w-3.5 h-3.5" /> Run</>
            }
          </Button>
        </div>
      </header>

      {/* ── Main ───────────────────────────────────────────────────────────── */}
      <main className="flex flex-1 overflow-hidden">

        {/* Activity bar */}
        <div className="hidden md:flex w-10 bg-card border-r border-border flex-col items-center py-3 gap-5 shrink-0">
          <button
            onClick={() => setShowExplorer(v => !v)}
            title="Explorer"
            className={`p-1.5 rounded transition-colors ${showExplorer ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground"}`}
          >
            <Files className="w-4 h-4" />
          </button>
          <button
            onClick={() => { setShowSearch(v => !v); setShowExplorer(true); setExplorerTab("history"); }}
            title="Search history"
            className={`p-1.5 rounded transition-colors ${showSearch ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground"}`}
          >
            <Search className="w-4 h-4" />
          </button>
          <div className="mt-auto flex flex-col gap-4">
            <button className="p-1.5 text-muted-foreground hover:text-foreground transition-colors rounded" title="Settings">
              <Settings className="w-4 h-4" />
            </button>
            {user && (
              <div className="pb-1 scale-[0.85]">
                <UserNav user={user} align="left" />
              </div>
            )}
          </div>
        </div>

        {/* ── Explorer panel ─────────────────────────────────────────────── */}
        {showExplorer && (
          <div className="hidden lg:flex w-56 bg-card border-r border-border flex-col shrink-0 select-none">
            {/* Panel header */}
            <div className="h-9 flex items-center justify-between px-3 border-b border-border shrink-0">
              <div className="flex gap-1">
                {(["files", "history"] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setExplorerTab(tab)}
                    className={`px-2 py-1 text-[11px] font-medium rounded transition-colors capitalize ${
                      explorerTab === tab
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
              <button onClick={() => setShowExplorer(false)} className="text-muted-foreground hover:text-foreground transition-colors p-0.5">
                <PanelLeftClose className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Search bar (history tab) */}
            {explorerTab === "history" && (
              <div className="px-2 py-1.5 border-b border-border">
                <div className="flex items-center gap-1.5 bg-muted rounded px-2 py-1">
                  <Search className="w-3 h-3 text-muted-foreground shrink-0" />
                  <input
                    ref={searchInputRef}
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search history…"
                    className="bg-transparent text-[12px] text-foreground placeholder:text-muted-foreground outline-none w-full"
                  />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery("")} className="text-muted-foreground hover:text-foreground">
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Panel content */}
            <div className="flex-1 overflow-y-auto p-1.5 flex flex-col gap-0.5">
              {explorerTab === "files" ? (
                hasCode ? (
                  <div className="flex items-center gap-2 px-2 py-1.5 text-[12px] text-foreground bg-primary/10 rounded border border-primary/20">
                    <FileCode2 className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span className="truncate font-medium">{currentFilename}</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center flex-1 py-8 gap-2 text-center px-3">
                    <FolderOpen className="w-8 h-8 text-muted-foreground/25" />
                    <p className="text-[11px] text-muted-foreground/50 leading-relaxed">
                      No files yet.<br />Generate code to create a file.
                    </p>
                  </div>
                )
              ) : (
                <>
                  {(searchQuery ? filteredHistory : history).length > 0
                    ? (searchQuery ? filteredHistory : history).map(item => (
                      <div key={item.id} className="relative group">
                        <button
                          onClick={() => {
                            loadCode(item.generatedCode, item.id);
                            setSelectedLanguage(item.targetLanguage);
                            // Restore terminal output if it exists
                            if (item.output || item.error) {
                              const footer = item.status === "SUCCESS"
                                ? `\n\n[Restored from history]  —  ${item.executionTime}ms`
                                : `\n\n[Restored (Failed run)]  —  ${item.executionTime}ms`;
                              setTerminalOutput((item.output || item.error || "(no output)") + footer);
                            } else {
                              setTerminalOutput("$ Restored from history");
                            }
                            addMessage("ai", `Restored session from: "${item.inputText.slice(0, 30)}..."`);
                          }}
                          className={`flex flex-col gap-1 px-2 py-2 text-left text-[12px] rounded transition-colors w-full border border-transparent hover:border-border ${
                            currentHistoryId === item.id ? "bg-primary/5 border-primary/20 text-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                          }`}
                        >
                          <div className="flex items-start gap-2 pr-12">
                            <Clock className="w-3 h-3 shrink-0 mt-0.5 text-muted-foreground/50" />
                            <span className="truncate leading-relaxed font-medium">{item.inputText}</span>
                          </div>
                          <div className="flex items-center gap-2 pl-5 text-[10px] opacity-70">
                            <span className="uppercase">{item.targetLanguage}</span>
                            {item.status && (
                              <div className={`flex items-center gap-1 ${
                                item.status === "SUCCESS" ? "text-emerald-500" : 
                                item.status === "ERROR" ? "text-red-500" : "text-primary"
                              }`}>
                                {item.status === "SUCCESS" ? (
                                  <CheckCircle2 className="w-2.5 h-2.5" />
                                ) : item.status === "ERROR" ? (
                                  <AlertCircle className="w-2.5 h-2.5" />
                                ) : (
                                  <Loader2 className="w-2.5 h-2.5 animate-spin" />
                                )}
                                <span>{item.status}</span>
                              </div>
                            )}
                            {item.executionTime > 0 && (
                              <div className="flex items-center gap-1">
                                <Timer className="w-2.5 h-2.5" />
                                <span>{item.executionTime}ms</span>
                              </div>
                            )}
                          </div>
                        </button>
                        
                        {/* Hover Actions */}
                        <div className="absolute right-1 top-1/2 -translate-y-1/2 hidden group-hover:flex items-center gap-1 bg-card/80 backdrop-blur-sm p-1 rounded-md border border-border shadow-sm">
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleShare(); }}
                            className="p-1 hover:text-primary transition-colors"
                            title="Copy share link"
                          >
                            <Share2 className="w-3 h-3" />
                          </button>
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleDeleteItem(item.id); }}
                            className="p-1 hover:text-destructive transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))
                    : (
                      <div className="flex flex-col items-center justify-center flex-1 py-8 gap-2 text-center px-3">
                        <FolderOpen className="w-8 h-8 text-muted-foreground/25" />
                        <p className="text-[11px] text-muted-foreground/50 leading-relaxed">
                          {searchQuery ? "No results found." : "No history yet."}
                        </p>
                      </div>
                    )
                  }
                </>
              )}
            </div>

            {explorerTab === "history" && history.length > 0 && (
              <div className="p-2 border-t border-border">
                <button
                  onClick={() => clearHistory().then(() => { setHistory([]); setSearchQuery(""); })}
                  className="w-full text-[11px] text-muted-foreground hover:text-destructive transition-colors py-1 flex items-center justify-center gap-1.5"
                >
                  <X className="w-3 h-3" /> Clear all history
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── Center: Editor + Terminal ───────────────────────────────────── */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

          {/* Editor tab bar */}
          <div className="flex h-9 items-center justify-between px-3 bg-card border-b border-border shrink-0">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 text-[12px] text-foreground font-medium">
                <FileCode2 className="w-3.5 h-3.5 text-primary" />
                {hasCode ? currentFilename : "untitled"}
              </div>
              {isLoadingCode && (
                <span className="flex items-center gap-1 text-[11px] text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
                  <Loader2 className="w-2.5 h-2.5 animate-spin" /> Generating
                </span>
              )}
            </div>
            <span className="text-[11px] text-muted-foreground uppercase tracking-wide">
              {LANG_LABEL[selectedLanguage] ?? selectedLanguage}
            </span>
          </div>

          {/* Monaco editor */}
          <div className="h-[62%] relative">
            {isLoadingCode && <EditorSkeleton />}
            {!hasCode && !isLoadingCode && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 pointer-events-none select-none bg-[#1e1e1e]">
                <Code2 className="w-10 h-10 text-zinc-700" />
                <p className="text-sm text-zinc-600 max-w-xs text-center leading-relaxed">
                  Describe what you want to build in the chat panel →
                </p>
              </div>
            )}
            <Editor
              height="100%"
              language={selectedLanguage}
              theme="vs-dark"
              value={editorValue}
              onChange={val => { if (!isLoadingCode) setEditorValue(val ?? ""); }}
              options={{
                readOnly: isLoadingCode,
                minimap: { enabled: false },
                fontSize: 13,
                fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
                lineHeight: 20,
                scrollBeyondLastLine: false,
                padding: { top: 12, bottom: 12 },
                lineNumbers: "on",
                wordWrap: "on",
                renderLineHighlight: "line",
                smoothScrolling: true,
                cursorBlinking: "smooth",
              }}
            />
          </div>

          {/* Terminal */}
          <div className="flex-1 border-t border-border flex flex-col bg-[#0d0d0d] min-h-0">
            <div className="flex h-8 items-center px-3 border-b border-border gap-2 shrink-0">
              <TerminalSquare className="w-3 h-3 text-muted-foreground" />
              <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Terminal</span>
              {isRunning && (
                <span className="flex items-center gap-1 text-[11px] text-amber-500 ml-auto">
                  <Loader2 className="w-2.5 h-2.5 animate-spin" /> Running
                </span>
              )}
            </div>
            <div className={`p-3 flex-1 overflow-y-auto text-[12px] font-mono whitespace-pre-wrap leading-relaxed ${
              terminalOutput.includes("Exited with code 1") || terminalOutput.includes("$ Error:")
                ? "text-red-400"
                : terminalOutput.includes("Exited with code 0")
                ? "text-emerald-400"
                : "text-zinc-400"
            }`}>
              {terminalOutput}
            </div>
          </div>
        </div>

        {/* ── Chat panel ─────────────────────────────────────────────────── */}
        {showChat && (
          <div className="w-full md:w-[320px] lg:w-[360px] flex flex-col bg-card border-l border-border shrink-0">

            {/* Chat header */}
            <div className="flex h-9 items-center justify-between px-3 border-b border-border shrink-0">
              <div className="flex items-center gap-2 text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
                <MessageSquare className="w-3.5 h-3.5" /> PolyLang AI
              </div>
              <button onClick={() => setShowChat(false)} className="text-muted-foreground hover:text-foreground transition-colors p-0.5">
                <PanelRightClose className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-3 space-y-4">
              {messages.map(msg => (
                <div key={msg.id} className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}>
                  <div className={`max-w-[88%] rounded-xl px-3 py-2 text-[13px] leading-relaxed ${
                    msg.isError
                      ? "bg-red-500/10 border border-red-500/20 text-foreground"
                      : msg.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted border border-border text-foreground"
                  }`}>
                    {msg.content}
                    {msg.detectedLanguage && msg.detectedLanguage !== "en" && (
                      <div className="mt-1.5 flex items-center gap-2">
                        <span className="text-[10px] bg-primary/15 text-primary border border-primary/25 rounded-full px-2 py-0.5 font-medium uppercase tracking-wide flex items-center gap-1">
                          <MessageSquare className="w-2 h-2" />
                          {LANG_NAMES[msg.detectedLanguage] ?? msg.detectedLanguage} detected
                        </span>
                      </div>
                    )}
                  </div>
                  <span className="text-[10px] text-muted-foreground mt-1 px-1">
                    {msg.role === "user" ? "You" : "PolyLang"}
                  </span>
                </div>
              ))}

              {/* Thinking indicator */}
              {isGenerating && (
                <div className="flex items-start">
                  <div className="bg-muted border border-border rounded-xl px-3 py-2 text-[13px] text-foreground flex items-center gap-2">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
                    <span>Thinking…</span>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input */}
            <div className="p-2.5 border-t border-border shrink-0">
              <form onSubmit={handleSubmit} className="relative">
                <textarea
                  ref={textareaRef}
                  value={inputVal}
                  onChange={e => setInputVal(e.target.value)}
                  placeholder="Describe what to build… (any language)"
                  rows={3}
                  className="w-full bg-muted/60 border border-border rounded-lg px-3 py-2.5 text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none pr-10 leading-relaxed transition-colors"
                  onKeyDown={e => {
                    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSubmit(e); }
                  }}
                />
                <button
                  type="submit"
                  disabled={!inputVal.trim() || isGenerating}
                  className="absolute right-2 bottom-2 p-1.5 bg-primary text-primary-foreground rounded-md disabled:opacity-40 hover:bg-primary/90 transition-all active:scale-95"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </form>
              <p className="text-[10px] text-muted-foreground/50 text-center mt-1.5">
                Supports Hindi, Marathi, French, and more
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
