import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardClient } from "@/components/dashboard/dashboard-client"

interface DashboardPageProps {
  searchParams: Promise<{ error?: string }>
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const { error } = await searchParams
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  const { data: meetings } = await supabase
    .from("meetings")
    .select("*")
    .eq("host_id", user.id)
    .order("created_at", { ascending: false })

  return (
    <DashboardClient 
      user={user} 
      profile={profile} 
      meetings={meetings || []}
      errorMessage={error === "meeting_full" ? "Meeting is full (max 2 participants)" : error === "meeting_not_found" ? "Meeting not found" : undefined}
    />
  )
}
