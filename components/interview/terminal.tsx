"use client"

import { useRef, useEffect } from "react"
import { Terminal as TerminalIcon, X, Maximize2, Minimize2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

interface TerminalLine {
  id: string
  type: "input" | "output" | "error" | "system"
  content: string
  timestamp: Date
}

interface TerminalProps {
  lines: TerminalLine[]
  isRunning: boolean
  isExpanded: boolean
  onToggleExpand: () => void
  onClear: () => void
}

export function Terminal({ lines, isRunning, isExpanded, onToggleExpand, onClear }: TerminalProps) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [lines])

  return (
    <div className={cn(
      "flex flex-col bg-sidebar border border-border rounded-lg overflow-hidden transition-all",
      isExpanded ? "h-64" : "h-10"
    )}>
      {/* Header */}
      <div
        onClick={onToggleExpand}
        className="flex items-center justify-between px-3 py-2 border-b border-border hover:bg-muted/30 transition-colors cursor-pointer"
        role="button"
        tabIndex={0}
      >
        <div className="flex items-center gap-2">
          <TerminalIcon className="h-4 w-4 text-accent" />
          <span className="text-sm font-medium">Output</span>
          {isRunning && (
            <span className="flex items-center gap-1 text-xs text-primary">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              Running...
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={(e) => {
              e.stopPropagation()
              onClear()
            }}
          >
            <X className="h-3 w-3" />
          </Button>
          {isExpanded ? (
            <Minimize2 className="h-4 w-4 text-muted-foreground" />
          ) : (
            <Maximize2 className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      </div>

      {/* Terminal Content */}
      {isExpanded && (
        <ScrollArea className="flex-1 p-3">
          <div className="font-mono text-sm space-y-1">
            {lines.length === 0 ? (
              <div className="text-muted-foreground">
                Run your code to see output here...
              </div>
            ) : (
              lines.map((line) => (
                <div
                  key={line.id}
                  className={cn(
                    "whitespace-pre-wrap",
                    line.type === "input" && "text-primary",
                    line.type === "output" && "text-foreground",
                    line.type === "error" && "text-destructive",
                    line.type === "system" && "text-muted-foreground italic"
                  )}
                >
                  {line.type === "input" && <span className="text-accent">$ </span>}
                  {line.content}
                </div>
              ))
            )}
            {isRunning && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <span className="animate-pulse">|</span>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        </ScrollArea>
      )}
    </div>
  )
}
