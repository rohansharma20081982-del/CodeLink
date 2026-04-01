"use client"

import { useState, useRef, useEffect } from "react"
import { Mic, MicOff, Video, VideoOff, Monitor, MoreVertical, Maximize2, Minimize2, UserCircle2, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface Participant {
  id: string
  name: string
  isHost: boolean
  isMuted: boolean
  isVideoOff: boolean
  isYou: boolean
  bio?: string
}

interface VideoPanelProps {
  participants: Participant[]
  localStream?: MediaStream | null
  isScreenSharing: boolean
  onToggleScreenShare: () => void
  isMinimized?: boolean
  onToggleMinimize?: () => void
  cameraSettings?: {
    mirrorVideo: boolean
    backgroundBlur: boolean
  }
}

export function VideoPanel({ 
  participants, 
  localStream, 
  isScreenSharing, 
  onToggleScreenShare,
  isMinimized = false,
  onToggleMinimize,
  cameraSettings
}: VideoPanelProps) {
  const [isMuted, setIsMuted] = useState(false)
  const [isVideoOff, setIsVideoOff] = useState(false)
  const localVideoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream
    }
  }, [localStream])

  const toggleMute = () => {
    setIsMuted(!isMuted)
    if (localStream) {
      localStream.getAudioTracks().forEach(track => {
        track.enabled = isMuted
      })
    }
  }

  const toggleVideo = () => {
    setIsVideoOff(!isVideoOff)
    if (localStream) {
      localStream.getVideoTracks().forEach(track => {
        track.enabled = isVideoOff
      })
    }
  }

  const currentUser = participants.find(p => p.isYou)
  const otherParticipant = participants.find(p => !p.isYou)

  if (isMinimized) {
    return (
      <div className="absolute bottom-4 right-4 z-50 flex items-center gap-2 bg-card/95 backdrop-blur-sm rounded-lg p-2 border border-border shadow-lg">
        <div className="w-32 h-24 bg-muted rounded overflow-hidden relative">
          <video 
            ref={localVideoRef}
            autoPlay 
            muted 
            playsInline
            className={cn(
              "w-full h-full object-cover transition-all duration-300", 
              isVideoOff && "hidden",
              cameraSettings?.mirrorVideo && "scale-x-[-1]",
              cameraSettings?.backgroundBlur && "blur-md scale-105"
            )}
          />
          {isVideoOff && (
            <div className="absolute inset-0 flex items-center justify-center bg-muted">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-medium">
                {currentUser?.name.charAt(0) || "Y"}
              </div>
            </div>
          )}
        </div>
        <div className="flex flex-col gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={toggleMute}>
            {isMuted ? <MicOff className="h-4 w-4 text-destructive" /> : <Mic className="h-4 w-4" />}
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={toggleVideo}>
            {isVideoOff ? <VideoOff className="h-4 w-4 text-destructive" /> : <Video className="h-4 w-4" />}
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onToggleMinimize}>
            <Maximize2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-card rounded-lg overflow-hidden border border-border">
      {/* Video Grid */}
      <div className="flex-1 p-2 flex flex-col gap-2">
        {/* Your video */}
        <div className="relative bg-muted rounded-lg overflow-hidden flex-1">
          <video 
            ref={localVideoRef}
            autoPlay 
            muted 
            playsInline
            className={cn(
              "w-full h-full object-cover transition-all duration-300", 
              isVideoOff && "hidden",
              cameraSettings?.mirrorVideo && "scale-x-[-1]",
              cameraSettings?.backgroundBlur && "blur-md scale-105"
            )}
          />
          {isVideoOff && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-lg font-medium">
                {currentUser?.name.charAt(0) || "Y"}
              </div>
            </div>
          )}
          <div className="absolute bottom-2 left-2 px-2 py-1 bg-background/80 backdrop-blur-sm rounded text-xs font-medium flex items-center gap-1">
            {isMuted && <MicOff className="h-3 w-3 text-destructive" />}
            {currentUser?.name || "You"} (You){currentUser?.isHost ? " - Host" : ""}
            {currentUser?.bio && (
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" className="h-4 w-4 p-0 ml-1 hover:bg-transparent text-muted-foreground hover:text-foreground">
                    <Info className="h-3 w-3" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent side="top" className="text-sm w-64 p-3">
                  <p className="font-semibold mb-1">About {currentUser.name}</p>
                  <p className="text-muted-foreground">{currentUser.bio}</p>
                </PopoverContent>
              </Popover>
            )}
          </div>
        </div>

        {/* Other participant or waiting state */}
        <div className="relative bg-muted rounded-lg overflow-hidden flex-1">
          {otherParticipant ? (
            <>
              {/* In a real app, this would show the other person's video stream */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center text-lg font-medium">
                  {otherParticipant.name.charAt(0)}
                </div>
              </div>
              <div className="absolute bottom-2 left-2 px-2 py-1 bg-background/80 backdrop-blur-sm rounded text-xs font-medium flex items-center gap-1">
                {otherParticipant.isMuted && <MicOff className="h-3 w-3 text-destructive" />}
                {otherParticipant.name} {otherParticipant.isHost && "- Host"}
                {otherParticipant.bio && (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="ghost" className="h-4 w-4 p-0 ml-1 hover:bg-transparent text-muted-foreground hover:text-foreground">
                        <Info className="h-3 w-3" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent side="top" className="text-sm w-64 p-3">
                      <p className="font-semibold mb-1">About {otherParticipant.name}</p>
                      <p className="text-muted-foreground">{otherParticipant.bio}</p>
                    </PopoverContent>
                  </Popover>
                )}
              </div>
            </>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
              <UserCircle2 className="h-16 w-16 text-muted-foreground/40" />
              <div className="text-sm text-muted-foreground">Waiting for participant to join...</div>
            </div>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="p-3 border-t border-border flex items-center justify-center gap-2">
        <Button
          variant={isMuted ? "destructive" : "secondary"}
          size="icon"
          onClick={toggleMute}
          className="h-10 w-10 rounded-full"
        >
          {isMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
        </Button>
        <Button
          variant={isVideoOff ? "destructive" : "secondary"}
          size="icon"
          onClick={toggleVideo}
          className="h-10 w-10 rounded-full"
        >
          {isVideoOff ? <VideoOff className="h-4 w-4" /> : <Video className="h-4 w-4" />}
        </Button>
        <Button
          variant={isScreenSharing ? "default" : "secondary"}
          size="icon"
          onClick={onToggleScreenShare}
          className="h-10 w-10 rounded-full"
        >
          <Monitor className="h-4 w-4" />
        </Button>
        {onToggleMinimize && (
          <Button
            variant="secondary"
            size="icon"
            onClick={onToggleMinimize}
            className="h-10 w-10 rounded-full"
          >
            <Minimize2 className="h-4 w-4" />
          </Button>
        )}
        <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
