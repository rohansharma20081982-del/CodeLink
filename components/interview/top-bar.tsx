"use client"

import { useState } from "react"
import {
  Users,
  Clock,
  Circle,
  Moon,
  Sun,
  LogOut,
  Settings,
  Lock,
  Unlock,
  Copy,
  Check,
  Mic,
  Video,
  AlertTriangle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { SettingsDialog, ReportIssueDialog } from "./settings-dialog"

interface TopBarProps {
  meetingTitle: string
  meetingId: string
  participantCount: number
  isRecording: boolean
  isLocked: boolean
  elapsedTime: string
  onEndCall: () => void
  onToggleLock: () => void
  isDarkMode: boolean
  onToggleTheme: () => void
  localStream?: MediaStream | null
  onApplySettings?: (settings: { mirrorVideo: boolean; backgroundBlur: boolean }) => void
}

export function TopBar({
  meetingTitle,
  meetingId,
  participantCount,
  isRecording,
  isLocked,
  elapsedTime,
  onEndCall,
  onToggleLock,
  isDarkMode,
  onToggleTheme,
  localStream = null,
  onApplySettings,
}: TopBarProps) {
  const [copied, setCopied] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [settingsTab, setSettingsTab] = useState<"audio" | "video" | "recording">("audio")
  const [reportOpen, setReportOpen] = useState(false)

  const copyMeetingLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/interview/${meetingId}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const openSettings = (tab: "audio" | "video" | "recording") => {
    setSettingsTab(tab)
    setSettingsOpen(true)
  }

  return (
    <>
      <header className="flex items-center justify-between px-4 py-2 bg-card border-b border-border">
        {/* Left: Logo & Meeting Info */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">CL</span>
            </div>
            <span className="font-semibold hidden sm:block">CodeLink</span>
          </div>

          <div className="h-6 w-px bg-border hidden sm:block" />

          <div className="hidden sm:block">
            <h1 className="font-medium text-sm">{meetingTitle}</h1>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                {participantCount}/2
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {elapsedTime}
              </span>
              {isRecording && (
                <span className="flex items-center gap-1 text-destructive">
                  <Circle className="h-2 w-2 fill-current animate-pulse" />
                  Recording
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="gap-1 text-xs"
            onClick={copyMeetingLink}
          >
            {copied ? (
              <>
                <Check className="h-3 w-3 text-accent" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="h-3 w-3" />
                <span className="hidden sm:inline">Copy Link</span>
              </>
            )}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={onToggleLock}
            title={isLocked ? "Unlock meeting" : "Lock meeting"}
          >
            {isLocked ? (
              <Lock className="h-4 w-4 text-accent" />
            ) : (
              <Unlock className="h-4 w-4" />
            )}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={onToggleTheme}
          >
            {isDarkMode ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Settings className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => openSettings("audio")}>
                <Mic className="h-4 w-4 mr-2" />
                Audio Settings
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => openSettings("video")}>
                <Video className="h-4 w-4 mr-2" />
                Video Settings
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => openSettings("recording")}>
                <Circle className="h-4 w-4 mr-2" />
                Recording Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setReportOpen(true)}>
                <AlertTriangle className="h-4 w-4 mr-2" />
                Report Issue
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant="destructive"
            size="sm"
            className="gap-1"
            onClick={onEndCall}
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">End</span>
          </Button>
        </div>
      </header>

      {/* Settings Dialog */}
      <SettingsDialog
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        defaultTab={settingsTab}
        localStream={localStream}
        onApplySettings={onApplySettings}
      />,

      {/* Report Issue Dialog */}
      <ReportIssueDialog
        open={reportOpen}
        onOpenChange={setReportOpen}
      />
    </>
  )
}
