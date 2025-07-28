"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import LoadingSpinner from "@/components/common/LoadingSpinner"
import { Lock } from "lucide-react"

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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#FAF9F7] to-[#FEFEFE] py-16">
      <div className="card-base max-w-md w-full p-8 shadow-lg">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-primary/10 rounded-full p-4 mb-4">
            <Lock className="text-primary" size={36} />
          </div>
          <h1 className="text-2xl font-semibold page-title mb-2">管理者ログイン</h1>
          <p className="text-gray-600 text-center page-subtitle text-base">管理者専用ページへのアクセスには認証が必要です。</p>
        </div>
        <form onSubmit={handleLogin} className="space-y-6" aria-label="管理者ログインフォーム">
          <div className="form-group">
            <Label htmlFor="email" className="form-label">メールアドレス</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              aria-required="true"
              aria-label="メールアドレス"
              className="form-input"
            />
          </div>
          <div className="form-group">
            <Label htmlFor="password" className="form-label">パスワード</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              aria-required="true"
              aria-label="パスワード"
              className="form-input"
            />
          </div>
          <Button type="submit" className="btn-primary w-full flex items-center justify-center gap-2 text-base font-semibold" disabled={loading} aria-busy={loading}>
            {loading ? <LoadingSpinner /> : <Lock size={18} className="mr-2" />}ログイン
          </Button>
        </form>
      </div>
    </div>
  )
} 