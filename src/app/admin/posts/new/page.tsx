export const dynamic = "force-dynamic";
import { redirect } from "next/navigation"
import { createServerSupabaseClient } from "@/lib/supabase-server"

export default async function NewPostPage() {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-xl font-bold mb-4">新規記事投稿</h1>
      <form className="w-full max-w-md space-y-4">
        <input className="input input-bordered w-full" placeholder="タイトル" />
        <textarea className="textarea textarea-bordered w-full" placeholder="本文" />
        <button className="btn btn-primary w-full" type="submit">投稿</button>
      </form>
    </div>
  )
} 