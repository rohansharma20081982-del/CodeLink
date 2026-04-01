import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { InterviewRoom } from "@/components/interview/interview-room"

interface InterviewPageProps {
  params: Promise<{ id: string }>
}

export default async function InterviewPage({ params }: InterviewPageProps) {
  const { id } = await params
  const supabase = await createClient()
  
  // Get meeting by code
  const { data: meeting } = await supabase
    .from("meetings")
    .select("*")
    .eq("code", id.toUpperCase())
    .single()

  if (!meeting) {
    redirect("/dashboard?error=meeting_not_found")
  }

  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect("/auth/login?redirect=/interview/" + id)
  }
  
  const isHost = user.id === meeting.host_id

  // Check if meeting is full (max 2 participants)
  const { data: existingParticipants } = await supabase
    .from("meeting_participants")
    .select("id, user_id")
    .eq("meeting_id", meeting.id)
    .is("left_at", null)

  const activeParticipants = existingParticipants || []
  const isAlreadyInMeeting = activeParticipants.some(p => p.user_id === user.id)

  // If meeting is full and user is not already in it, redirect
  if (activeParticipants.length >= 2 && !isAlreadyInMeeting) {
    redirect("/dashboard?error=meeting_full")
  }

  // Get user display name
  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name")
    .eq("id", user.id)
    .single()
  
  const displayName = profile?.display_name || user.email?.split("@")[0] || "Participant"

  // Only add participant if not already in meeting
  if (!isAlreadyInMeeting) {
    await supabase.from("meeting_participants").insert({
      meeting_id: meeting.id,
      user_id: user.id,
      display_name: displayName,
      role: isHost ? "host" : "candidate",
    })
  }

  return (
    <InterviewRoom 
      meetingId={meeting.id}
      meetingCode={meeting.code}
      userName={displayName} 
      userId={user.id}
      isHost={isHost} 
    />
  )
}
