"use client"

import { useState, useCallback } from "react"
import { 
  Play, 
  FileCode, 
  FolderOpen, 
  ChevronRight, 
  ChevronDown,
  Plus,
  X,
  Settings,
  Terminal as TerminalIcon
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

interface FileItem {
  id: string
  name: string
  type: "file" | "folder"
  language?: string
  content?: string
  children?: FileItem[]
}

interface CodeEditorProps {
  onRunCode: (code: string, language: string) => void
  isRunning: boolean
  collaboratorCursor?: { line: number; column: number; name: string }
  onToggleTerminal?: () => void
}

const LANGUAGE_CONFIG: Record<string, { extension: string; comment: string; sample: string }> = {
  python: {
    extension: "py",
    comment: "#",
    sample: `# Python Hello World
print("Hello, World!")
`
  },
  javascript: {
    extension: "js",
    comment: "//",
    sample: `// JavaScript Hello World
console.log("Hello, World!");
`
  },
  java: {
    extension: "java",
    comment: "//",
    sample: `// Java Hello World
public class Solution {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}
`
  },
  cpp: {
    extension: "cpp",
    comment: "//",
    sample: `// C++ Hello World
#include <iostream>
using namespace std;

int main() {
    cout << "Hello, World!" << endl;
    return 0;
}
`
  },
  typescript: {
    extension: "ts",
    comment: "//",
    sample: `// TypeScript Hello World
console.log("Hello, World!");
`
  }
}

const defaultFiles: FileItem[] = [
  {
    id: "1",
    name: "src",
    type: "folder",
    children: [
      { id: "2", name: "solution.py", type: "file", language: "python", content: LANGUAGE_CONFIG.python.sample },
      { id: "3", name: "solution.js", type: "file", language: "javascript", content: LANGUAGE_CONFIG.javascript.sample },
      { id: "4", name: "Solution.java", type: "file", language: "java", content: LANGUAGE_CONFIG.java.sample },
      { id: "5", name: "solution.cpp", type: "file", language: "cpp", content: LANGUAGE_CONFIG.cpp.sample },
      { id: "6", name: "solution.ts", type: "file", language: "typescript", content: LANGUAGE_CONFIG.typescript.sample },
    ]
  },
  {
    id: "7",
    name: "README.md",
    type: "file",
    content: `# Hello World Application

## Description
This is a standard CodeLink hello world workspace. You can edit the code files and run them using the embedded terminal. Enjoy!
`
  }
]

export function CodeEditor({ onRunCode, isRunning, collaboratorCursor, onToggleTerminal }: CodeEditorProps) {
  const [files] = useState<FileItem[]>(defaultFiles)
  const [openTabs, setOpenTabs] = useState<FileItem[]>([
    defaultFiles[0].children![0] // Open Python file by default
  ])
  const [activeTab, setActiveTab] = useState<string>("2")
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(["1"]))
  const [code, setCode] = useState<string>(LANGUAGE_CONFIG.python.sample)
  const [currentLanguage, setCurrentLanguage] = useState<string>("python")
  // Track edited content per file id so tab switches don't lose changes
  const [fileContents, setFileContents] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {}
    const collectContents = (items: FileItem[]) => {
      items.forEach(item => {
        if (item.type === "file" && item.content) initial[item.id] = item.content
        if (item.children) collectContents(item.children)
      })
    }
    collectContents(defaultFiles)
    return initial
  })

  const toggleFolder = (id: string) => {
    setExpandedFolders(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const openFile = (file: FileItem) => {
    if (file.type === "folder") {
      toggleFolder(file.id)
      return
    }

    // Save current code before switching
    if (activeTab) {
      setFileContents(prev => ({ ...prev, [activeTab]: code }))
    }

    if (!openTabs.find(t => t.id === file.id)) {
      setOpenTabs([...openTabs, file])
    }
    setActiveTab(file.id)
    setCode(fileContents[file.id] ?? file.content ?? "")
    setCurrentLanguage(file.language || "javascript")
  }

  const closeTab = (e: React.MouseEvent, fileId: string) => {
    e.stopPropagation()
    const newTabs = openTabs.filter(t => t.id !== fileId)
    setOpenTabs(newTabs)
    if (activeTab === fileId && newTabs.length > 0) {
      const newActive = newTabs[newTabs.length - 1]
      setActiveTab(newActive.id)
      setCode(fileContents[newActive.id] ?? newActive.content ?? "")
      setCurrentLanguage(newActive.language || "javascript")
    }
  }

  const handleRunCode = useCallback(() => {
    onRunCode(code, currentLanguage)
  }, [code, currentLanguage, onRunCode])

  const renderFileTree = (items: FileItem[], level = 0) => {
    return items.map(item => (
      <div key={item.id}>
        <button
          onClick={() => openFile(item)}
          className={cn(
            "w-full flex items-center gap-1 px-2 py-1 text-sm hover:bg-accent/50 rounded transition-colors text-left",
            activeTab === item.id && "bg-accent/50"
          )}
          style={{ paddingLeft: `${level * 12 + 8}px` }}
        >
          {item.type === "folder" ? (
            <>
              {expandedFolders.has(item.id) ? (
                <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              ) : (
                <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              )}
              <FolderOpen className="h-4 w-4 text-accent flex-shrink-0" />
            </>
          ) : (
            <>
              <span className="w-4" />
              <FileCode className="h-4 w-4 text-primary flex-shrink-0" />
            </>
          )}
          <span className="truncate">{item.name}</span>
        </button>
        {item.type === "folder" && expandedFolders.has(item.id) && item.children && (
          renderFileTree(item.children, level + 1)
        )}
      </div>
    ))
  }

  const getLineNumbers = () => {
    const lines = code.split("\n")
    return lines.map((_, i) => i + 1)
  }

  return (
    <div className="flex flex-col h-full bg-sidebar border border-border rounded-lg overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-card">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">CodeLink Editor</span>
          <span className="text-xs px-2 py-0.5 rounded bg-primary/20 text-primary">
            {currentLanguage.toUpperCase()}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={handleRunCode}
            disabled={isRunning}
            className="gap-1"
          >
            <Play className="h-3 w-3" />
            {isRunning ? "Running..." : "Run"}
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* File Explorer Sidebar */}
        <div className="w-48 border-r border-border flex-shrink-0 flex flex-col">
          <div className="p-2 border-b border-border flex items-center justify-between">
            <span className="text-xs font-medium uppercase text-muted-foreground">Explorer</span>
            <Button variant="ghost" size="icon" className="h-6 w-6">
              <Plus className="h-3 w-3" />
            </Button>
          </div>
          <ScrollArea className="flex-1">
            <div className="p-1">
              {renderFileTree(files)}
            </div>
          </ScrollArea>
        </div>

        {/* Editor Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Tabs */}
          <div className="flex items-center border-b border-border bg-muted/30 overflow-x-auto">
            {openTabs.map(tab => (
              <div
                key={tab.id}
                onClick={() => {
                  // Save current code before switching
                  if (activeTab) {
                    setFileContents(prev => ({ ...prev, [activeTab]: code }))
                  }
                  setActiveTab(tab.id)
                  setCode(fileContents[tab.id] ?? tab.content ?? "")
                  setCurrentLanguage(tab.language || "javascript")
                }}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 text-sm border-r border-border transition-colors group cursor-pointer",
                  activeTab === tab.id 
                    ? "bg-sidebar text-foreground" 
                    : "text-muted-foreground hover:text-foreground hover:bg-sidebar/50"
                )}
              >
                <FileCode className="h-3.5 w-3.5" />
                <span>{tab.name}</span>
                <span
                  role="button"
                  tabIndex={0}
                  onClick={(e) => closeTab(e, tab.id)}
                  onKeyDown={(e) => { if (e.key === 'Enter') closeTab(e as unknown as React.MouseEvent, tab.id) }}
                  className="opacity-0 group-hover:opacity-100 hover:bg-destructive/20 rounded p-0.5 transition-opacity"
                >
                  <X className="h-3 w-3" />
                </span>
              </div>
            ))}
          </div>

          {/* Code Area */}
          <div className="flex-1 overflow-hidden relative">
            <div className="absolute inset-0 flex">
              {/* Line Numbers */}
              <div className="w-12 bg-muted/20 border-r border-border flex-shrink-0 overflow-hidden">
                <div className="py-3 px-2 text-right">
                  {getLineNumbers().map(num => (
                    <div 
                      key={num} 
                      className={cn(
                        "text-xs text-muted-foreground leading-6 font-mono",
                        collaboratorCursor?.line === num && "bg-accent/30"
                      )}
                    >
                      {num}
                    </div>
                  ))}
                </div>
              </div>

              {/* Code Editor */}
              <div className="flex-1 overflow-auto">
                <textarea
                  value={code}
                  onChange={(e) => {
                    setCode(e.target.value)
                    setFileContents(prev => ({ ...prev, [activeTab]: e.target.value }))
                  }}
                  className="w-full h-full p-3 bg-transparent text-sm font-mono leading-6 resize-none focus:outline-none"
                  spellCheck={false}
                  placeholder="Start coding..."
                />
              </div>
            </div>

            {/* Collaborator Cursor Indicator */}
            {collaboratorCursor && (
              <div 
                className="absolute left-14 px-2 py-0.5 bg-accent text-accent-foreground text-xs rounded pointer-events-none"
                style={{ top: `${(collaboratorCursor.line - 1) * 24 + 12}px` }}
              >
                {collaboratorCursor.name}
              </div>
            )}
          </div>

          {/* Terminal Toggle */}
          <div className="border-t border-border">
            <button 
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors"
              onClick={onToggleTerminal}
            >
              <TerminalIcon className="h-4 w-4" />
              <span>Terminal</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
