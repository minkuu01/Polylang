"use client"

import React from "react"
import { cx } from "class-variance-authority"
import { AnimatePresence, motion } from "motion/react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { generateCode } from "@/lib/api"
import { useRouter } from "next/navigation"

interface OrbProps {
  dimension?: string
  className?: string
  tones?: {
    base?: string
    accent1?: string
    accent2?: string
    accent3?: string
  }
  spinDuration?: number
}

const ColorOrb: React.FC<OrbProps> = ({
  dimension = "192px",
  className,
  tones,
  spinDuration = 15,
}) => {
  const fallbackTones = {
    base: "oklch(75% 0.18 150)",      // Based on primary #EC4E02
    accent1: "oklch(80% 0.15 160)",
    accent2: "oklch(85% 0.12 140)",
    accent3: "oklch(65% 0.18 145)",
  }

  const palette = { ...fallbackTones, ...tones }

  const dimValue = parseInt(dimension.replace("px", ""), 10)

  const blurStrength =
    dimValue < 50 ? Math.max(dimValue * 0.008, 1) : Math.max(dimValue * 0.015, 4)

  const contrastStrength =
    dimValue < 50 ? Math.max(dimValue * 0.004, 1.2) : Math.max(dimValue * 0.008, 1.5)

  const pixelDot = dimValue < 50 ? Math.max(dimValue * 0.004, 0.05) : Math.max(dimValue * 0.008, 0.1)

  const shadowRange = dimValue < 50 ? Math.max(dimValue * 0.004, 0.5) : Math.max(dimValue * 0.008, 2)

  const maskRadius =
    dimValue < 30 ? "0%" : dimValue < 50 ? "5%" : dimValue < 100 ? "15%" : "25%"

  const adjustedContrast =
    dimValue < 30 ? 1.1 : dimValue < 50 ? Math.max(contrastStrength * 1.2, 1.3) : contrastStrength

  return (
    <div
      className={cn("color-orb", className)}
      style={{
        width: dimension,
        height: dimension,
        "--base": palette.base,
        "--accent1": palette.accent1,
        "--accent2": palette.accent2,
        "--accent3": palette.accent3,
        "--spin-duration": `${spinDuration}s`,
        "--blur": `${blurStrength}px`,
        "--contrast": adjustedContrast,
        "--dot": `${pixelDot}px`,
        "--shadow": `${shadowRange}px`,
        "--mask": maskRadius,
      } as React.CSSProperties}
    >
      <style jsx>{`
        @property --angle {
          syntax: "<angle>";
          inherits: false;
          initial-value: 0deg;
        }

        .color-orb {
          display: grid;
          grid-template-areas: "stack";
          overflow: hidden;
          border-radius: 50%;
          position: relative;
          transform: scale(1.1);
        }

        .color-orb::before,
        .color-orb::after {
          content: "";
          display: block;
          grid-area: stack;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          transform: translateZ(0);
        }

        .color-orb::before {
          background:
            conic-gradient(
              from calc(var(--angle) * 2) at 25% 70%,
              var(--accent3),
              transparent 20% 80%,
              var(--accent3)
            ),
            conic-gradient(
              from calc(var(--angle) * 2) at 45% 75%,
              var(--accent2),
              transparent 30% 60%,
              var(--accent2)
            ),
            conic-gradient(
              from calc(var(--angle) * -3) at 80% 20%,
              var(--accent1),
              transparent 40% 60%,
              var(--accent1)
            ),
            conic-gradient(
              from calc(var(--angle) * 2) at 15% 5%,
              var(--accent2),
              transparent 10% 90%,
              var(--accent2)
            ),
            conic-gradient(
              from calc(var(--angle) * 1) at 20% 80%,
              var(--accent1),
              transparent 10% 90%,
              var(--accent1)
            ),
            conic-gradient(
              from calc(var(--angle) * -2) at 85% 10%,
              var(--accent3),
              transparent 20% 80%,
              var(--accent3)
            );
          box-shadow: inset var(--base) 0 0 var(--shadow) calc(var(--shadow) * 0.2);
          filter: blur(var(--blur)) contrast(var(--contrast));
          animation: spin var(--spin-duration) linear infinite;
        }

        .color-orb::after {
          background-image: radial-gradient(
            circle at center,
            var(--base) var(--dot),
            transparent var(--dot)
          );
          background-size: calc(var(--dot) * 2) calc(var(--dot) * 2);
          backdrop-filter: blur(calc(var(--blur) * 2)) contrast(calc(var(--contrast) * 2));
          mix-blend-mode: overlay;
        }

        .color-orb[style*="--mask: 0%"]::after {
          mask-image: none;
        }

        .color-orb:not([style*="--mask: 0%"])::after {
          mask-image: radial-gradient(black var(--mask), transparent 75%);
        }

        @keyframes spin {
          to {
            --angle: 360deg;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .color-orb::before {
            animation: none;
          }
        }
      `}</style>
    </div>
  )
}

