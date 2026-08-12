export interface UserProfile {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  grade: string | null;
  province: string | null;
  current_school: string | null;
  dream_university: string | null;
  target_major: string | null;
  bio: string | null;
  instagram: string | null;
  tiktok: string | null;
  linkedin: string | null;
  avatar_url: string | null;
  banner_url: string | null;
  created_at: string;
}
