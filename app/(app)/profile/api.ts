import api from "@/lib/api";
import type { UserProfile } from "./types";

export async function fetchProfile(): Promise<UserProfile> {
  const { data } = await api.get<UserProfile>("/api/user/profile");
  return data;
}

export interface ProvinceOption {
  value: string;
  label: string;
}

export async function fetchProvinces(): Promise<ProvinceOption[]> {
  const { data } = await api.get<{ data: { code: string; name: string }[] }>("/api/onboarding/provinces");
  return data.data.map((p) => ({ value: p.name, label: p.name }));
}

export async function updateProfile(values: Record<string, string>): Promise<UserProfile> {
  const { data } = await api.patch<UserProfile>("/api/user/profile", values);
  return data;
}

export async function uploadProfileImage(
  kind: "avatar" | "banner",
  blob: Blob
): Promise<{ avatar_url?: string; banner_url?: string }> {
  const formData = new FormData();
  formData.append("file", blob, `${kind}.jpg`);
  const { data } = await api.post<{ avatar_url?: string; banner_url?: string }>(
    `/api/user/profile/${kind}`,
    formData,
    { headers: { "Content-Type": undefined } }
  );
  return data;
}

export async function changePassword(params: {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}): Promise<void> {
  await api.post("/api/user/change-password", {
    current_password: params.currentPassword,
    new_password: params.newPassword,
    confirm_password: params.confirmPassword,
  });
}