const SPEED_FACTOR = 1

interface ContextShape {
  showForm: boolean
  successFlag: boolean
  triggerOpen: () => void
  triggerClose: () => void
}

const FormContext = React.createContext({} as ContextShape)
const useFormContext = () => React.useContext(FormContext)

export function MorphPanel() {
  const wrapperRef = React.useRef<HTMLDivElement>(null)
  const textareaRef = React.useRef<HTMLTextAreaElement | null>(null)

  const [showForm, setShowForm] = React.useState(false)
  const [successFlag, setSuccessFlag] = React.useState(false)

  const triggerClose = React.useCallback(() => {
    setShowForm(false)
    textareaRef.current?.blur()
  }, [])

  const triggerOpen = React.useCallback(() => {
    setShowForm(true)
    setTimeout(() => {
      textareaRef.current?.focus()
    })
  }, [])

  const handleSuccess = React.useCallback(() => {
    triggerClose()
    setSuccessFlag(true)
    setTimeout(() => setSuccessFlag(false), 1500)
  }, [triggerClose])

  React.useEffect(() => {
    function clickOutsideHandler(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node) && showForm) {
        triggerClose()
      }
    }
    document.addEventListener("mousedown", clickOutsideHandler)
    return () => document.removeEventListener("mousedown", clickOutsideHandler)
  }, [showForm, triggerClose])

  const ctx = React.useMemo(
    () => ({ showForm, successFlag, triggerOpen, triggerClose }),
    [showForm, successFlag, triggerOpen, triggerClose]
  )

  return (
    <div className="flex w-full items-center justify-center pointer-events-auto" style={{ height: FORM_HEIGHT }}>
      <motion.div
        ref={wrapperRef}
        data-panel
        className={cx(
          "bg-background relative z-10 flex flex-col items-center justify-center overflow-hidden border border-border shadow-2xl"
        )}
        initial={false}
        animate={{
          width: showForm ? FORM_WIDTH : "auto",
          height: showForm ? FORM_HEIGHT : 60,
          borderRadius: showForm ? 14 : 30,
        }}
        transition={{
          type: "spring",
          stiffness: 550 / SPEED_FACTOR,
          damping: 45,
          mass: 0.7,
          delay: showForm ? 0 : 0.08,
        }}
      >
        <FormContext.Provider value={ctx}>
          <DockBar />
          <InputForm innerRef={textareaRef} onSuccess={handleSuccess} />
        </FormContext.Provider>
      </motion.div>
    </div>
  )
}

function DockBar() {
  const { showForm, triggerOpen } = useFormContext()
  return (
    <footer className="mt-auto flex h-[60px] items-center justify-center whitespace-nowrap select-none">
      <div className="flex items-center justify-center gap-3 px-4 max-sm:h-12 max-sm:px-3">
        <div className="flex w-fit items-center gap-2">
          <AnimatePresence mode="wait">
            {showForm ? (
              <motion.div
                key="blank"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0 }}
                exit={{ opacity: 0 }}
                className="h-5 w-5"
              />
            ) : (
              <motion.div
                key="orb"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {/* Fixed base color for small orb to fit our dark orange theme */}
                <ColorOrb dimension="24px" tones={{ base: "oklch(75% 0.18 150)" }} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex flex-col items-start" onClick={triggerOpen}>
          <Button
            type="button"
            className="flex h-fit flex-1 justify-start rounded-full px-2 py-0 h-auto font-medium text-foreground hover:bg-transparent hover:text-accent-foreground"
            variant="ghost"
          >
            <span className="truncate text-[15px]">Ask AI to Code</span>
          </Button>
          <span className="text-[11px] text-muted-foreground px-2 -mt-1 font-medium">PolyLang AI</span>
        </div>
      </div>
    </footer>
  )
}

const FORM_WIDTH = 640
const FORM_HEIGHT = 260

