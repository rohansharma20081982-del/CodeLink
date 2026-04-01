"use client"

import { useState, useEffect, useCallback } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Mic, Video, Circle, AlertTriangle, Check } from "lucide-react"
import { cn } from "@/lib/utils"


type SettingsTab = "audio" | "video" | "recording"

interface SettingsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultTab?: SettingsTab
  localStream: MediaStream | null
  onApplySettings?: (settings: { mirrorVideo: boolean; backgroundBlur: boolean }) => void
}

interface AudioDeviceInfo {
  deviceId: string
  label: string
}

export function SettingsDialog({ open, onOpenChange, defaultTab = "audio", localStream, onApplySettings }: SettingsDialogProps) {
  const [tab, setTab] = useState<SettingsTab>(defaultTab)

  // Audio settings
  const [audioInputDevices, setAudioInputDevices] = useState<AudioDeviceInfo[]>([])
  const [audioOutputDevices, setAudioOutputDevices] = useState<AudioDeviceInfo[]>([])
  const [selectedAudioInput, setSelectedAudioInput] = useState("")
  const [selectedAudioOutput, setSelectedAudioOutput] = useState("")
  const [micVolume, setMicVolume] = useState([75])
  const [speakerVolume, setSpeakerVolume] = useState([80])
  const [noiseSuppression, setNoiseSuppression] = useState(true)
  const [echoCancellation, setEchoCancellation] = useState(true)
  const [autoGainControl, setAutoGainControl] = useState(true)

  // Video settings
  const [videoDevices, setVideoDevices] = useState<AudioDeviceInfo[]>([])
  const [selectedVideoDevice, setSelectedVideoDevice] = useState("")
  const [videoResolution, setVideoResolution] = useState("720p")
  const [mirrorVideo, setMirrorVideo] = useState(true)
  const [backgroundBlur, setBackgroundBlur] = useState(false)
  const [lowBandwidthMode, setLowBandwidthMode] = useState(false)

  // Recording settings
  const [autoRecord, setAutoRecord] = useState(true)
  const [recordAudio, setRecordAudio] = useState(true)
  const [recordVideo, setRecordVideo] = useState(true)
  const [recordScreen, setRecordScreen] = useState(true)
  const [recordChat, setRecordChat] = useState(true)
  const [recordingQuality, setRecordingQuality] = useState("high")

  // Audio level meter
  const [audioLevel, setAudioLevel] = useState(0)

  // Update tab when defaultTab prop changes (when opening from different menu items)
  useEffect(() => {
    if (open) setTab(defaultTab)
  }, [defaultTab, open])

  // Enumerate media devices
  useEffect(() => {
    if (!open) return

    async function getDevices() {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices()

        const audioInputs = devices
          .filter(d => d.kind === "audioinput")
          .map((d, i) => ({ deviceId: d.deviceId, label: d.label || `Microphone ${i + 1}` }))

        const audioOutputs = devices
          .filter(d => d.kind === "audiooutput")
          .map((d, i) => ({ deviceId: d.deviceId, label: d.label || `Speaker ${i + 1}` }))

        const videoInputs = devices
          .filter(d => d.kind === "videoinput")
          .map((d, i) => ({ deviceId: d.deviceId, label: d.label || `Camera ${i + 1}` }))

        setAudioInputDevices(audioInputs)
        setAudioOutputDevices(audioOutputs)
        setVideoDevices(videoInputs)

        if (audioInputs.length && !selectedAudioInput) setSelectedAudioInput(audioInputs[0].deviceId)
        if (audioOutputs.length && !selectedAudioOutput) setSelectedAudioOutput(audioOutputs[0].deviceId)
        if (videoInputs.length && !selectedVideoDevice) setSelectedVideoDevice(videoInputs[0].deviceId)
      } catch {
        // Fallback devices
        setAudioInputDevices([{ deviceId: "default", label: "Default Microphone" }])
        setAudioOutputDevices([{ deviceId: "default", label: "Default Speaker" }])
        setVideoDevices([{ deviceId: "default", label: "Default Camera" }])
      }
    }

    getDevices()
  }, [open, selectedAudioInput, selectedAudioOutput, selectedVideoDevice])

  // Audio level monitoring
  const monitorAudio = useCallback(() => {
    if (!localStream || !open || tab !== "audio") {
      setAudioLevel(0)
      return
    }

    try {
      const audioContext = new AudioContext()
      const source = audioContext.createMediaStreamSource(localStream)
      const analyser = audioContext.createAnalyser()
      analyser.fftSize = 256
      source.connect(analyser)

      const dataArray = new Uint8Array(analyser.frequencyBinCount)
      let animationId: number

      const update = () => {
        analyser.getByteFrequencyData(dataArray)
        const avg = dataArray.reduce((sum, val) => sum + val, 0) / dataArray.length
        setAudioLevel(Math.min(100, avg * 1.5))
        animationId = requestAnimationFrame(update)
      }
      update()

      return () => {
        cancelAnimationFrame(animationId)
        audioContext.close()
      }
    } catch {
      // Simulate audio level for demo
      const interval = setInterval(() => {
        setAudioLevel(Math.random() * 40 + 10)
      }, 150)
      return () => clearInterval(interval)
    }
  }, [localStream, open, tab])

  useEffect(() => {
    const cleanup = monitorAudio()
    return cleanup
  }, [monitorAudio])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            Configure your audio, video, and recording preferences.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={tab} onValueChange={(v) => setTab(v as SettingsTab)}>
          <TabsList className="w-full">
            <TabsTrigger value="audio" className="flex-1 gap-1.5">
              <Mic className="h-3.5 w-3.5" />
              Audio
            </TabsTrigger>
            <TabsTrigger value="video" className="flex-1 gap-1.5">
              <Video className="h-3.5 w-3.5" />
              Video
            </TabsTrigger>
            <TabsTrigger value="recording" className="flex-1 gap-1.5">
              <Circle className="h-3.5 w-3.5" />
              Recording
            </TabsTrigger>
          </TabsList>

          {/* ─── Audio Settings ─── */}
          <TabsContent value="audio" className="space-y-5 mt-4">
            {/* Microphone */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Microphone</Label>
              <Select value={selectedAudioInput} onValueChange={setSelectedAudioInput}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select microphone" />
                </SelectTrigger>
                <SelectContent>
                  {audioInputDevices.map(d => (
                    <SelectItem key={d.deviceId} value={d.deviceId}>
                      {d.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Mic volume + level meter */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Microphone Volume</Label>
                <span className="text-xs text-muted-foreground">{micVolume[0]}%</span>
              </div>
              <Slider value={micVolume} onValueChange={setMicVolume} max={100} step={1} />
              {/* Level meter */}
              <div className="flex items-center gap-2">
                <Mic className="h-3.5 w-3.5 text-muted-foreground" />
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-accent rounded-full transition-all duration-75"
                    style={{ width: `${audioLevel}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Speaker */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Speaker</Label>
              <Select value={selectedAudioOutput} onValueChange={setSelectedAudioOutput}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select speaker" />
                </SelectTrigger>
                <SelectContent>
                  {audioOutputDevices.map(d => (
                    <SelectItem key={d.deviceId} value={d.deviceId}>
                      {d.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Speaker Volume</Label>
                <span className="text-xs text-muted-foreground">{speakerVolume[0]}%</span>
              </div>
              <Slider value={speakerVolume} onValueChange={setSpeakerVolume} max={100} step={1} />
            </div>

            {/* Audio processing toggles */}
            <div className="space-y-3 pt-2 border-t border-border">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Noise Suppression</Label>
                  <p className="text-xs text-muted-foreground">Reduce background noise</p>
                </div>
                <Switch checked={noiseSuppression} onCheckedChange={setNoiseSuppression} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Echo Cancellation</Label>
                  <p className="text-xs text-muted-foreground">Prevent audio feedback</p>
                </div>
                <Switch checked={echoCancellation} onCheckedChange={setEchoCancellation} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Auto Gain Control</Label>
                  <p className="text-xs text-muted-foreground">Automatically adjust mic level</p>
                </div>
                <Switch checked={autoGainControl} onCheckedChange={setAutoGainControl} />
              </div>
            </div>
          </TabsContent>

          {/* ─── Video Settings ─── */}
          <TabsContent value="video" className="space-y-5 mt-4">
            {/* Camera */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Camera</Label>
              <Select value={selectedVideoDevice} onValueChange={setSelectedVideoDevice}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select camera" />
                </SelectTrigger>
                <SelectContent>
                  {videoDevices.map(d => (
                    <SelectItem key={d.deviceId} value={d.deviceId}>
                      {d.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Resolution */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Video Quality</Label>
              <Select value={videoResolution} onValueChange={setVideoResolution}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1080p">1080p (Full HD)</SelectItem>
                  <SelectItem value="720p">720p (HD) — Recommended</SelectItem>
                  <SelectItem value="480p">480p (SD)</SelectItem>
                  <SelectItem value="360p">360p (Low)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Video toggles */}
            <div className="space-y-3 pt-2 border-t border-border">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Mirror Video</Label>
                  <p className="text-xs text-muted-foreground">Flip your camera horizontally</p>
                </div>
                <Switch checked={mirrorVideo} onCheckedChange={setMirrorVideo} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Background Blur</Label>
                  <p className="text-xs text-muted-foreground">Blur your background</p>
                </div>
                <Switch checked={backgroundBlur} onCheckedChange={setBackgroundBlur} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Low Bandwidth Mode</Label>
                  <p className="text-xs text-muted-foreground">Reduce video quality for slow connections</p>
                </div>
                <Switch checked={lowBandwidthMode} onCheckedChange={setLowBandwidthMode} />
              </div>
            </div>

            {/* Camera preview */}
            <div className="space-y-2 pt-2 border-t border-border">
              <Label className="text-sm font-medium">Preview</Label>
              <div className="w-full aspect-video bg-muted rounded-lg overflow-hidden relative">
                {localStream ? (
                  <video
                    autoPlay
                    muted
                    playsInline
                    ref={(el) => {
                      if (el) el.srcObject = localStream
                    }}
                    className={cn(
                      "w-full h-full object-cover transition-all duration-300",
                      mirrorVideo && "scale-x-[-1]",
                      backgroundBlur && "blur-md scale-105"
                    )}
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-sm text-muted-foreground">
                    Camera not available
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          {/* ─── Recording Settings ─── */}
          <TabsContent value="recording" className="space-y-5 mt-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">Auto-Record</Label>
                <p className="text-xs text-muted-foreground">Start recording when meeting begins</p>
              </div>
              <Switch checked={autoRecord} onCheckedChange={setAutoRecord} />
            </div>

            <div className="space-y-2 pt-2 border-t border-border">
              <Label className="text-sm font-medium">Recording Quality</Label>
              <Select value={recordingQuality} onValueChange={setRecordingQuality}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">High Quality (larger file)</SelectItem>
                  <SelectItem value="medium">Medium Quality — Recommended</SelectItem>
                  <SelectItem value="low">Low Quality (smaller file)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3 pt-2 border-t border-border">
              <Label className="text-sm font-medium">Include in Recording</Label>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Mic className="h-4 w-4 text-muted-foreground" />
                  <Label className="text-sm">Audio</Label>
                </div>
                <Switch checked={recordAudio} onCheckedChange={setRecordAudio} />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Video className="h-4 w-4 text-muted-foreground" />
                  <Label className="text-sm">Video</Label>
                </div>
                <Switch checked={recordVideo} onCheckedChange={setRecordVideo} />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <svg className="h-4 w-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <rect x="2" y="3" width="20" height="14" rx="2" />
                    <line x1="8" y1="21" x2="16" y2="21" />
                    <line x1="12" y1="17" x2="12" y2="21" />
                  </svg>
                  <Label className="text-sm">Screen Share</Label>
                </div>
                <Switch checked={recordScreen} onCheckedChange={setRecordScreen} />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <svg className="h-4 w-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                  <Label className="text-sm">Chat Messages</Label>
                </div>
                <Switch checked={recordChat} onCheckedChange={setRecordChat} />
              </div>
            </div>

            <div className="p-3 rounded-lg bg-muted/50 border border-border text-xs text-muted-foreground">
              <p>Recordings are saved securely and accessible from your dashboard after the interview ends.</p>
            </div>
          </TabsContent>
        </Tabs>
        
        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={() => {
            if (onApplySettings) {
              onApplySettings({ mirrorVideo, backgroundBlur })
            }
            onOpenChange(false)
          }}>
            Apply Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

/* ─── Report Issue Dialog ─── */

interface ReportIssueDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ReportIssueDialog({ open, onOpenChange }: ReportIssueDialogProps) {
  const [issueType, setIssueType] = useState("audio")
  const [description, setDescription] = useState("")
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = () => {
    setSubmitted(true)
    setTimeout(() => {
      setSubmitted(false)
      setDescription("")
      setIssueType("audio")
      onOpenChange(false)
    }, 2000)
  }

  // Reset state when dialog opens
  useEffect(() => {
    if (open) {
      setSubmitted(false)
      setDescription("")
    }
  }, [open])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Report an Issue
          </DialogTitle>
          <DialogDescription>
            Let us know what&apos;s going wrong so we can fix it.
          </DialogDescription>
        </DialogHeader>

        {submitted ? (
          <div className="flex flex-col items-center justify-center py-8 gap-3">
            <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center">
              <Check className="h-6 w-6 text-accent" />
            </div>
            <p className="font-medium">Report Submitted</p>
            <p className="text-sm text-muted-foreground text-center">
              Thank you for reporting this issue. We&apos;ll look into it.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Issue Type</Label>
              <Select value={issueType} onValueChange={setIssueType}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="audio">Audio Issue</SelectItem>
                  <SelectItem value="video">Video Issue</SelectItem>
                  <SelectItem value="connection">Connection Issue</SelectItem>
                  <SelectItem value="editor">Code Editor Issue</SelectItem>
                  <SelectItem value="chat">Chat Issue</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Description</Label>
              <Textarea
                placeholder="Describe what happened..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="min-h-[100px] resize-none"
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!description.trim()}
                className="gap-1.5"
              >
                Submit Report
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
