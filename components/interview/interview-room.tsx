"use client"

import { useState, useEffect, useCallback, useMemo, useRef } from "react"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"
import { TopBar } from "./top-bar"
import { VideoPanel } from "./video-panel"
import { CodeEditor } from "./code-editor"
import { ChatPanel } from "./chat-panel"
import { Terminal } from "./terminal"
import { MessageSquare, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"

interface TerminalLine {
  id: string
  type: "input" | "output" | "error" | "system"
  content: string
  timestamp: Date
}

interface Participant {
  id: string
  name: string
  isHost: boolean
  isMuted: boolean
  isVideoOff: boolean
  isYou: boolean
  bio?: string
}

interface InterviewRoomProps {
  meetingId: string
  meetingCode: string
  userName: string
  userId: string
  isHost: boolean
}

export function InterviewRoom({ meetingId, meetingCode, userName, userId, isHost }: InterviewRoomProps) {
  const [isDarkMode, setIsDarkMode] = useState(true)
  const [isRecording, setIsRecording] = useState(true)
  const [isLocked, setIsLocked] = useState(true)
  const [isScreenSharing, setIsScreenSharing] = useState(false)
  const [isVideoMinimized, setIsVideoMinimized] = useState(false)
  const [isChatOpen, setIsChatOpen] = useState(true)
  const [localStream, setLocalStream] = useState<MediaStream | null>(null)
  const [elapsedTime, setElapsedTime] = useState("00:00")
  const [terminalLines, setTerminalLines] = useState<TerminalLine[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [isTerminalExpanded, setIsTerminalExpanded] = useState(true)
  const [participants, setParticipants] = useState<Participant[]>([])
  const [otherUserName, setOtherUserName] = useState<string | null>(null)
  
  const [cameraSettings, setCameraSettings] = useState({
    mirrorVideo: true,
    backgroundBlur: false
  })

  const supabase = useMemo(() => createClient(), [])
  const localStreamRef = useRef<MediaStream | null>(null)

  // Fetch participants and subscribe to realtime updates
  useEffect(() => {
    async function fetchParticipants() {
      const { data, error } = await supabase
        .from("meeting_participants")
        .select("*")
        .eq("meeting_id", meetingId)
        .is("left_at", null)
      
      let mapped: Participant[] = []
      
      if (data && !error) {
        // Deduplicate participants in case of lingering active sessions from page reloads
        const uniqueData = Array.from(new Map(data.map(p => [p.user_id || p.id, p])).values())
        
        // Fetch bios for the discovered participants
        const userIds = uniqueData.map(p => p.user_id).filter(Boolean)
        let profiles: any[] = []
        if (userIds.length > 0) {
          const { data: profData } = await supabase.from("profiles").select("id, bio").in("id", userIds)
          if (profData) profiles = profData
        }

        mapped = uniqueData.map(p => {
          const matchingProfile = profiles.find(prof => prof.id === p.user_id)
          return {
            id: p.id,
            name: p.display_name,
            isHost: p.role === "host",
            isMuted: false,
            isVideoOff: p.user_id !== userId,
            isYou: p.user_id === userId,
            bio: matchingProfile?.bio
          }
        })
      }

      // Fallback: If no data returned or current user missing, ensure current user exists
      if (mapped.length === 0 || !mapped.find(m => m.isYou)) {
        mapped.push({
          id: userId || "local-user-id",
          name: userName || "You",
          isHost: isHost,
          isMuted: false,
          isVideoOff: false,
          isYou: true
        })
      }

      // Put current user first
      mapped.sort((a, b) => (b.isYou ? 1 : 0) - (a.isYou ? 1 : 0))
      setParticipants(mapped)
      
      // Find other user's name
      const other = mapped.find(p => !p.isYou)
      setOtherUserName(other?.name || null)
    }

    fetchParticipants()

    // Subscribe to realtime changes
    const channel = supabase
      .channel(`meeting-${meetingId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "meeting_participants",
          filter: `meeting_id=eq.${meetingId}`
        },
        () => {
          fetchParticipants()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [meetingId, userId, supabase])

  // Mark participant as left when leaving
  useEffect(() => {
    const handleBeforeUnload = async () => {
      await supabase
        .from("meeting_participants")
        .update({ left_at: new Date().toISOString() })
        .eq("meeting_id", meetingId)
        .eq("user_id", userId)
    }

    window.addEventListener("beforeunload", handleBeforeUnload)
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload)
      handleBeforeUnload()
    }
  }, [meetingId, userId, supabase])

  // Timer
  useEffect(() => {
    const startTime = Date.now()
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime
      const minutes = Math.floor(elapsed / 60000)
      const seconds = Math.floor((elapsed % 60000) / 1000)
      setElapsedTime(
        `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
      )
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  // Request camera/mic access
  useEffect(() => {
    async function setupMedia() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true
        })
        setLocalStream(stream)
        localStreamRef.current = stream
      } catch (err) {
        console.log("[v0] Media access denied or not available:", err)
      }
    }
    setupMedia()

    return () => {
      localStreamRef.current?.getTracks().forEach(track => track.stop())
    }
  }, [])

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode)
    document.documentElement.classList.toggle("dark")
  }

  const handleEndCall = async () => {
    // Mark participant as left
    await supabase
      .from("meeting_participants")
      .update({ left_at: new Date().toISOString() })
      .eq("meeting_id", meetingId)
      .eq("user_id", userId)
    
    localStream?.getTracks().forEach(track => track.stop())
    window.location.href = "/dashboard"
  }

  const handleToggleScreenShare = async () => {
    if (isScreenSharing) {
      setIsScreenSharing(false)
    } else {
      try {
        await navigator.mediaDevices.getDisplayMedia({ video: true })
        setIsScreenSharing(true)
        setIsVideoMinimized(true)
      } catch (err) {
        console.log("[v0] Screen share cancelled:", err)
      }
    }
  }

  const simulateCodeExecution = useCallback((code: string, language: string) => {
    setIsRunning(true)
    setIsTerminalExpanded(true)
    
    const systemLine: TerminalLine = {
      id: Date.now().toString(),
      type: "system",
      content: `Compiling ${language}...`,
      timestamp: new Date()
    }
    setTerminalLines(prev => [...prev, systemLine])

    setTimeout(() => {
      const inputLine: TerminalLine = {
        id: (Date.now() + 1).toString(),
        type: "input",
        content: `run solution.${language === "python" ? "py" : language === "javascript" ? "js" : language}`,
        timestamp: new Date()
      }
      setTerminalLines(prev => [...prev, inputLine])

      setTimeout(() => {
        let output = "Program executed successfully."
        
        // Simple regex to "mock" real execution of basic print statements
        const pyMatch = code.match(/print\(['"](.+)['"]\)/)
        const jsMatch = code.match(/console\.log\(['"](.+)['"]\)/)
        const cppMatch = code.match(/cout\s*<<\s*["']([^"']+)["']/)
        const javaMatch = code.match(/System\.out\.println\(['"]([^"']+)['"]\)/)
        
        if (code.includes("two_sum") || code.includes("twoSum")) {
          output = `Input: nums = [2, 7, 11, 15], target = 9\nOutput: [0, 1]`
        } else if (pyMatch) {
          output = pyMatch[1]
        } else if (jsMatch) {
          output = jsMatch[1]
        } else if (cppMatch) {
          output = cppMatch[1]
        } else if (javaMatch) {
          output = javaMatch[1]
        } else if (code.includes("Hello, World!")) {
          output = "Hello, World!"
        }

        const outputLine: TerminalLine = {
          id: (Date.now() + 2).toString(),
          type: "output",
          content: output,
          timestamp: new Date()
        }
        setTerminalLines(prev => [...prev, outputLine])

        const completeLine: TerminalLine = {
          id: (Date.now() + 3).toString(),
          type: "system",
          content: `Execution completed in 0.${Math.floor(Math.random() * 900) + 100}s`,
          timestamp: new Date()
        }
        setTerminalLines(prev => [...prev, completeLine])
        setIsRunning(false)
      }, 500)
    }, 300)
  }, [])

  const clearTerminal = () => {
    setTerminalLines([])
  }

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      <TopBar
        meetingTitle="Technical Interview - Two Sum Problem"
        meetingId={meetingCode}
        participantCount={participants.length}
        isRecording={isRecording}
        isLocked={isLocked}
        elapsedTime={elapsedTime}
        onEndCall={handleEndCall}
        onToggleLock={() => setIsLocked(!isLocked)}
        isDarkMode={isDarkMode}
        onToggleTheme={toggleTheme}
        localStream={localStream}
        onApplySettings={setCameraSettings}
      />

      <main className="flex-1 overflow-hidden p-2">
        <ResizablePanelGroup direction="horizontal" className="h-full">
          {/* Left: Video Panel (when not minimized) */}
          {!isVideoMinimized && (
            <>
              <ResizablePanel defaultSize={25} minSize={20} maxSize={40}>
                <VideoPanel
                  participants={participants}
                  localStream={localStream}
                  isScreenSharing={isScreenSharing}
                  onToggleScreenShare={handleToggleScreenShare}
                  onToggleMinimize={() => setIsVideoMinimized(true)}
                  cameraSettings={cameraSettings}
                />
              </ResizablePanel>
              <ResizableHandle withHandle />
            </>
          )}

          {/* Center: Code Editor & Terminal */}
          <ResizablePanel defaultSize={isVideoMinimized ? 75 : 50}>
            <div className="h-full flex flex-col gap-2">
              <div className="flex-1 min-h-0">
                <CodeEditor
                  onRunCode={simulateCodeExecution}
                  isRunning={isRunning}
                  onToggleTerminal={() => setIsTerminalExpanded(prev => !prev)}
                />
              </div>
              <Terminal
                lines={terminalLines}
                isRunning={isRunning}
                isExpanded={isTerminalExpanded}
                onToggleExpand={() => setIsTerminalExpanded(!isTerminalExpanded)}
                onClear={clearTerminal}
              />
            </div>
          </ResizablePanel>

          {/* Right: Chat Panel */}
          {isChatOpen && (
            <>
              <ResizableHandle withHandle />
              <ResizablePanel defaultSize={25} minSize={20} maxSize={35}>
                <div className="h-full relative">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 z-10 h-6 w-6"
                    onClick={() => setIsChatOpen(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                  <ChatPanel
                    currentUser={userName}
                    otherUser={otherUserName || "Waiting for participant..."}
                  />
                </div>
              </ResizablePanel>
            </>
          )}
        </ResizablePanelGroup>
      </main>

      {/* Minimized Video Overlay */}
      {isVideoMinimized && (
        <VideoPanel
          participants={participants}
          localStream={localStream}
          isScreenSharing={isScreenSharing}
          onToggleScreenShare={handleToggleScreenShare}
          isMinimized
          onToggleMinimize={() => setIsVideoMinimized(false)}
        />
      )}

      {/* Chat Toggle Button (when chat is closed) */}
      {!isChatOpen && (
        <Button
          className="fixed bottom-4 right-4 gap-2"
          onClick={() => setIsChatOpen(true)}
        >
          <MessageSquare className="h-4 w-4" />
          Chat
        </Button>
      )}
    </div>
  )
}