function InputForm({ innerRef, onSuccess }: { innerRef: React.RefObject<HTMLTextAreaElement | null>; onSuccess: () => void }) {
  const { triggerClose, showForm } = useFormContext()
  const btnRef = React.useRef<HTMLButtonElement>(null)
  
  const [text, setText] = React.useState("")
  const [exampleIndex, setExampleIndex] = React.useState(0)
  
  const examples = React.useMemo(() => [
    "Build a snake game in Python using Pygame...",
    "Write a reliable React Native authentication hook...",
    "Create a fully parallelized Rust file scraper...",
    "Design a scalable Golang microservice architecture...",
  ], [])

  React.useEffect(() => {
    if (!showForm) {
      setText("")
      setExampleIndex(0)
      return
    }

    let isMatched = true
    let isDeleting = false
    let charIndex = 0
    let timeout: NodeJS.Timeout
    let loopCount = 0

    const type = () => {
      if (!isMatched) return
      const currentExample = examples[exampleIndex % examples.length]
      
      if (isDeleting) {
        charIndex--
      } else {
        charIndex++
      }

      setText(currentExample.substring(0, charIndex))

      let typeSpeed = isDeleting ? 15 : 45

      if (!isDeleting && charIndex === currentExample.length) {
        typeSpeed = 1500 // pause at end of word
        isDeleting = true
        loopCount++
        if (loopCount >= 4) { 
           isMatched = false
           setTimeout(() => triggerClose(), 1000)
           return
        }
      } else if (isDeleting && charIndex === 0) {
        isDeleting = false
        setExampleIndex((prev) => prev + 1)
        typeSpeed = 400 // pause before next word
      }

      timeout = setTimeout(type, typeSpeed)
    }
    
    timeout = setTimeout(type, 600) // initial pause
    return () => {
      isMatched = false
      clearTimeout(timeout)
    }
  }, [showForm, exampleIndex, examples, triggerClose])

  const router = useRouter()
  
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!text.trim()) return
    
    try {
      const response = await generateCode(text, "python")
      sessionStorage.setItem("polylang_init", JSON.stringify(response))
      onSuccess()
      router.push("/playground")
    } catch (err) {
      console.error("Homepage generation failed", err)
      onSuccess()
      // Still redirect so the playground can show the error or let user retry
      router.push("/playground")
    }
  }

  function handleKeys(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Escape") triggerClose()
    if (e.key === "Enter" && e.metaKey) {
      e.preventDefault()
      btnRef.current?.click()
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="absolute bottom-0"
      style={{ width: FORM_WIDTH, height: FORM_HEIGHT, pointerEvents: showForm ? "all" : "none" }}
    >
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ type: "spring", stiffness: 550 / SPEED_FACTOR, damping: 45, mass: 0.7 }}
            className="flex h-full flex-col p-1"
          >
            <div className="flex justify-between py-1">
              <p className="text-foreground z-2 ml-[38px] flex items-center gap-[6px] select-none text-sm font-medium">
                PolyLang AI
              </p>
              <button
                type="submit"
                ref={btnRef}
                className="text-foreground right-4 mt-1 flex -translate-y-[3px] cursor-pointer items-center justify-center gap-1 rounded-[12px] bg-transparent pr-1 text-center select-none"
              >
                <KeyHint>⌘</KeyHint>
                <KeyHint className="w-fit">Enter</KeyHint>
              </button>
            </div>
            <textarea
              ref={innerRef}
              placeholder="e.g. Build a snake game in Python..."
              name="message"
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="h-full w-full resize-none scroll-py-2 rounded-md p-6 outline-0 bg-transparent text-base placeholder:text-muted-foreground focus:ring-0 leading-relaxed"
              required
              onKeyDown={handleKeys}
              spellCheck={false}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute top-2 left-3"
          >
            <ColorOrb dimension="24px" tones={{ base: "oklch(75% 0.18 150)" }} />
          </motion.div>
        )}
      </AnimatePresence>
    </form>
  )
}

const SPRING_LOGO = { type: "spring", stiffness: 350 / SPEED_FACTOR, damping: 35 } as const

function KeyHint({ children, className }: { children: string; className?: string }) {
  return (
    <kbd
      className={cx(
        "text-muted-foreground flex h-5 w-fit items-center justify-center rounded-md border border-border bg-muted/50 px-1.5 text-[10px] font-medium font-sans",
        className
      )}
    >
      {children}
    </kbd>
  )
}
