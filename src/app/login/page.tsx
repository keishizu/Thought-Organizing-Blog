"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase-client"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import LoadingSpinner from "@/components/common/LoadingSpinner"

export default function LoginPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (error) {
      toast({
        title: "ログインエラー",
        description: "メールアドレスまたはパスワードが正しくありません。",
        variant: "destructive"
      })
    } else {
      router.push("/admin")
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <form onSubmit={handleLogin} className="w-full max-w-xs space-y-4" aria-label="管理者ログインフォーム">
        <h1 className="text-xl font-bold text-center">管理者ログイン</h1>
        <div className="space-y-2">
          <Label htmlFor="email">メールアドレス</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            aria-required="true"
            aria-label="メールアドレス"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">パスワード</Label>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            aria-required="true"
            aria-label="パスワード"
          />
        </div>
        <Button type="submit" className="w-full" disabled={loading} aria-busy={loading}>
          {loading ? <LoadingSpinner /> : "ログイン"}
        </Button>
      </form>
    </div>
  )
} 