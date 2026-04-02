"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Code2, 
  Plus, 
  Video, 
  Clock, 
  Users, 
  LogOut, 
  Copy, 
  Check,
  Loader2,
  Trash2,
} from "lucide-react"
import type { User } from "@supabase/supabase-js"

interface Meeting {
  id: string
  code: string
  title: string
  created_at: string
  is_active: boolean
}

interface Profile {
  id: string
  display_name: string | null
}

interface DashboardClientProps {
  user: User
  profile: Profile | null
  meetings: Meeting[]
  errorMessage?: string
}

function generateMeetingCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
  let code = ""
  for (let i = 0; i < 3; i++) {
    if (i > 0) code += "-"
    for (let j = 0; j < 3; j++) {
      code += chars[Math.floor(Math.random() * chars.length)]
    }
  }
  return code
}

export function DashboardClient({ user, profile, meetings: initialMeetings, errorMessage }: DashboardClientProps) {
  const [meetings, setMeetings] = useState<Meeting[]>(initialMeetings)
  const [error, setError] = useState<string | null>(errorMessage || null)
  const [joinCode, setJoinCode] = useState("")
  const [creating, setCreating] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [joinError, setJoinError] = useState<string | null>(null)

  const router = useRouter()
  const supabase = createClient()

  const displayName = profile?.display_name || user.email?.split("@")[0] || "User"

  const handleCreateMeeting = async () => {
    setCreating(true)
    
    const code = generateMeetingCode()
    
    const { data, error } = await supabase
      .from("meetings")
      .insert({
        code,
        host_id: user.id,
        title: "Interview Session",
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating meeting:", error)
      setCreating(false)
      return
    }

    if (data) {
      setMeetings([data, ...meetings])
      router.push(`/interview/${data.code}`)
    }
    
    setCreating(false)
  }

  const handleJoinMeeting = async (e: React.FormEvent) => {
    e.preventDefault()
    setJoinError(null)
    
    const formattedCode = joinCode.toUpperCase().replace(/[^A-Z0-9-]/g, "")
    
    const { data } = await supabase
      .from("meetings")
      .select("*")
      .eq("code", formattedCode)
      .eq("is_active", true)
      .single()

    if (!data) {
      setJoinError("Meeting not found or has ended")
      return
    }

    router.push(`/interview/${formattedCode}`)
  }

  const handleCopyCode = async (code: string) => {
    await navigator.clipboard.writeText(code)
    setCopiedId(code)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleDeleteMeeting = async (meetingId: string) => {
    const { error } = await supabase
      .from("meetings")
      .delete()
      .eq("id", meetingId)

    if (!error) {
      setMeetings(meetings.filter(m => m.id !== meetingId))
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/")
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card animate-slide-up">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 animate-slide-left delay-100">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Code2 className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">CodeLink</span>
          </div>
          <div className="flex items-center gap-4 animate-slide-right delay-100">
            <span className="text-sm text-muted-foreground hidden sm:inline-block">
              Welcome, <span className="text-foreground font-medium">{displayName}</span>
            </span>
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              <LogOut className="w-4 h-4 mr-2" />
              Sign out
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {error && (
          <div className="mb-6 p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive flex items-center justify-between animate-slide-up">
            <span>{error}</span>
            <Button variant="ghost" size="sm" onClick={() => setError(null)} className="text-destructive hover:text-destructive">
              Dismiss
            </Button>
          </div>
        )}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card className="border-border bg-card animate-slide-left delay-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-card-foreground">
                <Plus className="w-5 h-5" />
                Create Meeting
              </CardTitle>
              <CardDescription>
                Start a new interview session and share the code with your candidate
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={handleCreateMeeting} 
                disabled={creating}
                className="w-full"
                size="lg"
              >
                {creating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Video className="w-4 h-4 mr-2" />
                    New Interview
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          <Card className="border-border bg-card animate-slide-right delay-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-card-foreground">
                <Users className="w-5 h-5" />
                Join Meeting
              </CardTitle>
              <CardDescription>
                Enter a meeting code to join an existing interview session
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleJoinMeeting} className="flex gap-2">
                <Input
                  placeholder="ABC-123-XYZ"
                  value={joinCode}
                  onChange={(e) => {
                    setJoinCode(e.target.value.toUpperCase())
                    setJoinError(null)
                  }}
                  className="bg-input border-border font-mono tracking-wider"
                />
                <Button type="submit" disabled={!joinCode.trim()}>
                  Join
                </Button>
              </form>
              {joinError && (
                <p className="text-sm text-destructive mt-2">{joinError}</p>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="border-border bg-card animate-slide-up delay-400">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-card-foreground">
              <Clock className="w-5 h-5" />
              Your Meetings
            </CardTitle>
            <CardDescription>
              Recent interview sessions you&apos;ve created
            </CardDescription>
          </CardHeader>
          <CardContent>
            {meetings.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Video className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No meetings yet</p>
                <p className="text-sm">Create your first interview session above</p>
              </div>
            ) : (
              <div className="space-y-3">
                {meetings.map((meeting) => (
                  <div
                    key={meeting.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border border-border"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Video className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{meeting.title}</p>
                        <p className="text-sm text-muted-foreground font-mono">
                          {meeting.code}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        meeting.is_active 
                          ? "bg-accent/20 text-accent" 
                          : "bg-muted text-muted-foreground"
                      }`}>
                        {meeting.is_active ? "Active" : "Ended"}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopyCode(meeting.code)}
                      >
                        {copiedId === meeting.code ? (
                          <Check className="w-4 h-4 text-accent" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push(`/interview/${meeting.code}`)}
                      >
                        Join
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteMeeting(meeting.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
