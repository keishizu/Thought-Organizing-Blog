import { NextResponse } from "next/server";
import { createServerSupabaseClient } from '@/lib/supabase-server';

// GET: 管理者認証チェック
export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    const isAdmin = !!user; // 認証済みユーザーは管理者とみなす

    return NextResponse.json({ isAdmin });
  } catch (error) {
    console.error("Error checking admin status:", error);
    return NextResponse.json({ isAdmin: false });
  }
} 