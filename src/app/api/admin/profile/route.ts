import { NextResponse } from "next/server";
import { createServerSupabaseClient } from '@/lib/supabase-server';

// GET: 管理者プロフィールデータの取得
export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ 
        adminName: "管理者",
        profileImage: null 
      });
    }

    // ユーザーのメタデータから管理者名とプロフィール画像を取得
    const adminName = user.user_metadata?.admin_name || "管理者";
    const profileImage = user.user_metadata?.profile_image_url || null;

    return NextResponse.json({ 
      adminName,
      profileImage 
    });
  } catch (error) {
    console.error("Error fetching admin profile:", error);
    return NextResponse.json({ 
      adminName: "管理者",
      profileImage: null 
    });
  }
} 