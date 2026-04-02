import { createClient } from "@supabase/supabase-js"
import { createClient as createServerClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    // Verify the user is authenticated first using the regular server client
    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { display_name, bio, avatar_url } = body

    // Use service role client — bypasses RLS completely
    const adminSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Update display_name and bio in the profiles table
    const { error: profileError } = await adminSupabase
      .from("profiles")
      .upsert({
        id: user.id,
        display_name,
        bio,
      }, { onConflict: "id" })

    if (profileError) {
      console.error("Admin profile upsert error:", profileError)
      return NextResponse.json({ error: profileError.message }, { status: 500 })
    }

    // Store avatar_url in auth user metadata (no schema cache issues, always works)
    const { error: metaError } = await adminSupabase.auth.admin.updateUserById(
      user.id,
      { user_metadata: { avatar_url } }
    )

    if (metaError) {
      console.error("Auth metadata update error:", metaError)
      // Non-fatal: profile text data was saved OK
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("Update profile API error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
